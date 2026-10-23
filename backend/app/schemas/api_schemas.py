from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- AUTH & USER SCHEMAS -----------------
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "solver"  # "provider", "solver", "organization", "admin"
    phone: Optional[str] = None
    address: Optional[str] = None
    aadhaar_number: Optional[str] = None
    roll_number: Optional[str] = None
    college_name: Optional[str] = None
    avatar_url: Optional[str] = None
    skills: Optional[List[str]] = None
    aicte_code: Optional[str] = None
    spoc_name: Optional[str] = None
    spoc_phone: Optional[str] = None
    spoc_email: Optional[str] = None
    logo_url: Optional[str] = None
    provider_type: Optional[str] = None  # "individual", "panchayat_rep"
    panchayat_name: Optional[str] = None
    panchayat_state: Optional[str] = None
    panchayat_district: Optional[str] = None
    designation: Optional[str] = None
    is_student: Optional[bool] = False
    graduation_year: Optional[int] = None
    location: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel):
    email: str  # Email or Phone Number
    password: str
    otp: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    provider_type: Optional[str] = None
    panchayat_name: Optional[str] = None
    panchayat_state: Optional[str] = None
    panchayat_district: Optional[str] = None
    designation: Optional[str] = None
    verification_status: str
    is_student: bool
    college_name: Optional[str] = None
    graduation_year: Optional[int] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    availability_hours_per_week: int
    preferred_duration_weeks: int
    fieldwork_willing: bool
    remote_preference: str
    portfolio_privacy: str
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    college_name: Optional[str] = None
    graduation_year: Optional[int] = None
    availability_hours_per_week: Optional[int] = None
    fieldwork_willing: Optional[bool] = None
    remote_preference: Optional[str] = None
    portfolio_privacy: Optional[str] = None

# ----------------- SOLVER SKILLS & INTERESTS -----------------
class SkillCreate(BaseModel):
    skill_name: str
    proficiency_level: str = "intermediate"  # "beginner", "intermediate", "advanced", "expert"
    years_experience: float = 1.0

class SkillResponse(BaseModel):
    id: str
    skill_name: str
    proficiency_level: str
    years_experience: float
    verified: bool

    class Config:
        from_attributes = True

class InterestCreate(BaseModel):
    domain: str

# ----------------- PROBLEM SCHEMAS -----------------
class ProblemCreate(BaseModel):
    title: str = Field(..., min_length=5)
    description: str = Field(..., min_length=20)
    current_situation: Optional[str] = None
    root_cause: Optional[str] = None
    affected_community: str
    beneficiaries_estimate: Optional[int] = None
    domain: str  # "Water & Sanitation", "Renewable Energy", "Agriculture & Rural Tech", etc.
    category: Optional[str] = None
    geographic_state: str
    geographic_district: str
    locality: Optional[str] = None
    expected_outcome: str
    constraints: Optional[str] = None
    available_resources: Optional[str] = None
    required_skills_declared: Optional[str] = None
    preferred_solver_type: str = "any"  # "individual", "organization", "any"
    urgency: str = "medium"  # "low", "medium", "high", "critical"
    deadline: Optional[datetime] = None
    deliverables_text: Optional[str] = None
    acceptance_criteria_text: Optional[str] = None
    testing_approach: Optional[str] = None
    adoption_plan: Optional[str] = None
    funding_model: str = "voluntary"  # "voluntary", "prize_based", "grant_funded", "sponsored"
    funding_amount: float = 0.0
    funding_currency: str = "INR"
    sponsor_details: Optional[str] = None
    award_conditions: Optional[str] = None
    payment_milestones: Optional[str] = None

class ProblemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    current_situation: Optional[str] = None
    root_cause: Optional[str] = None
    affected_community: Optional[str] = None
    beneficiaries_estimate: Optional[int] = None
    domain: Optional[str] = None
    category: Optional[str] = None
    geographic_state: Optional[str] = None
    geographic_district: Optional[str] = None
    locality: Optional[str] = None
    expected_outcome: Optional[str] = None
    constraints: Optional[str] = None
    available_resources: Optional[str] = None
    required_skills_declared: Optional[str] = None
    preferred_solver_type: Optional[str] = None
    urgency: Optional[str] = None
    deadline: Optional[datetime] = None
    deliverables_text: Optional[str] = None
    acceptance_criteria_text: Optional[str] = None
    testing_approach: Optional[str] = None
    adoption_plan: Optional[str] = None
    funding_model: Optional[str] = None
    funding_amount: Optional[float] = None
    funding_currency: Optional[str] = None
    sponsor_details: Optional[str] = None
    award_conditions: Optional[str] = None
    payment_milestones: Optional[str] = None

class ProblemModerationAction(BaseModel):
    action: str  # "approve", "reject", "request_changes"
    notes: Optional[str] = None

class ProblemResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    current_situation: Optional[str] = None
    root_cause: Optional[str] = None
    affected_community: str
    beneficiaries_estimate: Optional[int] = None
    domain: str
    category: Optional[str] = None
    geographic_state: str
    geographic_district: str
    locality: Optional[str] = None
    expected_outcome: str
    constraints: Optional[str] = None
    available_resources: Optional[str] = None
    required_skills_declared: Optional[str] = None
    preferred_solver_type: str
    urgency: str
    deadline: Optional[datetime] = None
    deliverables_text: Optional[str] = None
    acceptance_criteria_text: Optional[str] = None
    testing_approach: Optional[str] = None
    adoption_plan: Optional[str] = None
    funding_model: str
    funding_amount: float
    funding_currency: str
    funding_status: str
    sponsor_details: Optional[str] = None
    award_conditions: Optional[str] = None
    payment_milestones: Optional[str] = None
    moderation_status: str
    moderation_notes: Optional[str] = None
    view_count: int
    created_at: datetime
    updated_at: datetime
    creator_name: Optional[str] = None
    creator_type: Optional[str] = None
    panchayat_name: Optional[str] = None
    
    # Project Taken & Progress Insights
    is_taken: bool = False
    project_id: Optional[str] = None
    taken_by: Optional[str] = None
    solver_type: Optional[str] = None
    progress_percentage: float = 0.0
    last_activity_days_ago: int = 0
    days_until_inactivity_warning: int = 7
    inactivity_status: str = "open"  # "open", "active", "warning", "revoked"
    project_status: Optional[str] = None
    next_progress_check_days: int = 2

    class Config:
        from_attributes = True

# ----------------- AI ANALYSIS SCHEMAS -----------------
class AIAnalysisUpdate(BaseModel):
    is_confirmed_by_provider: bool = True
    provider_edits: Optional[Dict[str, Any]] = None

# ----------------- APPLICATION SCHEMAS -----------------
class TeamMemberInput(BaseModel):
    name: str
    email: EmailStr

class ApplicationCreate(BaseModel):
    problem_id: str
    solver_type: str = "individual"  # "individual", "organization", "team"
    organization_id: Optional[str] = None
    team_name: Optional[str] = None
    college_name: Optional[str] = None
    team_members: Optional[List[TeamMemberInput]] = None
    proposal: str = Field(..., min_length=20)
    approach: str = Field(..., min_length=20)
    relevant_experience: Optional[str] = None
    estimated_timeline_weeks: float = 8.0
    weekly_availability_hours: float = 15.0
    team_composition_notes: Optional[str] = None

class SolverSelectionAction(BaseModel):
    application_id: str
    charter_scope: str
    charter_deliverables: str
    charter_acceptance_criteria: str
    charter_milestones_summary: Optional[str] = None
    charter_funding_terms: Optional[str] = None
    charter_ip_terms: Optional[str] = "Open source / Public good licensing for community benefit"
    charter_confidentiality_terms: Optional[str] = None
    charter_withdrawal_rules: Optional[str] = "2 weeks advance notice with deliverable handover required"

