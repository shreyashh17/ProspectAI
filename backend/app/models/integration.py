import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Integration(Base):
    __tablename__ = "integrations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    
    provider = Column(String(50), nullable=False) # openai, anthropic, gemini, telegram, linkedin, google_calendar, hubspot
    status = Column(String(50), default="disconnected") # connected, disconnected, simulated, error
    is_active = Column(Boolean, default=True)
    config_json = Column(Text, default="{}") # encrypted or masked keys, tokens, webhook urls
    last_synced_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="integrations")
