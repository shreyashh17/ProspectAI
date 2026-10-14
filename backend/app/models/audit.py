import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False) # e.g. "LEAD_QUALIFIED", "CAMPAIGN_LAUNCHED", "MEETING_BOOKED", "OPT_OUT_PROCESSED"
    entity_type = Column(String(50), nullable=False) # lead, campaign, meeting, conversation, integration
    entity_id = Column(String(36), nullable=True)
    details = Column(Text, default="{}")
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    workspace = relationship("Workspace", back_populates="audit_logs")
