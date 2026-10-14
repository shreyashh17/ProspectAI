import io
import csv
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.core.database import get_db
from app.models.user import User
from app.models.lead import Lead
from app.models.qualification import QualificationResult
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut, LeadListResponse, QualificationSummaryOut
from app.services.qualification_service import QualificationService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/leads", tags=["Leads"])

def format_lead_out(lead: Lead) -> dict:
    qual_summary = None
    if lead.qualification:
        q = lead.qualification
        pain_points = []
        requirements = []
        missing_info = []
        try:
            pain_points = json.loads(q.pain_points or "[]")
            requirements = json.loads(q.requirements or "[]")
            missing_info = json.loads(q.missing_info or "[]")
        except Exception:
            pass

        qual_summary = QualificationSummaryOut(
            id=q.id,
            score=q.score,
            status=q.status,
            reason=q.reason,
            pain_points=pain_points,
            requirements=requirements,
            missing_info=missing_info,
            buying_intent=q.buying_intent,
            authority_fit=q.authority_fit,
            budget_fit=q.budget_fit,
            need_fit=q.need_fit,
            timeline_fit=q.timeline_fit,
            recommended_action=q.recommended_action,
            summary=q.summary,
            manual_override=q.manual_override,
            manual_notes=q.manual_notes
        )

    return {
        "id": lead.id,
        "workspace_id": lead.workspace_id,
        "first_name": lead.first_name,
        "last_name": lead.last_name,
        "email": lead.email,
        "phone": lead.phone,
        "designation": lead.designation,
        "company_name": lead.company_name,
        "company_size": lead.company_size,
        "industry": lead.industry,
        "location": lead.location,
        "website": lead.website,
        "linkedin_url": lead.linkedin_url,
        "source": lead.source,
        "status": lead.status,
        "icp_match_score": lead.icp_match_score,
        "icp_explanation": lead.icp_explanation,
        "tags": lead.tags or "",
        "notes": lead.notes,
        "created_at": lead.created_at,
        "updated_at": lead.updated_at,
        "qualification": qual_summary
    }

@router.get("", response_model=LeadListResponse)
def list_leads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    industry: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|icp_match_score|company_name)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$")
):
    query = db.query(Lead).filter(Lead.workspace_id == current_user.workspace_id)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.first_name.ilike(s),
                Lead.last_name.ilike(s),
                Lead.company_name.ilike(s),
                Lead.email.ilike(s),
                Lead.designation.ilike(s)
            )
        )

    if status and status != "all":
        query = query.filter(Lead.status == status)

    if industry and industry != "all":
        query = query.filter(Lead.industry == industry)

    total = query.count()

    order_col = getattr(Lead, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(order_col))
    else:
        query = query.order_by(asc(order_col))

    leads = query.offset((page - 1) * page_size).limit(page_size).all()

    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return LeadListResponse(
        items=[LeadOut(**format_lead_out(l)) for l in leads],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/export")
def export_leads_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    leads = db.query(Lead).filter(Lead.workspace_id == current_user.workspace_id).order_by(desc(Lead.created_at)).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "First Name", "Last Name", "Email", "Phone", "Designation",
        "Company Name", "Company Size", "Industry", "Location", "Website",
        "Status", "ICP Score", "Source", "Notes"
    ])

    for l in leads:
        writer.writerow([
            l.first_name, l.last_name, l.email or "", l.phone or "", l.designation or "",
            l.company_name, l.company_size or "", l.industry or "", l.location or "", l.website or "",
            l.status, l.icp_match_score, l.source, l.notes or ""
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=prospectai_leads_export.csv"}
    )

@router.get("/{lead_id}", response_model=LeadOut)
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return LeadOut(**format_lead_out(lead))

@router.post("", response_model=LeadOut)
async def create_lead(
    lead_in: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = Lead(
        workspace_id=current_user.workspace_id,
        **lead_in.model_dump()
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)

    # Automatically compute preliminary ICP score
    await QualificationService.qualify_lead(db, lead)
    db.refresh(lead)

    return LeadOut(**format_lead_out(lead))

@router.patch("/{lead_id}", response_model=LeadOut)
def update_lead(
    lead_id: str,
    lead_in: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    update_data = lead_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(lead, field, val)

    db.commit()
    db.refresh(lead)
    return LeadOut(**format_lead_out(lead))

@router.delete("/{lead_id}")
def delete_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    db.delete(lead)
    db.commit()
    return {"status": "success", "message": "Lead deleted successfully"}

@router.post("/{lead_id}/qualify", response_model=LeadOut)
async def trigger_qualification(
    lead_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    await QualificationService.qualify_lead(db, lead, force_refresh=True)
    db.refresh(lead)
    return LeadOut(**format_lead_out(lead))
