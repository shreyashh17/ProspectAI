from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database

# Import routers
from app.routers import (
    auth,
    dashboard,
    leads,
    discovery,
    qualification,
    conversations,
    campaigns,
    meetings,
    analytics,
    integrations,
    settings as app_settings
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schemas on startup
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed sample B2B leads, campaigns, and interactions for demo mode
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
        
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ProspectAI — AI-Powered Lead Generation & Client Outreach Automation API",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(leads.router, prefix=settings.API_V1_STR)
app.include_router(discovery.router, prefix=settings.API_V1_STR)
app.include_router(qualification.router, prefix=settings.API_V1_STR)
app.include_router(conversations.router, prefix=settings.API_V1_STR)
app.include_router(campaigns.router, prefix=settings.API_V1_STR)
app.include_router(meetings.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)
app.include_router(app_settings.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "ok", "service": "ProspectAI Core API"}
