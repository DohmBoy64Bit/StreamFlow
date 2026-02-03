import secrets
import string

from passlib.context import CryptContext

# Recovery code hashing context (simpler than passwords)
code_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_recovery_codes(count: int = 5, length: int = 12) -> list[str]:
    """Generate a list of recovery codes.

    Args:
        count: Number of codes to generate (default: 5)
        length: Length of each code (default: 12)

    Returns:
        List of recovery codes (alphanumeric, uppercase)
    """
    codes = []
    alphabet = string.ascii_uppercase + string.digits

    for _ in range(count):
        code = ''.join(secrets.choice(alphabet) for _ in range(length))
        codes.append(code)

    return codes


def hash_code(code: str) -> str:
    """Hash a recovery code using bcrypt."""
    return code_context.hash(code)


def verify_code(plain_code: str, hashed_code: str) -> bool:
    """Verify a recovery code against its hash."""
    return code_context.verify(plain_code, hashed_code)
