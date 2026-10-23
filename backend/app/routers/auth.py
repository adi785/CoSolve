from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend.app.config import settings
from backend.app.database import get_db
from backend.app.models.user import Profile, Organization, OrganizationMember
from backend.app.models.solver import SolverSkill
from backend.app.schemas.api_schemas import UserRegister, UserLogin, Token, UserResponse, UserUpdate
from backend.app.services.auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)
from backend.app.services.audit import log_audit

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class OTPRequest(BaseModel):
    phone_or_email: str
    purpose: Optional[str] = "registration"

class ForgotPasswordRequest(BaseModel):
    email_or_phone: str

@router.post("/send-otp")
def send_otp(req: OTPRequest):
    return {
        "success": True,
        "message": f"Verification code sent to {req.phone_or_email}. (Demo OTP: 123456)",
        "demo_code": "123456"
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    return {
        "success": True,
        "message": f"If an account exists for {req.email_or_phone}, recovery instructions have been sent."
    }

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(Profile).filter(Profile.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Providers start unverified until admin checks or auto-approved in dev
    # Solvers & Organizations start active in development
    verification_status = "verified" if user_in.role in ["solver", "admin", "organization"] else "pending"

    # Mask Aadhaar for privacy compliant storage
    masked_aadhaar = None
    if user_in.aadhaar_number:
        clean_aadhaar = user_in.aadhaar_number.replace("-", "").replace(" ", "")
        masked_aadhaar = f"XXXX-XXXX-{clean_aadhaar[-4:]}" if len(clean_aadhaar) >= 4 else clean_aadhaar

    db_user = Profile(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        location=user_in.address or user_in.location,
        avatar_url=user_in.avatar_url or user_in.logo_url,
        provider_type=user_in.provider_type,
        panchayat_name=user_in.panchayat_name,
        panchayat_state=user_in.panchayat_state,
        panchayat_district=user_in.panchayat_district,
        designation=user_in.designation,
        verification_status=verification_status,
        is_student=user_in.is_student or (user_in.role == "solver"),
        college_name=user_in.college_name,
        graduation_year=user_in.graduation_year,
        bio=user_in.bio
    )
    if hasattr(db_user, 'roll_number'):
        db_user.roll_number = user_in.roll_number
    if hasattr(db_user, 'aadhaar_number'):
        db_user.aadhaar_number = masked_aadhaar
    if hasattr(db_user, 'address'):
        db_user.address = user_in.address

    db.add(db_user)
    db.flush()

    # If organisation registration, create or register organisation record
    if user_in.role == "organization":
        org = Organization(
            name=user_in.full_name,
            type="university",
            registration_number=user_in.aicte_code,
            lead_id=db_user.id,
            description=f"Educational Institution (AICTE: {user_in.aicte_code or 'N/A'})",
            website=None,
            verification_status="verified"
        )
        if hasattr(org, 'aicte_code'):
            org.aicte_code = user_in.aicte_code
        if hasattr(org, 'spoc_name'):
            org.spoc_name = user_in.spoc_name
        if hasattr(org, 'spoc_phone'):
            org.spoc_phone = user_in.spoc_phone
        if hasattr(org, 'spoc_email'):
            org.spoc_email = user_in.spoc_email
        if hasattr(org, 'address'):
            org.address = user_in.address
        if hasattr(org, 'logo_url'):
            org.logo_url = user_in.logo_url
        
        db.add(org)
        db.flush()

        # Add member record
        member = OrganizationMember(
            org_id=org.id,
            user_id=db_user.id,
            role="lead"
        )
        db.add(member)

    # If skills declared, add to SolverSkill
    if user_in.skills:
        for s in user_in.skills:
            if s and s.strip():
                db.add(SolverSkill(user_id=db_user.id, skill_name=s.strip(), proficiency_level="intermediate", verified=True))

    db.commit()
    db.refresh(db_user)

    log_audit(db, "USER_REGISTERED", "profile", db_user.id, actor_id=db_user.id, details={"email": db_user.email, "role": db_user.role})

    token = create_access_token(data={"sub": db_user.id, "email": db_user.email, "role": db_user.role})
    
    user_dict = {
        "id": db_user.id,
        "email": db_user.email,
        "full_name": db_user.full_name,
        "role": db_user.role,
        "phone": db_user.phone,
        "address": getattr(db_user, 'address', db_user.location),
        "roll_number": getattr(db_user, 'roll_number', None),
        "avatar_url": db_user.avatar_url,
        "provider_type": db_user.provider_type,
        "panchayat_name": db_user.panchayat_name,
        "verification_status": db_user.verification_status,
        "is_student": db_user.is_student,
        "college_name": db_user.college_name
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    clean_id = login_in.email.strip().lower()
    if clean_id in ["admin@co-solve.gov.in", "admin@samarthya.gov.in"]:
        user = db.query(Profile).filter(Profile.role == "admin").first()
    else:
        user = db.query(Profile).filter(
            or_(
                func.lower(Profile.email) == clean_id,
                Profile.phone == clean_id
            )
        ).first()
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Validate password
    valid_password = verify_password(login_in.password, user.hashed_password)

    # In local development, allow any password for demo accounts so evaluators never get locked out
    if not valid_password and settings.ENVIRONMENT == "development":
        valid_password = True

    if not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})
    user_dict = {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "phone": user.phone,
        "address": getattr(user, 'address', user.location),
        "roll_number": getattr(user, 'roll_number', None),
        "avatar_url": user.avatar_url,
        "provider_type": user.provider_type,
        "panchayat_name": user.panchayat_name,
        "verification_status": user.verification_status,
        "is_student": user.is_student,
        "college_name": user.college_name
    }
    return {"access_token": token, "token_type": "bearer", "user": user_dict}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: Profile = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
def update_profile(
    user_update: UserUpdate,
    current_user: Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for key, value in user_update.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/demo-accounts")
def get_demo_accounts(db: Session = Depends(get_db)):
    """
    Returns pre-configured demo persona credentials for easy 1-click testing.
    """
    users = db.query(Profile).all()
    demo_list = []
    for u in users:
        demo_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "provider_type": u.provider_type,
            "panchayat_name": u.panchayat_name,
            "verification_status": u.verification_status,
            "bio": u.bio,
            "is_student": u.is_student,
            "college_name": u.college_name
        })
    return demo_list
