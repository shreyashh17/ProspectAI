from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.user import User
from app.schemas.lead import ICPCriteria, DiscoveredLead, LeadOut
from app.services.discovery_service import DiscoveryService, SAMPLE_PROSPECT_POOL
from app.services.qualification_service import QualificationService
from app.routers.auth import get_current_user
from app.routers.leads import format_lead_out

router = APIRouter(prefix="/discovery", tags=["Lead Discovery"])

@router.post("/search", response_model=List[DiscoveredLead])
def search_prospects(
    criteria: ICPCriteria,
    query: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = DiscoveryService.search_leads(
        db=db,
        workspace_id=current_user.workspace_id,
        criteria=criteria,
        query=query
    )
    return results

@router.post("/import", response_model=LeadOut)
async def import_discovered_lead(
    lead_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lead = DiscoveryService.import_lead(
        db=db,
        workspace_id=current_user.workspace_id,
        lead_data=lead_data
    )
    # Qualify lead right away
    await QualificationService.qualify_lead(db, lead)
    db.refresh(lead)
    return LeadOut(**format_lead_out(lead))

@router.post("/upload-csv")
async def upload_csv_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    result = DiscoveryService.parse_csv_leads(
        file_content=content,
        db=db,
        workspace_id=current_user.workspace_id
    )
    return result

@router.get("/csv-template")
def download_csv_template():
    csv_content = (
        "first_name,last_name,email,phone,designation,company_name,company_size,industry,location,website,linkedin_url\n"
        "Alex,Rivera,alex@innovatetech.com,+14155551234,VP of Engineering,InnovateTech,50-200,SaaS,San Francisco CA,https://innovatetech.com,https://linkedin.com/in/alex-rivera\n"
        "Claire,Dubois,claire@eurohealth.io,+3314567890,Head of Operations,EuroHealth,201-500,Healthcare,Paris France,https://eurohealth.io,https://linkedin.com/in/claire-dubois\n"
    )
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=prospectai_lead_import_template.csv"}
    )
