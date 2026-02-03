import uuid

from app.repositories.recovery_repo import (
    create_recovery_codes,
    get_unused_recovery_codes,
    verify_and_invalidate_code,
)
from app.repositories.user_repo import (
    create_user,
    get_user_by_id,
    get_user_by_username,
    update_password,
)
from app.utils.codes import hash_code


class TestUserRepository:
    def test_create_user(self, db_session):
        """Test creating a user."""
        user = create_user(db_session, "testuser", "hashed_password")

        assert user.id is not None
        assert user.username == "testuser"
        assert user.password_hash == "hashed_password"

    def test_get_user_by_username_found(self, db_session):
        """Test getting a user by username when user exists."""
        created_user = create_user(db_session, "testuser", "hashed_password")

        retrieved_user = get_user_by_username(db_session, "testuser")

        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.username == "testuser"

    def test_get_user_by_username_not_found(self, db_session):
        """Test getting a user by username when user doesn't exist."""
        retrieved_user = get_user_by_username(db_session, "nonexistent")

        assert retrieved_user is None

    def test_get_user_by_id_found(self, db_session):
        """Test getting a user by ID when user exists."""
        created_user = create_user(db_session, "testuser", "hashed_password")

        retrieved_user = get_user_by_id(db_session, created_user.id)

        assert retrieved_user is not None
        assert retrieved_user.id == created_user.id
        assert retrieved_user.username == "testuser"

    def test_get_user_by_id_not_found(self, db_session):
        """Test getting a user by ID when user doesn't exist."""
        fake_id = uuid.uuid4()
        retrieved_user = get_user_by_id(db_session, fake_id)

        assert retrieved_user is None

    def test_update_password_success(self, db_session):
        """Test updating a user's password successfully."""
        user = create_user(db_session, "testuser", "old_hash")
        new_hash = "new_hashed_password"

        result = update_password(db_session, user.id, new_hash)

        assert result is True

        # Verify password was updated
        updated_user = get_user_by_id(db_session, user.id)
        assert updated_user.password_hash == new_hash

    def test_update_password_user_not_found(self, db_session):
        """Test updating password for non-existent user."""
        fake_id = uuid.uuid4()

        result = update_password(db_session, fake_id, "new_hash")

        assert result is False


class TestRecoveryRepository:
    def test_create_recovery_codes(self, db_session):
        """Test creating recovery codes for a user."""
        user = create_user(db_session, "testuser", "hash")
        code_hashes = ["hash1", "hash2", "hash3"]

        codes = create_recovery_codes(db_session, user.id, code_hashes)

        assert len(codes) == 3
        for code in codes:
            assert code.user_id == user.id
            assert code.code_hash in code_hashes
            assert code.used is False

    def test_verify_and_invalidate_code_success(self, db_session):
        """Test verifying and invalidating a recovery code successfully."""

        user = create_user(db_session, "testuser", "hash")
        plain_codes = ["ABC123", "DEF456"]
        code_hashes = [hash_code(code) for code in plain_codes]
        create_recovery_codes(db_session, user.id, code_hashes)

        # Verify first code
        result = verify_and_invalidate_code(db_session, user.id, plain_codes[0])

        assert result is True

        # Check that code is now marked as used
        unused_codes = get_unused_recovery_codes(db_session, user.id)
        assert len(unused_codes) == 1
        # The remaining code should be verifiable with "DEF456"
        from app.utils.codes import verify_code
        assert verify_code(plain_codes[1], unused_codes[0].code_hash)

    def test_verify_and_invalidate_code_not_found(self, db_session):
        """Test verifying a non-existent recovery code."""

        user = create_user(db_session, "testuser", "hash")
        plain_codes = ["ABC123", "DEF456"]
        code_hashes = [hash_code(code) for code in plain_codes]
        create_recovery_codes(db_session, user.id, code_hashes)

        # Try to verify non-existent code
        result = verify_and_invalidate_code(db_session, user.id, "XYZ789")

        assert result is False

        # All codes should still be unused
        unused_codes = get_unused_recovery_codes(db_session, user.id)
        assert len(unused_codes) == 2

    def test_verify_and_invalidate_code_already_used(self, db_session):
        """Test verifying an already used recovery code."""

        user = create_user(db_session, "testuser", "hash")
        plain_code = "ABC123"
        code_hashes = [hash_code(plain_code)]
        create_recovery_codes(db_session, user.id, code_hashes)

        # Use the code once
        result1 = verify_and_invalidate_code(db_session, user.id, plain_code)
        assert result1 is True

        # Try to use it again
        result2 = verify_and_invalidate_code(db_session, user.id, plain_code)
        assert result2 is False

    def test_verify_and_invalidate_code_wrong_user(self, db_session):
        """Test verifying a recovery code for wrong user."""

        user1 = create_user(db_session, "user1", "hash")
        user2 = create_user(db_session, "user2", "hash")

        plain_code = "ABC123"
        code_hashes = [hash_code(plain_code)]
        create_recovery_codes(db_session, user1.id, code_hashes)

        # Try to verify user1's code for user2
        result = verify_and_invalidate_code(db_session, user2.id, plain_code)

        assert result is False

        # user1's code should still be unused
        unused_codes = get_unused_recovery_codes(db_session, user1.id)
        assert len(unused_codes) == 1

    def test_get_unused_recovery_codes(self, db_session):
        """Test getting unused recovery codes."""

        user = create_user(db_session, "testuser", "hash")
        plain_codes = ["ABC123", "DEF456", "GHI789"]
        code_hashes = [hash_code(code) for code in plain_codes]
        create_recovery_codes(db_session, user.id, code_hashes)

        unused_codes = get_unused_recovery_codes(db_session, user.id)

        assert len(unused_codes) == 3
        for code in unused_codes:
            assert code.used is False
            assert code.code_hash in code_hashes

    def test_get_unused_recovery_codes_after_use(self, db_session):
        """Test getting unused recovery codes after some have been used."""

        user = create_user(db_session, "testuser", "hash")
        plain_codes = ["ABC123", "DEF456", "GHI789"]
        code_hashes = [hash_code(code) for code in plain_codes]
        create_recovery_codes(db_session, user.id, code_hashes)

        # Use one code
        verify_and_invalidate_code(db_session, user.id, plain_codes[0])

        unused_codes = get_unused_recovery_codes(db_session, user.id)

        assert len(unused_codes) == 2
        # Check that the remaining codes can be verified with the correct plain codes
        from app.utils.codes import verify_code
        remaining_codes = plain_codes[1:]
        for code in unused_codes:
            assert any(verify_code(plain_code, code.code_hash) for plain_code in remaining_codes)
