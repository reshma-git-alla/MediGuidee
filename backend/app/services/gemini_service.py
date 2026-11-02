import logging
import time

from google import genai
from google.genai import types
from google.genai.errors import ServerError

from app.core.config import get_settings
from app.services.safety_guard import DISCLAIMER, enforce_response_boundaries

logger = logging.getLogger(__name__)
settings = get_settings()

SYSTEM_INSTRUCTION = f"""
You are MediGuide, a cautious educational medical information assistant.
- Explain possibilities in simple language without diagnosing.
- Never prescribe, provide individualized dosing, or tell a user to start/stop medication.
- State uncertainty explicitly and avoid certainty language.
- Encourage appropriate professional care.
- Give low-risk general self-care only when appropriate.
- If symptoms could be urgent, clearly advise immediate emergency care.
- Never interpret an image or report as definitive.
- End every answer with exactly: {DISCLAIMER}
"""


class GeminiService:
    def __init__(self) -> None:
        self.client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

    def _require_client(self) -> genai.Client:
        if not self.client:
            raise RuntimeError("GEMINI_API_KEY is not configured.")
        return self.client

    def _generate(
        self,
        contents: object,
        config: types.GenerateContentConfig,
    ) -> str:
        client = self._require_client()
        models = list(dict.fromkeys([settings.gemini_model, settings.gemini_fallback_model]))
        last_error: Exception | None = None

        for model in models:
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model=model,
                        contents=contents,
                        config=config,
                    )
                    if model != settings.gemini_model:
                        logger.warning("Gemini fallback model used: %s", model)
                    return response.text or ""
                except ServerError as exc:
                    last_error = exc
                    if exc.status_code not in {500, 503, 504}:
                        raise
                    logger.warning(
                        "Gemini model %s unavailable (attempt %s/2): %s",
                        model,
                        attempt + 1,
                        exc,
                    )
                    if attempt == 0:
                        time.sleep(1.5)

        if last_error:
            raise last_error
        raise RuntimeError("No Gemini model is configured.")

    def chat(self, message: str, history: list[dict[str, str]]) -> str:
        context = "\n".join(f"{item['role'].upper()}: {item['content']}" for item in history[-10:])
        prompt = (
            f"Conversation context:\n{context or 'No previous messages.'}\n\n"
            f"Current user question:\n{message}\n\n"
            "Respond with: possible non-diagnostic explanations, practical next steps, warning signs, "
            "and when to contact a healthcare professional. Use Markdown."
        )
        text = self._generate(
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.25,
                max_output_tokens=1200,
            ),
        )
        return enforce_response_boundaries(text or "I could not generate a response.")

    def analyze_report(self, text: str, filename: str) -> str:
        prompt = f"""
Analyze the following extracted medical report text from {filename}.
Return Markdown with these headings:
## Summary
## Important findings
## Values outside the stated reference range
## Plain-language explanation
## Questions to ask your healthcare professional
Only call a value abnormal when the report itself provides a reference range or flag.
Mention extraction limitations and uncertainty. Do not diagnose or recommend treatment/dosages.

REPORT TEXT:
{text[:50000]}
"""
        result = self._generate(
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.15,
                max_output_tokens=1800,
            ),
        )
        return enforce_response_boundaries(result or "The report could not be analyzed.")

    def analyze_report_image(self, data: bytes, mime_type: str, filename: str) -> str:
        prompt = f"""
Read and explain the medical report screenshot or scan named {filename}.
Return Markdown with these headings:
## Summary
## Important findings
## Values outside the stated reference range
## Plain-language explanation
## Questions to ask your healthcare professional
Only call a value abnormal when a visible reference range or abnormal flag supports it.
Say when text is unreadable or uncertain. Do not diagnose or recommend treatment/dosages.
"""
        result = self._generate(
            contents=[prompt, types.Part.from_bytes(data=data, mime_type=mime_type)],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                max_output_tokens=1800,
            ),
        )
        return enforce_response_boundaries(result or "The report image could not be analyzed.")

    def analyze_image(self, data: bytes, mime_type: str, filename: str) -> str:
        prompt = f"""
Review the uploaded medical-related image named {filename}.
Return Markdown with:
## What is visible
## General observations
## Limitations and uncertainty
## When to seek professional care
## Questions for a healthcare professional
Do not diagnose, assign probabilities, or claim the image rules a condition in or out.
If this appears to be diagnostic imaging, emphasize that a qualified radiologist/clinician must interpret it.
"""
        result = self._generate(
            contents=[prompt, types.Part.from_bytes(data=data, mime_type=mime_type)],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.1,
                max_output_tokens=1600,
            ),
        )
        return enforce_response_boundaries(result or "The image could not be analyzed.")


gemini_service = GeminiService()
