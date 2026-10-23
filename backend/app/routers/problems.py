import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.database import get_db
from backend.app.models.problem import Problem, AIProblemAnalysis
from backend.app.models.user import Profile
from backend.app.schemas.api_schemas import (
    ProblemCreate,
    ProblemUpdate,
    ProblemResponse,
    ProblemModerationAction,
    AIAnalysisUpdate
)
from backend.app.services.auth import (
    get_current_user,
    get_optional_current_user,
    require_role,
    require_verified_provider,
    require_admin
)
from backend.app.services.ai_analyst import AIProblemAnalystService
from backend.app.services.audit import log_audit
from backend.app.services.notifications import create_notification

router = APIRouter(prefix="/api/problems", tags=["Problems"])

@router.post("", response_model=ProblemResponse)
def create_problem(
    problem_in: ProblemCreate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "provider" and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified problem providers or administrators can create societal challenges"
        )

    db_problem = Problem(
        creator_id=current_user.id,
        title=problem_in.title,
        description=problem_in.description,
        current_situation=problem_in.current_situation,
        root_cause=problem_in.root_cause,
        affected_community=problem_in.affected_community,
        beneficiaries_estimate=problem_in.beneficiaries_estimate,
        domain=problem_in.domain,
        category=problem_in.category,
        geographic_state=problem_in.geographic_state,
        geographic_district=problem_in.geographic_district,
        locality=problem_in.locality,
        expected_outcome=problem_in.expected_outcome,
        constraints=problem_in.constraints,
        available_resources=problem_in.available_resources,
        required_skills_declared=problem_in.required_skills_declared,
        preferred_solver_type=problem_in.preferred_solver_type,
        urgency=problem_in.urgency,
        deadline=problem_in.deadline,
        deliverables_text=problem_in.deliverables_text,
        acceptance_criteria_text=problem_in.acceptance_criteria_text,
        testing_approach=problem_in.testing_approach,
        adoption_plan=problem_in.adoption_plan,
        funding_model=problem_in.funding_model,
        funding_amount=problem_in.funding_amount,
        funding_currency=problem_in.funding_currency,
        funding_status="planned" if problem_in.funding_amount > 0 else "voluntary",
        sponsor_details=problem_in.sponsor_details,
        award_conditions=problem_in.award_conditions,
        payment_milestones=problem_in.payment_milestones,
        moderation_status="draft"
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)

    log_audit(db, "PROBLEM_CREATED", "problem", db_problem.id, actor_id=current_user.id, details={"title": db_problem.title})
    
    # Automatically generate initial AI analysis in background/synchronously
    try:
        analysis_data = AIProblemAnalystService.generate_analysis({
            "title": db_problem.title,
            "description": db_problem.description,
            "domain": db_problem.domain,
            "affected_community": db_problem.affected_community,
            "geographic_state": db_problem.geographic_state,
            "geographic_district": db_problem.geographic_district,
            "required_skills_declared": db_problem.required_skills_declared
        })
        ai_record = AIProblemAnalysis(
            problem_id=db_problem.id,
            version=1,
            provider=analysis_data.get("provider", "samarthya-ai"),
            model_name=analysis_data.get("model_name", "samarthya-v1"),
            executive_summary=analysis_data.get("executive_summary", ""),
            problem_statement=analysis_data.get("problem_statement", ""),
            affected_stakeholders=json.dumps(analysis_data.get("affected_stakeholders", [])),
            domain_detected=analysis_data.get("domain_detected", db_problem.domain),
            subdomains=json.dumps(analysis_data.get("subdomains", [])),
            potential_root_causes=json.dumps(analysis_data.get("potential_root_causes", [])),
            required_skills=json.dumps(analysis_data.get("required_skills", [])),
            suggested_team_composition=analysis_data.get("suggested_team_composition", ""),
            complexity_score=analysis_data.get("complexity_score", 3),
            complexity_explanation=analysis_data.get("complexity_explanation", ""),
            expected_deliverables=json.dumps(analysis_data.get("expected_deliverables", [])),
            suggested_milestones=json.dumps(analysis_data.get("suggested_milestones", [])),
            acceptance_criteria=json.dumps(analysis_data.get("acceptance_criteria", [])),
            testing_strategy=analysis_data.get("testing_strategy", ""),
            risks_and_constraints=json.dumps(analysis_data.get("risks_and_constraints", [])),
            missing_information_questions=json.dumps(analysis_data.get("missing_information_questions", [])),
            impact_indicators=json.dumps(analysis_data.get("impact_indicators", [])),
            suggested_adoption_strategy=analysis_data.get("suggested_adoption_strategy", ""),
            confidence_score=analysis_data.get("confidence_score", 0.9)
        )
        db.add(ai_record)
        db.commit()
    except Exception as e:
        print(f"Error generating initial AI analysis: {e}")

    # Build response
    resp = ProblemResponse.model_validate(db_problem)
    resp.creator_name = current_user.full_name
    resp.creator_type = current_user.provider_type
    resp.panchayat_name = current_user.panchayat_name
    return resp


