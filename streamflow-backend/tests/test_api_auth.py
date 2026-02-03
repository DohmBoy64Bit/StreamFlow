import os
import uuid

os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health_check():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_register_user_success():
    """Test successful user registration."""
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    user_data = {
        "username": username,
        "password": "testpassword123"
    }

    response = client.post("/api/v1/auth/register", json=user_data)

    assert response.status_code == 200
    data = response.json()

    assert "user" in data
    assert "recovery_codes" in data
    assert data["user"]["username"] == username
    assert len(data["recovery_codes"]) == 5  # Default number of recovery codes


def test_register_user_duplicate_username():
    """Test registration with duplicate username."""
    username = f"duplicateuser_{uuid.uuid4().hex[:8]}"

    # First registration
    user_data = {
        "username": username,
        "password": "testpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Second registration with same username
    response = client.post("/api/v1/auth/register", json=user_data)

    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_login_success():
    """Test successful user login."""
    username = f"loginuser_{uuid.uuid4().hex[:8]}"

    # Register user first
    user_data = {
        "username": username,
        "password": "testpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Login
    login_data = {
        "username": username,
        "password": "testpassword123"
    }
    response = client.post("/api/v1/auth/login", json=login_data)

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert "token_type" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials():
    """Test login with invalid credentials."""
    login_data = {
        "username": "nonexistent",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", json=login_data)

    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_password_recovery_success():
    """Test successful password recovery."""
    username = f"recoveryuser_{uuid.uuid4().hex[:8]}"

    # Register user and get recovery codes
    user_data = {
        "username": username,
        "password": "oldpassword123"
    }
    register_response = client.post("/api/v1/auth/register", json=user_data)
    recovery_codes = register_response.json()["recovery_codes"]

    # Use first recovery code
    recovery_data = {
        "username": username,
        "recovery_code": recovery_codes[0],
        "new_password": "newpassword123"
    }
    response = client.post("/api/v1/auth/recover-password", json=recovery_data)

    assert response.status_code == 200
    assert "Password successfully updated" in response.json()["message"]

    # Verify login with new password works
    login_data = {
        "username": username,
        "password": "newpassword123"
    }
    login_response = client.post("/api/v1/auth/login", json=login_data)
    assert login_response.status_code == 200


def test_password_recovery_invalid_code():
    """Test password recovery with invalid recovery code."""
    username = f"recoveryuser2_{uuid.uuid4().hex[:8]}"

    # Register user
    user_data = {
        "username": username,
        "password": "testpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Try recovery with invalid code
    recovery_data = {
        "username": username,
        "recovery_code": "INVALID-CODE-123456",
        "new_password": "newpassword123"
    }
    response = client.post("/api/v1/auth/recover-password", json=recovery_data)

    assert response.status_code == 400
    assert "Invalid or already used recovery code" in response.json()["detail"]


def test_password_recovery_used_code():
    """Test password recovery with already used recovery code."""
    username = f"recoveryuser3_{uuid.uuid4().hex[:8]}"

    # Register user and get recovery codes
    user_data = {
        "username": username,
        "password": "oldpassword123"
    }
    register_response = client.post("/api/v1/auth/register", json=user_data)
    recovery_codes = register_response.json()["recovery_codes"]

    # Use recovery code once
    recovery_data = {
        "username": username,
        "recovery_code": recovery_codes[0],
        "new_password": "newpassword123"
    }
    client.post("/api/v1/auth/recover-password", json=recovery_data)

    # Try to use same code again
    response = client.post("/api/v1/auth/recover-password", json=recovery_data)

    assert response.status_code == 400
    assert "Invalid or already used recovery code" in response.json()["detail"]


def test_get_current_user_with_token():
    """Test /auth/me endpoint with valid token."""
    username = f"meuser_{uuid.uuid4().hex[:8]}"

    # Register user
    user_data = {
        "username": username,
        "password": "testpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Login to get token
    login_data = {
        "username": username,
        "password": "testpassword123"
    }
    login_response = client.post("/api/v1/auth/login", json=login_data)
    token = login_response.json()["access_token"]

    # Access /auth/me with token
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == username
    assert "id" in data
    assert "created_at" in data


def test_get_current_user_without_token():
    """Test /auth/me endpoint without token."""
    response = client.get("/api/v1/auth/me")

    assert response.status_code == 401


def test_get_current_user_with_invalid_token():
    """Test /auth/me endpoint with invalid token."""
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer invalid_token_here"}
    )

    assert response.status_code == 401
    assert "Could not validate credentials" in response.json()["detail"]
