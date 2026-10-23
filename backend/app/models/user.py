import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="solver")  # "provider", "solver", "admin"
    
    # Provider specifics
    provider_type = Column(String(50), nullable=True)  # "individual", "panchayat_rep"
    panchayat_name = Column(String(255), nullable=True)
    panchayat_state = Column(String(100), nullable=True)
    panchayat_district = Column(String(100), nullable=True)
    designation = Column(String(100), nullable=True)
    
    # Verification
    verification_status = Column(String(50), default="unverified")  # "unverified", "pending", "verified", "rejected", "correction_requested"
    verification_notes = Column(Text, nullable=True)
    
    # Individual solver specifics
    is_student = Column(Boolean, default=False)
    college_name = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    
    # Profile details
    phone = Column(String(50), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Availability & preferences
    availability_hours_per_week = Column(Integer, default=15)
    preferred_duration_weeks = Column(Integer, default=8)
    fieldwork_willing = Column(Boolean, default=True)
    remote_preference = Column(String(50), default="hybrid")  # "remote", "hybrid", "on_site"
    portfolio_privacy = Column(String(50), default="public")  # "public", "platform_only", "private"
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    skills = relationship("SolverSkill", back_populates="user", cascade="all, delete-orphan")
    interests = relationship("SolverInterest", back_populates="user", cascade="all, delete-orphan")
    problems_created = relationship("Problem", foreign_keys="Problem.creator_id", back_populates="creator")
    applications = relationship("Application", foreign_keys="Application.applicant_id", back_populates="applicant")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, nullable=False)
    type = Column(String(50), nullable=False)  # "university", "student_club", "ngo", "shg", "research_lab", "other"
    registration_number = Column(String(100), nullable=True)
    lead_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    description = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    
    # Verification
    verification_status = Column(String(50), default="pending")  # "pending", "verified", "rejected", "correction_requested"
    verification_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    lead = relationship("Profile", foreign_keys=[lead_id])
    members = relationship("OrganizationMember", back_populates="organization", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="organization")


class OrganizationMember(Base):
    __tablename__ = "organization_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    role = Column(String(50), default="member")  # "lead", "coordinator", "member", "contributor"
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    organization = relationship("Organization", back_populates="members")
    user = relationship("Profile")


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    request_type = Column(String(50), nullable=False)  # "individual_identity", "student_affiliation", "panchayat_authority", "organization_existence"
    status = Column(String(50), default="pending")  # "pending", "approved", "rejected", "correction_requested"
    document_ref = Column(String(500), nullable=True)  # sanitized identifier or protected filename
    notes = Column(Text, nullable=True)
    admin_feedback = Column(Text, nullable=True)
    reviewed_by = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("Profile", foreign_keys=[user_id])
    org = relationship("Organization", foreign_keys=[org_id])
    reviewer = relationship("Profile", foreign_keys=[reviewed_by])
