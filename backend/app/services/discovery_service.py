import csv
import io
import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.schemas.lead import ICPCriteria, DiscoveredLead
from app.services.qualification_service import QualificationService

SAMPLE_PROSPECT_POOL = [
    {
        "first_name": "Elena", "last_name": "Rostova",
        "email": "elena.rostova@cloudscale.io",
        "designation": "VP of Growth & Revenue Operations",
        "company_name": "CloudScale Systems",
        "company_size": "201-500", "industry": "SaaS",
        "location": "San Francisco, CA", "website": "https://cloudscale.io",
        "linkedin_url": "https://linkedin.com/in/elena-rostova-growth",
        "notes": "Looking to automate outbound SDR workflows before Q1 budget review."
    },
    {
        "first_name": "Marcus", "last_name": "Chen",
        "email": "marcus.chen@finovate.tech",
        "designation": "Head of Enterprise Sales",
        "company_name": "Finovate Tech",
        "company_size": "51-200", "industry": "FinTech",
        "location": "New York, NY", "website": "https://finovate.tech",
        "linkedin_url": "https://linkedin.com/in/marcus-chen-fintech",
        "notes": "Scaling European expansion; needs automated multilingual prospect enrichment."
    },
    {
        "first_name": "Sarah", "last_name": "Jenkins",
        "email": "sarah.j@nexushr.com",
        "designation": "Chief Commercial Officer",
        "company_name": "NexusHR",
        "company_size": "500-1000", "industry": "Software",
        "location": "Austin, TX", "website": "https://nexushr.com",
        "linkedin_url": "https://linkedin.com/in/sarah-jenkins-nexushr",
        "notes": "Seeking AI conversational assistants to replace static web forms."
    },
    {
        "first_name": "David", "last_name": "Kim",
        "email": "david.k@synthetica.ai",
        "designation": "Founder & CEO",
        "company_name": "Synthetica AI",
        "company_size": "11-50", "industry": "Artificial Intelligence",
        "location": "Seattle, WA", "website": "https://synthetica.ai",
        "linkedin_url": "https://linkedin.com/in/david-kim-synthetica",
        "notes": "Seed stage company looking for aggressive outbound client acquisition."
    },
    {
        "first_name": "Amina", "last_name": "Diallo",
        "email": "amina@biovista.health",
        "designation": "Director of Commercial Partnerships",
        "company_name": "BioVista Health",
        "company_size": "201-500", "industry": "Healthcare",
        "location": "Boston, MA", "website": "https://biovista.health",
        "linkedin_url": "https://linkedin.com/in/amina-diallo-biovista",
        "notes": "Strict compliance requirements, interested in authorized calendar booking."
    },
    {
        "first_name": "Lucas", "last_name": "Vanderbilt",
        "email": "lucas@cyberguard.net",
        "designation": "VP of Global Marketing",
        "company_name": "CyberGuard Security",
        "company_size": "501-1000", "industry": "Technology",
        "location": "Chicago, IL", "website": "https://cyberguard.net",
        "linkedin_url": "https://linkedin.com/in/lucas-vanderbilt-sec",
        "notes": "Wants personalized account-based outreach for Fortune 500 CISOs."
    },
    {
        "first_name": "Priya", "last_name": "Sharma",
        "email": "priya.sharma@logiqflow.com",
        "designation": "Head of Business Development",
        "company_name": "LogiqFlow Logistics",
        "company_size": "51-200", "industry": "Supply Chain",
        "location": "Atlanta, GA", "website": "https://logiqflow.com",
        "linkedin_url": "https://linkedin.com/in/priya-sharma-logistics",
        "notes": "High response decay; needs immediate automated qualification responses."
    },
    {
        "first_name": "Julian", "last_name": "Moreau",
        "email": "julian@aperturedata.co",
        "designation": "Chief Operating Officer",
        "company_name": "Aperture Data",
        "company_size": "51-200", "industry": "Cloud Computing",
        "location": "London, UK", "website": "https://aperturedata.co",
        "linkedin_url": "https://linkedin.com/in/julian-moreau-ops",
        "notes": "Testing AI SDR tooling to complement existing Hubspot stack."
    },
    {
        "first_name": "Rachel", "last_name": "Greenfield",
        "email": "rachel@omnicharge.io",
        "designation": "Director of Demand Generation",
        "company_name": "OmniCharge CleanTech",
        "company_size": "100-250", "industry": "CleanTech",
        "location": "Denver, CO", "website": "https://omnicharge.io",
        "linkedin_url": "https://linkedin.com/in/rachel-greenfield-demand",
        "notes": "Expanding sales team; wants automated multi-touch email and LinkedIn messaging."
    },
    {
        "first_name": "Klaus", "last_name": "Weber",
        "email": "klaus.weber@autoai.de",
        "designation": "VP of Automotive Partnerships",
        "company_name": "AutoAI Mobility",
        "company_size": "201-500", "industry": "Automotive Tech",
        "location": "Berlin, Germany", "website": "https://autoai.de",
        "linkedin_url": "https://linkedin.com/in/klaus-weber-autoai",
        "notes": "Looking for Telegram integration for real-time fleet customer inquiries."
    }
]

