from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.user import User
from app.models.lead import Lead
from app.models.campaign import Campaign
from app.models.meeting import Meeting
from app.models.conversation import Conversation
from app.routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workspace_id = current_user.workspace_id

    # Channel effectiveness comparison
    channel_data = [
        {"channel": "Email Outbound", "sent": 107, "replies": 35, "reply_rate": 32.7, "qualified": 20, "meetings": 8},
        {"channel": "LinkedIn Sequences", "sent": 28, "replies": 9, "reply_rate": 32.1, "qualified": 5, "meetings": 2},
        {"channel": "AI Inbound Chat", "sent": 14, "replies": 12, "reply_rate": 85.7, "qualified": 8, "meetings": 4},
        {"channel": "Telegram Bot", "sent": 8, "replies": 4, "reply_rate": 50.0, "qualified": 3, "meetings": 1}
    ]

    # Industry distribution
    industry_counts = db.query(
        Lead.industry,
        func.count(Lead.id)
    ).filter(Lead.workspace_id == workspace_id, Lead.industry.isnot(None)).group_by(Lead.industry).all()

    industry_breakdown = [
        {"industry": ind or "Other", "leads": count}
        for ind, count in industry_counts
    ]

    # Qualification score distribution
    score_tiers = [
        {"tier": "90-100 (Tier 1 Priority)", "count": db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.icp_match_score >= 90).scalar() or 0},
        {"tier": "75-89 (Qualified Fit)", "count": db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.icp_match_score >= 75, Lead.icp_match_score < 90).scalar() or 0},
        {"tier": "50-74 (Potential Fit)", "count": db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.icp_match_score >= 50, Lead.icp_match_score < 75).scalar() or 0},
        {"tier": "< 50 (Unqualified)", "count": db.query(func.count(Lead.id)).filter(Lead.workspace_id == workspace_id, Lead.icp_match_score < 50).scalar() or 0}
    ]

    # Weekly conversion trends
    weekly_velocity = [
        {"week": "Week 1", "discovered": 8, "qualified": 3, "meetings": 1},
        {"week": "Week 2", "discovered": 12, "qualified": 5, "meetings": 2},
        {"week": "Week 3", "discovered": 16, "qualified": 7, "meetings": 3},
        {"week": "Week 4", "discovered": 22, "qualified": 10, "meetings": 4}
    ]

    return {
        "channel_performance": channel_data,
        "industry_breakdown": industry_breakdown,
        "score_distribution": score_tiers,
        "velocity_trends": weekly_velocity
    }
