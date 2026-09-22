import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database.config import get_db
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate
from app.auth.jwt import hash_password, verify_password
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("", response_model=UserResponse)
def update_profile(
    profile_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    update_data = profile_data.model_dump(exclude_unset=True)

    if "email" in update_data:
        existing = db.query(User).filter(
            User.email == update_data["email"],
            User.id != current_user.id,
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )

    for field, value in update_data.items():
        setattr(current_user, field, value)

    activity = ActivityLog(
        user_id=current_user.id,
        action="profile_update",
        details="Profile updated",
    )
    db.add(activity)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/password")
def update_password(
    password_data: PasswordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.password_hash = hash_password(password_data.new_password)

    activity = ActivityLog(
        user_id=current_user.id,
        action="password_change",
        details="Password changed successfully",
    )
    db.add(activity)
    db.commit()

    return {"message": "Password updated successfully"}


@router.post("/upload-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are allowed",
        )

    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be less than 5MB",
        )

    upload_dir = os.path.join("uploads", "profiles")
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = file.filename.split(".")[-1]
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{file_ext}"
    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    current_user.profile_picture = f"/uploads/profiles/{filename}"
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile picture uploaded", "path": current_user.profile_picture}
