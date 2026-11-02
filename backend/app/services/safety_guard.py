import re
from dataclasses import dataclass

DISCLAIMER = "This information is for educational purposes only and is not medical advice."
EMERGENCY_MESSAGE = "Seek immediate medical attention or contact emergency services."


@dataclass(frozen=True)
class SafetyAssessment:
    is_emergency: bool
    reasons: list[str]


EMERGENCY_PATTERNS: dict[str, tuple[str, ...]] = {
    "possible heart emergency": (
        r"\bchest (pain|pressure|tightness)\b",
        r"\bpain (spreading|radiating) to (my |the )?(arm|jaw|back)\b",
    ),
    "breathing emergency": (
        r"\b(can'?t|cannot|unable to) breathe\b",
        r"\b(severe|extreme) (shortness of breath|breathing difficulty)\b",
        r"\bturning blue\b",
    ),
    "possible stroke": (
        r"\b(face droop|facial droop)\b",
        r"\b(slurred speech|sudden confusion)\b",
        r"\bsudden (weakness|numbness).*(one side|arm|leg)\b",
    ),
    "severe bleeding": (
        r"\b(severe|heavy|uncontrolled) bleeding\b",
        r"\bbleeding (won'?t|will not) stop\b",
    ),
    "loss of consciousness": (
        r"\b(unconscious|unresponsive|passed out and won'?t wake)\b",
    ),
    "infant fever": (
        r"\b(infant|newborn|baby).*(fever|temperature)\b",
        r"\bfever.*(infant|newborn|baby under (2|3) months)\b",
    ),
    "self-harm risk": (
        r"\b(suicidal|kill(ing)? myself|end my life|hurt myself|self[- ]harm)\b",
    ),
}

UNSAFE_REQUEST_PATTERNS = (
    r"\bprescribe\b",
    r"\bwhat dosage\b",
    r"\bhow many (pills|tablets)\b",
    r"\bdiagnose me\b",
    r"\bhelp me (hide|fake|forge) (a )?(symptom|report|prescription)\b",
)


def assess_emergency(text: str) -> SafetyAssessment:
    normalized = " ".join(text.lower().split())
    reasons = [
        label
        for label, patterns in EMERGENCY_PATTERNS.items()
        if any(re.search(pattern, normalized) for pattern in patterns)
    ]
    return SafetyAssessment(bool(reasons), reasons)


def is_unsafe_medical_request(text: str) -> bool:
    normalized = " ".join(text.lower().split())
    return any(re.search(pattern, normalized) for pattern in UNSAFE_REQUEST_PATTERNS)


def emergency_response(reasons: list[str]) -> str:
    reason_text = ", ".join(reasons) if reasons else "potentially serious symptoms"
    return (
        f"**{EMERGENCY_MESSAGE}**\n\n"
        f"Your message may describe {reason_text}. Do not wait for an online response. "
        "Call your local emergency number now or go to the nearest emergency department. "
        "If it is safe, have someone stay with you. In the United States or Canada, call 911. "
        "For suicidal thoughts in the United States or Canada, call or text 988.\n\n"
        f"{DISCLAIMER}"
    )


def unsafe_request_response() -> str:
    return (
        "I cannot diagnose a condition, prescribe medication, or provide an individualized drug dose. "
        "A licensed clinician or pharmacist can review your symptoms, history, allergies, and other "
        "medicines safely. I can help explain general health information or prepare questions for them.\n\n"
        f"{DISCLAIMER}"
    )


def enforce_response_boundaries(text: str) -> str:
    cleaned = text.strip()
    if DISCLAIMER.lower() not in cleaned.lower():
        cleaned = f"{cleaned}\n\n{DISCLAIMER}"
    return cleaned
