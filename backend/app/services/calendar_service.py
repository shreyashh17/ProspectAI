import uuid
import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.meeting import Meeting
from app.models.lead import Lead
from app.models.audit import AuditLog
from app.schemas.meeting import AvailableSlot

class CalendarService:
    @classmethod
    def get_available_slots(cls, db: Session, date_str: str, tz_name: str = "UTC") -> List[AvailableSlot]:
        """Generate available 30-min meeting slots for a given date, checking for conflicts."""
        try:
            target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            target_date = datetime.now(timezone.utc).date() + timedelta(days=1)

        # Standard business hours slots: 09:00 to 17:00
        slot_hours = [9, 10, 11, 13, 14, 15, 16]
        slots = []

        # Find existing meetings on that date
        start_of_day = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
        end_of_day = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
        existing_meetings = db.query(Meeting).filter(
            Meeting.status == "scheduled",
            Meeting.start_time >= start_of_day,
            Meeting.start_time <= end_of_day
        ).all()

        booked_hours = {m.start_time.hour for m in existing_meetings}

        for h in slot_hours:
            start_dt = datetime(target_date.year, target_date.month, target_date.day, h, 0, 0)
            end_dt = start_dt + timedelta(minutes=30)
            is_available = h not in booked_hours

            formatted = start_dt.strftime("%I:%M %p")
            slots.append(
                AvailableSlot(
                    start_time=start_dt,
                    end_time=end_dt,
                    formatted_time=f"{formatted} ({tz_name})",
                    available=is_available
                )
            )

        return slots

    @classmethod
    def schedule_meeting(
        cls,
        db: Session,
        lead_id: str,
        user_id: Optional[str],
        title: str,
        start_time: datetime,
        end_time: datetime,
        tz_name: str = "UTC",
        notes: Optional[str] = None
    ) -> Meeting:
        """Schedule a meeting, prevent double-booking, and link to Lead."""
        # Conflict check
        conflict = db.query(Meeting).filter(
            Meeting.status == "scheduled",
            Meeting.start_time < end_time,
            Meeting.end_time > start_time
        ).first()

        if conflict:
            raise ValueError("The requested time slot has already been booked. Please select another slot.")

        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise ValueError("Lead not found")

        # Generate Google Meet link & external event ID
        mock_event_id = f"gcal_{uuid.uuid4().hex[:12]}"
        meet_link = f"https://meet.google.com/pro-{uuid.uuid4().hex[:3]}-{uuid.uuid4().hex[:4]}"

        meeting = Meeting(
            lead_id=lead_id,
            user_id=user_id,
            title=title or f"ProspectAI Discovery: {lead.first_name} ({lead.company_name})",
            start_time=start_time,
            end_time=end_time,
            timezone=tz_name,
            google_calendar_event_id=mock_event_id,
            meeting_link=meet_link,
            status="scheduled",
            notes=notes
        )
        db.add(meeting)

        # Update lead status
        lead.status = "meeting_scheduled"

        # Log audit
        audit = AuditLog(
            workspace_id=lead.workspace_id,
            action="MEETING_BOOKED",
            entity_type="meeting",
            entity_id=meeting.id,
            details=json.dumps({
                "lead": f"{lead.first_name} {lead.last_name}",
                "company": lead.company_name,
                "time": start_time.isoformat()
            })
        )
        db.add(audit)
        db.commit()
        db.refresh(meeting)

        return meeting

    @classmethod
    def cancel_meeting(cls, db: Session, meeting_id: str, reason: Optional[str] = None) -> Meeting:
        meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
        if not meeting:
            raise ValueError("Meeting not found")

        meeting.status = "canceled"
        if reason:
            meeting.notes = f"{meeting.notes or ''} [Canceled: {reason}]"

        db.commit()
        db.refresh(meeting)
        return meeting
