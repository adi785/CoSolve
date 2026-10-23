from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.project import Project
from backend.app.models.user import Profile
from backend.app.models.dispute_audit import Dispute
from backend.app.schemas.api_schemas import DisputeCreate, DisputeResolve
from backend.app.services.auth import get_current_user, require_admin
from backend.app.services.audit import log_audit
from backend.app.services.notifications import create_notification

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

@router.post("")
def raise_dispute(
    dispute_in: DisputeCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == dispute_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_provider = (project.problem and project.problem.creator_id == current_user.id)
    is_lead = (project.lead_solver_id == current_user.id)
    is_member = any(m.user_id == current_user.id for m in project.members)

    if not (is_provider or is_lead or is_member or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Only project participants can raise disputes")

    dispute = Dispute(
        project_id=project.id,
        raised_by_id=current_user.id,
        dispute_type=dispute_in.dispute_type,
        title=dispute_in.title,
        description=dispute_in.description,
        evidence_text=dispute_in.evidence_text,
        status="submitted"
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)

    log_audit(db, "DISPUTE_RAISED", "dispute", dispute.id, actor_id=current_user.id, details={"type": dispute.dispute_type, "project_id": project.id})

    # Notify counterparty
    counterparty_id = project.lead_solver_id if is_provider else project.problem.creator_id
    if counterparty_id:
        create_notification(
            db,
            user_id=counterparty_id,
            title=f"Dispute Lodged: {dispute.title}",
            message=f"A dispute has been submitted regarding project '{project.problem.title}'. An independent reviewer will be assigned.",
            category="dispute",
            link=f"/projects/{project.id}"
        )

    return {"message": "Dispute lodged successfully. It will be assigned to an independent reviewer.", "dispute_id": dispute.id}


@router.get("/project/{project_id}")
def get_project_disputes(
    project_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).filter(Dispute.project_id == project_id).all()
    results = []
    for d in disputes:
        results.append({
            "id": d.id,
            "project_id": d.project_id,
            "dispute_type": d.dispute_type,
            "title": d.title,
            "description": d.description,
            "evidence_text": d.evidence_text,
            "status": d.status,
            "raised_by_name": d.raised_by.full_name if d.raised_by else "User",
            "reviewer_name": d.reviewer.full_name if d.reviewer else "Unassigned",
            "resolution_decision": d.resolution_decision,
            "created_at": d.created_at,
            "resolved_at": d.resolved_at
        })
    return results


@router.get("")
def list_all_disputes(
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).order_by(Dispute.created_at.desc()).all()
    results = []
    for d in disputes:
        results.append({
            "id": d.id,
            "project_id": d.project_id,
            "project_title": d.project.problem.title if d.project and d.project.problem else "Project",
            "dispute_type": d.dispute_type,
            "title": d.title,
            "description": d.description,
            "status": d.status,
            "raised_by_name": d.raised_by.full_name if d.raised_by else "User",
            "reviewer_name": d.reviewer.full_name if d.reviewer else None,
            "created_at": d.created_at,
            "resolved_at": d.resolved_at
        })
    return results


@router.post("/{dispute_id}/assign-reviewer")
def assign_reviewer(
    dispute_id: str,
    reviewer_id: str,
    admin: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    # Conflict of interest check: Reviewer cannot be the dispute raiser, solver, or provider
    project = dispute.project
    if (reviewer_id == dispute.raised_by_id or
        reviewer_id == project.lead_solver_id or
        (project.problem and reviewer_id == project.problem.creator_id)):
        raise HTTPException(
            status_code=400,
            detail="Conflict of interest: Assigned reviewer cannot be a direct party to the dispute or project."
        )

    dispute.assigned_reviewer_id = reviewer_id
    dispute.status = "assigned"
    db.commit()

    log_audit(db, "DISPUTE_REVIEWER_ASSIGNED", "dispute", dispute.id, actor_id=admin.id, details={"reviewer_id": reviewer_id})
    return {"message": "Independent reviewer successfully assigned to dispute"}


@router.post("/{dispute_id}/resolve")
def resolve_dispute(
    dispute_id: str,
    resolve_in: DisputeResolve,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    # Only assigned reviewer or admin can resolve
    if dispute.assigned_reviewer_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only assigned reviewer or admin can record resolution")

    # Prevent self-review
    if current_user.id == dispute.raised_by_id:
        raise HTTPException(status_code=400, detail="Reviewer cannot resolve their own dispute")

    dispute.status = resolve_in.status
    dispute.resolution_decision = resolve_in.resolution_decision
    dispute.resolved_at = datetime.utcnow()
    db.commit()

    log_audit(db, f"DISPUTE_{resolve_in.status.upper()}", "dispute", dispute.id, actor_id=current_user.id, details={"decision": resolve_in.resolution_decision})

    create_notification(
        db,
        user_id=dispute.raised_by_id,
        title=f"Dispute Resolved: {dispute.title}",
        message=f"Findings & Decision: {resolve_in.resolution_decision}",
        category="dispute",
        link=f"/projects/{dispute.project_id}"
    )

    return {"message": "Dispute resolution recorded", "status": dispute.status}
