from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.auth import (
    PasswordRecoveryRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
)
from app.services.auth_service import (
    InvalidCredentialsError,
    InvalidRecoveryCodeError,
    UserAlreadyExistsError,
    authenticate_user,
    recover_password,
    register_user,
)
from app.utils.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse)
async def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
) -> UserRegisterResponse:
    """Register a new user account."""
    try:
        user, recovery_codes = register_user(db, request.username, request.password)

        return UserRegisterResponse(
            user=UserResponse(
                id=str(user.id),
                username=user.username,
                created_at=user.created_at.isoformat(),
            ),
            recovery_codes=recovery_codes,
        )
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate a user and return an access token."""
    try:
        user = authenticate_user(db, request.username, request.password)

        # Create access token
        access_token = create_access_token(data={"sub": str(user.id), "username": user.username})

        return TokenResponse(access_token=access_token)
    except InvalidCredentialsError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/recover-password")
async def recover_password_endpoint(
    request: PasswordRecoveryRequest,
    db: Session = Depends(get_db)
):
    """Recover password using a recovery code."""
    try:
        recover_password(db, request.username, request.recovery_code, request.new_password)
        return {"message": "Password successfully updated"}
    except InvalidRecoveryCodeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=400, detail="Password recovery failed")
