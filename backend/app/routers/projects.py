import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.project import Project, ProjectMember, Milestone, Task, Deliverable, Review
from backend.app.models.testing_adoption import TestingRecord, AdoptionRecord, ImpactMetric
from backend.app.models.problem import Problem
from backend.app.models.user import Profile
from backend.app.models.dispute_audit import Reward, AuditLog
from backend.app.schemas.api_schemas import (
    MilestoneCreate,
    MilestoneUpdate,
    TaskCreate,
    TaskUpdate,
    DeliverableCreate,
    PrototypeSubmit,
    ReviewCreate,
    TestingRecordCreate,
    AdoptionRecordCreate
)
from backend.app.services.auth import get_current_user
from backend.app.services.audit import log_audit
from backend.app.services.notifications import create_notification

router = APIRouter(prefix="/api/projects", tags=["Projects"])

@router.get("")
def list_projects(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns projects where the user is either the problem provider, the solver lead, or a team member.
    """
    if current_user.role == "admin":
        projects = db.query(Project).all()
    elif current_user.role == "provider":
        # Problem creator
        projects = db.query(Project).join(Problem).filter(Problem.creator_id == current_user.id).all()
    else:
        # Solver lead or member
        lead_projs = db.query(Project).filter(Project.lead_solver_id == current_user.id).all()
        member_projs = db.query(Project).join(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
        projects = list({p.id: p for p in (lead_projs + member_projs)}.values())

    results = []
    for p in projects:
        adoption = p.adoption_records[-1] if p.adoption_records else None
        results.append({
            "id": p.id,
            "problem_id": p.problem_id,
            "problem_title": p.problem.title if p.problem else "Challenge",
            "domain": p.problem.domain if p.problem else "General",
            "status": p.status,
            "lead_solver_name": p.lead_solver.full_name if p.lead_solver else "Solver",
            "provider_name": p.problem.creator.full_name if p.problem and p.problem.creator else "Provider",
            "panchayat_name": p.problem.creator.panchayat_name if p.problem and p.problem.creator else None,
            "assigned_at": p.assigned_at,
            "completed_at": p.completed_at,
            "adoption_status": adoption.adoption_status if adoption else "not_yet_adopted",
            "beneficiaries_served": adoption.beneficiaries_served if adoption else 0
        })
    return results


@router.get("/{project_id}")
def get_project_workspace(
    project_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Verify authorization
    is_provider = (project.problem and project.problem.creator_id == current_user.id)
    is_lead = (project.lead_solver_id == current_user.id)
    is_member = any(m.user_id == current_user.id for m in project.members)
    is_admin = (current_user.role == "admin")

    if not (is_provider or is_lead or is_member or is_admin):
        raise HTTPException(status_code=403, detail="Unauthorized to access this project workspace")

    # Serialize workspace details
    milestones_data = [{
        "id": m.id,
        "title": m.title,
        "description": m.description,
        "order": m.order,
        "status": m.status,
        "target_date": m.target_date,
        "created_at": m.created_at
    } for m in sorted(project.milestones, key=lambda x: x.order)]

    tasks_data = [{
        "id": t.id,
        "milestone_id": t.milestone_id,
        "assigned_to_id": t.assigned_to_id,
        "assigned_to_name": t.assignee.full_name if t.assignee else "Unassigned",
        "title": t.title,
        "description": t.description,
        "status": t.status,
        "created_at": t.created_at
    } for t in project.tasks]

    deliverables_data = [{
        "id": d.id,
        "milestone_id": d.milestone_id,
        "submitted_by_name": d.submitter.full_name if d.submitter else "Contributor",
        "title": d.title,
        "description": d.description,
        "file_path": d.file_path,
        "external_link": d.external_link,
        "submission_type": d.submission_type,
        "version": d.version,
        "status": d.status,
        "created_at": d.created_at
    } for d in project.deliverables]

    reviews_data = [{
        "id": r.id,
        "target_type": r.target_type,
        "target_id": r.target_id,
        "reviewer_name": r.reviewer.full_name if r.reviewer else "Reviewer",
        "rating": r.rating,
        "decision": r.decision,
        "comments": r.comments,
        "created_at": r.created_at
    } for r in project.reviews]

    testing_data = [{
        "id": t.id,
        "round_number": t.round_number,
        "test_plan": t.test_plan,
        "test_results": t.test_results,
        "status": t.status,
        "reviewer_comments": t.reviewer_comments,
        "reviewer_name": t.reviewer.full_name if t.reviewer else "Examiner",
        "conducted_at": t.conducted_at
    } for t in sorted(project.testing_records, key=lambda x: x.round_number)]

    adoption_data = [{
        "id": a.id,
        "adoption_status": a.adoption_status,
        "implementation_date": a.implementation_date,
        "real_world_evidence": a.real_world_evidence,
        "beneficiaries_served": a.beneficiaries_served,
        "outcomes_achieved": a.outcomes_achieved,
        "known_limitations": a.known_limitations,
        "maintenance_plan": a.maintenance_plan,
        "is_independent_review": a.is_independent_review,
        "review_rationale": a.review_rationale,
        "reviewer_name": a.reviewer.full_name if a.reviewer else "Provider / Authority",
        "reviewed_at": a.reviewed_at,
        "created_at": a.created_at
    } for a in project.adoption_records]

    team_members = [{
        "id": m.id,
        "user_id": m.user_id,
        "name": m.user.full_name if m.user else "Member",
        "email": m.user.email if m.user else "",
        "role": m.role,
        "assigned_at": m.assigned_at
    } for m in project.members]

    # Recent activity logs for this project
    audit_events = db.query(AuditLog).filter(
        AuditLog.resource_id == project.id
    ).order_by(AuditLog.timestamp.desc()).limit(15).all()

    activity_data = [{
        "id": a.id,
        "action": a.action,
        "actor_name": a.actor.full_name if a.actor else "System",
        "timestamp": a.timestamp,
        "details": a.details
    } for a in audit_events]

    return {
        "id": project.id,
        "status": project.status,
        "solver_type": project.solver_type,
        "assigned_at": project.assigned_at,
        "completed_at": project.completed_at,
        "problem": {
            "id": project.problem.id,
            "title": project.problem.title,
            "description": project.problem.description,
            "affected_community": project.problem.affected_community,
            "geographic_state": project.problem.geographic_state,
            "geographic_district": project.problem.geographic_district,
            "locality": project.problem.locality,
            "domain": project.problem.domain,
            "funding_model": project.problem.funding_model,
            "funding_amount": project.problem.funding_amount,
            "funding_status": project.problem.funding_status,
            "creator_name": project.problem.creator.full_name if project.problem.creator else "Provider",
            "panchayat_name": project.problem.creator.panchayat_name if project.problem.creator else None
        },
        "lead_solver": {
            "id": project.lead_solver.id,
            "name": project.lead_solver.full_name,
            "email": project.lead_solver.email,
            "college_name": project.lead_solver.college_name,
            "is_student": project.lead_solver.is_student
        },
        "charter": {
            "scope": project.charter_scope,
            "deliverables": project.charter_deliverables,
            "acceptance_criteria": project.charter_acceptance_criteria,
            "funding_terms": project.charter_funding_terms,
            "ip_terms": project.charter_ip_terms,
            "confidentiality_terms": project.charter_confidentiality_terms,
            "withdrawal_rules": project.charter_withdrawal_rules
        },
        "prototype": {
            "demo_url": project.prototype_demo_url,
            "repo_url": project.prototype_repo_url,
            "video_url": project.prototype_video_url,
            "documentation": project.prototype_documentation,
            "test_instructions": project.prototype_test_instructions,
            "known_limitations": project.prototype_known_limitations,
            "submitted_at": project.prototype_submitted_at
        },
        "milestones": milestones_data,
        "tasks": tasks_data,
        "deliverables": deliverables_data,
        "reviews": reviews_data,
        "testing_records": testing_data,
        "adoption_records": adoption_data,
        "team_members": team_members,
        "activity_log": activity_data,
        "user_permissions": {
            "is_provider": is_provider,
            "is_lead_solver": is_lead,
            "is_team_member": is_member,
            "is_admin": is_admin
        }
    }


@router.post("/{project_id}/prototype")
def submit_prototype(
    project_id: str,
    proto_in: PrototypeSubmit,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_lead = (project.lead_solver_id == current_user.id)
    is_member = any(m.user_id == current_user.id for m in project.members)
    if not (is_lead or is_member or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Only assigned solver or team members can submit prototype")

    project.prototype_demo_url = proto_in.prototype_demo_url
    project.prototype_repo_url = proto_in.prototype_repo_url
    project.prototype_video_url = proto_in.prototype_video_url
    project.prototype_documentation = proto_in.prototype_documentation
    project.prototype_test_instructions = proto_in.prototype_test_instructions
    project.prototype_known_limitations = proto_in.prototype_known_limitations
    project.prototype_submitted_at = datetime.utcnow()
    project.status = "prototype_submitted"
    project.last_activity_at = datetime.utcnow()
    project.progress_percentage = max(project.progress_percentage, 55.0)

    db.commit()

    log_audit(db, "PROTOTYPE_SUBMITTED", "project", project.id, actor_id=current_user.id, details={"demo": proto_in.prototype_demo_url})

    # Notify provider
    if project.problem and project.problem.creator_id:
        create_notification(
            db,
            user_id=project.problem.creator_id,
            title=f"Prototype Submitted: {project.problem.title}",
            message=f"The solver team has submitted the working prototype demo and documentation for your review.",
            category="project",
            link=f"/projects/{project.id}"
        )

    return {"message": "Prototype successfully submitted for provider review", "status": project.status}


@router.post("/{project_id}/reviews")
def submit_review(
    project_id: str,
    review_in: ReviewCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_provider = (project.problem and project.problem.creator_id == current_user.id)
    if not (is_provider or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Only the problem provider can submit prototype / deliverable reviews")

    review = Review(
        project_id=project.id,
        target_type=review_in.target_type,
        target_id=review_in.target_id,
        reviewer_id=current_user.id,
        rating=review_in.rating,
        decision=review_in.decision,
        comments=review_in.comments
    )
    db.add(review)

    # If reviewing prototype
    if review_in.target_type == "prototype":
        if review_in.decision == "approved":
            project.status = "testing"
        elif review_in.decision == "revisions_required":
            project.status = "in_progress"

    db.commit()

    log_audit(db, f"REVIEW_{review_in.decision.upper()}", "project", project.id, actor_id=current_user.id, details={"type": review_in.target_type, "comments": review_in.comments})

    # Notify solver
    create_notification(
        db,
        user_id=project.lead_solver_id,
        title=f"Provider Feedback on {review_in.target_type.title()}",
        message=f"Decision: {review_in.decision}. {review_in.comments}",
        category="testing",
        link=f"/projects/{project.id}"
    )

    return {"message": "Review recorded successfully", "project_status": project.status}


@router.post("/{project_id}/testing")
def record_testing_outcome(
    project_id: str,
    test_in: TestingRecordCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_provider = (project.problem and project.problem.creator_id == current_user.id)
    if not (is_provider or current_user.role == "admin"):
        raise HTTPException(status_code=403, detail="Only the problem provider or authorized reviewer can record testing outcomes")

    # Round number
    round_num = len(project.testing_records) + 1

    record = TestingRecord(
        project_id=project.id,
        round_number=round_num,
        test_plan=test_in.test_plan,
        test_results=test_in.test_results,
        status=test_in.status,
        criteria_checked=json.dumps(test_in.criteria_checked or []),
        reviewer_comments=test_in.reviewer_comments,
        reviewer_id=current_user.id
    )
    db.add(record)

    if test_in.status == "passed":
        project.status = "adoption_review"
    elif test_in.status == "revision_required":
        project.status = "in_progress"

    db.commit()

    log_audit(db, f"TESTING_ROUND_{round_num}_{test_in.status.upper()}", "project", project.id, actor_id=current_user.id)

    create_notification(
        db,
        user_id=project.lead_solver_id,
        title=f"Testing Round #{round_num} Result: {test_in.status.upper()}",
        message=f"Test outcome: {test_in.status}. Results: {test_in.test_results[:100]}...",
        category="testing",
        link=f"/projects/{project.id}"
    )

    return {"message": f"Testing round #{round_num} recorded successfully", "status": test_in.status}


@router.post("/{project_id}/adoption")
def record_adoption(
    project_id: str,
    adopt_in: AdoptionRecordCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Records real-world adoption verification.
    Provider confirmation is default; high-impact or disputed cases can be reviewed independently.
    NEVER counts prototype submission as proof of adoption!
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_provider = (project.problem and project.problem.creator_id == current_user.id)
    is_admin = (current_user.role == "admin")

    if not (is_provider or is_admin):
        raise HTTPException(status_code=403, detail="Only provider or authorized independent reviewer can record adoption")

    # Prevent marking verified adoption if testing was not passed
    passed_testing = any(t.status == "passed" for t in project.testing_records)
    if adopt_in.adoption_status == "verified_adopted" and not passed_testing:
        raise HTTPException(
            status_code=400,
            detail="Cannot mark adoption as verified: project must first pass testing stage against acceptance criteria."
        )

    record = AdoptionRecord(
        project_id=project.id,
        adoption_status=adopt_in.adoption_status,
        implementation_date=adopt_in.implementation_date or datetime.utcnow(),
        real_world_evidence=adopt_in.real_world_evidence,
        beneficiaries_served=adopt_in.beneficiaries_served,
        outcomes_achieved=adopt_in.outcomes_achieved,
        known_limitations=adopt_in.known_limitations,
        maintenance_plan=adopt_in.maintenance_plan,
        is_independent_review=adopt_in.is_independent_review or is_admin,
        reviewer_id=current_user.id,
        review_rationale=adopt_in.review_rationale,
        reviewed_at=datetime.utcnow()
    )
    db.add(record)

    if adopt_in.adoption_status == "verified_adopted":
        project.status = "completed"
        project.completed_at = datetime.utcnow()
        project.is_scope_completed = True

        # Issue verified digital credential reward if not already issued
        existing_reward = db.query(Reward).filter(
            Reward.user_id == project.lead_solver_id,
            Reward.project_id == project.id
        ).first()
        if not existing_reward:
            reward = Reward(
                user_id=project.lead_solver_id,
                project_id=project.id,
                reward_type="digital_credential",
                title=f"Verified Civic Implementation: {project.problem.title}",
                description=f"Successfully deployed and verified with {adopt_in.beneficiaries_served} community beneficiaries in {project.problem.affected_community}.",
                sponsor=project.problem.creator.panchayat_name or project.problem.creator.full_name,
                amount=project.problem.funding_amount if project.problem.funding_model in ["prize_based", "grant_funded"] else 0.0,
                status="approved"
            )
            db.add(reward)

    db.commit()

    log_audit(
        db,
        f"ADOPTION_STATUS_{adopt_in.adoption_status.upper()}",
        "project",
        project.id,
        actor_id=current_user.id,
        details={
            "status": adopt_in.adoption_status,
            "beneficiaries": adopt_in.beneficiaries_served,
            "evidence": adopt_in.real_world_evidence
        }
    )

    create_notification(
        db,
        user_id=project.lead_solver_id,
        title=f"Adoption Verification Updated: {adopt_in.adoption_status.replace('_', ' ').title()}",
        message=f"Adoption decision recorded. Status: {adopt_in.adoption_status}. Beneficiaries served: {adopt_in.beneficiaries_served}.",
        category="adoption",
        link=f"/projects/{project.id}"
    )

    return {"message": "Adoption record created successfully", "adoption_status": adopt_in.adoption_status}


@router.post("/{project_id}/milestones")
def add_milestone(
    project_id: str,
    m_in: MilestoneCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    m = Milestone(
        project_id=project.id,
        title=m_in.title,
        description=m_in.description,
        target_date=m_in.target_date,
        order=m_in.order,
        status="pending"
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m


@router.put("/{project_id}/milestones/{milestone_id}")
def update_milestone_status(
    project_id: str,
    milestone_id: str,
    m_in: MilestoneUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.project_id == project_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")

    m.status = m_in.status
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.last_activity_at = datetime.utcnow()
    db.commit()
    return m


@router.post("/{project_id}/tasks")
def add_task(
    project_id: str,
    task_in: TaskCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    t = Task(
        project_id=project_id,
        milestone_id=task_in.milestone_id,
        assigned_to_id=task_in.assigned_to_id or current_user.id,
        title=task_in.title,
        description=task_in.description,
        status="todo"
    )
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.put("/{project_id}/tasks/{task_id}")
def update_task_status(
    project_id: str,
    task_id: str,
    task_in: TaskUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    t = db.query(Task).filter(Task.id == task_id, Task.project_id == project_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Task not found")

    t.status = task_in.status
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.last_activity_at = datetime.utcnow()
    db.commit()
    return t


@router.post("/{project_id}/deliverables")
def submit_deliverable(
    project_id: str,
    deliv_in: DeliverableCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    d = Deliverable(
        project_id=project_id,
        milestone_id=deliv_in.milestone_id,
        submitted_by_id=current_user.id,
        title=deliv_in.title,
        description=deliv_in.description,
        file_path=deliv_in.file_path,
        external_link=deliv_in.external_link,
        submission_type=deliv_in.submission_type,
        status="submitted"
    )
    db.add(d)
    db.commit()
    db.refresh(d)
    return d
