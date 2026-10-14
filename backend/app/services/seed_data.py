import json
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User, Workspace
from app.models.lead import Lead
from app.models.qualification import QualificationResult
from app.models.conversation import Conversation, Message
from app.models.campaign import Campaign, CampaignLead
from app.models.meeting import Meeting
from app.models.integration import Integration
from app.models.audit import AuditLog
from app.core.security import get_password_hash

def seed_database(db: Session):
    """Seed comprehensive demo dataset if database is empty."""
    if db.query(User).first():
        print("[Seed] Database already seeded. Skipping.")
        return

    print("[Seed] Seeding ProspectAI database with rich demo data...")

    # 1. Create Workspace
    icp_config = {
        "industries": ["SaaS", "Software", "FinTech", "Artificial Intelligence", "Healthcare"],
        "job_titles": ["VP of Sales", "Head of Growth", "Chief Commercial Officer", "Founder", "Director of Marketing"],
        "locations": ["San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Remote"],
        "company_sizes": ["51-200", "201-500", "501-1000"],
        "keywords": ["pipeline", "outbound", "automation", "qualification", "revenue"],
        "min_budget": 5000
    }
    workspace = Workspace(
        name="Acme HyperGrowth SaaS",
        icp_config=json.dumps(icp_config)
    )
    db.add(workspace)
    db.flush()

    # 2. Create Users
    admin_user = User(
        email="admin@prospectai.io",
        hashed_password=get_password_hash("admin123"),
        full_name="Alexander Wright",
        role="admin",
        workspace_id=workspace.id
    )
    rep_user = User(
        email="sarah.sales@prospectai.io",
        hashed_password=get_password_hash("sales123"),
        full_name="Sarah Miller",
        role="sales_rep",
        workspace_id=workspace.id
    )
    db.add_all([admin_user, rep_user])
    db.flush()

    # 3. Create Seed Leads
    leads_data = [
        {
            "first_name": "Elena", "last_name": "Rostova",
            "email": "elena.rostova@cloudscale.io", "phone": "+1 (415) 890-1234",
            "designation": "VP of Growth & Operations", "company_name": "CloudScale Systems",
            "company_size": "201-500", "industry": "SaaS", "location": "San Francisco, CA",
            "website": "https://cloudscale.io", "linkedin_url": "https://linkedin.com/in/elena-rostova",
            "status": "meeting_scheduled", "score": 92.0, "source": "discovery",
            "notes": "Fast growing B2B cloud monitoring platform. Scaling outbound team from 3 to 15 reps."
        },
        {
            "first_name": "Marcus", "last_name": "Chen",
            "email": "marcus.chen@finovate.tech", "phone": "+1 (212) 555-7890",
            "designation": "Head of Enterprise Sales", "company_name": "Finovate Tech",
            "company_size": "51-200", "industry": "FinTech", "location": "New York, NY",
            "website": "https://finovate.tech", "linkedin_url": "https://linkedin.com/in/marcus-chen",
            "status": "qualified", "score": 88.5, "source": "discovery",
            "notes": "Looking for automated qualification to filter incoming requests and high-value outbound."
        },
        {
            "first_name": "Lucas", "last_name": "Vanderbilt",
            "email": "lucas.v@cyberguard.net", "phone": "+1 (312) 440-9821",
            "designation": "VP of Global Marketing", "company_name": "CyberGuard Security",
            "company_size": "501-1000", "industry": "Technology", "location": "Chicago, IL",
            "website": "https://cyberguard.net", "linkedin_url": "https://linkedin.com/in/lucas-v",
            "status": "qualified", "score": 85.0, "source": "csv_import",
            "notes": "Evaluating AI chatbots for instant website visitor qualification."
        },
        {
            "first_name": "Sarah", "last_name": "Jenkins",
            "email": "sarah.j@nexushr.com", "phone": "+1 (512) 300-4567",
            "designation": "Chief Commercial Officer", "company_name": "NexusHR",
            "company_size": "500-1000", "industry": "Software", "location": "Austin, TX",
            "website": "https://nexushr.com", "linkedin_url": "https://linkedin.com/in/sarah-jenkins",
            "status": "replied", "score": 79.0, "source": "discovery",
            "notes": "Expressed interest in Telegram and LinkedIn multi-touch sequences."
        },
        {
            "first_name": "David", "last_name": "Kim",
            "email": "david.k@synthetica.ai", "phone": "+1 (206) 789-0123",
            "designation": "Founder & CEO", "company_name": "Synthetica AI",
            "company_size": "11-50", "industry": "Artificial Intelligence", "location": "Seattle, WA",
            "website": "https://synthetica.ai", "linkedin_url": "https://linkedin.com/in/david-kim",
            "status": "potential", "score": 68.0, "source": "manual",
            "notes": "Early stage AI startup. High interest, evaluating software budget allocation."
        },
        {
            "first_name": "Priya", "last_name": "Sharma",
            "email": "priya.sharma@logiqflow.com", "phone": "+1 (404) 992-3344",
            "designation": "Head of Business Development", "company_name": "LogiqFlow Logistics",
            "company_size": "51-200", "industry": "Supply Chain", "location": "Atlanta, GA",
            "website": "https://logiqflow.com", "linkedin_url": "https://linkedin.com/in/priya-sharma",
            "status": "potential", "score": 64.0, "source": "discovery",
            "notes": "High inbound volume; SDRs struggling to keep up with SLA."
        },
        {
            "first_name": "Amina", "last_name": "Diallo",
            "email": "amina@biovista.health", "phone": "+1 (617) 223-9001",
            "designation": "Director of Commercial Partnerships", "company_name": "BioVista Health",
            "company_size": "201-500", "industry": "Healthcare", "location": "Boston, MA",
            "website": "https://biovista.health", "linkedin_url": "https://linkedin.com/in/amina-diallo",
            "status": "contacted", "score": 74.0, "source": "discovery",
            "notes": "Requested compliance info regarding lead data handling."
        },
        {
            "first_name": "Julian", "last_name": "Moreau",
            "email": "julian@aperturedata.co", "phone": "+44 20 7946 0912",
            "designation": "Chief Operating Officer", "company_name": "Aperture Data",
            "company_size": "51-200", "industry": "Cloud Computing", "location": "London, UK",
            "website": "https://aperturedata.co", "linkedin_url": "https://linkedin.com/in/julian-moreau",
            "status": "new", "score": 72.0, "source": "discovery",
            "notes": "Imported from European Tech ICP list."
        },
        {
            "first_name": "Arthur", "last_name": "Pendleton",
            "email": "arthur@tradewinds.org", "phone": "+1 (305) 555-1122",
            "designation": "Purchasing Specialist", "company_name": "TradeWinds Maritime",
            "company_size": "10-25", "industry": "Shipping", "location": "Miami, FL",
            "website": "https://tradewinds.org", "linkedin_url": "https://linkedin.com/in/arthur-p",
            "status": "not_qualified", "score": 38.0, "source": "inbound",
            "notes": "Non-target industry; no budget authority for outbound AI software."
        },
        {
            "first_name": "Robert", "last_name": "Vance",
            "email": "bob.vance@vancerefrig.com", "phone": "+1 (570) 555-4321",
            "designation": "President", "company_name": "Vance Refrigeration",
            "company_size": "15-30", "industry": "HVAC & Appliances", "location": "Scranton, PA",
            "website": "https://vancerefrig.com", "linkedin_url": "https://linkedin.com/in/bob-vance",
            "status": "opted_out", "score": 32.0, "source": "csv_import",
            "notes": "Replied 'STOP' on campaign outreach; contact suppressed."
        }
    ]

    saved_leads = []
    for l_data in leads_data:
        lead = Lead(
            workspace_id=workspace.id,
            first_name=l_data["first_name"],
            last_name=l_data["last_name"],
            email=l_data["email"],
            phone=l_data["phone"],
            designation=l_data["designation"],
            company_name=l_data["company_name"],
            company_size=l_data["company_size"],
            industry=l_data["industry"],
            location=l_data["location"],
            website=l_data["website"],
            linkedin_url=l_data["linkedin_url"],
            status=l_data["status"],
            icp_match_score=l_data["score"],
            source=l_data["source"],
            notes=l_data["notes"]
        )
        db.add(lead)
        db.flush()
        saved_leads.append(lead)

        # Add Qualification Results
        qual_status = "qualified" if l_data["score"] >= 75 else ("potential" if l_data["score"] >= 50 else "not_qualified")
        qual = QualificationResult(
            lead_id=lead.id,
            score=l_data["score"],
            status=qual_status,
            reason=f"Scored {l_data['score']}/100. Match on {lead.industry} and {lead.designation}.",
            pain_points=json.dumps([
                f"High SDR response latency at {lead.company_name}",
                "Manual prospecting bottleneck",
                "Unqualified calendar bookings"
            ]),
            requirements=json.dumps([
                "Real-time AI qualification chatbot",
                "Automated calendar integration",
                "Bi-directional CRM sync"
            ]),
            missing_info=json.dumps(["Quarterly marketing budget", "Contract renewal dates"]),
            buying_intent="high" if l_data["score"] >= 80 else ("medium" if l_data["score"] >= 50 else "low"),
            authority_fit="decision_maker" if "VP" in lead.designation or "Chief" in lead.designation or "Head" in lead.designation else "influencer",
            budget_fit="likely" if l_data["score"] >= 75 else "unknown",
            need_fit="strong" if l_data["score"] >= 75 else "moderate",
            timeline_fit="immediate" if l_data["score"] >= 85 else "1_3_months",
            recommended_action="Schedule 15-minute executive walkthrough demo." if qual_status == "qualified" else "Nurture with educational case studies.",
            summary=f"Key decision maker at {lead.company_name}. Strong potential ROI from automated AI qualification."
        )
        db.add(qual)

    db.commit()

    # 4. Create Conversations & Messages
    # Conversation 1: Elena Rostova (Scheduled meeting)
    elena = saved_leads[0]
    conv1 = Conversation(
        lead_id=elena.id,
        channel="chat",
        status="active",
        unread_count=0,
        summary="Elena expressed urgent need for outbound automation; scheduled 15-min discovery demo.",
        extracted_intent="ready_to_book"
    )
    db.add(conv1)
    db.flush()

    now = datetime.now(timezone.utc)
    db.add_all([
        Message(conversation_id=conv1.id, sender="ai", content="Hello Elena! I am ProspectAI's sales assistant. Are you currently looking into AI-powered outreach for CloudScale?", timestamp=now - timedelta(hours=5)),
        Message(conversation_id=conv1.id, sender="lead", content="Hi! Yes, our sales development reps are spending over 4 hours a day manually qualifying accounts. We need an automated solution.", timestamp=now - timedelta(hours=4, minutes=45)),
        Message(conversation_id=conv1.id, sender="ai", content="That's a huge time drain. ProspectAI automatically qualifies prospects against your ICP and handles conversational discovery before booking. Would a quick demo this Thursday help?", timestamp=now - timedelta(hours=4, minutes=30)),
        Message(conversation_id=conv1.id, sender="lead", content="Yes, Thursday works great. Let's lock in a time.", timestamp=now - timedelta(hours=4, minutes=15)),
        Message(conversation_id=conv1.id, sender="ai", content="Perfect! I have reserved Thursday at 2:00 PM UTC for a 15-minute discovery call with Alexander Wright.", timestamp=now - timedelta(hours=4))
    ])

    # Conversation 2: Marcus Chen (Qualified, Exploring)
    marcus = saved_leads[1]
    conv2 = Conversation(
        lead_id=marcus.id,
        channel="email",
        status="active",
        unread_count=1,
        summary="Marcus inquired about enterprise security and multi-channel sequencing.",
        extracted_intent="interested"
    )
    db.add(conv2)
    db.flush()
    db.add_all([
        Message(conversation_id=conv2.id, sender="ai", content="Hi Marcus, saw Finovate's expansion. Are you automating prospect outreach across LinkedIn and Email?", timestamp=now - timedelta(days=1)),
        Message(conversation_id=conv2.id, sender="lead", content="Thanks for reaching out! We use email, but we've been wanting to add LinkedIn touchpoints safely. How do you handle compliance?", timestamp=now - timedelta(hours=8)),
        Message(conversation_id=conv2.id, sender="ai", content="We use authorized LinkedIn draft generation with human-in-the-loop confirmation and simulated sandbox modes to ensure zero account risk. Would you like to review a sample sequence?", timestamp=now - timedelta(hours=6))
    ])

    # Conversation 3: Sarah Jenkins (Human Handoff)
    sarah_lead = saved_leads[3]
    conv3 = Conversation(
        lead_id=sarah_lead.id,
        channel="chat",
        status="human_handoff",
        unread_count=1,
        summary="Prospect requested direct discussion with a founder/technical lead regarding custom CRM hooks.",
        extracted_intent="escalated"
    )
    db.add(conv3)
    db.flush()
    db.add_all([
        Message(conversation_id=conv3.id, sender="ai", content="Hello Sarah! Welcome to ProspectAI.", timestamp=now - timedelta(hours=2)),
        Message(conversation_id=conv3.id, sender="lead", content="Hi, can I speak to a real person or founder? We have custom on-premise CRM hooks and I need technical clarification.", timestamp=now - timedelta(hours=1, minutes=40)),
        Message(conversation_id=conv3.id, sender="ai", content="I completely understand! I have paused automated responses and routed this directly to our team. Alexander Wright will connect with you shortly.", timestamp=now - timedelta(hours=1, minutes=38))
    ])

    # Conversation 4: Robert Vance (Opted Out)
    bob_lead = saved_leads[9]
    conv4 = Conversation(
        lead_id=bob_lead.id,
        channel="email",
        status="opted_out",
        unread_count=0,
        summary="Opted out via campaign reply.",
        extracted_intent="opt_out"
    )
    db.add(conv4)
    db.flush()
    db.add_all([
        Message(conversation_id=conv4.id, sender="ai", content="Hi Robert, would you be interested in AI lead qualification for Vance Refrigeration?", timestamp=now - timedelta(days=2)),
        Message(conversation_id=conv4.id, sender="lead", content="STOP. Unsubscribe.", timestamp=now - timedelta(days=1, hours=22)),
        Message(conversation_id=conv4.id, sender="ai", content="You have been unsubscribed and will not receive further outreach from us.", timestamp=now - timedelta(days=1, hours=21))
    ])

    # 5. Create Meetings
    meeting1 = Meeting(
        lead_id=elena.id,
        user_id=admin_user.id,
        title="ProspectAI Discovery & Demo - Elena Rostova (CloudScale)",
        start_time=now + timedelta(days=1, hours=2),
        end_time=now + timedelta(days=1, hours=2, minutes=30),
        timezone="UTC",
        google_calendar_event_id="gcal_elena_001",
        meeting_link="https://meet.google.com/pro-ai-demo",
        status="scheduled",
        notes="Focus on SDR automated qualification and calendar dispatch."
    )
    meeting2 = Meeting(
        lead_id=marcus.id,
        user_id=rep_user.id,
        title="Finovate Tech Architecture Alignment",
        start_time=now + timedelta(days=3, hours=4),
        end_time=now + timedelta(days=3, hours=4, minutes=45),
        timezone="America/New_York",
        google_calendar_event_id="gcal_marcus_002",
        meeting_link="https://meet.google.com/pro-fin-tech",
        status="scheduled",
        notes="Review enterprise security and CRM integration requirements."
    )
    db.add_all([meeting1, meeting2])

    # 6. Create Campaigns
    camp1 = Campaign(
        workspace_id=workspace.id,
        name="Q4 Enterprise SaaS Outbound",
        channel="email",
        status="running",
        target_criteria=json.dumps({"industry": "SaaS", "role": "VP / Head", "size": "50-500"}),
        message_template="Hi {first_name},\n\nNoticed how {company_name} is accelerating its pipeline in {industry}. Are you automating your SDR qualification yet?",
        follow_up_template="Hi {first_name},\n\nFollowing up on my previous note. Thought this case study on cutting qualification lag by 65% would interest you.",
        follow_up_delay_days=3,
        sent_count=42,
        reply_count=14,
        qualified_count=8,
        meeting_count=3,
        opt_out_count=1
    )
    camp2 = Campaign(
        workspace_id=workspace.id,
        name="FinTech Growth Leaders - US",
        channel="email",
        status="completed",
        target_criteria=json.dumps({"industry": "FinTech", "location": "US"}),
        message_template="Hi {first_name},\n\nReaching out to leaders at {company_name} regarding automated AI prospecting.",
        follow_up_delay_days=2,
        sent_count=65,
        reply_count=21,
        qualified_count=12,
        meeting_count=5,
        opt_out_count=2
    )
    camp3 = Campaign(
        workspace_id=workspace.id,
        name="LinkedIn Multi-Touch Sequence",
        channel="linkedin",
        status="running",
        target_criteria=json.dumps({"channels": ["linkedin"]}),
        message_template="Hi {first_name}, impressed by {company_name}'s recent milestones. Would love to share our AI qualification benchmark for your sector.",
        follow_up_delay_days=4,
        sent_count=28,
        reply_count=9,
        qualified_count=5,
        meeting_count=2,
        opt_out_count=0
    )
    camp4 = Campaign(
        workspace_id=workspace.id,
        name="AI Founders Early Adopter Sprint",
        channel="multichannel",
        status="draft",
        target_criteria=json.dumps({"industry": "Artificial Intelligence"}),
        message_template="Hi {first_name}, invitation to pilot our autonomous AI sales qualification SDR.",
        sent_count=0,
        reply_count=0,
        qualified_count=0,
        meeting_count=0,
        opt_out_count=0
    )
    db.add_all([camp1, camp2, camp3, camp4])
    db.flush()

    # Link leads to campaign 1
    for lead in saved_leads[:5]:
        cl = CampaignLead(
            campaign_id=camp1.id,
            lead_id=lead.id,
            status="replied" if lead.status in ["replied", "meeting_scheduled"] else "sent",
            sent_at=now - timedelta(days=2),
            personalized_message=f"Hi {lead.first_name},\n\nNoticed how {lead.company_name} is accelerating its pipeline in {lead.industry}. Are you automating your SDR qualification yet?"
        )
        db.add(cl)

    # 7. Create Integrations
    integrations = [
        Integration(workspace_id=workspace.id, provider="openai", status="simulated", is_active=True, config_json=json.dumps({"model": "gpt-4o-mini", "mode": "Deterministic Fallback Engine"})),
        Integration(workspace_id=workspace.id, provider="telegram", status="simulated", is_active=True, config_json=json.dumps({"bot_username": "@ProspectAISalesBot", "status": "Simulated Active"})),
        Integration(workspace_id=workspace.id, provider="linkedin", status="simulated", is_active=True, config_json=json.dumps({"mode": "Authorized Draft & Sandbox Simulation"})),
        Integration(workspace_id=workspace.id, provider="google_calendar", status="simulated", is_active=True, config_json=json.dumps({"synced_calendar": "primary@company.com", "timezone": "UTC"})),
        Integration(workspace_id=workspace.id, provider="hubspot", status="disconnected", is_active=False, config_json="{}")
    ]
    db.add_all(integrations)

    # 8. Create Audit Logs
    audit_logs = [
        AuditLog(workspace_id=workspace.id, user_email=admin_user.email, action="SYSTEM_INITIALIZED", entity_type="workspace", entity_id=workspace.id, details=json.dumps({"msg": "Workspace created with standard ICP."}), timestamp=now - timedelta(days=5)),
        AuditLog(workspace_id=workspace.id, user_email=admin_user.email, action="CAMPAIGN_LAUNCHED", entity_type="campaign", entity_id=camp1.id, details=json.dumps({"name": camp1.name}), timestamp=now - timedelta(days=3)),
        AuditLog(workspace_id=workspace.id, user_email="system@prospectai.io", action="LEAD_QUALIFIED", entity_type="lead", entity_id=elena.id, details=json.dumps({"score": 92.0, "status": "qualified"}), timestamp=now - timedelta(hours=6)),
        AuditLog(workspace_id=workspace.id, user_email="system@prospectai.io", action="MEETING_BOOKED", entity_type="meeting", entity_id=meeting1.id, details=json.dumps({"prospect": "Elena Rostova", "time": "Thursday 2:00 PM UTC"}), timestamp=now - timedelta(hours=4)),
        AuditLog(workspace_id=workspace.id, user_email="system@prospectai.io", action="OPT_OUT_PROCESSED", entity_type="lead", entity_id=bob_lead.id, details=json.dumps({"keyword": "STOP", "action": "suppressed"}), timestamp=now - timedelta(days=1))
    ]
    db.add_all(audit_logs)

    db.commit()
    print("[Seed] Successfully seeded ProspectAI with 10 leads, 4 campaigns, meetings, transcripts, and integrations!")
