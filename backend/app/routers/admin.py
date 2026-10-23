from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import Profile, Organization, VerificationRequest
from backend.app.models.problem import Problem
from backend.app.models.project import Project
from backend.app.models.dispute_audit import Dispute, AuditLog, Reward
from backend.app.schemas.api_schemas import VerificationReview, ProblemModerationAction
from backend.app.services.auth import require_admin
from backend.app.services.audit import log_audit
from backend.app.services.notifications import create_notification

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/metrics")
def get_platform_metrics(
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(Profile).count()
    total_solvers = db.query(Profile).filter(Profile.role == "solver").count()
    total_providers = db.query(Profile).filter(Profile.role == "provider").count()
    verified_providers = db.query(Profile).filter(Profile.role == "provider", Profile.verification_status == "verified").count()
    
    total_problems = db.query(Problem).count()
    published_problems = db.query(Problem).filter(Problem.moderation_status == "published").count()
    pending_moderation = db.query(Problem).filter(Problem.moderation_status.in_(["submitted", "under_review"])).count()
    
    total_projects = db.query(Project).count()
    active_projects = db.query(Project).filter(Project.status.in_(["assigned", "in_progress", "prototype_submitted", "testing"])).count()
    completed_projects = db.query(Project).filter(Project.status == "completed").count()
    
    pending_verifications = db.query(VerificationRequest).filter(VerificationRequest.status == "pending").count()
    open_disputes = db.query(Dispute).filter(Dispute.status.in_(["submitted", "under_investigation", "assigned"])).count()

    return {
        "users": {
            "total": total_users,
            "solvers": total_solvers,
            "providers": total_providers,
            "verified_providers": verified_providers
        },
        "challenges": {
            "total": total_problems,
            "published": published_problems,
            "pending_moderation": pending_moderation
        },
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": completed_projects
        },
        "queues": {
            "pending_verifications": pending_verifications,
            "open_disputes": open_disputes
        }
    }


@router.get("/verifications")
def list_verifications(
    status_filter: Optional[str] = None,
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(VerificationRequest)
    if status_filter:
        query = query.filter(VerificationRequest.status == status_filter)
    reqs = query.order_by(VerificationRequest.created_at.desc()).all()
    
    results = []
    for r in reqs:
        results.append({
            "id": r.id,
            "request_type": r.request_type,
            "status": r.status,
            "user_id": r.user_id,
            "user_name": r.user.full_name if r.user else None,
            "user_email": r.user.email if r.user else None,
            "panchayat_name": r.user.panchayat_name if r.user else None,
            "org_id": r.org_id,
            "org_name": r.org.name if r.org else None,
            "notes": r.notes,
            "document_ref": r.document_ref,
            "admin_feedback": r.admin_feedback,
            "created_at": r.created_at,
            "reviewed_at": r.reviewed_at
        })
    return results


@router.post("/verifications/{req_id}/review")
def review_verification(
    req_id: str,
    review_in: VerificationReview,
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    req = db.query(VerificationRequest).filter(VerificationRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Verification request not found")

    req.status = review_in.status
    req.admin_feedback = review_in.admin_feedback
    req.reviewed_by = admin.id
    req.reviewed_at = datetime.utcnow()

    # Update corresponding profile or organization
    if req.user:
        req.user.verification_status = "verified" if review_in.status == "approved" else review_in.status
        req.user.verification_notes = review_in.admin_feedback

        create_notification(
            db,
            user_id=req.user.id,
            title=f"Verification Request {review_in.status.title()}",
            message=f"Your verification request has been {review_in.status}. Notes: {review_in.admin_feedback or 'None'}",
            category="system",
            link="/profile"
        )

    if req.org:
        req.org.verification_status = "verified" if review_in.status == "approved" else review_in.status
        req.org.verification_notes = review_in.admin_feedback

    db.commit()

    log_audit(db, f"VERIFICATION_{review_in.status.upper()}", "verification", req.id, actor_id=admin.id, details={"status": review_in.status})
    return {"message": f"Verification status updated to {review_in.status}"}


@router.get("/moderation-queue")
def get_moderation_queue(
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    problems = db.query(Problem).filter(Problem.moderation_status.in_(["submitted", "under_review", "changes_requested"])).order_by(Problem.created_at.desc()).all()
    results = []
    for p in problems:
        results.append({
            "id": p.id,
            "title": p.title,
            "domain": p.domain,
            "affected_community": p.affected_community,
            "creator_name": p.creator.full_name if p.creator else "Unknown",
            "creator_type": p.creator.provider_type if p.creator else None,
            "provider_verified": (p.creator.verification_status == "verified") if p.creator else False,
            "funding_model": p.funding_model,
            "funding_amount": p.funding_amount,
            "moderation_status": p.moderation_status,
            "created_at": p.created_at
        })
    return results


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    resource_type: Optional[str] = None,
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "actor_name": l.actor.full_name if l.actor else "System",
            "actor_id": l.actor_id,
            "details": l.details,
            "timestamp": l.timestamp
        })
    return results
