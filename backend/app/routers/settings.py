import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User, Workspace
from app.models.audit import AuditLog
from app.schemas.analytics import ActivityLogOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/settings", tags=["Settings & Workspace"])

@router.get("/workspace")
def get_workspace_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    icp_obj = {}
    try:
        icp_obj = json.loads(workspace.icp_config or "{}")
    except Exception:
        pass

    return {
        "id": workspace.id,
        "name": workspace.name,
        "icp_config": icp_obj,
        "created_at": workspace.created_at,
        "updated_at": workspace.updated_at
    }

@router.put("/workspace")
def update_workspace_settings(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace = db.query(Workspace).filter(Workspace.id == current_user.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    if "name" in data:
        workspace.name = data["name"]
    if "icp_config" in data:
        workspace.icp_config = json.dumps(data["icp_config"])

    db.commit()
    db.refresh(workspace)

    icp_obj = {}
    try:
        icp_obj = json.loads(workspace.icp_config or "{}")
    except Exception:
        pass

    return {
        "id": workspace.id,
        "name": workspace.name,
        "icp_config": icp_obj,
        "updated_at": workspace.updated_at
    }

@router.get("/audit-logs", response_model=List[ActivityLogOut])
def get_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(AuditLog).filter(
        AuditLog.workspace_id == current_user.workspace_id
    ).order_by(desc(AuditLog.timestamp)).limit(limit).all()

    results = []
    for log in logs:
        details_obj = {}
        try:
            details_obj = json.loads(log.details or "{}")
        except Exception:
            pass
        results.append(ActivityLogOut(
            id=log.id,
            action=log.action,
            entity_type=log.entity_type,
            entity_id=log.entity_id,
            user_email=log.user_email,
            details=details_obj,
            timestamp=log.timestamp
        ))
    return results
