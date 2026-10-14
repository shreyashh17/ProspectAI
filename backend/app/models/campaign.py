import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    channel = Column(String(50), default="email") # email, linkedin, telegram, multichannel
    status = Column(String(50), default="draft")  # draft, scheduled, running, paused, completed
    
    target_criteria = Column(Text, default="{}") # JSON of ICP filters applied
    message_template = Column(Text, nullable=True)
    follow_up_template = Column(Text, nullable=True)
    follow_up_delay_days = Column(Integer, default=3)
    
    # Aggregated metrics
    sent_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    qualified_count = Column(Integer, default=0)
    meeting_count = Column(Integer, default=0)
    opt_out_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="campaigns")
    leads = relationship("CampaignLead", back_populates="campaign", cascade="all, delete-orphan")


class CampaignLead(Base):
    __tablename__ = "campaign_leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False, index=True)
    lead_id = Column(String(36), ForeignKey("leads.id"), nullable=False, index=True)
    
    status = Column(String(50), default="pending") # pending, sent, opened, replied, qualified, opted_out, error
    personalized_message = Column(Text, nullable=True)
    error_message = Column(Text, nullable=True)
    
    sent_at = Column(DateTime, nullable=True)
    reply_at = Column(DateTime, nullable=True)
    
    campaign = relationship("Campaign", back_populates="leads")
    lead = relationship("Lead", back_populates="campaign_associations")