class DiscoveryService:
    @classmethod
    def search_leads(cls, db: Session, workspace_id: str, criteria: ICPCriteria, query: Optional[str] = None) -> List[DiscoveredLead]:
        """Search discovery pool against workspace ICP criteria and text query."""
        # Find already saved emails in workspace to avoid duplicates
        existing_emails = {
            email.lower()
            for (email,) in db.query(Lead.email).filter(Lead.workspace_id == workspace_id, Lead.email.isnot(None)).all()
        }

        results = []
        for item in SAMPLE_PROSPECT_POOL:
            # Check query filter
            if query:
                q = query.lower()
                combined = f"{item['first_name']} {item['last_name']} {item['company_name']} {item['designation']} {item['industry']} {item['location']}".lower()
                if q not in combined:
                    continue

            # Evaluate match score against criteria
            score = 70.0
            reasons = []

            if criteria.industries:
                if any(ind.lower() in item["industry"].lower() for ind in criteria.industries):
                    score += 15.0
                    reasons.append(f"Industry match: {item['industry']}")
                else:
                    score -= 10.0

            if criteria.job_titles:
                if any(title.lower() in item["designation"].lower() for title in criteria.job_titles):
                    score += 15.0
                    reasons.append(f"Target role match: {item['designation']}")

            if criteria.locations:
                if any(loc.lower() in item["location"].lower() for loc in criteria.locations):
                    score += 10.0
                    reasons.append(f"Geographic focus: {item['location']}")

            if criteria.company_sizes:
                if any(size in item["company_size"] for size in criteria.company_sizes):
                    score += 10.0
                    reasons.append(f"Company size match: {item['company_size']}")

            if not reasons:
                reasons.append("General B2B SaaS target profile")

            final_score = min(max(round(score, 1), 40.0), 98.0)
            is_saved = item["email"].lower() in existing_emails

            results.append(
                DiscoveredLead(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, item["email"])),
                    first_name=item["first_name"],
                    last_name=item["last_name"],
                    email=item["email"],
                    designation=item["designation"],
                    company_name=item["company_name"],
                    company_size=item["company_size"],
                    industry=item["industry"],
                    location=item["location"],
                    website=item["website"],
                    linkedin_url=item["linkedin_url"],
                    match_score=final_score,
                    match_reasons=reasons,
                    already_saved=is_saved
                )
            )

        # Sort by match score descending
        results.sort(key=lambda x: x.match_score, reverse=True)
        return results

    @classmethod
    def import_lead(cls, db: Session, workspace_id: str, lead_data: Dict[str, Any]) -> Lead:
        """Import a single discovered lead into the workspace and run qualification."""
        # Check duplicate
        existing = db.query(Lead).filter(
            Lead.workspace_id == workspace_id,
            Lead.email == lead_data.get("email")
        ).first()
        if existing:
            return existing

        lead = Lead(
            workspace_id=workspace_id,
            first_name=lead_data["first_name"],
            last_name=lead_data["last_name"],
            email=lead_data.get("email"),
            phone=lead_data.get("phone"),
            designation=lead_data.get("designation"),
            company_name=lead_data["company_name"],
            company_size=lead_data.get("company_size"),
            industry=lead_data.get("industry"),
            location=lead_data.get("location"),
            website=lead_data.get("website"),
            linkedin_url=lead_data.get("linkedin_url"),
            source="discovery",
            status="new",
            notes=lead_data.get("notes")
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

        return lead

    @classmethod
    def parse_csv_leads(cls, file_content: bytes, db: Session, workspace_id: str) -> Dict[str, Any]:
        """Parse CSV data, detect duplicates, and import leads."""
        text_stream = io.StringIO(file_content.decode("utf-8", errors="ignore"))
        reader = csv.DictReader(text_stream)

        imported = 0
        duplicates = 0
        errors = 0

        # Existing emails map
        existing_emails = {
            email.lower()
            for (email,) in db.query(Lead.email).filter(Lead.workspace_id == workspace_id, Lead.email.isnot(None)).all()
        }

        for row in reader:
            first_name = row.get("first_name") or row.get("First Name") or row.get("name", "").split(" ")[0]
            last_name = row.get("last_name") or row.get("Last Name") or (row.get("name", "").split(" ")[1] if len(row.get("name", "").split(" ")) > 1 else "Unknown")
            company_name = row.get("company_name") or row.get("Company") or row.get("company")
            email = (row.get("email") or row.get("Email") or "").strip()

            if not first_name or not company_name:
                errors += 1
                continue

            if email and email.lower() in existing_emails:
                duplicates += 1
                continue

            lead = Lead(
                workspace_id=workspace_id,
                first_name=first_name,
                last_name=last_name,
                email=email if email else None,
                phone=row.get("phone") or row.get("Phone"),
                designation=row.get("designation") or row.get("Title") or row.get("job_title"),
                company_name=company_name,
                company_size=row.get("company_size") or row.get("Size") or "50-200",
                industry=row.get("industry") or row.get("Industry") or "Technology",
                location=row.get("location") or row.get("Location") or "Remote",
                website=row.get("website") or row.get("Website"),
                linkedin_url=row.get("linkedin_url") or row.get("LinkedIn"),
                source="csv_import",
                status="new"
            )
            db.add(lead)
            if email:
                existing_emails.add(email.lower())
            imported += 1

        db.commit()
        return {"imported": imported, "duplicates": duplicates, "errors": errors}
