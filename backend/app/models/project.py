import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id"), nullable=False)
    application_id = Column(String(36), ForeignKey("applications.id"), nullable=False, unique=True)
    
    solver_type = Column(String(50), default="individual")  # "individual", "organization"
    lead_solver_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    
    # Status
    # assigned -> in_progress -> prototype_submitted -> prototype_review -> testing -> adoption_review -> completed
    status = Column(String(50), default="assigned")
    
    # Project Charter & Agreements (Section 9/10)
    charter_scope = Column(Text, nullable=False)
    charter_deliverables = Column(Text, nullable=False)
    charter_acceptance_criteria = Column(Text, nullable=False)
    charter_milestones_summary = Column(Text, nullable=True)
    charter_funding_terms = Column(Text, nullable=True)
    charter_ip_terms = Column(Text, nullable=True)
    charter_confidentiality_terms = Column(Text, nullable=True)
    charter_withdrawal_rules = Column(Text, nullable=True)
    
    charter_agreed_solver = Column(Boolean, default=True)
    charter_agreed_provider = Column(Boolean, default=True)
    
    # Prototype details (Section 10)
    prototype_demo_url = Column(String(500), nullable=True)
    prototype_repo_url = Column(String(500), nullable=True)
    prototype_video_url = Column(String(500), nullable=True)
    prototype_documentation = Column(Text, nullable=True)
    prototype_test_instructions = Column(Text, nullable=True)
    prototype_known_limitations = Column(Text, nullable=True)
    prototype_submitted_at = Column(DateTime, nullable=True)
    
    # Overall completion separate from adoption
    is_scope_completed = Column(Boolean, default=False)
    
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    problem = relationship("Problem", back_populates="projects")
    application = relationship("Application", back_populates="project")
    lead_solver = relationship("Profile", foreign_keys=[lead_solver_id])
    organization = relationship("Organization")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan", order_by="Milestone.order")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    deliverables = relationship("Deliverable", back_populates="project", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="project", cascade="all, delete-orphan")
    testing_records = relationship("TestingRecord", back_populates="project", cascade="all, delete-orphan")
    adoption_records = relationship("AdoptionRecord", back_populates="project", cascade="all, delete-orphan")
    impact_metrics = relationship("ImpactMetric", back_populates="project", cascade="all, delete-orphan")
    disputes = relationship("Dispute", back_populates="project")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    role = Column(String(50), default="contributor")  # "lead", "contributor", "advisor", "reviewer"
    assigned_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="members")
    user = relationship("Profile")


class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=1)
    target_date = Column(DateTime, nullable=True)
    status = Column(String(50), default="pending")  # "pending", "in_progress", "submitted", "approved", "rejected"
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="milestones")
    tasks = relationship("Task", back_populates="milestone")
    deliverables = relationship("Deliverable", back_populates="milestone")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=True)
    assigned_to_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="todo")  # "todo", "in_progress", "done"
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    milestone = relationship("Milestone", back_populates="tasks")
    assignee = relationship("Profile")


class Deliverable(Base):
    __tablename__ = "deliverables"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    milestone_id = Column(String(36), ForeignKey("milestones.id"), nullable=True)
    submitted_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    external_link = Column(String(500), nullable=True)
    submission_type = Column(String(50), default="code")  # "report", "code", "dataset", "schematic", "demo_video", "other"
    version = Column(Integer, default=1)
    status = Column(String(50), default="submitted")  # "submitted", "approved", "revision_requested"
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="deliverables")
    milestone = relationship("Milestone", back_populates="deliverables")
    submitter = relationship("Profile")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    target_type = Column(String(50), nullable=False)  # "prototype", "deliverable", "milestone"
    target_id = Column(String(36), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    rating = Column(Integer, default=5)  # 1 to 5
    decision = Column(String(50), nullable=False)  # "approved", "revisions_required", "rejected"
    comments = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="reviews")
    reviewer = relationship("Profile")
