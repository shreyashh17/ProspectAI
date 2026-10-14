import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id"), nullable=False, index=True)
    channel = Column(String(50), default="chat") # chat, telegram, email, linkedin
    status = Column(String(50), default="active", index=True) # active, paused, human_handoff, closed, opted_out
    unread_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    extracted_intent = Column(String(100), default="exploring") # exploring, interested, budget_concern, ready_to_book, opt_out, escalated
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    lead = relationship("Lead", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.timestamp")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    sender = Column(String(50), nullable=False) # ai, lead, human_agent
    content = Column(Text, nullable=False)
    # Stored as JSON: {"question_type": "need", "offered_meeting": false, "opt_out_detected": false}
    metadata_json = Column(Text, default="{}")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    conversation = relationship("Conversation", back_populates="messages")
