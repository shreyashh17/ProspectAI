import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User
from app.models.lead import Lead
from app.models.conversation import Conversation, Message
from app.schemas.conversation import (
    ConversationOut,
    ConversationDetailOut,
    MessageOut,
    MessageCreate,
    ChatReplyResponse
)
from app.services.chatbot_service import ChatbotService
from app.routers.auth import get_current_user

router = APIRouter(prefix="/conversations", tags=["Conversations & AI Chatbot"])

def format_message(m: Message) -> MessageOut:
    metadata = {}
    try:
        metadata = json.loads(m.metadata_json or "{}")
    except Exception:
        pass
    return MessageOut(
        id=m.id,
        conversation_id=m.conversation_id,
        sender=m.sender,
        content=m.content,
        metadata=metadata,
        timestamp=m.timestamp
    )

def format_conversation_out(conv: Conversation) -> ConversationOut:
    last_msg = None
    last_msg_at = None
    if conv.messages:
        sorted_msgs = sorted(conv.messages, key=lambda x: x.timestamp)
        last_msg = sorted_msgs[-1].content
        last_msg_at = sorted_msgs[-1].timestamp

    lead = conv.lead
    return ConversationOut(
        id=conv.id,
        lead_id=conv.lead_id,
        lead_name=f"{lead.first_name} {lead.last_name}" if lead else "Unknown",
        lead_email=lead.email if lead else None,
        lead_company=lead.company_name if lead else "Unknown",
        lead_designation=lead.designation if lead else None,
        lead_status=lead.status if lead else "new",
        channel=conv.channel,
        status=conv.status,
        unread_count=conv.unread_count,
        summary=conv.summary,
        extracted_intent=conv.extracted_intent,
        last_message=last_msg,
        last_message_at=last_msg_at,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )

@router.get("", response_model=List[ConversationOut])
def list_conversations(
    filter_status: Optional[str] = Query(None),
    channel: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Conversation).join(Lead).filter(Lead.workspace_id == current_user.workspace_id)

    if filter_status and filter_status != "all":
        if filter_status == "unread":
            query = query.filter(Conversation.unread_count > 0)
        else:
            query = query.filter(Conversation.status == filter_status)

    if channel and channel != "all":
        query = query.filter(Conversation.channel == channel)

    conversations = query.order_by(desc(Conversation.updated_at)).all()
    return [format_conversation_out(c) for c in conversations]

@router.get("/lead/{lead_id}", response_model=ConversationDetailOut)
def get_or_start_lead_conversation(
    lead_id: str,
    channel: str = Query("chat"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.workspace_id == current_user.workspace_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    conv = ChatbotService.get_or_create_conversation(db, lead_id, channel)
    base_out = format_conversation_out(conv)
    msgs = [format_message(m) for m in conv.messages]
    
    return ConversationDetailOut(
        **base_out.model_dump(),
        messages=msgs
    )

@router.get("/{conversation_id}", response_model=ConversationDetailOut)
def get_conversation_detail(
    conversation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).join(Lead).filter(
        Conversation.id == conversation_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.unread_count = 0
    db.commit()

    base_out = format_conversation_out(conv)
    msgs = [format_message(m) for m in conv.messages]

    return ConversationDetailOut(
        **base_out.model_dump(),
        messages=msgs
    )

@router.post("/{conversation_id}/messages", response_model=ChatReplyResponse)
async def post_message(
    conversation_id: str,
    msg_in: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).join(Lead).filter(
        Conversation.id == conversation_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conv.status == "opted_out" and msg_in.sender != "human_agent":
        raise HTTPException(status_code=400, detail="This conversation is opted out. Outbound messaging is prohibited.")

    if msg_in.sender == "human_agent":
        # Manual reply from sales rep
        human_msg = Message(
            conversation_id=conv.id,
            sender="human_agent",
            content=msg_in.content,
            metadata_json=json.dumps({"agent": current_user.full_name, "email": current_user.email})
        )
        db.add(human_msg)
        conv.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(human_msg)

        return ChatReplyResponse(
            message=format_message(human_msg),
            conversation_status=conv.status,
            extracted_intent=conv.extracted_intent,
            suggested_meeting=False,
            opted_out=False,
            handed_off=conv.status == "human_handoff"
        )

    # Lead message -> Process with conversational AI
    bot_msg, state_info = await ChatbotService.process_user_message(
        db=db,
        conversation=conv,
        user_message_text=msg_in.content
    )

    return ChatReplyResponse(
        message=format_message(bot_msg),
        conversation_status=conv.status,
        extracted_intent=conv.extracted_intent,
        qualification_status=state_info.get("qualification_status"),
        qualification_score=state_info.get("qualification_score"),
        suggested_meeting=state_info.get("suggested_meeting", False),
        opted_out=state_info.get("opted_out", False),
        handed_off=state_info.get("handed_off", False)
    )

@router.post("/{conversation_id}/handoff")
def toggle_human_handoff(
    conversation_id: str,
    enable: bool = Query(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).join(Lead).filter(
        Conversation.id == conversation_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.status = "human_handoff" if enable else "active"
    db.commit()
    return {"status": "success", "conversation_status": conv.status}

@router.post("/{conversation_id}/status")
def update_conversation_status(
    conversation_id: str,
    new_status: str = Query(..., regex="^(active|paused|closed|opted_out)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    conv = db.query(Conversation).join(Lead).filter(
        Conversation.id == conversation_id,
        Lead.workspace_id == current_user.workspace_id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.status = new_status
    if new_status == "opted_out":
        conv.lead.status = "opted_out"
    db.commit()
    return {"status": "success", "conversation_status": conv.status}
