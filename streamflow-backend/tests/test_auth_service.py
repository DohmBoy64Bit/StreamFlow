import pytest

from app.services.auth_service import (
    InvalidCredentialsError,
    InvalidRecoveryCodeError,
    UserAlreadyExistsError,
    authenticate_user,
    recover_password,
    register_user,
)


class TestUserRegistration:
    def test_register_user_success(self, db_session):
        """Test successful user registration."""
        username = "testuser"
        password = "testpassword123"

        user, recovery_codes = register_user(db_session, username, password)

        assert user.username == username
        assert user.password_hash != password  # Should be hashed
        assert len(recovery_codes) == 5  # Default number of codes

        # Verify recovery codes are valid format
        for code in recovery_codes:
            assert len(code) == 12
            assert code.isalnum()
            assert code.isupper()

    def test_register_user_duplicate_username(self, db_session):
        """Test registration with duplicate username."""
        username = "testuser"
        password1 = "password1"
        password2 = "password2"

        # Register first user
        register_user(db_session, username, password1)

        # Try to register second user with same username
        with pytest.raises(UserAlreadyExistsError):
            register_user(db_session, username, password2)


class TestUserAuthentication:
    def test_authenticate_user_success(self, db_session):
        """Test successful user authentication."""
        username = "testuser"
        password = "testpassword123"

        # Register user
        registered_user, _ = register_user(db_session, username, password)

        # Authenticate
        authenticated_user = authenticate_user(db_session, username, password)

        assert authenticated_user.id == registered_user.id
        assert authenticated_user.username == username

    def test_authenticate_user_wrong_username(self, db_session):
        """Test authentication with wrong username."""
        username = "testuser"
        password = "testpassword123"

        # Register user
        register_user(db_session, username, password)

        # Try to authenticate with wrong username
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, "wronguser", password)

    def test_authenticate_user_wrong_password(self, db_session):
        """Test authentication with wrong password."""
        username = "testuser"
        password = "testpassword123"
        wrong_password = "wrongpassword"

        # Register user
        register_user(db_session, username, password)

        # Try to authenticate with wrong password
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, username, wrong_password)


class TestPasswordRecovery:
    def test_recover_password_success(self, db_session):
        """Test successful password recovery."""
        username = "testuser"
        old_password = "oldpassword123"
        new_password = "newpassword123"

        # Register user and get recovery codes
        user, recovery_codes = register_user(db_session, username, old_password)

        # Use first recovery code
        recovery_code = recovery_codes[0]

        # Recover password
        recovered_user = recover_password(db_session, username, recovery_code, new_password)

        assert recovered_user.id == user.id
        assert recovered_user.username == username

        # Verify old password no longer works
        with pytest.raises(InvalidCredentialsError):
            authenticate_user(db_session, username, old_password)

        # Verify new password works
        authenticated_user = authenticate_user(db_session, username, new_password)
        assert authenticated_user.id == user.id

    def test_recover_password_wrong_username(self, db_session):
        """Test password recovery with wrong username."""
        username = "testuser"
        recovery_code = "ABC123DEF456"
        new_password = "newpassword123"

        with pytest.raises(InvalidCredentialsError):
            recover_password(db_session, username, recovery_code, new_password)

    def test_recover_password_invalid_code(self, db_session):
        """Test password recovery with invalid recovery code."""
        username = "testuser"
        old_password = "oldpassword123"
        invalid_code = "INVALIDCODE12"
        new_password = "newpassword123"

        # Register user
        register_user(db_session, username, old_password)

        # Try to recover with invalid code
        with pytest.raises(InvalidRecoveryCodeError):
            recover_password(db_session, username, invalid_code, new_password)

    def test_recover_password_used_code(self, db_session):
        """Test password recovery with already used recovery code."""
        username = "testuser"
        old_password = "oldpassword123"
        new_password1 = "newpassword123"
        new_password2 = "anotherpassword"

        # Register user and get recovery codes
        user, recovery_codes = register_user(db_session, username, old_password)

        # Use recovery code once
        recovery_code = recovery_codes[0]
        recover_password(db_session, username, recovery_code, new_password1)

        # Try to use same code again
        with pytest.raises(InvalidRecoveryCodeError):
            recover_password(db_session, username, recovery_code, new_password2)

    def test_recover_password_multiple_codes(self, db_session):
        """Test that multiple recovery codes work."""
        username = "testuser"
        old_password = "oldpassword123"
        new_password1 = "newpassword123"
        new_password2 = "anotherpassword"

        # Register user and get recovery codes
        user, recovery_codes = register_user(db_session, username, old_password)

        # Use first code
        recover_password(db_session, username, recovery_codes[0], new_password1)

        # Use second code for another recovery
        recover_password(db_session, username, recovery_codes[1], new_password2)

        # Verify final password works
        authenticated_user = authenticate_user(db_session, username, new_password2)
        assert authenticated_user.id == user.id
