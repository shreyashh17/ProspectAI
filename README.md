# ProspectAI — AI-Powered Lead Generation & Client Outreach Automation

ProspectAI is an enterprise-grade B2B SaaS platform that automates lead discovery, enrichment, multi-dimensional AI qualification, personalized multi-channel outreach, conversational sales discovery, and conflict-free calendar meeting scheduling.

Built as a full-stack, production-ready system with **zero-credential demonstration sandbox** capability, ProspectAI allows you to experience autonomous sales development out-of-the-box without requiring paid API keys.

---

## 🚀 Key Capabilities & The 7-Stage Pipeline

```
Lead Discovery ➔ Lead Enrichment ➔ AI Qualification ➔ Personalized Outreach ➔ AI Sales Chatbot ➔ Meeting Scheduling ➔ CRM Sync
```

1. **Lead Discovery & ICP Engine**:
   - Define custom Ideal Customer Profiles (industry, title seniority, company size, geographic focus, intent keywords).
   - Real-time prospect pool matching with dynamic fit scores and match reasons.
   - 1-click pipeline import with duplicate prevention by email and company.
   - Full CSV bulk import and export with standard templates.

2. **AI Lead Qualification Engine**:
   - Hybrid scoring system combining rule-based heuristics with LLM semantic synthesis.
   - Evaluates 5 dimensions: **ICP fit**, **Role authority**, **Business need/pain fit**, **Buying intent**, and **Budget/timeline**.
   - Structured JSON output: fit score (0-100), classification (`qualified`, `potential`, `not_qualified`), extracted pain points, requirements, missing information, and recommended next step.
   - Comprehensive evidence inspector with 1-click human review and audit-logged manual overrides.

3. **Persistent Conversational AI Sales Bot**:
   - Transparently introduces itself as an AI assistant.
   - Conducts natural discovery dialogue asking **1 relevant question at a time**.
   - Remembers past context and avoids repetitive inquiries.
   - Extracts pain points, tech stack bottlenecks, and buying intent from prospect messages.
   - **Immediate Opt-Out Respect**: Keywords such as `"STOP"`, `"unsubscribe"`, or `"remove me"` instantly suppress all future outreach and update database records.
   - **Human Takeover & Escalation**: Seamlessly pauses automation and alerts sales specialists when requested.
   - Dynamically offers meeting slots when the prospect qualifies and shows buying intent.

4. **Multi-Channel Outreach Campaigns**:
   - 5-step campaign creation wizard (Target Criteria, Delivery Channel, AI Message Personalization, Follow-up Rules, Confirmation).
   - Supports Email, LinkedIn (authorized drafts & sandbox simulation), Telegram Bot API, and coordinated multi-channel sequences.
   - AI personalizes copy per lead using name, company, industry, and known pain points.
   - Enforces sending limits and auto-halts follow-ups upon reply or opt-out.

5. **Conflict-Free Meeting Scheduling**:
   - Google Calendar sync with real-time free/busy slot retrieval.
   - 30-minute slot availability picker across UTC, EST, and PST timezones.
   - Automatic double-booking prevention.
   - Instant Google Meet link generation and lead timeline updates.

6. **Analytics & Conversion Telemetry**:
   - Database-driven dashboard metrics (Total leads, Qualified rate, Active campaigns, Response rate, Scheduled meetings).
   - Recharts visualizations: 7-day velocity trends, conversion funnels, channel response rates, and qualification score distributions.

7. **Security & Workspace Isolation**:
   - Bcrypt password hashing and JWT token authentication.
   - Strict workspace-level data isolation.
   - Immutable security and compliance audit trail.

---

## 🎨 Design System & Branding

- **Theme**: Minimalist, sober, premium modern B2B SaaS startup aesthetic.
- **Palette**:
  - Light Background: `#F7F8FA`
  - Dark Background: `#0B0F17` / Cards `#131926`
  - Text: Navy `#17202F` / Dark mode `#E2E8F0`
  - Accent: Purple `#5B5CE2` (Hover `#4A4BC8`)
  - Subtle Borders: `#E7E9EF` / Dark mode `#1E293B`
- **Typography**: Inter
- **UI Components**: Responsive collapsible sidebar, topbar with global search, notifications center, quick action dropdown, theme switcher, skeleton loaders, and slide-over lead detail drawers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, React Router 7, TanStack Query, Recharts |
| **Backend** | Python 3.13, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | SQLite (default out-of-the-box demo) / PostgreSQL ready |
| **AI Layer** | Configurable LLM API (OpenAI / Gemini / Anthropic) + Deterministic Fallback Engine |
| **Testing** | Pytest (Backend), Vitest (Frontend) |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## ⚙️ Quick Start Installation

### Prerequisites
- Node.js (v18+) and npm
- Python (v3.10+)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database tests
python -m pytest tests/ -v

# Start the FastAPI server (auto-seeds demo data on first launch)
uvicorn app.main:app --reload --port 8000
```
Backend API will be live at: `http://localhost:8000`  
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Run frontend tests
npm test

# Start the Vite development server
npm run dev
```
Frontend Web Application will be live at: `http://localhost:5173`

---

## 🔑 Demo Credentials

A full demo workspace is seeded automatically on startup:

- **Admin Account**: `admin@prospectai.io` / `admin123`
- **Sales Rep Account**: `sarah.sales@prospectai.io` / `sales123`
- **1-Click Login**: Simply click the **"1-Click Instant Demo Login (Admin)"** button on the Login page.

---

## 🐳 Docker Compose Deployment

To build and run both frontend and backend in isolated containers:

```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 🧪 Testing Results

### Backend (`pytest`)
```
============================= test session starts =============================
tests/test_all_features.py::test_health_check PASSED                     [ 12%]
tests/test_all_features.py::test_auth_login_default_admin PASSED         [ 25%]
tests/test_all_features.py::test_dashboard_metrics PASSED                [ 37%]
tests/test_all_features.py::test_leads_crud_and_filter PASSED            [ 50%]
tests/test_all_features.py::test_qualification_override PASSED           [ 62%]
tests/test_all_features.py::test_ai_sales_chatbot_opt_out_and_handoff PASSED [ 75%]
tests/test_all_features.py::test_campaign_lifecycle_and_opt_out_protection PASSED [ 87%]
tests/test_all_features.py::test_calendar_availability_and_booking PASSED [100%]
======================= 8 passed in 2.65s ========================
```

### Frontend (`vitest`)
```
 RUN  v5.0.4 E:/Intern-project/frontend

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Duration  960ms
```

---

## 🔒 Ethical Outreach & Compliance Safeguards

ProspectAI strictly adheres to anti-spam regulations (CAN-SPAM, GDPR) and provider policies:
- **Instant Opt-Out Suppression**: Inbound messages with refusal intent immediately update the lead to `opted_out` status, cancel pending sequence follow-ups, and block further contact attempts.
- **Human Handoff**: Leads requesting to speak to a person trigger automated AI pausing and alert team members.
- **Safe LinkedIn Integration**: Uses approved draft preparation and client-side copying, avoiding scraping or account compromise.
- **Transparent AI Disclaimer**: The sales bot always introduces itself honestly as an AI assistant.

---

© 2026 ProspectAI Inc. All rights reserved.
#