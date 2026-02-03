import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from app.repositories import recovery_repo, user_repo


def test_create_user(db_session):
    username = "testuser"
    password_hash = "hashed_password"

    user = user_repo.create_user(db_session, username, password_hash)

    assert user.id is not None
    assert isinstance(user.id, uuid.UUID)
    assert user.username == username
    assert user.password_hash == password_hash
    assert user.created_at is not None


def test_create_user_duplicate_username(db_session):
    username = "testuser"
    password_hash = "hashed_password"

    user_repo.create_user(db_session, username, password_hash)

    with pytest.raises(IntegrityError):
        user_repo.create_user(db_session, username, password_hash)


def test_get_user_by_username(db_session):
    username = "testuser"
    password_hash = "hashed_password"
    created_user = user_repo.create_user(db_session, username, password_hash)

    retrieved_user = user_repo.get_user_by_username(db_session, username)

    assert retrieved_user is not None
    assert retrieved_user.id == created_user.id
    assert retrieved_user.username == username


def test_get_user_by_username_not_found(db_session):
    retrieved_user = user_repo.get_user_by_username(db_session, "nonexistent")

    assert retrieved_user is None


def test_get_user_by_id(db_session):
    username = "testuser"
    password_hash = "hashed_password"
    created_user = user_repo.create_user(db_session, username, password_hash)

    retrieved_user = user_repo.get_user_by_id(db_session, created_user.id)

    assert retrieved_user is not None
    assert retrieved_user.id == created_user.id
    assert retrieved_user.username == username


def test_get_user_by_id_not_found(db_session):
    random_uuid = uuid.uuid4()
    retrieved_user = user_repo.get_user_by_id(db_session, random_uuid)

    assert retrieved_user is None


def test_update_password(db_session):
    username = "testuser"
    old_password_hash = "old_hashed_password"
    new_password_hash = "new_hashed_password"

    user = user_repo.create_user(db_session, username, old_password_hash)
    assert user.password_hash == old_password_hash

    updated_user = user_repo.update_password(db_session, user.id, new_password_hash)

    assert updated_user is not None
    assert updated_user.password_hash == new_password_hash


def test_update_password_user_not_found(db_session):
    random_uuid = uuid.uuid4()
    updated_user = user_repo.update_password(db_session, random_uuid, "new_hash")

    assert updated_user is None


def test_create_recovery_codes(db_session):
    username = "testuser"
    password_hash = "hashed_password"
    user = user_repo.create_user(db_session, username, password_hash)

    code_hashes = ["hash1", "hash2", "hash3"]
    recovery_codes = recovery_repo.create_recovery_codes(db_session, user.id, code_hashes)

    assert len(recovery_codes) == 3
    for i, code in enumerate(recovery_codes):
        assert code.user_id == user.id
        assert code.code_hash == code_hashes[i]
        assert code.used is False


def test_verify_and_invalidate_code_success(db_session):
    from app.utils.codes import hash_code

    username = "testuser"
    password_hash = "hashed_password"
    user = user_repo.create_user(db_session, username, password_hash)

    plain_code = "ABC123XYZ789"
    code_hash = hash_code(plain_code)
    recovery_repo.create_recovery_codes(db_session, user.id, [code_hash])

    result = recovery_repo.verify_and_invalidate_code(db_session, user.id, plain_code)

    assert result is True

    result_second = recovery_repo.verify_and_invalidate_code(db_session, user.id, plain_code)
    assert result_second is False


def test_verify_and_invalidate_code_failure(db_session):
    from app.utils.codes import hash_code

    username = "testuser"
    password_hash = "hashed_password"
    user = user_repo.create_user(db_session, username, password_hash)

    plain_code = "ABC123XYZ789"
    code_hash = hash_code(plain_code)
    recovery_repo.create_recovery_codes(db_session, user.id, [code_hash])

    result = recovery_repo.verify_and_invalidate_code(db_session, user.id, "WRONG_CODE")

    assert result is False


def test_verify_and_invalidate_code_no_codes(db_session):
    username = "testuser"
    password_hash = "hashed_password"
    user = user_repo.create_user(db_session, username, password_hash)

    result = recovery_repo.verify_and_invalidate_code(db_session, user.id, "ANY_CODE")

    assert result is False
