from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    conversation_id: int
    response: str
    is_emergency: bool
    emergency_reasons: list[str] = Field(default_factory=list)
    disclaimer: str


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: list[MessageOut]

    model_config = {"from_attributes": True}


class AnalysisResponse(BaseModel):
    id: int
    filename: str
    analysis_type: str
    content: str
    is_emergency: bool = False
    emergency_reasons: list[str] = Field(default_factory=list)
    disclaimer: str


class AnalysisHistoryOut(BaseModel):
    id: int
    analysis_type: str
    filename: str
    result: str
    created_at: datetime

    model_config = {"from_attributes": True}
