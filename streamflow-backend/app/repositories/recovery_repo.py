import uuid

from sqlalchemy.orm import Session

from app.models.db_models import RecoveryCode
from app.utils.codes import verify_code


def create_recovery_codes(
    db: Session, user_id: uuid.UUID, code_hashes: list[str]
) -> list[RecoveryCode]:
    codes = []
    for code_hash in code_hashes:
        recovery_code = RecoveryCode(user_id=user_id, code_hash=code_hash, used=False)
        db.add(recovery_code)
        codes.append(recovery_code)
    db.commit()
    return codes


def verify_and_invalidate_code(db: Session, user_id: uuid.UUID, plain_code: str) -> bool:
    recovery_codes = (
        db.query(RecoveryCode)
        .filter(RecoveryCode.user_id == user_id, RecoveryCode.used.is_(False))
        .all()
    )

    for recovery_code in recovery_codes:
        if verify_code(plain_code, recovery_code.code_hash):
            recovery_code.used = True
            db.commit()
            return True

    return False
