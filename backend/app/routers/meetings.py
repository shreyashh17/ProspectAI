from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User
from app.models.lead import Lead
from app.models.meeting import Meeting
from app.schemas.meeting import (
    MeetingCreate,
    MeetingUpdate,
    MeetingOut,
    AvailableSlot,
    SlotAvailabilityRequest
)
from app.services.calendar_service import CalendarService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/meetings", tags=["Meeting Scheduling"])

def format_meeting_out(m: Meeting) -> MeetingOut:
    lead = m.lead
    return MeetingOut(
        id=m.id,
        lead_id=m.lead_id,
        lead_name=f"{lead.first_name} {lead.last_name}" if lead else "Unknown",
        lead_email=lead.email if lead else None,
        lead_company=lead.company_name if lead else "Unknown",
        user_id=m.user_id,
        title=m.title,
        start_time=m.start_time,
        end_time=m.end_time,
        timezone=m.timezone,
        google_calendar_event_id=m.google_calendar_event_id,
        meeting_link=m.meeting_link,
        status=m.status,
        notes=m.notes,
        created_at=m.created_at
    )

@router.get("", response_model=List[MeetingOut])
def list_meetings(
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Meeting).join(Lead).filter(Lead.workspace_id == current_user.workspace_id)
    if status_filter and status_filter != "all":
        query = query.filter(Meeting.status == status_filter)

    meetings = query.order_by(desc(Meeting.start_time)).all()
    return [format_meeting_out(m) for m in meetings]

@router.get("/slots", response_model=List[AvailableSlot])
def get_slots(
    date: str = Query(...), # YYYY-MM-DD
    timezone: str = Query("UTC"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    slots = CalendarService.get_available_slots(db, date, timezone)
    return slots

@router.post("", response_model=MeetingOut)
def schedule_meeting(
    meet_in: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure lead belongs to workspace
    lead = db.query(Lead).filter(
        Lead.id == meet_in.lead_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found in this workspace")

    try:
        meeting = CalendarService.schedule_meeting(
            db=db,
            lead_id=meet_in.lead_id,
            user_id=current_user.id,
            title=meet_in.title,
            start_time=meet_in.start_time,
            end_time=meet_in.end_time,
            tz_name=meet_in.timezone,
            notes=meet_in.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return format_meeting_out(meeting)

@router.post("/{meeting_id}/cancel", response_model=MeetingOut)
def cancel_meeting(
    meeting_id: str,
    reason: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).join(Lead).filter(
        Meeting.id == meeting_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting = CalendarService.cancel_meeting(db, meeting_id, reason)
    return format_meeting_out(meeting)
