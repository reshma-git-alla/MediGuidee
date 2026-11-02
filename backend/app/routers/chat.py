import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.database import get_db
from app.models import Conversation, Message
from app.schemas.api import ChatRequest, ChatResponse, ConversationOut
from app.services.gemini_service import gemini_service
from app.services.safety_guard import (
    DISCLAIMER,
    assess_emergency,
    emergency_response,
    is_unsafe_medical_request,
    unsafe_request_response,
)

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    conversation = db.get(Conversation, payload.conversation_id) if payload.conversation_id else None
    if payload.conversation_id and not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    if not conversation:
        conversation = Conversation(title=payload.message[:80])
        db.add(conversation)
        db.flush()

    history = [{"role": item.role, "content": item.content} for item in conversation.messages]
    db.add(Message(conversation_id=conversation.id, role="user", content=payload.message))

    assessment = assess_emergency(payload.message)
    try:
        if assessment.is_emergency:
            response_text = emergency_response(assessment.reasons)
        elif is_unsafe_medical_request(payload.message):
            response_text = unsafe_request_response()
        else:
            response_text = gemini_service.chat(payload.message, history)
    except Exception as exc:
        logger.exception("Chat generation failed")
        db.rollback()
        raise HTTPException(status_code=503, detail="AI service is temporarily unavailable. Please try again shortly.") from exc

    db.add(Message(conversation_id=conversation.id, role="assistant", content=response_text))
    db.commit()
    return ChatResponse(
        conversation_id=conversation.id,
        response=response_text,
        is_emergency=assessment.is_emergency,
        emergency_reasons=assessment.reasons,
        disclaimer=DISCLAIMER,
    )


@router.get("/history", response_model=list[ConversationOut])
def history(db: Session = Depends(get_db)) -> list[Conversation]:
    query = (
        select(Conversation)
        .options(selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
        .limit(50)
    )
    return list(db.scalars(query).all())
