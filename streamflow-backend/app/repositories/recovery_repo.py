import uuid

from sqlalchemy.orm import Session

from app.models.db_models import RecoveryCode


def create_recovery_codes(db: Session, user_id: uuid.UUID, code_hashes: list[str]) -> list[RecoveryCode]:
    """Create recovery codes for a user."""
    recovery_codes = []
    for code_hash in code_hashes:
        recovery_code = RecoveryCode(user_id=user_id, code_hash=code_hash)
        recovery_codes.append(recovery_code)
        db.add(recovery_code)

    db.commit()
    for code in recovery_codes:
        db.refresh(code)

    return recovery_codes


def verify_and_invalidate_code(db: Session, user_id: uuid.UUID, plain_code: str) -> bool:
    """Verify a recovery code and mark it as used if valid."""
    from app.utils.codes import verify_code

    # Find unused recovery codes for this user
    recovery_codes = db.query(RecoveryCode).filter(
        RecoveryCode.user_id == user_id,
        RecoveryCode.used.is_(False)
    ).all()

    # Check if any code matches
    for recovery_code in recovery_codes:
        if verify_code(plain_code, recovery_code.code_hash):
            # Mark as used
            recovery_code.used = True
            db.commit()
            return True

    return False


def get_unused_recovery_codes(db: Session, user_id: uuid.UUID) -> list[RecoveryCode]:
    """Get all unused recovery codes for a user."""
    return db.query(RecoveryCode).filter(
        RecoveryCode.user_id == user_id,
        RecoveryCode.used.is_(False)
    ).all()
