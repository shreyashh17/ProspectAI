import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User, Workspace
from app.models.lead import Lead
from app.models.qualification import QualificationResult
from app.schemas.qualification import (
    QualificationDetailOut,
    QualificationOverrideRequest,
    BatchQualificationRequest,
    QualificationRulesConfig
)
from app.services.qualification_service import QualificationService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/qualification", tags=["AI Qualification"])

def format_qual_detail(q: QualificationResult) -> QualificationDetailOut:
    pain_points = []
    requirements = []
    missing_info = []
    try:
        pain_points = json.loads(q.pain_points or "[]")
        requirements = json.loads(q.requirements or "[]")
        missing_info = json.loads(q.missing_info or "[]")
    except Exception:
        pass

    return QualificationDetailOut(
        id=q.id,
        lead_id=q.lead_id,
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
        manual_notes=q.manual_notes,
        reviewed_by=q.reviewed_by,
        created_at=q.created_at,
        updated_at=q.updated_at
    )

@router.get("/stats")
def get_qualification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace_id = current_user.workspace_id
    total_leads = db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id).scalar() or 0
    qualified = db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.status == "qualified").scalar() or 0
    potential = db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.status == "potential").scalar() or 0
    not_qualified = db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.status == "not_qualified").scalar() or 0
    overrides = db.query(func.count(QualificationResult.id)).join(Lead).filter(
        Lead.workspace_id == workspace_id,
        QualificationResult.manual_override == True
    ).scalar() or 0

    avg_score = db.query(func.avg(Lead.icp_match_score)).filter(Lead.workspace_id == workspace_id).scalar() or 0.0

    return {
        "total_evaluated": total_leads,
        "qualified_count": qualified,
        "potential_count": potential,
        "not_qualified_count": not_qualified,
        "manual_overrides_count": overrides,
        "average_score": round(float(avg_score), 1)
    }

@router.get("/rules", response_model=QualificationRulesConfig)
def get_qualification_rules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    if workspace and workspace.icp_config:
        try:
            cfg = json.loads(workspace.icp_config)
            return QualificationRulesConfig(**cfg.get("rules", {}))
        except Exception:
            pass
    return QualificationRulesConfig()

@router.put("/rules", response_model=QualificationRulesConfig)
def update_qualification_rules(
    rules: QualificationRulesConfig,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    cfg = {}
    if workspace.icp_config:
        try:
            cfg = json.loads(workspace.icp_config)
        except Exception:
            cfg = {}

    cfg["rules"] = rules.model_dump()
    workspace.icp_config = json.dumps(cfg)
    db.commit()
    return rules

@router.post("/batch")
async def run_batch_qualification(
    req: BatchQualificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Lead).filter(Lead.workspace_id == current_user.workspace_id)
    if req.lead_ids:
        query = query.filter(Lead.id.in_(req.lead_ids))
    else:
        query = query.filter(Lead.status.in_(["new", "potential"]))

    leads_to_process = query.all()
    count = 0
    for lead in leads_to_process:
        await QualificationService.qualify_lead(db, lead, force_refresh=True)
        count += 1

    return {"status": "success", "processed_count": count}

@router.post("/{qual_id}/override", response_model=QualificationDetailOut)
def override_qualification(
    qual_id: str,
    override_req: QualificationOverrideRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    qual = QualificationService.override_qualification(
        db=db,
        qual_id=qual_id,
        status=override_req.status,
        score=override_req.score,
        notes=override_req.manual_notes,
        reviewer_email=current_user.email
    )
    return format_qual_detail(qual)
