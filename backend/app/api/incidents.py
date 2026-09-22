import math
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional
from app.database.config import get_db
from app.models.incident import IncidentReport
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/incident", tags=["Incident Reports"])


def generate_incident_id() -> str:
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"INC-{unique_id}"


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    valid_types = ["theft", "assault", "accident", "fire", "harassment", "vandalism", "medical", "other"]
    valid_severities = ["low", "medium", "high", "critical"]

    if incident_data.incident_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid incident type. Must be one of: {', '.join(valid_types)}",
        )

    if incident_data.severity not in valid_severities:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}",
        )

    new_incident = IncidentReport(
        user_id=current_user.id,
        incident_id=generate_incident_id(),
        incident_type=incident_data.incident_type,
        description=incident_data.description,
        location=incident_data.location,
        latitude=incident_data.latitude,
        longitude=incident_data.longitude,
        severity=incident_data.severity,
        image=incident_data.image,
        status="pending",
    )

    db.add(new_incident)

    activity = ActivityLog(
        user_id=current_user.id,
        action="incident_report",
        details=f"Incident reported: {new_incident.incident_id}",
    )
    db.add(activity)
    db.commit()
    db.refresh(new_incident)
    return new_incident


@router.get("", response_model=list[IncidentResponse])
def get_incidents(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    status_filter: Optional[str] = Query(None, alias="status"),
    severity: Optional[str] = Query(None),
    incident_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(IncidentReport).filter(IncidentReport.user_id == current_user.id)

    if status_filter:
        query = query.filter(IncidentReport.status == status_filter)

    if severity:
        query = query.filter(IncidentReport.severity == severity)

    if incident_type:
        query = query.filter(IncidentReport.incident_type == incident_type)

    if search:
        query = query.filter(
            (IncidentReport.description.ilike(f"%{search}%"))
            | (IncidentReport.location.ilike(f"%{search}%"))
            | (IncidentReport.incident_id.ilike(f"%{search}%"))
        )

    incidents = (
        query.order_by(IncidentReport.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return incidents


@router.get("/all", response_model=list[IncidentResponse])
def get_all_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incidents = (
        db.query(IncidentReport)
        .filter(IncidentReport.user_id == current_user.id)
        .order_by(IncidentReport.created_at.desc())
        .all()
    )
    return incidents


@router.get("/{incident_db_id}", response_model=IncidentResponse)
def get_incident(
    incident_db_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(IncidentReport)
        .filter(IncidentReport.id == incident_db_id, IncidentReport.user_id == current_user.id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    return incident


@router.put("/{incident_db_id}", response_model=IncidentResponse)
def update_incident(
    incident_db_id: int,
    incident_data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(IncidentReport)
        .filter(IncidentReport.id == incident_db_id, IncidentReport.user_id == current_user.id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    update_data = incident_data.model_dump(exclude_unset=True)

    if "status" in update_data:
        valid_statuses = ["pending", "investigating", "resolved", "closed"]
        if update_data["status"] not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}",
            )

    if "severity" in update_data:
        valid_severities = ["low", "medium", "high", "critical"]
        if update_data["severity"] not in valid_severities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid severity. Must be one of: {', '.join(valid_severities)}",
            )

    for field, value in update_data.items():
        setattr(incident, field, value)

    db.commit()
    db.refresh(incident)
    return incident


@router.delete("/{incident_db_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_incident(
    incident_db_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = (
        db.query(IncidentReport)
        .filter(IncidentReport.id == incident_db_id, IncidentReport.user_id == current_user.id)
        .first()
    )

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )

    db.delete(incident)
    db.commit()
