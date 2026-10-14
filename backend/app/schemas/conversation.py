from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class MessageCreate(BaseModel):
    content: str
    sender: Optional[str] = "lead" # lead, human_agent

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    metadata: Dict[str, Any] = {}
    timestamp: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: str
    lead_id: str
    lead_name: str
    lead_email: Optional[str] = None
    lead_company: str
    lead_designation: Optional[str] = None
    lead_status: str
    channel: str
    status: str
    unread_count: int
    summary: Optional[str] = None
    extracted_intent: str
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConversationDetailOut(ConversationOut):
    messages: List[MessageOut] = []

class ChatReplyResponse(BaseModel):
    message: MessageOut
    conversation_status: str
    extracted_intent: str
    qualification_status: Optional[str] = None
    qualification_score: Optional[float] = None
    suggested_meeting: bool = False
    opted_out: bool = False
    handed_off: bool = False
