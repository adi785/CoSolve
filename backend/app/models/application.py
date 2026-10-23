import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    problem_id = Column(String(36), ForeignKey("problems.id"), nullable=False)
    solver_type = Column(String(50), default="individual")  # "individual", "organization"
    applicant_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    
    # Application details
    proposal = Column(Text, nullable=False)
    approach = Column(Text, nullable=False)
    relevant_experience = Column(Text, nullable=True)
    estimated_timeline_weeks = Column(Float, default=8.0)
    weekly_availability_hours = Column(Float, default=15.0)
    team_composition_notes = Column(Text, nullable=True)
    
    # Match snapshot at time of application
    match_score_at_application = Column(Float, default=0.0)
    match_explanation_snapshot = Column(Text, nullable=True)  # JSON or text summary
    
    # Evaluation & selection
    status = Column(String(50), default="submitted")  # "submitted", "under_review", "shortlisted", "accepted", "rejected", "withdrawn"
    provider_notes = Column(Text, nullable=True)
    
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    problem = relationship("Problem", back_populates="applications")
    applicant = relationship("Profile", foreign_keys=[applicant_id], back_populates="applications")
    organization = relationship("Organization", back_populates="applications")
    project = relationship("Project", back_populates="application", uselist=False)
