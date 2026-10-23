import json
from typing import Optional, Any
from sqlalchemy.orm import Session
from backend.app.models.dispute_audit import AuditLog

def log_audit(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str,
    actor_id: Optional[str] = None,
    details: Optional[Any] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    details_str = json.dumps(details, default=str) if isinstance(details, (dict, list)) else str(details) if details else None
    audit = AuditLog(
        actor_id=actor_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details_str,
        ip_address=ip_address
    )
    db.add(audit)
    db.commit()
    return audit
