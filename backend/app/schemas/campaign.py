from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class CampaignCreate(BaseModel):
    name: str
    channel: str = "email" # email, linkedin, telegram, multichannel
    target_criteria: Optional[Dict[str, Any]] = {}
    lead_ids: Optional[List[str]] = []
    message_template: str
    follow_up_template: Optional[str] = None
    follow_up_delay_days: int = 3

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None # draft, scheduled, running, paused, completed
    message_template: Optional[str] = None
    follow_up_template: Optional[str] = None
    follow_up_delay_days: Optional[int] = None

class CampaignLeadOut(BaseModel):
    id: str
    campaign_id: str
    lead_id: str
    lead_name: str
    lead_email: Optional[str] = None
    lead_company: str
    lead_designation: Optional[str] = None
    status: str
    personalized_message: Optional[str] = None
    sent_at: Optional[datetime] = None
    reply_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class CampaignOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    channel: str
    status: str
    target_criteria: Dict[str, Any] = {}
    message_template: Optional[str] = None
    follow_up_template: Optional[str] = None
    follow_up_delay_days: int
    sent_count: int
    reply_count: int
    qualified_count: int
    meeting_count: int
    opt_out_count: int
    total_leads_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CampaignDetailOut(CampaignOut):
    leads: List[CampaignLeadOut] = []

class MessagePersonalizationPreview(BaseModel):
    lead_id: str
    lead_name: str
    company_name: str
    channel: str
    generated_message: str
