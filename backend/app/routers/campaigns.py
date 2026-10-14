import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User
from app.models.lead import Lead
from app.models.campaign import Campaign, CampaignLead
from app.schemas.campaign import (
    CampaignCreate,
    CampaignUpdate,
    CampaignOut,
    CampaignDetailOut,
    CampaignLeadOut,
    MessagePersonalizationPreview
)
from app.services.outreach_service import OutreachService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/campaigns", tags=["Outreach Campaigns"])

def format_campaign_out(c: Campaign) -> CampaignOut:
    criteria = {}
    try:
        criteria = json.loads(c.target_criteria or "{}")
    except Exception:
        pass

    return CampaignOut(
        id=c.id,
        workspace_id=c.workspace_id,
        name=c.name,
        channel=c.channel,
        status=c.status,
        target_criteria=criteria,
        message_template=c.message_template,
        follow_up_template=c.follow_up_template,
        follow_up_delay_days=c.follow_up_delay_days,
        sent_count=c.sent_count,
        reply_count=c.reply_count,
        qualified_count=c.qualified_count,
        meeting_count=c.meeting_count,
        opt_out_count=c.opt_out_count,
        total_leads_count=len(c.leads) if c.leads else 0,
        created_at=c.created_at,
        updated_at=c.updated_at
    )

def format_campaign_lead_out(cl: CampaignLead) -> CampaignLeadOut:
    lead = cl.lead
    return CampaignLeadOut(
        id=cl.id,
        campaign_id=cl.campaign_id,
        lead_id=cl.lead_id,
        lead_name=f"{lead.first_name} {lead.last_name}" if lead else "Unknown",
        lead_email=lead.email if lead else None,
        lead_company=lead.company_name if lead else "Unknown",
        lead_designation=lead.designation if lead else None,
        status=cl.status,
        personalized_message=cl.personalized_message,
        sent_at=cl.sent_at,
        reply_at=cl.reply_at,
        error_message=cl.error_message
    )

@router.get("", response_model=List[CampaignOut])
def list_campaigns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaigns = db.query(Campaign).filter(
        Campaign.workspace_id == current_user.workspace_id
    ).order_by(desc(Campaign.created_at)).all()
    return [format_campaign_out(c) for c in campaigns]

@router.post("", response_model=CampaignOut)
def create_campaign(
    camp_in: CampaignCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = Campaign(
        workspace_id=current_user.workspace_id,
        name=camp_in.name,
        channel=camp_in.channel,
        status="draft",
        target_criteria=json.dumps(camp_in.target_criteria or {}),
        message_template=camp_in.message_template,
        follow_up_template=camp_in.follow_up_template,
        follow_up_delay_days=camp_in.follow_up_delay_days
    )
    db.add(campaign)
    db.flush()

    # Associate selected leads
    lead_ids = camp_in.lead_ids or []
    if not lead_ids:
        # Default: pick available qualified/new leads in workspace
        leads = db.query(Lead).filter(
            Lead.workspace_id == current_user.workspace_id,
            Lead.status.notin_(["opted_out"])
        ).limit(10).all()
        lead_ids = [l.id for l in leads]

    for lid in lead_ids:
        cl = CampaignLead(
            campaign_id=campaign.id,
            lead_id=lid,
            status="pending"
        )
        db.add(cl)

    db.commit()
    db.refresh(campaign)
    return format_campaign_out(campaign)

@router.get("/{campaign_id}", response_model=CampaignDetailOut)
def get_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.workspace_id == current_user.workspace_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    base = format_campaign_out(campaign)
    leads_out = [format_campaign_lead_out(cl) for cl in campaign.leads]

    return CampaignDetailOut(
        **base.model_dump(),
        leads=leads_out
    )

@router.patch("/{campaign_id}", response_model=CampaignOut)
def update_campaign(
    campaign_id: str,
    camp_update: CampaignUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.workspace_id == current_user.workspace_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    update_dict = camp_update.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(campaign, k, v)

    db.commit()
    db.refresh(campaign)
    return format_campaign_out(campaign)

@router.post("/{campaign_id}/launch")
def launch_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.workspace_id == current_user.workspace_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    result = OutreachService.launch_campaign(db, campaign)
    return result

@router.post("/{campaign_id}/pause")
def pause_campaign(
    campaign_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    campaign = db.query(Campaign).filter(
        Campaign.id == campaign_id,
        Campaign.workspace_id == current_user.workspace_id
    ).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")

    campaign.status = "paused"
    db.commit()
    return {"status": "success", "campaign_status": campaign.status}

@router.post("/preview-personalization", response_model=MessagePersonalizationPreview)
async def preview_personalized_message(
    lead_id: str = Query(...),
    channel: str = Query("email"),
    template: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if template:
        msg = OutreachService.personalize_message(template, lead)
    else:
        msg = await OutreachService.generate_ai_personalized_message(lead, channel)

    return MessagePersonalizationPreview(
        lead_id=lead.id,
        lead_name=f"{lead.first_name} {lead.last_name}",
        company_name=lead.company_name,
        channel=channel,
        generated_message=msg
    )
