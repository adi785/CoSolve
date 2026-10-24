import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import engine, Base
import backend.app.models  # ensure models are registered
from backend.app.routers import (
    auth,
    problems,
    solver,
    applications,
    projects,
    organizations,
    admin,
    disputes,
    notifications
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

def _migrate_sqlite_schema():
    """Ensure newly added columns are safely present in existing SQLite database tables."""
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    try:
        with engine.connect() as conn:
            # Check applications table columns
            app_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(applications)")]
            if "team_name" not in app_cols:
                conn.exec_driver_sql("ALTER TABLE applications ADD COLUMN team_name VARCHAR")
            if "college_name" not in app_cols:
                conn.exec_driver_sql("ALTER TABLE applications ADD COLUMN college_name VARCHAR")
            if "team_members_data" not in app_cols:
                conn.exec_driver_sql("ALTER TABLE applications ADD COLUMN team_members_data TEXT")

            # Check projects table columns
            proj_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(projects)")]
            if "team_name" not in proj_cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN team_name VARCHAR")
            if "progress_percentage" not in proj_cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN progress_percentage FLOAT DEFAULT 0.0")
            if "last_activity_at" not in proj_cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN last_activity_at DATETIME")
            if "last_progress_updated_at" not in proj_cols:
                conn.exec_driver_sql("ALTER TABLE projects ADD COLUMN last_progress_updated_at DATETIME")

            # Check profiles table columns for PRD compliance
            prof_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(profiles)")]
            if "roll_number" not in prof_cols:
                conn.exec_driver_sql("ALTER TABLE profiles ADD COLUMN roll_number VARCHAR")
            if "aadhaar_number" not in prof_cols:
                conn.exec_driver_sql("ALTER TABLE profiles ADD COLUMN aadhaar_number VARCHAR")
            if "address" not in prof_cols:
                conn.exec_driver_sql("ALTER TABLE profiles ADD COLUMN address TEXT")
            if "is_phone_verified" not in prof_cols:
                conn.exec_driver_sql("ALTER TABLE profiles ADD COLUMN is_phone_verified BOOLEAN DEFAULT 1")
            if "is_aadhaar_verified" not in prof_cols:
                conn.exec_driver_sql("ALTER TABLE profiles ADD COLUMN is_aadhaar_verified BOOLEAN DEFAULT 1")

            # Check organizations table columns for PRD compliance
            org_cols = [row[1] for row in conn.exec_driver_sql("PRAGMA table_info(organizations)")]
            if "aicte_code" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN aicte_code VARCHAR")
            if "spoc_name" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN spoc_name VARCHAR")
            if "spoc_phone" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN spoc_phone VARCHAR")
            if "spoc_email" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN spoc_email VARCHAR")
            if "address" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN address VARCHAR")
            if "logo_url" not in org_cols:
                conn.exec_driver_sql("ALTER TABLE organizations ADD COLUMN logo_url VARCHAR")
            conn.commit()
    except Exception as e:
        print(f"Schema migration note: {e}")

_migrate_sqlite_schema()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Powered Societal Challenge Coordination Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads
uploads_dir = settings.UPLOAD_DIR
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(problems.router)
app.include_router(solver.router)
app.include_router(applications.router)
app.include_router(projects.router)
app.include_router(organizations.router)
app.include_router(admin.router)
app.include_router(disputes.router)
app.include_router(notifications.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_provider": settings.AI_PROVIDER
    }
