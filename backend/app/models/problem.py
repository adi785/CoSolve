import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Problem(Base):
    __tablename__ = "problems"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    creator_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    
    # Core submission fields
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    current_situation = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    affected_community = Column(String(255), nullable=False)
    beneficiaries_estimate = Column(Integer, nullable=True)
    
    # Classification & Location
    domain = Column(String(100), nullable=False)  # "Water & Sanitation", "Renewable Energy", "Agriculture & Rural Tech", "Education & Digital Literacy", "Healthcare & Nutrition", "Livelihoods & Waste Management"
    category = Column(String(100), nullable=True)
    geographic_state = Column(String(100), nullable=False)
    geographic_district = Column(String(100), nullable=False)
    locality = Column(String(255), nullable=True)
    
    # Requirements & Scope
    expected_outcome = Column(Text, nullable=False)
    constraints = Column(Text, nullable=True)
    available_resources = Column(Text, nullable=True)
    required_skills_declared = Column(Text, nullable=True)  # JSON or comma-separated list
    preferred_solver_type = Column(String(50), default="any")  # "individual", "organization", "any"
    urgency = Column(String(50), default="medium")  # "low", "medium", "high", "critical"
    deadline = Column(DateTime, nullable=True)
    
    # Deliverables & Acceptance
    deliverables_text = Column(Text, nullable=True)
    acceptance_criteria_text = Column(Text, nullable=True)
    testing_approach = Column(Text, nullable=True)
    adoption_plan = Column(Text, nullable=True)
    
    # Funding Model
    funding_model = Column(String(50), default="voluntary")  # "voluntary", "prize_based", "grant_funded", "sponsored"
    funding_amount = Column(Float, default=0.0)
    funding_currency = Column(String(10), default="INR")
    funding_status = Column(String(50), default="planned")  # "planned", "pledged", "secured", "awarded", "paid"
    sponsor_details = Column(String(255), nullable=True)
    award_conditions = Column(Text, nullable=True)
    payment_milestones = Column(Text, nullable=True)
    
    # Moderation & Lifecycle
    moderation_status = Column(String(50), default="draft")  # "draft", "submitted", "under_review", "changes_requested", "approved", "rejected", "published"
    moderation_notes = Column(Text, nullable=True)
    moderated_by = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    moderated_at = Column(DateTime, nullable=True)
    
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship("Profile", foreign_keys=[creator_id], back_populates="problems_created")
    moderator = relationship("Profile", foreign_keys=[moderated_by])
    attachments = relationship("ProblemAttachment", back_populates="problem", cascade="all, delete-orphan")
    ai_analyses = relationship("AIProblemAnalysis", back_populates="problem", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="problem", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="problem")


class ProblemAttachment(Base):
    __tablename__ = "problem_attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)
    is_private = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="attachments")


class AIProblemAnalysis(Base):
    __tablename__ = "ai_problem_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id"), nullable=False)
    version = Column(Integer, default=1)
    provider = Column(String(50), default="Co-Solve-ai-engine")  # "mock", "gemini-1.5-flash", "openai-gpt-4o"
    model_name = Column(String(100), default="Co-Solve-v1")
    
    # Structured outputs (stored as JSON strings)
    executive_summary = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    affected_stakeholders = Column(Text, nullable=False)  # JSON list
    domain_detected = Column(String(100), nullable=False)
    subdomains = Column(Text, nullable=True)  # JSON list
    potential_root_causes = Column(Text, nullable=True)  # JSON list of hypotheses
    required_skills = Column(Text, nullable=False)  # JSON list: [{"skill": "IoT", "level": "intermediate", "weight": 5}]
    suggested_team_composition = Column(Text, nullable=True)  # JSON list / text
    complexity_score = Column(Integer, default=3)  # 1 to 5
    complexity_explanation = Column(Text, nullable=True)
    expected_deliverables = Column(Text, nullable=True)  # JSON list
    suggested_milestones = Column(Text, nullable=True)  # JSON list
    acceptance_criteria = Column(Text, nullable=True)  # JSON list
    testing_strategy = Column(Text, nullable=True)  # JSON text
    risks_and_constraints = Column(Text, nullable=True)  # JSON list
    missing_information_questions = Column(Text, nullable=True)  # JSON list of questions
    impact_indicators = Column(Text, nullable=True)  # JSON list
    suggested_adoption_strategy = Column(Text, nullable=True)  # JSON text
    confidence_score = Column(Float, default=0.88)
    
    # Provider review & confirmation
    is_confirmed_by_provider = Column(Boolean, default=False)
    provider_edits = Column(Text, nullable=True)  # JSON delta or notes
    generated_at = Column(DateTime, default=datetime.utcnow)

    problem = relationship("Problem", back_populates="ai_analyses")
