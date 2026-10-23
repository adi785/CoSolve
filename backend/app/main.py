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
    allow_origins=["*"],  # Allows all origins for local dev
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
