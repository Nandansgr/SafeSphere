from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database.config import get_db
from app.models.contact import EmergencyContact
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/contacts", tags=["Emergency Contacts"])


@router.get("", response_model=list[ContactResponse])
def get_contacts(
    search: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id)

    if search:
        query = query.filter(
            (EmergencyContact.name.ilike(f"%{search}%"))
            | (EmergencyContact.phone.ilike(f"%{search}%"))
            | (EmergencyContact.rel_type.ilike(f"%{search}%"))
        )

    if priority:
        query = query.filter(EmergencyContact.priority == priority)

    contacts = query.order_by(EmergencyContact.created_at.desc()).all()
    return contacts


@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if contact_data.priority not in ["low", "medium", "high", "critical"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be low, medium, high, or critical",
        )

    new_contact = EmergencyContact(
        user_id=current_user.id,
        name=contact_data.name,
        relationship=contact_data.relationship,
        phone=contact_data.phone,
        email=contact_data.email,
        priority=contact_data.priority,
    )

    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


@router.get("/{contact_id}", response_model=ContactResponse)
def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    return contact


@router.put("/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: int,
    contact_data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    update_data = contact_data.model_dump(exclude_unset=True)

    if "priority" in update_data and update_data["priority"] not in ["low", "medium", "high", "critical"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be low, medium, high, or critical",
        )

    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact not found",
        )

    db.delete(contact)
    db.commit()
