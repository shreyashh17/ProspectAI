import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    # Stored as JSON string for ICP preferences (industry, roles, location, sizes, keywords, rules)
    icp_config = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    users = relationship("User", back_populates="workspace", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="workspace", cascade="all, delete-orphan")
    campaigns = relationship("Campaign", back_populates="workspace", cascade="all, delete-orphan")
    integrations = relationship("Integration", back_populates="workspace", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="workspace", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="admin") # admin, sales_rep, viewer
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    workspace = relationship("Workspace", back_populates="users")
    meetings = relationship("Meeting", back_populates="user")
