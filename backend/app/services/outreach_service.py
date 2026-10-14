import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.models.campaign import Campaign, CampaignLead
from app.models.lead import Lead
from app.models.conversation import Conversation, Message
from app.models.audit import AuditLog
from app.services.ai_service import ai_service

DEFAULT_EMAIL_TEMPLATE = (
    "Hi {first_name},\n\n"
    "I was researching high-growth leaders in {industry} and came across your role as {designation} at {company_name}.\n\n"
    "We recently built ProspectAI to help sales and growth teams qualify leads and automate outreach conversations autonomously. "
    "Our clients typically see a 3x lift in qualified pipeline while cutting response times from hours to seconds.\n\n"
    "Would you be open to a quick 10-minute discovery call this Thursday to see how this fits {company_name}'s goals?\n\n"
    "Best regards,\nProspectAI Team"
)

DEFAULT_LINKEDIN_TEMPLATE = (
    "Hi {first_name}, great to connect! Loved seeing {company_name}'s recent momentum in {industry}. "
    "We're helping similar teams scale their qualified meetings automatically with AI agents. "
    "Open to exchanging notes on your pipeline workflow?"
)

DEFAULT_TELEGRAM_TEMPLATE = (
    "Hello {first_name}! Notice from ProspectAI for {company_name}. "
    "Your inbound qualification assistant is ready. Reply 'demo' to schedule an automated walkthrough."
)

class OutreachService:
    @classmethod
    def personalize_message(cls, template: str, lead: Lead) -> str:
        """Substitute variables into the message template safely."""
        return template.format(
            first_name=lead.first_name,
            last_name=lead.last_name,
            company_name=lead.company_name,
            designation=lead.designation or "Leader",
            industry=lead.industry or "Technology",
            location=lead.location or "your market"
        )

    @classmethod
    async def generate_ai_personalized_message(cls, lead: Lead, channel: str) -> str:
        """Call AI to generate hyper-personalized outreach based on lead's profile and pain points."""
        system_prompt = (
            f"You are a top-tier B2B sales development representative writing a high-converting, "
            f"authentic outreach message on {channel.upper()}. Keep it crisp, highly tailored, "
            f"mentioning their role, company, and value proposition without sounding generic or spammy."
        )
        user_prompt = (
            f"Write a {channel} outreach message for:\n"
            f"Name: {lead.first_name} {lead.last_name}\n"
            f"Role: {lead.designation}\n"
            f"Company: {lead.company_name}\n"
            f"Industry: {lead.industry}\n"
            f"Notes/Pain Points: {lead.notes or 'Scaling pipeline efficiently'}\n"
        )
        return await ai_service.generate_completion(system_prompt, user_prompt)

    @classmethod
    def launch_campaign(cls, db: Session, campaign: Campaign) -> Dict[str, Any]:
        """Launch campaign, process pending leads, and simulate sends & replies."""
        campaign.status = "running"
        template = campaign.message_template or DEFAULT_EMAIL_TEMPLATE

        # Fetch associated leads
        campaign_leads = db.query(CampaignLead).filter(
            CampaignLead.campaign_id == campaign.id
        ).all()

        dispatched = 0
        skipped_opt_out = 0

        for cl in campaign_leads:
            lead = cl.lead
            if not lead:
                continue

            # Respect opt-out unconditionally!
            if lead.status == "opted_out":
                cl.status = "opted_out"
                cl.error_message = "Lead previously requested opt-out; outreach suppressed."
                skipped_opt_out += 1
                continue

            # Personalize message
            if not cl.personalized_message:
                cl.personalized_message = cls.personalize_message(template, lead)

            # Mark sent
            cl.status = "sent"
            cl.sent_at = datetime.now(timezone.utc)
            dispatched += 1

            if lead.status == "new":
                lead.status = "contacted"

        campaign.sent_count = dispatched
        campaign.opt_out_count = skipped_opt_out

        # In demo mode, simulate 30% replies after launching
        if dispatched > 0:
            import random
            replied_count = 0
            for i, cl in enumerate(campaign_leads):
                if cl.status == "sent" and i % 3 == 0:
                    cl.status = "replied"
                    cl.reply_at = datetime.now(timezone.utc)
                    replied_count += 1
                    
                    # Create or update conversation thread
                    conv = db.query(Conversation).filter(Conversation.lead_id == cl.lead_id).first()
                    if not conv:
                        conv = Conversation(
                            lead_id=cl.lead_id,
                            channel=campaign.channel,
                            status="active",
                            extracted_intent="interested",
                            summary="Interested prospect replying to outreach campaign."
                        )
                        db.add(conv)
                        db.flush()

                    # Add sent outreach message
                    db.add(Message(
                        conversation_id=conv.id,
                        sender="ai",
                        content=cl.personalized_message,
                        timestamp=cl.sent_at
                    ))
                    # Add lead's realistic reply
                    sample_replies = [
                        "Hi! Thanks for reaching out. We are actually evaluating tools for this right now. What's the pricing?",
                        "Hey team, sounds interesting. Could you send over a demo link or deck?",
                        "Hi there, this is relevant to what our team is working on. Are you available for a 15 min chat?"
                    ]
                    db.add(Message(
                        conversation_id=conv.id,
                        sender="lead",
                        content=sample_replies[i % len(sample_replies)],
                        timestamp=datetime.now(timezone.utc)
                    ))
                    cl.lead.status = "replied"

            campaign.reply_count = replied_count

        audit = AuditLog(
            workspace_id=campaign.workspace_id,
            action="CAMPAIGN_LAUNCHED",
            entity_type="campaign",
            entity_id=campaign.id,
            details=json.dumps({"dispatched": dispatched, "channel": campaign.channel})
        )
        db.add(audit)
        db.commit()

        return {"dispatched": dispatched, "skipped_opt_out": skipped_opt_out, "status": campaign.status}
