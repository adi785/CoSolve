from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import Profile, Organization, OrganizationMember
from backend.app.models.problem import Problem, AIProblemAnalysis
from backend.app.schemas.api_schemas import OrganizationCreate
from backend.app.services.auth import get_current_user
from backend.app.services.matching_engine import MatchingEngine
from backend.app.services.audit import log_audit

router = APIRouter(prefix="/api/organizations", tags=["Organizations"])

@router.post("")
def create_organization(
    org_in: OrganizationCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(Organization).filter(Organization.name == org_in.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization name already taken")

    org = Organization(
        name=org_in.name,
        type=org_in.type,
        registration_number=org_in.registration_number,
        lead_id=current_user.id,
        description=org_in.description,
        website=org_in.website,
        verification_status="verified" if current_user.role == "admin" else "pending"
    )
    db.add(org)
    db.flush()

    # Add creator as lead member
    member = OrganizationMember(
        org_id=org.id,
        user_id=current_user.id,
        role="lead"
    )
    db.add(member)
    db.commit()
    db.refresh(org)

    log_audit(db, "ORGANIZATION_CREATED", "organization", org.id, actor_id=current_user.id, details={"name": org.name})
    return org


@router.get("/my")
def get_my_organizations(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    memberships = db.query(OrganizationMember).filter(OrganizationMember.user_id == current_user.id).all()
    orgs = []
    for m in memberships:
        org = m.organization
        if org:
            orgs.append({
                "id": org.id,
                "name": org.name,
                "type": org.type,
                "registration_number": org.registration_number,
                "description": org.description,
                "verification_status": org.verification_status,
                "my_role": m.role,
                "member_count": len(org.members)
            })
    return orgs


@router.get("/{org_id}")
def get_organization_detail(
    org_id: str,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    members = []
    total_skills = set()
    for m in org.members:
        u = m.user
        if u:
            for s in u.skills:
                total_skills.add(s.skill_name)
            members.append({
                "id": m.id,
                "user_id": u.id,
                "name": u.full_name,
                "email": u.email,
                "college_name": u.college_name,
                "role": m.role,
                "availability": u.availability_hours_per_week,
                "skills": [s.skill_name for s in u.skills]
            })

    return {
        "id": org.id,
        "name": org.name,
        "type": org.type,
        "registration_number": org.registration_number,
        "description": org.description,
        "website": org.website,
        "verification_status": org.verification_status,
        "lead_id": org.lead_id,
        "lead_name": org.lead.full_name if org.lead else "Lead",
        "members": members,
        "aggregated_skills": list(total_skills)
    }


@router.post("/{org_id}/members")
def add_organization_member(
    org_id: str,
    email: str,
    role: str = "member",
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if org.lead_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only organization lead can add members")

    user_to_add = db.query(Profile).filter(Profile.email == email).first()
    if not user_to_add:
        raise HTTPException(status_code=404, detail="User with this email not found")

    existing = db.query(OrganizationMember).filter(
        OrganizationMember.org_id == org.id,
        OrganizationMember.user_id == user_to_add.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member of this organization")

    new_member = OrganizationMember(
        org_id=org.id,
        user_id=user_to_add.id,
        role=role
    )
    db.add(new_member)
    db.commit()

    log_audit(db, "ORG_MEMBER_ADDED", "organization", org.id, actor_id=current_user.id, details={"added_user_id": user_to_add.id})
    return {"message": f"{user_to_add.full_name} added to organization as {role}"}


@router.get("/{org_id}/recommendations")
def get_org_recommendations(
    org_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    published_problems = db.query(Problem).filter(Problem.moderation_status == "published").all()
    recommendations = []

    for prob in published_problems:
        ai_analysis = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == prob.id).order_by(AIProblemAnalysis.version.desc()).first()
        match_info = MatchingEngine.calculate_org_match(org, prob, ai_analysis)

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
                "creator_name": prob.creator.full_name if prob.creator else "Provider",
                "panchayat_name": prob.creator.panchayat_name if prob.creator else None
            },
            "match": match_info
        })

    recommendations.sort(key=lambda x: x["match"]["match_score"], reverse=True)
    return recommendations
