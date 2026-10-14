from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class StatMetric(BaseModel):
    label: str
    value: Any
    change_percentage: float
    trend: str # up, down, neutral

class DashboardStats(BaseModel):
    total_leads: int
    qualified_leads: int
    active_campaigns: int
    scheduled_meetings: int
    qualification_rate: float # percentage e.g. 42.5
    response_rate: float      # percentage e.g. 18.2
    active_conversations: int

class TrendDataPoint(BaseModel):
    date: str
    discovered: int
    qualified: int
    meetings: int

class FunnelStage(BaseModel):
    stage: str
    count: int
    percentage: float

class CampaignPerformancePoint(BaseModel):
    name: str
    channel: str
    sent: int
    replies: int
    qualified: int
    meetings: int

class ActivityLogOut(BaseModel):
    id: str
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    user_email: Optional[str] = None
    details: Dict[str, Any] = {}
    timestamp: datetime

    class Config:
        from_attributes = True
