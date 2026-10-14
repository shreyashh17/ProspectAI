from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class LeadBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    company_name: str
    company_size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    source: Optional[str] = "manual"
    status: Optional[str] = "new"
    tags: Optional[str] = ""
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    designation: Optional[str] = None
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[str] = None
    notes: Optional[str] = None

class QualificationSummaryOut(BaseModel):
    id: str
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

class LeadOut(LeadBase):
    id: str
    workspace_id: str
    icp_match_score: float
    icp_explanation: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    qualification: Optional[QualificationSummaryOut] = None

    class Config:
        from_attributes = True

class LeadListResponse(BaseModel):
    items: List[LeadOut]
    total: int
    page: int
    page_size: int
    total_pages: int

class ICPCriteria(BaseModel):
    industries: List[str] = []
    job_titles: List[str] = []
    locations: List[str] = []
    company_sizes: List[str] = []
    keywords: List[str] = []
    business_requirements: Optional[str] = None

class DiscoveredLead(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: str
    designation: str
    company_name: str
    company_size: str
    industry: str
    location: str
    website: str
    linkedin_url: str
    match_score: float
    match_reasons: List[str] = []
    already_saved: bool = False
