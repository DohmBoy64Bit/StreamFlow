import os

os.environ["SECRET_KEY"] = "test-secret-key-for-testing-only"

import pytest

from app.services import auth_service


def test_register_user(db_session):
    username = "newuser"
    password = "secure_password"

    user, recovery_codes = auth_service.register_user(db_session, username, password)

    assert user.id is not None
    assert user.username == username
    assert user.password_hash != password
    assert len(recovery_codes) == 5
    for code in recovery_codes:
        assert len(code) == 12


def test_register_user_creates_recovery_codes(db_session):
    username = "newuser"
    password = "secure_password"

    user, recovery_codes = auth_service.register_user(db_session, username, password)

    assert len(user.recovery_codes) == 5
    for recovery_code_obj in user.recovery_codes:
        assert recovery_code_obj.user_id == user.id
        assert recovery_code_obj.used is False


def test_authenticate_user_success(db_session):
    username = "testuser"
    password = "secure_password"
    auth_service.register_user(db_session, username, password)

    authenticated_user = auth_service.authenticate_user(db_session, username, password)

    assert authenticated_user is not None
    assert authenticated_user.username == username


def test_authenticate_user_wrong_password(db_session):
    username = "testuser"
    password = "secure_password"
    auth_service.register_user(db_session, username, password)

    authenticated_user = auth_service.authenticate_user(db_session, username, "wrong_password")

    assert authenticated_user is None


def test_authenticate_user_nonexistent(db_session):
    authenticated_user = auth_service.authenticate_user(db_session, "nonexistent", "password")

    assert authenticated_user is None


def test_recover_password_success(db_session):
    username = "testuser"
    password = "secure_password"
    new_password = "new_secure_password"

    user, recovery_codes = auth_service.register_user(db_session, username, password)

    result = auth_service.recover_password(db_session, username, recovery_codes[0], new_password)

    assert result is True

    old_auth = auth_service.authenticate_user(db_session, username, password)
    assert old_auth is None

    new_auth = auth_service.authenticate_user(db_session, username, new_password)
    assert new_auth is not None


def test_recover_password_wrong_code(db_session):
    username = "testuser"
    password = "secure_password"
    new_password = "new_secure_password"

    user, recovery_codes = auth_service.register_user(db_session, username, password)

    result = auth_service.recover_password(db_session, username, "WRONG_CODE", new_password)

    assert result is False

    auth = auth_service.authenticate_user(db_session, username, password)
    assert auth is not None


def test_recover_password_code_invalidated(db_session):
    username = "testuser"
    password = "secure_password"
    new_password = "new_secure_password"

    user, recovery_codes = auth_service.register_user(db_session, username, password)

    result1 = auth_service.recover_password(db_session, username, recovery_codes[0], new_password)
    assert result1 is True

    result2 = auth_service.recover_password(db_session, username, recovery_codes[0], "another_password")
    assert result2 is False


def test_recover_password_nonexistent_user(db_session):
    result = auth_service.recover_password(db_session, "nonexistent", "ANY_CODE", "new_password")

    assert result is False
