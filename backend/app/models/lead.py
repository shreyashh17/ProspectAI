import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), index=True, nullable=True)
    phone = Column(String(50), nullable=True)
    designation = Column(String(150), nullable=True)
    company_name = Column(String(200), nullable=False)
    company_size = Column(String(50), nullable=True)  # e.g. "50-200", "201-500", "1000+"
    industry = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    source = Column(String(100), default="discovery") # discovery, csv_import, manual, inbound
    
    # Status: new, qualified, potential, not_qualified, contacted, replied, meeting_scheduled, opted_out
    status = Column(String(50), default="new", index=True)
    icp_match_score = Column(Float, default=0.0) # 0 to 100
    icp_explanation = Column(Text, nullable=True)
    
    tags = Column(String(255), default="") # comma-separated
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="leads")
    qualification = relationship("QualificationResult", uselist=False, back_populates="lead", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="lead", cascade="all, delete-orphan")
    campaign_associations = relationship("CampaignLead", back_populates="lead", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="lead", cascade="all, delete-orphan")
