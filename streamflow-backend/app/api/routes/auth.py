from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.core.middleware import limiter
from app.models.db_models import User
from app.schemas.auth import (
    PasswordRecoveryRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserRegisterResponse,
    UserResponse,
)
from app.services.auth_service import (
    UserAlreadyExistsError,
    authenticate_user,
    recover_password,
    register_user,
)
from app.utils.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse)
@limiter.limit("3/hour")
async def register(
    request: Request, user_request: UserRegisterRequest, db: Annotated[Session, Depends(get_db)]
) -> UserRegisterResponse:
    """Register a new user account."""
    try:
        user, recovery_codes = register_user(db, user_request.username, user_request.password)

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
@limiter.limit("5/15minutes")
async def login(
    request: Request, user_request: UserLoginRequest, db: Annotated[Session, Depends(get_db)]
) -> TokenResponse:
    """Authenticate a user and return an access token."""
    user = authenticate_user(db, user_request.username, user_request.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": str(user.id), "username": user.username})

    return TokenResponse(access_token=access_token)


@router.post("/recover-password")
@limiter.limit("3/hour")
async def recover_password_endpoint(
    request: Request,
    recovery_request: PasswordRecoveryRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """Recover password using a recovery code."""
    success = recover_password(
        db, recovery_request.username, recovery_request.recovery_code, recovery_request.new_password
    )

    if not success:
        raise HTTPException(status_code=400, detail="Invalid or already used recovery code")

    return {"message": "Password successfully updated"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
) -> UserResponse:
    """Get current authenticated user information."""
    return UserResponse(
        id=str(current_user.id),
        username=current_user.username,
        created_at=current_user.created_at.isoformat(),
    )
