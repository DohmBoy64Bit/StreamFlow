from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.db_models import User
from app.repositories import recovery_repo, user_repo
from app.utils.codes import generate_recovery_codes, hash_code
from app.utils.security import hash_password, verify_password


class UserAlreadyExistsError(Exception):
    """Raised when attempting to register a user with an existing username."""

    pass


class InvalidCredentialsError(Exception):
    """Raised when authentication fails due to invalid credentials."""

    pass


class InvalidRecoveryCodeError(Exception):
    """Raised when password recovery fails due to invalid or used recovery code."""

    pass


def register_user(db: Session, username: str, password: str) -> tuple[User, list[str]]:
    existing_user = user_repo.get_user_by_username(db, username)
    if existing_user:
        raise UserAlreadyExistsError(f"Username '{username}' already exists")

    password_hash = hash_password(password)
    try:
        user = user_repo.create_user(db, username, password_hash)
    except IntegrityError:
        db.rollback()
        raise UserAlreadyExistsError(f"Username '{username}' already exists")

    plain_codes = generate_recovery_codes()
    code_hashes = [hash_code(code) for code in plain_codes]
    recovery_repo.create_recovery_codes(db, user.id, code_hashes)

    return user, plain_codes


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = user_repo.get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def recover_password(db: Session, username: str, recovery_code: str, new_password: str) -> bool:
    user = user_repo.get_user_by_username(db, username)
    if not user:
        return False

    if not recovery_repo.verify_and_invalidate_code(db, user.id, recovery_code):
        return False

    new_password_hash = hash_password(new_password)
    user_repo.update_password(db, user.id, new_password_hash)
    return True
