from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database.config import get_db
from app.models.contact import EmergencyContact
from app.models.sos import SOSAlert
from app.models.incident import IncidentReport
from app.models.activity import ActivityLog
from app.models.user import User
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_contacts = (
        db.query(func.count(EmergencyContact.id))
        .filter(EmergencyContact.user_id == current_user.id)
        .scalar()
    )

    total_sos = (
        db.query(func.count(SOSAlert.id))
        .filter(SOSAlert.user_id == current_user.id)
        .scalar()
    )

    active_sos = (
        db.query(func.count(SOSAlert.id))
        .filter(SOSAlert.user_id == current_user.id, SOSAlert.status == "active")
        .scalar()
    )

    total_incidents = (
        db.query(func.count(IncidentReport.id))
        .filter(IncidentReport.user_id == current_user.id)
        .scalar()
    )

    recent_activities = (
        db.query(ActivityLog)
        .filter(ActivityLog.user_id == current_user.id)
        .order_by(ActivityLog.created_at.desc())
        .limit(5)
        .all()
    )

    recent_alerts = (
        db.query(SOSAlert)
        .filter(SOSAlert.user_id == current_user.id)
        .order_by(SOSAlert.created_at.desc())
        .limit(5)
        .all()
    )

    recent_incidents = (
        db.query(IncidentReport)
        .filter(IncidentReport.user_id == current_user.id)
        .order_by(IncidentReport.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_contacts": total_contacts,
        "total_sos_alerts": total_sos,
        "active_sos": active_sos,
        "total_incidents": total_incidents,
        "recent_activities": [
            {
                "id": a.id,
                "action": a.action,
                "details": a.details,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent_activities
        ],
        "recent_alerts": [
            {
                "id": a.id,
                "alert_type": a.alert_type,
                "status": a.status,
                "address": a.address,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in recent_alerts
        ],
        "recent_incidents": [
            {
                "id": i.id,
                "incident_id": i.incident_id,
                "incident_type": i.incident_type,
                "severity": i.severity,
                "status": i.status,
                "created_at": i.created_at.isoformat() if i.created_at else None,
            }
            for i in recent_incidents
        ],
    }
