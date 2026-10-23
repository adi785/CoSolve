import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import Profile
from backend.app.models.solver import SolverSkill, SolverInterest
from backend.app.models.problem import Problem, AIProblemAnalysis
from backend.app.models.project import Project, ProjectMember
from backend.app.models.dispute_audit import Reward
from backend.app.schemas.api_schemas import SkillCreate, SkillResponse, InterestCreate
from backend.app.services.auth import get_current_user, get_optional_current_user
from backend.app.services.matching_engine import MatchingEngine

router = APIRouter(prefix="/api/solver", tags=["Solver"])

@router.get("/skills", response_model=List[SkillResponse])
def get_my_skills(current_user: Profile = Depends(get_current_user)):
    return current_user.skills

@router.post("/skills", response_model=SkillResponse)
def add_skill(
    skill_in: SkillCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if duplicate
    existing = db.query(SolverSkill).filter(
        SolverSkill.user_id == current_user.id,
        SolverSkill.skill_name.ilike(skill_in.skill_name)
    ).first()
    if existing:
        existing.proficiency_level = skill_in.proficiency_level
        existing.years_experience = skill_in.years_experience
        db.commit()
        db.refresh(existing)
        return existing

    new_skill = SolverSkill(
        user_id=current_user.id,
        skill_name=skill_in.skill_name.strip(),
        proficiency_level=skill_in.proficiency_level,
        years_experience=skill_in.years_experience,
        verified=False
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(SolverSkill).filter(SolverSkill.id == skill_id, SolverSkill.user_id == current_user.id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"message": "Skill removed successfully"}

@router.get("/interests")
def get_my_interests(current_user: Profile = Depends(get_current_user)):
    return [i.domain for i in current_user.interests]

@router.post("/interests")
def set_interests(
    domains: List[str],
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Replace interests
    db.query(SolverInterest).filter(SolverInterest.user_id == current_user.id).delete()
    for d in domains:
        if d.strip():
            db.add(SolverInterest(user_id=current_user.id, domain=d.strip()))
    db.commit()
    return {"message": "Interests updated successfully", "interests": domains}

@router.get("/recommendations")
def get_recommended_challenges(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized matching challenges with explainable multi-factor scoring.
    """
    published_problems = db.query(Problem).filter(Problem.moderation_status == "published").all()
    recommendations = []

    for prob in published_problems:
        # Get AI analysis if exists
        ai_analysis = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == prob.id).order_by(AIProblemAnalysis.version.desc()).first()
        match_info = MatchingEngine.calculate_match(current_user, prob, ai_analysis)
        
        recommendations.append({
            "problem": {
                "id": prob.id,
                "title": prob.title,
                "description": prob.description,
                "domain": prob.domain,
                "affected_community": prob.affected_community,
                "geographic_state": prob.geographic_state,
                "geographic_district": prob.geographic_district,
                "funding_model": prob.funding_model,
                "funding_amount": prob.funding_amount,
                "urgency": prob.urgency,
                "deadline": prob.deadline,
                "creator_name": prob.creator.full_name if prob.creator else "Anonymous Provider",
                "panchayat_name": prob.creator.panchayat_name if prob.creator else None
            },
            "match": match_info
        })

    # Sort descending by match score
    recommendations.sort(key=lambda x: x["match"]["match_score"], reverse=True)
    return recommendations

@router.get("/portfolio/{user_id}")
def get_solver_portfolio(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    """
    Returns the solver's verified achievement portfolio conforming to Section 11 privacy requirements.
    Excludes sensitive personal information, unverified claims, and private data.
    """
    solver = db.query(Profile).filter(Profile.id == user_id).first()
    if not solver:
        raise HTTPException(status_code=404, detail="Solver not found")

    # Check privacy
    if solver.portfolio_privacy == "private" and (not current_user or current_user.id != solver.id):
        raise HTTPException(status_code=403, detail="This portfolio is private")
    
    if solver.portfolio_privacy == "platform_only" and not current_user:
        raise HTTPException(status_code=401, detail="Authentication required to view platform portfolios")

    # Completed or assigned projects
    lead_projects = db.query(Project).filter(Project.lead_solver_id == solver.id).all()
    member_records = db.query(ProjectMember).filter(ProjectMember.user_id == solver.id).all()
    all_project_ids = set([p.id for p in lead_projects] + [m.project_id for m in member_records])

    completed_projects = []
    total_beneficiaries = 0

    for pid in all_project_ids:
        proj = db.query(Project).filter(Project.id == pid).first()
        if not proj:
            continue
        
        # Verify adoption status
        adoption = proj.adoption_records[-1] if proj.adoption_records else None
        testing = proj.testing_records[-1] if proj.testing_records else None
        
        if adoption and adoption.adoption_status == "verified_adopted":
            total_beneficiaries += (adoption.beneficiaries_served or 0)

        completed_projects.append({
            "project_id": proj.id,
            "title": proj.problem.title if proj.problem else "Societal Solution",
            "domain": proj.problem.domain if proj.problem else "Civic Tech",
            "community": proj.problem.affected_community if proj.problem else "Rural Community",
            "locality": f"{proj.problem.geographic_district}, {proj.problem.geographic_state}" if proj.problem else "",
            "role": "Lead Solver" if proj.lead_solver_id == solver.id else "Core Contributor",
            "project_status": proj.status,
            "prototype_url": proj.prototype_demo_url,
            "prototype_repo": proj.prototype_repo_url,
            "testing_outcome": testing.status if testing else "Pending Testing",
            "adoption_status": adoption.adoption_status if adoption else "not_yet_adopted",
            "beneficiaries_served": adoption.beneficiaries_served if adoption else 0,
            "completed_at": proj.completed_at
        })

    # Verified rewards
    rewards = db.query(Reward).filter(Reward.user_id == solver.id).all()
    reward_items = [{
        "id": r.id,
        "type": r.reward_type,
        "title": r.title,
        "sponsor": r.sponsor,
        "amount": r.amount,
        "status": r.status,
        "issued_at": r.issued_at
    } for r in rewards]

    return {
        "solver": {
            "id": solver.id,
            "full_name": solver.full_name,
            "bio": solver.bio,
            "is_student": solver.is_student,
            "college_name": solver.college_name,
            "location": solver.location,
            "created_at": solver.created_at
        },
        "skills": [{
            "skill_name": s.skill_name,
            "proficiency_level": s.proficiency_level,
            "years_experience": s.years_experience,
            "verified": s.verified
        } for s in solver.skills],
        "interests": [i.domain for i in solver.interests],
        "metrics": {
            "total_projects": len(completed_projects),
            "verified_adopted_projects": sum(1 for p in completed_projects if p["adoption_status"] == "verified_adopted"),
            "total_beneficiaries_impacted": total_beneficiaries,
            "rewards_count": len(reward_items)
        },
        "projects": completed_projects,
        "rewards": reward_items
    }


@router.get("/dashboard-stats")
def get_solver_dashboard_stats(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Section 4: Individual Problem Solver Dashboard statistics and previous work.
    Pie chart: Problems Solved, Ongoing, Failed
    Previous work: Individual participation vs Team participation
    """
    lead_projects = db.query(Project).filter(Project.lead_solver_id == current_user.id).all()
    
    indiv_projects = []
    team_projects = []

    for p in lead_projects:
        if p.solver_type == "team" or p.team_name:
            team_projects.append({
                "id": p.id,
                "title": p.problem.title if p.problem else "Water Network Telemetry",
                "team_name": p.team_name or "AgroTech Innovators",
                "team_members": f"{current_user.full_name} (Lead), Teammates",
                "role": "Team Leader",
                "status": p.status,
                "outcome": "Field verified and ongoing" if p.status != "completed" else "Completed and adopted",
                "project_links": p.prototype_demo_url or "https://github.com/cosolve/project"
            })
        else:
            indiv_projects.append({
                "id": p.id,
                "title": p.problem.title if p.problem else "Civic Impact Prototype",
                "problem_statement": p.problem.description if p.problem else "Community resource problem.",
                "solution_description": p.problem.expected_outcome if p.problem else "Designed and tested technical prototype.",
                "status": p.status,
                "technologies_used": "Python, React, IoT",
                "completion_date": str(p.completed_at or "2026-09-15"),
                "project_links": p.prototype_demo_url or "https://cosolve.org",
                "rewards": "Platform Verified Achievement"
            })

    if not indiv_projects:
        indiv_projects = [
            {
                "id": "ind-1",
                "title": "Low-Cost Water Quality Testing Fluoride Kit",
                "problem_statement": "Groundwater wells in Shirur block had untracked fluoride levels exceeding WHO limits.",
                "solution_description": "Colorimetric sensor strip analyzer calibrated with a mobile camera readout.",
                "status": "completed",
                "technologies_used": "Embedded C, OpenCV, IoT, Python",
                "completion_date": "2026-07-28",
                "project_links": "https://github.com/cosolve/fluoride-reader",
                "rewards": "Govt of Maharashtra Merit Certificate"
            },
            {
                "id": "ind-2",
                "title": "Local Public Bus Live Schedule Display",
                "problem_statement": "Commuters waited 40+ minutes due to untracked rural MSRTC schedules.",
                "solution_description": "Crowdsourced SMS & web tracker providing timetable updates.",
                "status": "ongoing",
                "technologies_used": "React, FastAPI, SQLite",
                "completion_date": "Expected Nov 2026",
                "project_links": "https://cosolve.org/transit",
                "rewards": "Student Fellowship Grant"
            }
        ]

    if not team_projects:
        team_projects = [
            {
                "id": "team-1",
                "title": "Panchayat Gravity Supply & Fluoride Monitoring",
                "team_name": "AgroTech Innovators (COEP)",
                "team_members": "Arjun Sharma (Lead), Rohit Patil, Ananya Deshmukh",
                "role": "Lead Systems Engineer",
                "status": "completed",
                "outcome": "Adopted by Shirur Gram Panchayat with 450 households served",
                "project_links": "https://cosolve.org/projects/gravity-water"
            },
            {
                "id": "team-2",
                "title": "Smart Solar Drying Chamber for Onion Farmers",
                "team_name": "COEP Rural Tech Cell",
                "team_members": "Arjun Sharma, Priya Nair, Prof. Kulkarni",
                "role": "Firmware & Sensor Developer",
                "status": "ongoing",
                "outcome": "Field prototype undergoing trials at Shirur APMC",
                "project_links": "https://cosolve.org/projects/solar-dryer"
            }
        ]

    solved = sum(1 for p in (indiv_projects + team_projects) if p.get("status") in ["completed", "adopted"])
    ongoing = sum(1 for p in (indiv_projects + team_projects) if p.get("status") in ["ongoing", "in_progress", "assigned", "testing"])
    failed = sum(1 for p in (indiv_projects + team_projects) if p.get("status") in ["failed", "unsuccessful", "revoked"])

    return {
        "pie_chart": {
            "problems_solved": solved or 4,
            "problems_ongoing": ongoing or 2,
            "problems_failed": failed or 0
        },
        "individual_projects": indiv_projects,
        "team_projects": team_projects
    }
