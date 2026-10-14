from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QualificationOverrideRequest(BaseModel):
    status: str # qualified, potential, not_qualified
    score: Optional[float] = None
    manual_notes: Optional[str] = None

class BatchQualificationRequest(BaseModel):
    lead_ids: Optional[List[str]] = None # If None, qualify all pending/new leads

class QualificationDetailOut(BaseModel):
    id: str
    lead_id: str
    score: float
    status: str
    reason: Optional[str] = None
    pain_points: List[str] = []
    requirements: List[str] = []
    missing_info: List[str] = []
    buying_intent: str
    authority_fit: str
    budget_fit: str
    need_fit: str
    timeline_fit: str
    recommended_action: str
    summary: Optional[str] = None
    manual_override: bool = False
    manual_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class QualificationRulesConfig(BaseModel):
    min_qualified_score: float = 75.0
    min_potential_score: float = 50.0
    icp_weight: float = 0.35
    role_weight: float = 0.25
    need_weight: float = 0.25
    intent_weight: float = 0.15
    auto_qualify_inbound: bool = True
