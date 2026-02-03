
from pydantic import BaseModel, Field


class UserRegisterRequest(BaseModel):
    """Request model for user registration."""
    username: str = Field(..., min_length=3, max_length=50, description="Username for the new user")
    password: str = Field(..., min_length=8, description="Password for the new user")


class UserLoginRequest(BaseModel):
    """Request model for user login."""
    username: str = Field(..., description="Username of the user")
    password: str = Field(..., description="Password of the user")


class PasswordRecoveryRequest(BaseModel):
    """Request model for password recovery."""
    username: str = Field(..., description="Username of the user")
    recovery_code: str = Field(..., description="Recovery code to verify identity")
    new_password: str = Field(..., min_length=8, description="New password for the user")


class TokenResponse(BaseModel):
    """Response model containing access token."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class UserResponse(BaseModel):
    """Response model for user information (without sensitive data)."""
    id: str = Field(..., description="User ID")
    username: str = Field(..., description="Username")
    created_at: str = Field(..., description="Account creation timestamp")


class RecoveryCodesResponse(BaseModel):
    """Response model containing recovery codes."""
    recovery_codes: list[str] = Field(..., description="List of recovery codes for password recovery")


class UserRegisterResponse(BaseModel):
    """Response model for successful user registration."""
    user: UserResponse
    recovery_codes: list[str] = Field(..., description="Recovery codes for the new user")
