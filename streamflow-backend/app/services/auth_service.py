
from sqlalchemy.orm import Session

from app.models.db_models import User
from app.repositories.recovery_repo import create_recovery_codes
from app.repositories.user_repo import create_user, get_user_by_username, update_password
from app.utils.codes import generate_recovery_codes, hash_code
from app.utils.security import hash_password, verify_password


class UserAlreadyExistsError(Exception):
    """Raised when attempting to register a user that already exists."""
    pass


class InvalidCredentialsError(Exception):
    """Raised when authentication fails."""
    pass


class InvalidRecoveryCodeError(Exception):
    """Raised when recovery code is invalid."""
    pass


def register_user(db: Session, username: str, password: str) -> tuple[User, list[str]]:
    """Register a new user and generate recovery codes.

    Args:
        db: Database session
        username: Username for the new user
        password: Plain text password

    Returns:
        Tuple of (User object, list of recovery codes)

    Raises:
        UserAlreadyExistsError: If username already exists
    """
    # Check if user already exists
    existing_user = get_user_by_username(db, username)
    if existing_user:
        raise UserAlreadyExistsError(f"User with username '{username}' already exists")

    # Hash password
    password_hash = hash_password(password)

    # Create user
    user = create_user(db, username, password_hash)

    # Generate recovery codes
    plain_codes = generate_recovery_codes()
    hashed_codes = [hash_code(code) for code in plain_codes]

    # Store hashed codes
    create_recovery_codes(db, user.id, hashed_codes)

    return user, plain_codes


def authenticate_user(db: Session, username: str, password: str) -> User:
    """Authenticate a user with username and password.

    Args:
        db: Database session
        username: Username
        password: Plain text password

    Returns:
        User object if authentication successful

    Raises:
        InvalidCredentialsError: If authentication fails
    """
    user = get_user_by_username(db, username)
    if not user:
        raise InvalidCredentialsError("Invalid username or password")

    if not verify_password(password, user.password_hash):
        raise InvalidCredentialsError("Invalid username or password")

    return user


def recover_password(db: Session, username: str, recovery_code: str, new_password: str) -> User:
    """Recover password using a recovery code.

    Args:
        db: Database session
        username: Username
        recovery_code: Plain text recovery code
        new_password: New plain text password

    Returns:
        User object

    Raises:
        InvalidCredentialsError: If user doesn't exist
        InvalidRecoveryCodeError: If recovery code is invalid
    """
    # Get user
    user = get_user_by_username(db, username)
    if not user:
        raise InvalidCredentialsError("User not found")

    # Verify and invalidate the code
    from app.repositories.recovery_repo import verify_and_invalidate_code
    if not verify_and_invalidate_code(db, user.id, recovery_code):
        raise InvalidRecoveryCodeError("Invalid or already used recovery code")

    # Update password
    new_password_hash = hash_password(new_password)
    update_password(db, user.id, new_password_hash)

    return user
