from typing import Optional
from sqlalchemy.orm import Session
from backend.app.models.dispute_audit import Notification

def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    category: str = "system",
    link: Optional[str] = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        category=category,
        link=link,
        is_read=False
    )
    db.add(notif)
    db.commit()
    return notif
