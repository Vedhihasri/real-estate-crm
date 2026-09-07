from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.user import User
from database.connection import get_db
from schemas.auth import LoginRequest, TokenResponse
from services.auth_service import (
    verify_password,
    create_access_token
)
from services.auth_dependencies import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/login",
    response_model=TokenResponse
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({
        "sub": str(user.id),
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/employees")
def get_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    employees = (
        db.query(User)
        .filter(User.role == "SALES_EMPLOYEE")
        .order_by(User.name)
        .all()
    )

    return [
        {
            "id": employee.id,
            "name": employee.name,
            "email": employee.email,
            "role": employee.role,
        }
        for employee in employees
    ]