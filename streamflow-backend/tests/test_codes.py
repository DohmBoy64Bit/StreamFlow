import pytest

from app.utils.codes import generate_recovery_codes, hash_code, verify_code


def test_generate_recovery_codes_default():
    codes = generate_recovery_codes()

    assert len(codes) == 5
    for code in codes:
        assert len(code) == 12
        assert code.isupper() or code.isdigit()


def test_generate_recovery_codes_custom():
    codes = generate_recovery_codes(count=3, length=8)

    assert len(codes) == 3
    for code in codes:
        assert len(code) == 8


def test_generate_recovery_codes_uniqueness():
    codes = generate_recovery_codes(count=100)

    assert len(codes) == len(set(codes))


def test_hash_code():
    code = "ABC123XYZ789"
    hashed = hash_code(code)

    assert hashed != code
    assert hashed.startswith("$2b$")


def test_verify_code_success():
    code = "ABC123XYZ789"
    hashed = hash_code(code)

    assert verify_code(code, hashed) is True


def test_verify_code_failure():
    code = "ABC123XYZ789"
    hashed = hash_code(code)

    assert verify_code("WRONG123CODE", hashed) is False


def test_verify_code_case_sensitive():
    code = "ABC123XYZ789"
    hashed = hash_code(code)

    assert verify_code("abc123xyz789", hashed) is False
