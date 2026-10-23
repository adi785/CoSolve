import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.user import Profile, Organization
from backend.app.models.problem import Problem, AIProblemAnalysis
from backend.app.models.solver import SolverSkill, SolverInterest

class MatchingEngine:
    # Configurable weights from Section 8 of prompt
    WEIGHT_SKILLS = 0.40
    WEIGHT_DOMAIN = 0.20
    WEIGHT_AVAILABILITY = 0.15
    WEIGHT_EXPERIENCE = 0.15
    WEIGHT_LOCATION_FIELDWORK = 0.10

    @classmethod
    def calculate_match(
        cls,
        solver: Profile,
        problem: Problem,
        ai_analysis: Optional[AIProblemAnalysis] = None
    ) -> Dict[str, Any]:
        """
        Calculates explainable match score between an individual solver and a problem.
        Returns score (0-100), breakdown, matched/missing skills, and narrative explanation.
        """
        reasons = []
        limitations = []
        
        # Check eligibility first
        if problem.preferred_solver_type == "organization":
            limitations.append("Challenge author explicitly prefers organization/team solver.")

        # 1. Required Skills Match (40%)
        # Extract required skills from AI analysis or problem declared skills
        required_skills = []
        if ai_analysis and ai_analysis.required_skills:
            try:
                skills_data = json.loads(ai_analysis.required_skills)
                if isinstance(skills_data, list):
                    for item in skills_data:
                        if isinstance(item, dict) and "skill" in item:
                            required_skills.append(item["skill"].strip())
                        elif isinstance(item, str):
                            required_skills.append(item.strip())
            except Exception:
                pass

        if not required_skills and problem.required_skills_declared:
            required_skills = [s.strip() for s in problem.required_skills_declared.split(",") if s.strip()]

        if not required_skills:
            required_skills = ["Software/Hardware Engineering", "Field Testing"]

        # Normalize solver skills
        solver_skills_map = {s.skill_name.lower(): s for s in solver.skills}
        matched_skills = []
        missing_skills = []

        proficiency_weights = {
            "beginner": 0.5,
            "intermediate": 0.8,
            "advanced": 1.0,
            "expert": 1.1
        }

        skill_points = 0.0
        max_skill_points = len(required_skills)

        for req in required_skills:
            req_lower = req.lower()
            # Check direct or substring match
            matched = False
            for s_name, s_obj in solver_skills_map.items():
                if req_lower in s_name or s_name in req_lower:
                    mult = proficiency_weights.get(s_obj.proficiency_level.lower(), 0.8)
                    skill_points += mult
                    matched_skills.append({
                        "skill": req,
                        "solver_level": s_obj.proficiency_level,
                        "verified": s_obj.verified
                    })
                    matched = True
                    break
            if not matched:
                missing_skills.append(req)

        skills_score = min(100.0, (skill_points / max_skill_points) * 100.0) if max_skill_points > 0 else 70.0
        if matched_skills:
            reasons.append(f"Strong match for {len(matched_skills)} required skills ({', '.join([m['skill'] for m in matched_skills[:3]])}).")
        if missing_skills:
            limitations.append(f"Missing direct profile match for: {', '.join(missing_skills[:3])}.")

        # 2. Domain & Interest Relevance (20%)
        solver_interests = [i.domain.lower() for i in solver.interests]
        problem_domain = problem.domain.lower()
        if problem_domain in solver_interests or any(i in problem_domain for i in solver_interests):
            domain_score = 100.0
            reasons.append(f"Direct alignment with solver's declared interest in '{problem.domain}'.")
        elif len(solver_interests) == 0:
            domain_score = 60.0  # neutral baseline for unstated interests
        else:
            domain_score = 40.0

        # 3. Availability & Timeline Fit (15%)
        # Expected weekly effort: ~10-15h
        avail_hours = solver.availability_hours_per_week or 10
        if avail_hours >= 15:
            availability_score = 100.0
            reasons.append(f"High weekly availability ({avail_hours} hrs/week) fits project timeline.")
        elif avail_hours >= 10:
            availability_score = 80.0
        else:
            availability_score = 50.0
            limitations.append(f"Low weekly availability ({avail_hours} hrs/week).")

        # 4. Relevant Experience (15%)
        # Experience based on student graduation status or years of experience
        avg_exp = 1.0
        if solver.skills:
            avg_exp = sum(s.years_experience for s in solver.skills) / len(solver.skills)
        if avg_exp >= 3.0:
            exp_score = 100.0
            reasons.append(f"Demonstrated track record with ~{avg_exp:.1f} years practical domain experience.")
        elif avg_exp >= 1.5:
            exp_score = 85.0
        elif avg_exp >= 0.5:
            exp_score = 70.0
        else:
            exp_score = 55.0

        # 5. Location or Fieldwork Suitability (10%)
        location_score = 50.0  # baseline
        if solver.fieldwork_willing:
            location_score += 30.0
            reasons.append("Willing and available for on-ground field trials and community testing.")
        
        # Check geographic proximity
        if solver.location and problem.geographic_state:
            if problem.geographic_state.lower() in solver.location.lower():
                location_score += 20.0
                reasons.append(f"Located within target state ({problem.geographic_state}).")
        location_score = min(100.0, location_score)

        # Weighted total
        total_score = (
            (skills_score * cls.WEIGHT_SKILLS) +
            (domain_score * cls.WEIGHT_DOMAIN) +
            (availability_score * cls.WEIGHT_AVAILABILITY) +
            (exp_score * cls.WEIGHT_EXPERIENCE) +
            (location_score * cls.WEIGHT_LOCATION_FIELDWORK)
        )
        total_score = round(total_score, 1)

        return {
            "solver_id": solver.id,
            "solver_name": solver.full_name,
            "solver_type": "individual",
            "match_score": total_score,
            "breakdown": {
                "skills_score": round(skills_score, 1),
                "domain_score": round(domain_score, 1),
                "availability_score": round(availability_score, 1),
                "experience_score": round(exp_score, 1),
                "location_score": round(location_score, 1),
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "availability_fit": f"{avail_hours} hrs/week",
            "fieldwork_fit": "Yes" if solver.fieldwork_willing else "Remote Only",
            "reasons": reasons,
            "limitations": limitations
        }

    @classmethod
    def calculate_org_match(
        cls,
        org: Organization,
        problem: Problem,
        ai_analysis: Optional[AIProblemAnalysis] = None
    ) -> Dict[str, Any]:
        """
        Calculates combined team capabilities for an organization solver.
        Aggregates member skills and collective capacity.
        """
        # Aggregate all members' skills
        all_skills = []
        total_capacity = 0
        fieldwork_count = 0
        member_count = len(org.members)

        for m in org.members:
            if m.user:
                all_skills.extend(m.user.skills)
                total_capacity += (m.user.availability_hours_per_week or 10)
                if m.user.fieldwork_willing:
                    fieldwork_count += 1

        # Calculate skills match against combined pool
        required_skills = []
        if ai_analysis and ai_analysis.required_skills:
            try:
                skills_data = json.loads(ai_analysis.required_skills)
                if isinstance(skills_data, list):
                    for item in skills_data:
                        if isinstance(item, dict) and "skill" in item:
                            required_skills.append(item["skill"].strip())
            except Exception:
                pass

        if not required_skills and problem.required_skills_declared:
            required_skills = [s.strip() for s in problem.required_skills_declared.split(",") if s.strip()]

        if not required_skills:
            required_skills = ["Engineering", "Field Deployment"]

        matched_skills = []
        missing_skills = []
        org_skills_names = {s.skill_name.lower(): s for s in all_skills}

        for req in required_skills:
            req_lower = req.lower()
            if any(req_lower in s_name or s_name in req_lower for s_name in org_skills_names):
                matched_skills.append({"skill": req, "solver_level": "team_pool", "verified": True})
            else:
                missing_skills.append(req)

        skill_points = len(matched_skills)
        skills_score = min(100.0, (skill_points / len(required_skills)) * 100.0) if required_skills else 80.0
        
        # Org domain alignment
        domain_score = 90.0 if problem.domain in (org.description or "") else 70.0
        
        # Team capacity
        avail_score = min(100.0, (total_capacity / 40.0) * 100.0)
        
        # Combined experience
        exp_score = 85.0
        
        # Location / fieldwork
        loc_score = 90.0 if fieldwork_count > 0 else 60.0

        total_score = round(
            (skills_score * cls.WEIGHT_SKILLS) +
            (domain_score * cls.WEIGHT_DOMAIN) +
            (avail_score * cls.WEIGHT_AVAILABILITY) +
            (exp_score * cls.WEIGHT_EXPERIENCE) +
            (loc_score * cls.WEIGHT_LOCATION_FIELDWORK),
            1
        )

        reasons = [
            f"Collective team capacity of {member_count} members with {total_capacity} combined hrs/week.",
            f"Covering {len(matched_skills)} of {len(required_skills)} required technical areas.",
            f"{fieldwork_count} team members available for on-ground fieldwork."
        ]

        return {
            "solver_id": org.id,
            "solver_name": org.name,
            "solver_type": "organization",
            "match_score": total_score,
            "breakdown": {
                "skills_score": round(skills_score, 1),
                "domain_score": round(domain_score, 1),
                "availability_score": round(avail_score, 1),
                "experience_score": round(exp_score, 1),
                "location_score": round(loc_score, 1),
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "availability_fit": f"{total_capacity} collective hrs/week",
            "fieldwork_fit": f"{fieldwork_count} members available",
            "reasons": reasons,
            "limitations": [f"Missing: {', '.join(missing_skills)}"] if missing_skills else []
        }