class ApplicationResponse(BaseModel):
    id: str
    problem_id: str
    solver_type: str
    applicant_id: str
    organization_id: Optional[str] = None
    proposal: str
    approach: str
    relevant_experience: Optional[str] = None
    estimated_timeline_weeks: float
    weekly_availability_hours: float
    team_composition_notes: Optional[str] = None
    match_score_at_application: float
    match_explanation_snapshot: Optional[str] = None
    status: str
    provider_notes: Optional[str] = None
    submitted_at: datetime
    applicant_name: Optional[str] = None
    college_name: Optional[str] = None
    org_name: Optional[str] = None
    team_name: Optional[str] = None
    team_members: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

# ----------------- PROJECT & WORKSPACE SCHEMAS -----------------
class MilestoneCreate(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    order: int = 1

class MilestoneUpdate(BaseModel):
    status: str  # "pending", "in_progress", "submitted", "approved", "rejected"

class TaskCreate(BaseModel):
    milestone_id: Optional[str] = None
    assigned_to_id: Optional[str] = None
    title: str
    description: Optional[str] = None

class TaskUpdate(BaseModel):
    status: str  # "todo", "in_progress", "done"

class DeliverableCreate(BaseModel):
    milestone_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    external_link: Optional[str] = None
    submission_type: str = "code"

class PrototypeSubmit(BaseModel):
    prototype_demo_url: Optional[str] = None
    prototype_repo_url: Optional[str] = None
    prototype_video_url: Optional[str] = None
    prototype_documentation: Optional[str] = None
    prototype_test_instructions: Optional[str] = None
    prototype_known_limitations: Optional[str] = None

class ReviewCreate(BaseModel):
    target_type: str  # "prototype", "deliverable", "milestone"
    target_id: str
    rating: int = 5
    decision: str  # "approved", "revisions_required", "rejected"
    comments: str

# ----------------- TESTING & ADOPTION SCHEMAS -----------------
class TestingRecordCreate(BaseModel):
    test_plan: str
    test_results: str
    status: str = "passed"  # "passed", "revision_required", "failed"
    criteria_checked: Optional[List[str]] = None
    reviewer_comments: Optional[str] = None

class AdoptionRecordCreate(BaseModel):
    adoption_status: str  # "not_yet_adopted", "adoption_claimed", "verified_adopted", "not_adopted", "unable_to_verify"
    implementation_date: Optional[datetime] = None
    real_world_evidence: Optional[str] = None
    beneficiaries_served: int = 0
    outcomes_achieved: Optional[str] = None
    known_limitations: Optional[str] = None
    maintenance_plan: Optional[str] = None
    is_independent_review: bool = False
    review_rationale: Optional[str] = None

# ----------------- DISPUTES & VERIFICATION -----------------
class DisputeCreate(BaseModel):
    project_id: str
    dispute_type: str  # "false_adoption", "unfair_rejection", "nonresponsive_provider", "unpaid_reward", "ip_dispute", "deliverable_misuse", "other"
    title: str
    description: str
    evidence_text: Optional[str] = None

class DisputeResolve(BaseModel):
    resolution_decision: str
    status: str = "resolved"  # "resolved", "dismissed"

class VerificationSubmit(BaseModel):
    request_type: str  # "individual_identity", "student_affiliation", "panchayat_authority", "organization_existence"
    document_ref: Optional[str] = None
    notes: Optional[str] = None
    org_id: Optional[str] = None

class VerificationReview(BaseModel):
    status: str  # "approved", "rejected", "correction_requested"
    admin_feedback: Optional[str] = None

class OrganizationCreate(BaseModel):
    name: str
    type: str  # "university", "student_club", "ngo", "shg", "research_lab", "other"
    registration_number: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
