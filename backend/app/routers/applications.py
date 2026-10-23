from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.problem import Problem, AIProblemAnalysis
from backend.app.models.application import Application
from backend.app.models.project import Project, Milestone, ProjectMember
from backend.app.models.user import Profile, Organization
from backend.app.schemas.api_schemas import (
    ApplicationCreate,
    ApplicationResponse,
    SolverSelectionAction
)
from backend.app.services.auth import get_current_user
from backend.app.services.matching_engine import MatchingEngine
from backend.app.services.audit import log_audit
from backend.app.services.notifications import create_notification

router = APIRouter(prefix="/api/applications", tags=["Applications"])

@router.post("", response_model=ApplicationResponse)
def submit_application(
    app_in: ApplicationCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == app_in.problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Challenge not found")
    
    if problem.moderation_status != "published":
        raise HTTPException(status_code=400, detail="Cannot apply: challenge is not currently published")

    if problem.creator_id == current_user.id:
        raise HTTPException(status_code=400, detail="Problem provider cannot apply to their own challenge")

    # Check for existing application
    existing = db.query(Application).filter(
        Application.problem_id == app_in.problem_id,
        Application.applicant_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted an application for this challenge")

    # Calculate match snapshot
    ai_analysis = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == problem.id).order_by(AIProblemAnalysis.version.desc()).first()
    
    if app_in.solver_type == "organization" and app_in.organization_id:
        org = db.query(Organization).filter(Organization.id == app_in.organization_id).first()
        match_info = MatchingEngine.calculate_org_match(org, problem, ai_analysis) if org else MatchingEngine.calculate_match(current_user, problem, ai_analysis)
    else:
        match_info = MatchingEngine.calculate_match(current_user, problem, ai_analysis)

    members_json = None
    if app_in.team_members:
        members_json = json.dumps([m.model_dump() for m in app_in.team_members])

    app = Application(
        problem_id=app_in.problem_id,
        solver_type=app_in.solver_type,
        applicant_id=current_user.id,
        organization_id=app_in.organization_id,
        team_name=app_in.team_name,
        college_name=app_in.college_name or current_user.college_name,
        team_members_data=members_json,
        proposal=app_in.proposal,
        approach=app_in.approach,
        relevant_experience=app_in.relevant_experience,
        estimated_timeline_weeks=app_in.estimated_timeline_weeks,
        weekly_availability_hours=app_in.weekly_availability_hours,
        team_composition_notes=app_in.team_composition_notes,
        match_score_at_application=match_info["match_score"],
        match_explanation_snapshot=json_summary(match_info),
        status="submitted"
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    log_audit(db, "APPLICATION_SUBMITTED", "application", app.id, actor_id=current_user.id, details={"problem_id": problem.id, "team_name": app_in.team_name, "match_score": match_info["match_score"]})

    # Teammate email confirmation dispatch (Requirement 4)
    if app_in.team_members:
        for m in app_in.team_members:
            reg_user = db.query(Profile).filter(Profile.email == m.email).first()
            if reg_user:
                create_notification(
                    db,
                    user_id=reg_user.id,
                    title=f"Team Challenge Confirmation: {app_in.team_name or 'College Team'}",
                    message=f"Team Leader {current_user.full_name} added you to '{app_in.team_name}' for '{problem.title}'. Confirmation email dispatched.",
                    category="project",
                    link=f"/problems/{problem.id}"
                )
            log_audit(
                db,
                "TEAMMATE_EMAIL_CONFIRMATION_SENT",
                "application",
                app.id,
                actor_id=current_user.id,
                details={
                    "recipient_name": m.name,
                    "recipient_email": m.email,
                    "team_name": app_in.team_name,
                    "problem_title": problem.title,
                    "email_status": "sent"
                }
            )

    # Notify provider
    create_notification(
        db,
        user_id=problem.creator_id,
        title=f"New Application for '{problem.title}'",
        message=f"{current_user.full_name} {f'and Team {app_in.team_name}' if app_in.team_name else ''} applied with a match score of {match_info['match_score']}%.",
        category="application",
        link=f"/problems/{problem.id}/applications"
    )

    resp = ApplicationResponse.model_validate(app)
    resp.applicant_name = current_user.full_name
    resp.college_name = app.college_name or current_user.college_name
    resp.team_name = app.team_name
    if app.team_members_data:
        try:
            resp.team_members = json.loads(app.team_members_data)
        except Exception:
            resp.team_members = []
    return resp


@router.get("/problem/{problem_id}", response_model=List[ApplicationResponse])
def get_applications_for_problem(
    problem_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to view applicants for this challenge")

    apps = db.query(Application).filter(Application.problem_id == problem_id).all()
    results = []
    for a in apps:
        item = ApplicationResponse.model_validate(a)
        if a.applicant:
            item.applicant_name = a.applicant.full_name
            item.college_name = a.college_name or a.applicant.college_name
        if a.organization:
            item.org_name = a.organization.name
        item.team_name = a.team_name
        if a.team_members_data:
            try:
                item.team_members = json.loads(a.team_members_data)
            except Exception:
                item.team_members = []
        results.append(item)
    
    # Sort by match score descending
    results.sort(key=lambda x: x.match_score_at_application, reverse=True)
    return results


@router.get("/my", response_model=List[ApplicationResponse])
def get_my_applications(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(Application).filter(Application.applicant_id == current_user.id).order_by(Application.submitted_at.desc()).all()
    results = []
    for a in apps:
        item = ApplicationResponse.model_validate(a)
        item.applicant_name = current_user.full_name
        item.college_name = a.college_name or current_user.college_name
        item.team_name = a.team_name
        if a.organization:
            item.org_name = a.organization.name
        if a.team_members_data:
            try:
                item.team_members = json.loads(a.team_members_data)
            except Exception:
                item.team_members = []
        results.append(item)
    return results


@router.post("/select-solver")
def select_solver_and_create_project(
    selection_in: SolverSelectionAction,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provider explicitly selects solver, locks project charter agreement, and initializes workspace.
    Enforces atomic transaction and prevents duplicate active project assignments.
    """
    app = db.query(Application).filter(Application.id == selection_in.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    problem = app.problem
    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only the problem provider can select the solver")

    # Prevent duplicate active assignments
    existing_project = db.query(Project).filter(
        Project.problem_id == problem.id,
        Project.status.in_(["assigned", "in_progress", "prototype_submitted", "testing", "adoption_review", "completed"])
    ).first()
    if existing_project:
        raise HTTPException(
            status_code=400,
            detail=f"This challenge already has an active project workspace (Project #{existing_project.id[:8]})."
        )

    # Update application status
    app.status = "accepted"
    
    # Mark others as rejected or shortlisted
    other_apps = db.query(Application).filter(
        Application.problem_id == problem.id,
        Application.id != app.id
    ).all()
    for o in other_apps:
        if o.status == "submitted":
            o.status = "rejected"

    # Create project workspace
    project = Project(
        problem_id=problem.id,
        application_id=app.id,
        solver_type=app.solver_type,
        team_name=app.team_name,
        lead_solver_id=app.applicant_id,
        organization_id=app.organization_id,
        status="assigned",
        progress_percentage=15.0,
        last_activity_at=datetime.utcnow(),
        last_progress_updated_at=datetime.utcnow(),
        charter_scope=selection_in.charter_scope,
        charter_deliverables=selection_in.charter_deliverables,
        charter_acceptance_criteria=selection_in.charter_acceptance_criteria,
        charter_milestones_summary=selection_in.charter_milestones_summary,
        charter_funding_terms=selection_in.charter_funding_terms or f"{problem.funding_model.title()} - {problem.funding_currency} {problem.funding_amount}",
        charter_ip_terms=selection_in.charter_ip_terms,
        charter_confidentiality_terms=selection_in.charter_confidentiality_terms,
        charter_withdrawal_rules=selection_in.charter_withdrawal_rules,
        charter_agreed_solver=True,
        charter_agreed_provider=True
    )
    db.add(project)
    db.flush()

    # Add lead solver as project member
    member = ProjectMember(
        project_id=project.id,
        user_id=app.applicant_id,
        role="lead"
    )
    db.add(member)

    # Add any teammates from team_members_data who have existing accounts
    if app.team_members_data:
        try:
            m_list = json.loads(app.team_members_data)
            for m in m_list:
                user_match = db.query(Profile).filter(Profile.email == m.get("email")).first()
                if user_match and user_match.id != app.applicant_id:
                    db.add(ProjectMember(
                        project_id=project.id,
                        user_id=user_match.id,
                        role="team_member"
                    ))
        except Exception:
            pass

    # Initialize default 4 milestones based on project scope
    m1 = Milestone(project_id=project.id, title="1. Requirement Baseline & Hardware/Data Prep", description="Establish baseline conditions and sensor/data schemas.", order=1, status="in_progress")
    m2 = Milestone(project_id=project.id, title="2. Core Prototype Implementation", description="Develop functional prototype unit or application.", order=2, status="pending")
    m3 = Milestone(project_id=project.id, title="3. Community Field Testing", description="Execute structured field testing against acceptance criteria.", order=3, status="pending")
    m4 = Milestone(project_id=project.id, title="4. Final Handover & Adoption Verification", description="Deliver final documentation and verify real-world deployment.", order=4, status="pending")
    db.add_all([m1, m2, m3, m4])

    db.commit()

    log_audit(
        db,
        "SOLVER_SELECTED_AND_PROJECT_CHARTERED",
        "project",
        project.id,
        actor_id=current_user.id,
        details={
            "solver_id": app.applicant_id,
            "problem_id": problem.id,
            "application_id": app.id
        }
    )

    # Notify solver
    create_notification(
        db,
        user_id=app.applicant_id,
        title=f"Application Accepted! Project Workspace Created",
        message=f"Congratulations! Provider selected your proposal for '{problem.title}'. The project workspace is now active.",
        category="project",
        link=f"/projects/{project.id}"
    )

    return {
        "message": "Solver successfully selected and project workspace initialized",
        "project_id": project.id,
        "application_id": app.id,
        "status": "assigned"
    }


def json_summary(data: dict) -> str:
    import json
    try:
        return json.dumps(data)
    except Exception:
        return ""
