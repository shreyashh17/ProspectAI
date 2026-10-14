import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from typing import Dict, Any, Tuple, Optional
from app.models.conversation import Conversation, Message
from app.models.lead import Lead
from app.models.qualification import QualificationResult
from app.models.audit import AuditLog
from app.services.ai_service import ai_service

OPT_OUT_KEYWORDS = [
    "stop", "unsubscribe", "opt out", "opt-out", "remove me", "don't contact me", 
    "do not contact", "not interested", "leave me alone", "cancel"
]

HUMAN_HANDOFF_KEYWORDS = [
    "human", "real person", "agent", "representative", "speak to someone", 
    "talk to a person", "founder", "sales rep", "call me", "escalate"
]

INTEREST_KEYWORDS = [
    "yes", "demo", "pricing", "cost", "schedule", "meeting", "book", "available", 
    "interested", "tell me more", "how does it work", "sounds good"
]

class ChatbotService:
    @classmethod
    async def process_user_message(
        cls, db: Session, conversation: Conversation, user_message_text: str
    ) -> Tuple[Message, Dict[str, Any]]:
        """
        Process an incoming user/prospect message, extract intent, update DB entities,
        and generate an AI response.
        """
        lower_text = user_message_text.strip().lower()
        lead = conversation.lead
        workspace_id = lead.workspace_id

        # 1. Save incoming user message
        lead_msg = Message(
            conversation_id=conversation.id,
            sender="lead",
            content=user_message_text,
            metadata_json=json.dumps({"received_at": datetime.now(timezone.utc).isoformat()})
        )
        db.add(lead_msg)
        conversation.unread_count = 0

        # 2. Check for Immediate Opt-out
        if any(keyword in lower_text for keyword in OPT_OUT_KEYWORDS):
            conversation.status = "opted_out"
            conversation.extracted_intent = "opt_out"
            lead.status = "opted_out"
            
            ai_reply_text = (
                f"You have been successfully opted out and removed from our outreach list. "
                f"We respect your preference and will not contact you again. Have a great day!"
            )
            bot_msg = Message(
                conversation_id=conversation.id,
                sender="ai",
                content=ai_reply_text,
                metadata_json=json.dumps({"opt_out_detected": True, "action": "suppress_contact"})
            )
            db.add(bot_msg)
            
            audit = AuditLog(
                workspace_id=workspace_id,
                action="OPT_OUT_PROCESSED",
                entity_type="lead",
                entity_id=lead.id,
                details=json.dumps({"reason": "Keyword detected", "text": user_message_text})
            )
            db.add(audit)
            db.commit()
            db.refresh(bot_msg)
            
            return bot_msg, {
                "opted_out": True,
                "handed_off": False,
                "suggested_meeting": False,
                "intent": "opt_out",
                "status": "opted_out"
            }

        # 3. Check for Human Handoff Request
        if any(keyword in lower_text for keyword in HUMAN_HANDOFF_KEYWORDS):
            conversation.status = "human_handoff"
            conversation.extracted_intent = "escalated"
            
            ai_reply_text = (
                f"I completely understand! I have paused automated responses and routed this conversation "
                f"directly to our sales specialist. A team member will follow up with you directly shortly."
            )
            bot_msg = Message(
                conversation_id=conversation.id,
                sender="ai",
                content=ai_reply_text,
                metadata_json=json.dumps({"handoff_triggered": True})
            )
            db.add(bot_msg)
            
            audit = AuditLog(
                workspace_id=workspace_id,
                action="HUMAN_HANDOFF_TRIGGERED",
                entity_type="conversation",
                entity_id=conversation.id,
                details=json.dumps({"lead_id": lead.id, "text": user_message_text})
            )
            db.add(audit)
            db.commit()
            db.refresh(bot_msg)
            
            return bot_msg, {
                "opted_out": False,
                "handed_off": True,
                "suggested_meeting": False,
                "intent": "escalated",
                "status": "human_handoff"
            }

        # 4. Context Extraction and State Tracking
        # Count previous messages to determine question stage
        past_messages = db.query(Message).filter(Message.conversation_id == conversation.id).order_by(Message.timestamp).all()
        ai_questions_asked = sum(1 for m in past_messages if m.sender == "ai")
        
        # Determine buying intent
        current_intent = conversation.extracted_intent or "exploring"
        if any(k in lower_text for k in INTEREST_KEYWORDS):
            current_intent = "interested"
        
        # Check qualification status
        qual = db.query(QualificationResult).filter(QualificationResult.lead_id == lead.id).first()
        is_qualified = qual and qual.status == "qualified"
        
        # 5. Formulate Response (Deterministic or LLM)
        if ai_service.is_live():
            system_prompt = (
                f"You are ProspectAI's friendly, professional AI sales assistant. "
                f"Always be honest that you are an AI assistant. "
                f"Your goal: qualify the prospect ({lead.first_name} at {lead.company_name}), "
                f"understand their pain points in lead generation & outreach, and ask ONE concise question at a time. "
                f"If they express interest and are qualified, offer to book a 15-minute discovery demo. "
                f"Keep responses under 3 sentences."
            )
            history_text = "\n".join([f"{m.sender}: {m.content}" for m in past_messages[-6:]])
            prompt = f"Conversation history:\n{history_text}\nLead: {user_message_text}\nAI:"
            ai_reply_text = await ai_service.generate_completion(system_prompt, prompt, temperature=0.6)
        else:
            # Deterministic conversational tree
            if any(k in lower_text for k in ["demo", "meeting", "book", "schedule"]):
                ai_reply_text = (
                    f"Fantastic! I would be delighted to set up a 15-minute live demo tailored to {lead.company_name}. "
                    f"You can choose a convenient slot directly using our interactive meeting scheduler below."
                )
                current_intent = "ready_to_book"
                if lead.status != "qualified":
                    lead.status = "qualified"
                    if qual:
                        qual.status = "qualified"
                        qual.score = max(qual.score, 85.0)
            elif "pricing" in lower_text or "cost" in lower_text:
                ai_reply_text = (
                    f"Our platform starts at $99/seat/month with unlimited AI qualification and multi-channel "
                    f"automation. To ensure we recommend the right tier for {lead.company_name}, approximately "
                    f"how many new leads is your team targeting each month?"
                )
                current_intent = "interested"
            elif any(k in lower_text for k in ["yes", "sure", "sounds good", "interested"]):
                ai_reply_text = (
                    f"Fantastic! I would be delighted to walk you through how ProspectAI works for {lead.company_name}. "
                    f"Would you like to book a quick 15-minute discovery demo?"
                )
                current_intent = "ready_to_book"
                if qual:
                    qual.status = "qualified"
                    qual.score = max(qual.score, 85.0)
            elif ai_questions_asked == 1:
                ai_reply_text = (
                    f"Thank you for sharing that, {lead.first_name}. What is currently your biggest hurdle "
                    f"when reaching out to target accounts—finding verified prospects, or personalizing follow-ups at scale?"
                )
            elif ai_questions_asked == 2:
                ai_reply_text = (
                    f"That is very common for teams in {lead.industry or 'your industry'}. "
                    f"ProspectAI automatically qualifies prospect profiles and handles conversational follow-up autonomously. "
                    f"Would you be open to a quick 15-minute walkthrough this week to see it in action?"
                )
                current_intent = "interested"
            else:
                ai_reply_text = (
                    f"Thanks for following up, {lead.first_name}! Would Thursday at 2:00 PM UTC work well for a quick "
                    f"overview of our AI lead automation platform, or would another day suit your calendar better?"
                )
                current_intent = "ready_to_book"

        # Update Conversation & Lead intent
        conversation.extracted_intent = current_intent
        conversation.summary = f"Conversation with {lead.first_name} {lead.last_name} ({lead.company_name}). Intent: {current_intent}."
        if lead.status == "new":
            lead.status = "replied"

        # Save AI reply message
        suggested_meeting = (current_intent == "ready_to_book" or "demo" in ai_reply_text.lower() or "slot" in ai_reply_text.lower() or "walkthrough" in ai_reply_text.lower())
        bot_msg = Message(
            conversation_id=conversation.id,
            sender="ai",
            content=ai_reply_text,
            metadata_json=json.dumps({"suggested_meeting": suggested_meeting, "intent": current_intent})
        )
        db.add(bot_msg)
        db.commit()
        db.refresh(bot_msg)

        return bot_msg, {
            "opted_out": False,
            "handed_off": False,
            "suggested_meeting": suggested_meeting,
            "intent": current_intent,
            "status": conversation.status,
            "qualification_status": lead.status,
            "qualification_score": lead.icp_match_score
        }

    @staticmethod
    def get_or_create_conversation(db: Session, lead_id: str, channel: str = "chat") -> Conversation:
        conv = db.query(Conversation).filter(
            Conversation.lead_id == lead_id,
            Conversation.channel == channel
        ).first()
        
        if not conv:
            lead = db.query(Lead).filter(Lead.id == lead_id).first()
            conv = Conversation(
                lead_id=lead_id,
                channel=channel,
                status="active",
                extracted_intent="exploring",
                summary=f"New conversation initiated with {lead.first_name if lead else 'prospect'}"
            )
            db.add(conv)
            db.flush()

            # Add welcome message
            greeting = (
                f"Hello {lead.first_name if lead else 'there'}! I am ProspectAI's assistant. "
                f"I'm here to help you evaluate how AI-powered lead qualification and client outreach "
                f"can accelerate sales at {lead.company_name if lead else 'your company'}. "
                f"Are you currently exploring ways to improve your outbound pipeline?"
            )
            welcome_msg = Message(
                conversation_id=conv.id,
                sender="ai",
                content=greeting,
                metadata_json=json.dumps({"initial_greeting": True})
            )
            db.add(welcome_msg)
            db.commit()
            db.refresh(conv)

        return conv
