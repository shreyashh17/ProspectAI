from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AvailableSlot(BaseModel):
    start_time: datetime
    end_time: datetime
    formatted_time: str
    available: bool = True

class SlotAvailabilityRequest(BaseModel):
    date: str # YYYY-MM-DD
    timezone: str = "UTC"

class MeetingCreate(BaseModel):
    lead_id: str
    title: str
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"
    notes: Optional[str] = None

class MeetingUpdate(BaseModel):
    status: Optional[str] = None # scheduled, completed, canceled, rescheduled
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    notes: Optional[str] = None

class MeetingOut(BaseModel):
    id: str
    lead_id: str
    lead_name: str
    lead_email: Optional[str] = None
    lead_company: str
    user_id: Optional[str] = None
    title: str
    start_time: datetime
    end_time: datetime
    timezone: str
    google_calendar_event_id: Optional[str] = None
    meeting_link: Optional[str] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
