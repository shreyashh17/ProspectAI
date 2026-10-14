import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class QualificationResult(Base):
    __tablename__ = "qualification_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    lead_id = Column(String(36), ForeignKey("leads.id"), unique=True, nullable=False, index=True)
    
    score = Column(Float, default=0.0) # 0 to 100
    status = Column(String(50), default="potential") # qualified, potential, not_qualified
    reason = Column(Text, nullable=True)
    
    # JSON strings
    pain_points = Column(Text, default="[]") 
    requirements = Column(Text, default="[]")
    missing_info = Column(Text, default="[]")
    
    buying_intent = Column(String(50), default="unknown") # high, medium, low, unknown
    authority_fit = Column(String(50), default="unknown") # decision_maker, influencer, non_buyer, unknown
    budget_fit = Column(String(50), default="unknown")    # verified, likely, constraint, unknown
    need_fit = Column(String(50), default="unknown")      # strong, moderate, none, unknown
    timeline_fit = Column(String(50), default="unknown")  # immediate, 1_3_months, later, unknown
    
    recommended_action = Column(String(255), default="Initiate personalized discovery outreach")
    summary = Column(Text, nullable=True)
    
    manual_override = Column(Boolean, default=False)
    manual_notes = Column(Text, nullable=True)
    reviewed_by = Column(String(100), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    lead = relationship("Lead", back_populates="qualification")
