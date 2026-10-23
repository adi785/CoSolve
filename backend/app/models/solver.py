import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class SolverSkill(Base):
    __tablename__ = "solver_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), default="intermediate")  # "beginner", "intermediate", "advanced", "expert"
    years_experience = Column(Float, default=1.0)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="skills")


class SolverInterest(Base):
    __tablename__ = "solver_interests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    domain = Column(String(100), nullable=False)  # e.g., "Water & Sanitation", "Renewable Energy", etc.

    user = relationship("Profile", back_populates="interests")
