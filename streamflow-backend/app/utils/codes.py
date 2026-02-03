import secrets
import string

from passlib.context import CryptContext

code_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def generate_recovery_codes(count: int = 5, length: int = 12) -> list[str]:
    codes = []
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(count):
        code = "".join(secrets.choice(alphabet) for _ in range(length))
        codes.append(code)
    return codes


def hash_code(code: str) -> str:
    return code_context.hash(code)


def verify_code(plain_code: str, hashed_code: str) -> bool:
    return code_context.verify(plain_code, hashed_code)
