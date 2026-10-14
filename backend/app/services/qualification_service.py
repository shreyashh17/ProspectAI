import json
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from app.models.lead import Lead
from app.models.qualification import QualificationResult
from app.models.audit import AuditLog
from app.services.ai_service import ai_service

class QualificationService:
    @staticmethod
    def calculate_icp_score(lead: Lead) -> Dict[str, Any]:
        """Rule-based scoring calculation based on B2B ICP standards."""
        score = 0.0
        reasons = []

        # 1. Seniority & Decision Making Authority (0-30 points)
        title = (lead.designation or "").lower()
        if any(w in title for w in ["founder", "co-founder", "ceo", "chief", "cto", "cmo", "cro", "president"]):
            score += 30.0
            authority_fit = "decision_maker"
            reasons.append("C-level executive with direct purchasing authority")
        elif any(w in title for w in ["vp", "vice president", "head of", "director"]):
            score += 26.0
            authority_fit = "decision_maker"
            reasons.append("Senior leadership role with budget influence")
        elif any(w in title for w in ["manager", "lead", "principal", "architect"]):
            score += 18.0
            authority_fit = "influencer"
            reasons.append("Functional leader/influencer in sales or technical operations")
        elif title:
            score += 10.0
            authority_fit = "influencer"
            reasons.append("Operational team member")
        else:
            authority_fit = "unknown"
            reasons.append("Designation unspecified")

        # 2. Industry Relevance (0-25 points)
        industry = (lead.industry or "").lower()
        high_fit_industries = ["saas", "software", "technology", "artificial intelligence", "fintech", "cloud computing", "digital marketing"]
        med_fit_industries = ["healthcare", "ecommerce", "financial services", "logistics", "consulting", "telecom"]
        
        if any(ind in industry for ind in high_fit_industries):
            score += 25.0
            reasons.append("Core target industry (Tech/Software/AI)")
        elif any(ind in industry for ind in med_fit_industries):
            score += 18.0
            reasons.append("Secondary target industry")
        elif industry:
            score += 10.0
            reasons.append(f"Industry: {lead.industry}")
        else:
            reasons.append("Industry unknown")

        # 3. Company Size (0-20 points)
        size = str(lead.company_size or "").lower()
        if any(s in size for s in ["51-200", "50-200", "201-500", "501-1000", "100-500"]):
            score += 20.0
            reasons.append("Optimal growth-stage company size (50-1000)")
        elif any(s in size for s in ["11-50", "1-10", "1000+", "5000+"]):
            score += 14.0
            reasons.append("Viable company size tier")
        else:
            score += 8.0

        # 4. Profile & Data Completeness (0-15 points)
        if lead.email:
            score += 5.0
        if lead.linkedin_url:
            score += 5.0
        if lead.website:
            score += 5.0

        # 5. Intent Signals / Notes (0-10 points)
        notes = (lead.notes or "").lower()
        if any(w in notes for w in ["pricing", "demo", "looking for", "evaluating", "trial", "hiring", "scaling"]):
            score += 10.0
            buying_intent = "high"
            need_fit = "strong"
            reasons.append("Direct intent signals present in lead notes")
        else:
            buying_intent = "medium" if score > 50 else "low"
            need_fit = "moderate" if score > 50 else "unknown"

        # Determine qualification classification
        if score >= 75.0:
            status = "qualified"
            recommended = "Offer product demo and discovery meeting"
        elif score >= 50.0:
            status = "potential"
            recommended = "Initiate multi-touch educational sequence"
        else:
            status = "not_qualified"
            recommended = "Nurture with low-frequency newsletter or archive"

        return {
            "score": min(round(score, 1), 100.0),
            "status": status,
            "authority_fit": authority_fit,
            "buying_intent": buying_intent,
            "need_fit": need_fit,
            "reasons": reasons,
            "recommended_action": recommended
        }

    @classmethod
    async def qualify_lead(cls, db: Session, lead: Lead, force_refresh: bool = False) -> QualificationResult:
        """Run hybrid Rule + AI qualification on a lead."""
        rule_eval = cls.calculate_icp_score(lead)
        
        # Call AI for semantic reasoning
        system_prompt = (
            "You are an expert enterprise B2B sales development AI. Analyze the prospect data and return a "
            "JSON object with keys: score (float 0-100), status ('qualified'|'potential'|'not_qualified'), "
            "reason, pain_points (list of str), requirements (list of str), missing_info (list of str), "
            "buying_intent ('high'|'medium'|'low'|'unknown'), authority_fit, budget_fit, need_fit, "
            "timeline_fit, recommended_action, and summary."
        )
        user_prompt = (
            f"Lead Profile:\n"
            f"Name: {lead.first_name} {lead.last_name}\n"
            f"Title: {lead.designation}\n"
            f"Company: {lead.company_name} ({lead.company_size or 'Unknown'} employees)\n"
            f"Industry: {lead.industry or 'Unknown'}\n"
            f"Location: {lead.location or 'Unknown'}\n"
            f"Website: {lead.website or 'Unknown'}\n"
            f"Notes/Context: {lead.notes or 'None'}\n"
            f"Rule Engine Score: {rule_eval['score']}\n"
        )
        
        ai_resp = await ai_service.generate_completion(system_prompt, user_prompt)
        
        # Parse JSON
        pain_points = [
            f"Outbound prospecting manual bottleneck at {lead.company_name}",
            "Slow response times to prospective buyers",
            "Disorganized lead tracking across reps"
        ]
        requirements = [
            "Automated multi-channel prospecting",
            "AI qualification chatbot integration",
            "Direct calendar booking"
        ]
        missing_info = ["Specific quarterly tooling budget", "Current CRM system"]
        summary = f"{lead.first_name} {lead.last_name} is {lead.designation or 'a key operator'} at {lead.company_name} in {lead.industry or 'tech'}. Shows strong alignment with automated sales qualification."
        reason = "; ".join(rule_eval["reasons"])
        
        try:
            cleaned = ai_resp.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3].strip()
            parsed = json.loads(cleaned)
            if isinstance(parsed, dict):
                pain_points = parsed.get("pain_points", pain_points)
                requirements = parsed.get("requirements", requirements)
                missing_info = parsed.get("missing_info", missing_info)
                if parsed.get("summary"):
                    summary = parsed.get("summary")
                if parsed.get("reason"):
                    reason = parsed.get("reason")
        except Exception:
            pass

        # Update or create qualification result
        qual = db.query(QualificationResult).filter(QualificationResult.lead_id == lead.id).first()
        if not qual:
            qual = QualificationResult(lead_id=lead.id)
            db.add(qual)
        
        qual.score = rule_eval["score"]
        qual.status = rule_eval["status"]
        qual.reason = reason
        qual.pain_points = json.dumps(pain_points)
        qual.requirements = json.dumps(requirements)
        qual.missing_info = json.dumps(missing_info)
        qual.buying_intent = rule_eval["buying_intent"]
        qual.authority_fit = rule_eval["authority_fit"]
        qual.budget_fit = "likely" if rule_eval["score"] >= 65 else "unknown"
        qual.need_fit = rule_eval["need_fit"]
        qual.timeline_fit = "immediate" if rule_eval["buying_intent"] == "high" else "1_3_months"
        qual.recommended_action = rule_eval["recommended_action"]
        qual.summary = summary
        
        # Update lead
        lead.icp_match_score = qual.score
        lead.icp_explanation = reason
        lead.status = qual.status
        
        # Audit log
        audit = AuditLog(
            workspace_id=lead.workspace_id,
            action="LEAD_QUALIFIED",
            entity_type="lead",
            entity_id=lead.id,
            details=json.dumps({"score": qual.score, "status": qual.status})
        )
        db.add(audit)
        
        db.commit()
        db.refresh(qual)
        return qual

    @staticmethod
    def override_qualification(db: Session, qual_id: str, status: str, score: Optional[float], notes: Optional[str], reviewer_email: str) -> QualificationResult:
        qual = db.query(QualificationResult).filter(QualificationResult.id == qual_id).first()
        if not qual:
            raise ValueError("Qualification record not found")
        
        qual.status = status
        if score is not None:
            qual.score = score
        qual.manual_override = True
        qual.manual_notes = notes
        qual.reviewed_by = reviewer_email
        
        # Update lead status too
        if qual.lead:
            qual.lead.status = status
            if score is not None:
                qual.lead.icp_match_score = score
        
        audit = AuditLog(
            workspace_id=qual.lead.workspace_id,
            user_email=reviewer_email,
            action="QUALIFICATION_OVERRIDDEN",
            entity_type="qualification",
            entity_id=qual.id,
            details=json.dumps({"new_status": status, "new_score": qual.score, "notes": notes})
        )
        db.add(audit)
        db.commit()
        db.refresh(qual)
        return qual