@router.get("", response_model=List[ProblemResponse])
def list_published_problems(
    domain: Optional[str] = None,
    state: Optional[str] = None,
    funding_model: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Problem).filter(Problem.moderation_status == "published")
    
    if domain and domain != "all":
        query = query.filter(Problem.domain == domain)
    if state and state != "all":
        query = query.filter(Problem.geographic_state == state)
    if funding_model and funding_model != "all":
        query = query.filter(Problem.funding_model == funding_model)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(or_(
            Problem.title.ilike(search_filter),
            Problem.description.ilike(search_filter),
            Problem.affected_community.ilike(search_filter)
        ))

    problems = query.order_by(Problem.created_at.desc()).all()
    results = []
    for p in problems:
        res = ProblemResponse.model_validate(p)
        if p.creator:
            res.creator_name = p.creator.full_name
            res.creator_type = p.creator.provider_type
            res.panchayat_name = p.creator.panchayat_name
        results.append(res)
    return results


@router.get("/my", response_model=List[ProblemResponse])
def get_my_problems(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problems = db.query(Problem).filter(Problem.creator_id == current_user.id).order_by(Problem.created_at.desc()).all()
    results = []
    for p in problems:
        res = ProblemResponse.model_validate(p)
        res.creator_name = current_user.full_name
        res.creator_type = current_user.provider_type
        res.panchayat_name = current_user.panchayat_name
        results.append(res)
    return results


@router.get("/{problem_id}", response_model=ProblemResponse)
def get_problem(
    problem_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # If not published, only creator or admin can view
    if problem.moderation_status != "published":
        if not current_user or (current_user.id != problem.creator_id and current_user.role != "admin"):
            raise HTTPException(status_code=403, detail="Challenge is not yet published")

    problem.view_count = (problem.view_count or 0) + 1
    db.commit()

    res = ProblemResponse.model_validate(problem)
    if problem.creator:
        res.creator_name = problem.creator.full_name
        res.creator_type = problem.creator.provider_type
        res.panchayat_name = problem.creator.panchayat_name
    return res


@router.put("/{problem_id}", response_model=ProblemResponse)
def update_problem(
    problem_id: str,
    problem_in: ProblemUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized to edit this challenge")

    for key, val in problem_in.model_dump(exclude_unset=True).items():
        setattr(problem, key, val)
    
    db.commit()
    db.refresh(problem)
    res = ProblemResponse.model_validate(problem)
    return res


@router.post("/{problem_id}/submit")
def submit_for_moderation(
    problem_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    problem.moderation_status = "submitted"
    db.commit()
    log_audit(db, "PROBLEM_SUBMITTED_FOR_MODERATION", "problem", problem.id, actor_id=current_user.id)
    return {"message": "Problem submitted for moderation review successfully"}


@router.post("/{problem_id}/moderate")
def moderate_problem(
    problem_id: str,
    action_in: ProblemModerationAction,
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if action_in.action == "approve":
        # Check provider verification
        if problem.creator and problem.creator.verification_status != "verified":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish challenge: Provider account is not yet verified."
            )
        problem.moderation_status = "published"
    elif action_in.action == "reject":
        problem.moderation_status = "rejected"
    elif action_in.action == "request_changes":
        problem.moderation_status = "changes_requested"
    else:
        raise HTTPException(status_code=400, detail="Invalid moderation action")

    problem.moderation_notes = action_in.notes
    problem.moderated_by = current_user.id
    problem.moderated_at = datetime.utcnow()
    db.commit()

    log_audit(db, f"PROBLEM_MODERATED_{action_in.action.upper()}", "problem", problem.id, actor_id=current_user.id, details={"notes": action_in.notes})
    
    # Notify creator
    create_notification(
        db,
        user_id=problem.creator_id,
        title=f"Challenge Moderation: {problem.title}",
        message=f"Your challenge has been updated to '{problem.moderation_status}'. Notes: {action_in.notes or 'None'}",
        category="system",
        link=f"/problems/{problem.id}"
    )

    return {"message": f"Problem status updated to {problem.moderation_status}", "status": problem.moderation_status}


@router.post("/{problem_id}/analyze")
def trigger_ai_analysis(
    problem_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    analysis_data = AIProblemAnalystService.generate_analysis({
        "title": problem.title,
        "description": problem.description,
        "domain": problem.domain,
        "affected_community": problem.affected_community,
        "geographic_state": problem.geographic_state,
        "geographic_district": problem.geographic_district,
        "required_skills_declared": problem.required_skills_declared
    })

    # Find current max version
    latest = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == problem.id).order_by(AIProblemAnalysis.version.desc()).first()
    version = (latest.version + 1) if latest else 1

    ai_record = AIProblemAnalysis(
        problem_id=problem.id,
        version=version,
        provider=analysis_data.get("provider", "samarthya-ai"),
        model_name=analysis_data.get("model_name", "samarthya-v1"),
        executive_summary=analysis_data.get("executive_summary", ""),
        problem_statement=analysis_data.get("problem_statement", ""),
        affected_stakeholders=json.dumps(analysis_data.get("affected_stakeholders", [])),
        domain_detected=analysis_data.get("domain_detected", problem.domain),
        subdomains=json.dumps(analysis_data.get("subdomains", [])),
        potential_root_causes=json.dumps(analysis_data.get("potential_root_causes", [])),
        required_skills=json.dumps(analysis_data.get("required_skills", [])),
        suggested_team_composition=analysis_data.get("suggested_team_composition", ""),
        complexity_score=analysis_data.get("complexity_score", 3),
        complexity_explanation=analysis_data.get("complexity_explanation", ""),
        expected_deliverables=json.dumps(analysis_data.get("expected_deliverables", [])),
        suggested_milestones=json.dumps(analysis_data.get("suggested_milestones", [])),
        acceptance_criteria=json.dumps(analysis_data.get("acceptance_criteria", [])),
        testing_strategy=analysis_data.get("testing_strategy", ""),
        risks_and_constraints=json.dumps(analysis_data.get("risks_and_constraints", [])),
        missing_information_questions=json.dumps(analysis_data.get("missing_information_questions", [])),
        impact_indicators=json.dumps(analysis_data.get("impact_indicators", [])),
        suggested_adoption_strategy=analysis_data.get("suggested_adoption_strategy", ""),
        confidence_score=analysis_data.get("confidence_score", 0.9)
    )
    db.add(ai_record)
    db.commit()
    db.refresh(ai_record)

    log_audit(db, "AI_ANALYSIS_GENERATED", "problem", problem.id, actor_id=current_user.id, details={"version": version})
    return get_ai_analysis(problem_id, db, current_user)


@router.get("/{problem_id}/analysis")
def get_ai_analysis(
    problem_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[Profile] = Depends(get_optional_current_user)
):
    analysis = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == problem_id).order_by(AIProblemAnalysis.version.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="AI analysis not yet generated for this challenge")

    def safe_json_loads(val, default):
        if not val:
            return default
        try:
            return json.loads(val)
        except Exception:
            return default

    return {
        "id": analysis.id,
        "problem_id": analysis.problem_id,
        "version": analysis.version,
        "provider": analysis.provider,
        "model_name": analysis.model_name,
        "confidence_score": analysis.confidence_score,
        "executive_summary": analysis.executive_summary,
        "problem_statement": analysis.problem_statement,
        "affected_stakeholders": safe_json_loads(analysis.affected_stakeholders, []),
        "domain_detected": analysis.domain_detected,
        "subdomains": safe_json_loads(analysis.subdomains, []),
        "potential_root_causes": safe_json_loads(analysis.potential_root_causes, []),
        "required_skills": safe_json_loads(analysis.required_skills, []),
        "suggested_team_composition": analysis.suggested_team_composition,
        "complexity_score": analysis.complexity_score,
        "complexity_explanation": analysis.complexity_explanation,
        "expected_deliverables": safe_json_loads(analysis.expected_deliverables, []),
        "suggested_milestones": safe_json_loads(analysis.suggested_milestones, []),
        "acceptance_criteria": safe_json_loads(analysis.acceptance_criteria, []),
        "testing_strategy": analysis.testing_strategy,
        "risks_and_constraints": safe_json_loads(analysis.risks_and_constraints, []),
        "missing_information_questions": safe_json_loads(analysis.missing_information_questions, []),
        "impact_indicators": safe_json_loads(analysis.impact_indicators, []),
        "suggested_adoption_strategy": analysis.suggested_adoption_strategy,
        "is_confirmed_by_provider": analysis.is_confirmed_by_provider,
        "provider_edits": safe_json_loads(analysis.provider_edits, {}),
        "generated_at": analysis.generated_at
    }


@router.put("/{problem_id}/analysis")
def update_or_confirm_ai_analysis(
    problem_id: str,
    update_in: AIAnalysisUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(AIProblemAnalysis).filter(AIProblemAnalysis.problem_id == problem_id).order_by(AIProblemAnalysis.version.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="AI analysis not found")

    problem = db.query(Problem).filter(Problem.id == problem_id).first()
    if problem.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Unauthorized")

    analysis.is_confirmed_by_provider = update_in.is_confirmed_by_provider
    if update_in.provider_edits:
        analysis.provider_edits = json.dumps(update_in.provider_edits)
    db.commit()

    log_audit(db, "AI_ANALYSIS_CONFIRMED_BY_PROVIDER", "problem", problem.id, actor_id=current_user.id)
    return {"message": "AI analysis confirmed and saved by provider", "is_confirmed": analysis.is_confirmed_by_provider}
