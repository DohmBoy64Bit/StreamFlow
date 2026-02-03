import os

os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"

import pytest

from app.utils.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_password():
    password = "my_secure_password"
    hashed = hash_password(password)

    assert hashed != password
    assert hashed.startswith("$2b$")


def test_verify_password_success():
    password = "my_secure_password"
    hashed = hash_password(password)

    assert verify_password(password, hashed) is True


def test_verify_password_failure():
    password = "my_secure_password"
    hashed = hash_password(password)

    assert verify_password("wrong_password", hashed) is False


def test_create_access_token():
    data = {"sub": "test_user", "user_id": "123"}
    token = create_access_token(data)

    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token_success():
    data = {"sub": "test_user", "user_id": "123"}
    token = create_access_token(data)

    decoded = decode_access_token(token)

    assert decoded is not None
    assert decoded["sub"] == "test_user"
    assert decoded["user_id"] == "123"
    assert "exp" in decoded


def test_decode_access_token_invalid():
    invalid_token = "invalid.token.here"

    decoded = decode_access_token(invalid_token)

    assert decoded is None


def test_decode_access_token_tampered():
    data = {"sub": "test_user"}
    token = create_access_token(data)

    tampered_token = token[:-5] + "12345"
    decoded = decode_access_token(tampered_token)

    assert decoded is None
