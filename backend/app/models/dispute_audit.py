import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="system")  # "match", "application", "project", "testing", "adoption", "dispute", "system"
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="notifications")


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    org_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=True)
    
    # "digital_credential", "portfolio_endorsement", "ai_credits", "prize", "grant", "mentorship"
    reward_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sponsor = Column(String(255), nullable=True)
    amount = Column(Float, default=0.0)
    status = Column(String(50), default="eligible")  # "eligible", "approved", "disbursed", "cancelled"
    issued_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile")
    project = relationship("Project")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    raised_by_id = Column(String(36), ForeignKey("profiles.id"), nullable=False)
    
    # "false_adoption", "unfair_rejection", "nonresponsive_provider", "unpaid_reward", "ip_dispute", "deliverable_misuse", "other"
    dispute_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    evidence_text = Column(Text, nullable=True)
    
    # "submitted", "under_investigation", "assigned", "resolved", "dismissed", "appealed"
    status = Column(String(50), default="submitted")
    
    assigned_reviewer_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    resolution_decision = Column(Text, nullable=True)
    reconsidered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    project = relationship("Project", back_populates="disputes")
    raised_by = relationship("Profile", foreign_keys=[raised_by_id])
    reviewer = relationship("Profile", foreign_keys=[assigned_reviewer_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("profiles.id"), nullable=True)
    action = Column(String(100), nullable=False)  # e.g., "PROBLEM_APPROVED", "SOLVER_SELECTED", "ADOPTION_VERIFIED", etc.
    resource_type = Column(String(50), nullable=False)  # "problem", "project", "application", "verification", "dispute"
    resource_id = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)  # JSON text
    ip_address = Column(String(45), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    actor = relationship("Profile")
