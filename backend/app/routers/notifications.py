from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import Profile
from backend.app.models.dispute_audit import Notification
from backend.app.services.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def get_my_notifications(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).limit(30).all()
    results = []
    for n in notifs:
        results.append({
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "link": n.link,
            "is_read": n.is_read,
            "created_at": n.created_at
        })
    return results

@router.put("/{notif_id}/read")
def mark_as_read(
    notif_id: str,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}

@router.put("/read-all")
def mark_all_as_read(
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.user_id == current_user.id).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
