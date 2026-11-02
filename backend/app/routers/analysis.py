import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import AnalysisHistory
from app.schemas.api import AnalysisHistoryOut, AnalysisResponse
from app.services.gemini_service import gemini_service
from app.services.safety_guard import DISCLAIMER, assess_emergency
from app.utils.files import ALLOWED_IMAGE_TYPES, ALLOWED_REPORT_TYPES, extract_pdf_text, read_validated_upload

router = APIRouter(tags=["analysis"])
logger = logging.getLogger(__name__)


def persist_analysis(db: Session, kind: str, filename: str, content: str) -> AnalysisHistory:
    record = AnalysisHistory(analysis_type=kind, filename=filename, result=content)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/analysis-history", response_model=list[AnalysisHistoryOut])
def analysis_history(db: Session = Depends(get_db)) -> list[AnalysisHistory]:
    query = select(AnalysisHistory).order_by(AnalysisHistory.created_at.desc()).limit(50)
    return list(db.scalars(query).all())


@router.post("/analyze-report", response_model=AnalysisResponse)
async def analyze_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    data = await read_validated_upload(file, ALLOWED_REPORT_TYPES)
    filename = file.filename or "report"
    try:
        if file.content_type == "application/pdf":
            content = gemini_service.analyze_report(extract_pdf_text(data), filename)
        else:
            content = gemini_service.analyze_report_image(data, file.content_type or "image/jpeg", filename)
        assessment = assess_emergency(content)
        record = persist_analysis(db, "report", filename, content)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Report analysis failed")
        raise HTTPException(status_code=503, detail="Report analysis is temporarily unavailable.") from exc
    return AnalysisResponse(
        id=record.id,
        filename=filename,
        analysis_type="report",
        content=content,
        is_emergency=assessment.is_emergency,
        emergency_reasons=assessment.reasons,
        disclaimer=DISCLAIMER,
    )


@router.post("/analyze-image", response_model=AnalysisResponse)
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> AnalysisResponse:
    data = await read_validated_upload(file, ALLOWED_IMAGE_TYPES)
    filename = file.filename or "medical-image"
    try:
        content = gemini_service.analyze_image(data, file.content_type or "image/jpeg", filename)
        assessment = assess_emergency(content)
        record = persist_analysis(db, "image", filename, content)
    except Exception as exc:
        logger.exception("Image analysis failed")
        raise HTTPException(status_code=503, detail="Image analysis is temporarily unavailable.") from exc
    return AnalysisResponse(
        id=record.id,
        filename=filename,
        analysis_type="image",
        content=content,
        is_emergency=assessment.is_emergency,
        emergency_reasons=assessment.reasons,
        disclaimer=DISCLAIMER,
    )
