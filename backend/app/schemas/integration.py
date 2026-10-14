from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class IntegrationUpdate(BaseModel):
    provider: str
    status: Optional[str] = None # connected, disconnected, simulated
    is_active: Optional[bool] = True
    config: Optional[Dict[str, Any]] = {}

class IntegrationOut(BaseModel):
    id: str
    workspace_id: str
    provider: str
    status: str
    is_active: bool
    config_summary: Dict[str, Any] = {}
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TestConnectionResponse(BaseModel):
    provider: str
    success: bool
    message: str
    mode: str # "live" or "simulated"
