import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TestingRecord(Base):
    __tablename__ = "testing_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    round_number = Column(Integer, default=1)
    
    test_plan = Column(Text, nullable=False)
    test_results = Column(Text, nullable=False)
    status = Column(String(50), default="passed")  # "passed", "revision_required", "failed"
    criteria_checked = Column(Text, nullable=True)  # JSON checklist
    evidence_files = Column(Text, nullable=True)  # JSON list of evidence paths/refs
    reviewer_comments = Column(Text, nullable=True)
    
    reviewer_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    conducted_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="testing_records")
    reviewer = relationship("Profile")


class AdoptionRecord(Base):
    __tablename__ = "adoption_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    
    # Status: "not_yet_adopted", "adoption_claimed", "verified_adopted", "not_adopted", "unable_to_verify"
    adoption_status = Column(String(50), default="not_yet_adopted")
    
    implementation_date = Column(DateTime, nullable=True)
    real_world_evidence = Column(Text, nullable=True)
    evidence_files = Column(Text, nullable=True)  # JSON list
    beneficiaries_served = Column(Integer, default=0)
    outcomes_achieved = Column(Text, nullable=True)
    known_limitations = Column(Text, nullable=True)
    maintenance_plan = Column(Text, nullable=True)
    
    # Independent verification route
    is_independent_review = Column(Boolean, default=False)
    reviewer_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    review_rationale = Column(Text, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="adoption_records")
    reviewer = relationship("Profile")


class ImpactMetric(Base):
    __tablename__ = "impact_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)  # e.g., "Villagers with Clean Water", "KWh Solar Energy Generated"
    metric_value = Column(String(50), nullable=False)  # e.g., "1,200", "450"
    unit = Column(String(50), nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="impact_metrics")
