from io import BytesIO

from fastapi import HTTPException, UploadFile
from PIL import Image
from pypdf import PdfReader

from app.core.config import get_settings

settings = get_settings()
ALLOWED_REPORT_TYPES = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png"}


async def read_validated_upload(upload: UploadFile, allowed_types: set[str]) -> bytes:
    if upload.content_type not in allowed_types:
        raise HTTPException(status_code=415, detail="Unsupported file type.")
    data = await upload.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if not data:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.max_upload_mb} MB.")
    if upload.content_type in ALLOWED_IMAGE_TYPES:
        try:
            image = Image.open(BytesIO(data))
            image.verify()
        except Exception as exc:
            raise HTTPException(status_code=400, detail="Invalid or corrupted image.") from exc
    return data


def extract_pdf_text(data: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(data))
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="The PDF could not be read.") from exc
    if not text:
        raise HTTPException(
            status_code=422,
            detail="No selectable text was found. Upload report pages as JPG or PNG for vision analysis.",
        )
    return text
