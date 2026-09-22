import math
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from app.database.config import get_db
from app.models.sos import SOSAlert
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.sos import SOSCreate, SOSResponse, SOSHistoryResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/sos", tags=["SOS Alert"])


@router.post("", response_model=SOSResponse, status_code=status.HTTP_201_CREATED)
def create_sos_alert(
    sos_data: SOSCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if sos_data.alert_type not in ["manual", "automatic", "panic", "medical", "fire", "security"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid alert type",
        )

    new_alert = SOSAlert(
        user_id=current_user.id,
        latitude=sos_data.latitude,
        longitude=sos_data.longitude,
        address=sos_data.address,
        message=sos_data.message,
        alert_type=sos_data.alert_type,
        status="active",
    )

    db.add(new_alert)

    activity = ActivityLog(
        user_id=current_user.id,
        action="sos_alert",
        details=f"SOS Alert triggered: {sos_data.alert_type}",
    )
    db.add(activity)
    db.commit()
    db.refresh(new_alert)
    return new_alert


@router.get("/history", response_model=SOSHistoryResponse)
def get_sos_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SOSAlert).filter(SOSAlert.user_id == current_user.id)

    if status_filter:
        query = query.filter(SOSAlert.status == status_filter)

    if search:
        query = query.filter(
            (SOSAlert.address.ilike(f"%{search}%"))
            | (SOSAlert.message.ilike(f"%{search}%"))
            | (SOSAlert.alert_type.ilike(f"%{search}%"))
        )

    total = query.count()
    pages = math.ceil(total / per_page) if total > 0 else 1

    alerts = (
        query.order_by(SOSAlert.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return SOSHistoryResponse(
        alerts=alerts,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.get("", response_model=list[SOSResponse])
def get_all_sos_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    alerts = (
        db.query(SOSAlert)
        .filter(SOSAlert.user_id == current_user.id)
        .order_by(SOSAlert.created_at.desc())
        .all()
    )
    return alerts
