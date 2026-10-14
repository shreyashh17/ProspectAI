import pytest

def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_auth_login_default_admin(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@prospectai.io"

def test_dashboard_metrics(client):
    # Log in
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/dashboard/metrics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "stats" in data
    assert data["stats"]["total_leads"] > 0
    assert "trends" in data
    assert "funnel" in data

def test_leads_crud_and_filter(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # List leads
    res = client.get("/api/v1/leads", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0
    first_lead_id = data["items"][0]["id"]

    # Get single lead
    lead_res = client.get(f"/api/v1/leads/{first_lead_id}", headers=headers)
    assert lead_res.status_code == 200
    assert lead_res.json()["id"] == first_lead_id

    # Create new lead
    new_lead_res = client.post("/api/v1/leads", json={
        "first_name": "Oliver",
        "last_name": "Queen",
        "email": "oliver.queen@startech.io",
        "company_name": "Starling Tech",
        "designation": "Chief Executive Officer",
        "industry": "SaaS",
        "company_size": "51-200"
    }, headers=headers)
    assert new_lead_res.status_code == 200
    new_lead = new_lead_res.json()
    assert new_lead["first_name"] == "Oliver"
    assert new_lead["icp_match_score"] > 70.0

def test_qualification_override(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get a lead's qualification
    leads = client.get("/api/v1/leads", headers=headers).json()["items"]
    lead = leads[0]
    qual_id = lead["qualification"]["id"]

    # Override qualification
    override_res = client.post(
        f"/api/v1/qualification/{qual_id}/override",
        json={"status": "qualified", "score": 98.0, "manual_notes": "Verified enterprise budget"},
        headers=headers
    )
    assert override_res.status_code == 200
    data = override_res.json()
    assert data["status"] == "qualified"
    assert data["score"] == 98.0
    assert data["manual_override"] is True

def test_ai_sales_chatbot_opt_out_and_handoff(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a test lead
    lead = client.post("/api/v1/leads", json={
        "first_name": "TestLead",
        "last_name": "BotTester",
        "company_name": "TestCorp",
        "email": "bottest@testcorp.com"
    }, headers=headers).json()

    # Get or create conversation
    conv = client.get(f"/api/v1/conversations/lead/{lead['id']}", headers=headers).json()
    conv_id = conv["id"]

    # Send natural interest reply
    msg1 = client.post(f"/api/v1/conversations/{conv_id}/messages", json={
        "content": "Hi! We'd love to learn more about the pricing and book a demo."
    }, headers=headers).json()
    assert msg1["opted_out"] is False
    assert msg1["suggested_meeting"] is True

    # Send Human Handoff request
    msg2 = client.post(f"/api/v1/conversations/{conv_id}/messages", json={
        "content": "Can I please speak with a human or real founder?"
    }, headers=headers).json()
    assert msg2["handed_off"] is True
    assert msg2["conversation_status"] == "human_handoff"

    # Send Opt-out request
    msg3 = client.post(f"/api/v1/conversations/{conv_id}/messages", json={
        "content": "Actually, unsubscribe and remove me from your list. STOP."
    }, headers=headers).json()
    assert msg3["opted_out"] is True
    assert msg3["conversation_status"] == "opted_out"

def test_campaign_lifecycle_and_opt_out_protection(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create campaign
    camp_res = client.post("/api/v1/campaigns", json={
        "name": "Test Automated Campaign",
        "channel": "email",
        "message_template": "Hi {first_name}, from {company_name}."
    }, headers=headers)
    assert camp_res.status_code == 200
    camp = camp_res.json()
    assert camp["status"] == "draft"

    # Launch campaign
    launch_res = client.post(f"/api/v1/campaigns/{camp['id']}/launch", headers=headers)
    assert launch_res.status_code == 200
    data = launch_res.json()
    assert data["status"] == "running"
    assert data["dispatched"] >= 0

def test_calendar_availability_and_booking(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@prospectai.io",
        "password": "admin123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get slots
    slots_res = client.get("/api/v1/meetings/slots?date=2026-10-20&timezone=UTC", headers=headers)
    assert slots_res.status_code == 200
    slots = slots_res.json()
    assert len(slots) > 0
    chosen_slot = slots[0]

    # Get a lead
    leads = client.get("/api/v1/leads", headers=headers).json()["items"]
    lead = leads[0]

    # Book meeting
    book_res = client.post("/api/v1/meetings", json={
        "lead_id": lead["id"],
        "title": "Discovery Alignment Call",
        "start_time": chosen_slot["start_time"],
        "end_time": chosen_slot["end_time"],
        "timezone": "UTC",
        "notes": "Testing slot booking"
    }, headers=headers)
    assert book_res.status_code == 200
    meeting = book_res.json()
    assert meeting["status"] == "scheduled"
    assert "meet.google.com" in meeting["meeting_link"]
