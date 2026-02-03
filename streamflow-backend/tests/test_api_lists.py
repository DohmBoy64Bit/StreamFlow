import os
import uuid

os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def create_test_user():
    """Helper function to create a test user and return auth token."""
    username = f"testuser_{uuid.uuid4().hex[:8]}"
    user_data = {
        "username": username,
        "password": "testpassword123"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    login_response = client.post("/api/v1/auth/login", json=user_data)
    token = login_response.json()["access_token"]
    
    return token


def test_create_list_success():
    """Test successful list creation."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    list_data = {"name": "My Watchlist"}
    response = client.post("/api/v1/lists", json=list_data, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    
    assert "id" in data
    assert data["name"] == "My Watchlist"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_list_without_auth():
    """Test list creation without authentication."""
    list_data = {"name": "My Watchlist"}
    response = client.post("/api/v1/lists", json=list_data)
    
    assert response.status_code == 401


def test_create_list_invalid_name():
    """Test list creation with invalid name."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    list_data = {"name": ""}
    response = client.post("/api/v1/lists", json=list_data, headers=headers)
    
    assert response.status_code == 422


def test_get_user_lists():
    """Test retrieving user's lists."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    client.post("/api/v1/lists", json={"name": "Favorites"}, headers=headers)
    client.post("/api/v1/lists", json={"name": "Watch Later"}, headers=headers)
    
    response = client.get("/api/v1/lists", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data) == 2
    assert data[0]["name"] == "Favorites"
    assert data[1]["name"] == "Watch Later"


def test_get_user_lists_empty():
    """Test retrieving lists when user has none."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/v1/lists", headers=headers)
    
    assert response.status_code == 200
    assert response.json() == []


def test_get_user_lists_without_auth():
    """Test retrieving lists without authentication."""
    response = client.get("/api/v1/lists")
    
    assert response.status_code == 401


def test_get_list_by_id():
    """Test retrieving a specific list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    response = client.get(f"/api/v1/lists/{list_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["id"] == list_id
    assert data["name"] == "My List"
    assert "items" in data
    assert len(data["items"]) == 0


def test_get_list_by_id_not_found():
    """Test retrieving a non-existent list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    random_uuid = uuid.uuid4()
    response = client.get(f"/api/v1/lists/{random_uuid}", headers=headers)
    
    assert response.status_code == 404


def test_get_list_by_id_wrong_user():
    """Test retrieving another user's list."""
    token1 = create_test_user()
    token2 = create_test_user()
    
    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "User1's List"}, headers=headers1)
    list_id = create_response.json()["id"]
    
    response = client.get(f"/api/v1/lists/{list_id}", headers=headers2)
    
    assert response.status_code == 404


def test_delete_list():
    """Test deleting a list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "To Delete"}, headers=headers)
    list_id = create_response.json()["id"]
    
    response = client.delete(f"/api/v1/lists/{list_id}", headers=headers)
    
    assert response.status_code == 204
    
    get_response = client.get(f"/api/v1/lists/{list_id}", headers=headers)
    assert get_response.status_code == 404


def test_delete_list_not_found():
    """Test deleting a non-existent list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    random_uuid = uuid.uuid4()
    response = client.delete(f"/api/v1/lists/{random_uuid}", headers=headers)
    
    assert response.status_code == 404


def test_add_item_to_list():
    """Test adding an item to a list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    item_data = {
        "tmdb_id": 12345,
        "media_type": "movie"
    }
    response = client.post(f"/api/v1/lists/{list_id}/items", json=item_data, headers=headers)
    
    assert response.status_code == 201
    data = response.json()
    
    assert "id" in data
    assert data["tmdb_id"] == 12345
    assert data["media_type"] == "movie"
    assert "added_at" in data


def test_add_item_to_list_duplicate():
    """Test adding duplicate item to a list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    item_data = {
        "tmdb_id": 12345,
        "media_type": "movie"
    }
    client.post(f"/api/v1/lists/{list_id}/items", json=item_data, headers=headers)
    
    response = client.post(f"/api/v1/lists/{list_id}/items", json=item_data, headers=headers)
    
    assert response.status_code == 409
    assert "already in this list" in response.json()["detail"]


def test_add_item_invalid_media_type():
    """Test adding item with invalid media type."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    item_data = {
        "tmdb_id": 12345,
        "media_type": "invalid"
    }
    response = client.post(f"/api/v1/lists/{list_id}/items", json=item_data, headers=headers)
    
    assert response.status_code == 422


def test_remove_item_from_list():
    """Test removing an item from a list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    item_data = {"tmdb_id": 12345, "media_type": "movie"}
    add_response = client.post(f"/api/v1/lists/{list_id}/items", json=item_data, headers=headers)
    item_id = add_response.json()["id"]
    
    response = client.delete(f"/api/v1/lists/{list_id}/items/{item_id}", headers=headers)
    
    assert response.status_code == 204
    
    get_response = client.get(f"/api/v1/lists/{list_id}", headers=headers)
    assert len(get_response.json()["items"]) == 0


def test_remove_item_not_found():
    """Test removing a non-existent item."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    random_uuid = uuid.uuid4()
    response = client.delete(f"/api/v1/lists/{list_id}/items/{random_uuid}", headers=headers)
    
    assert response.status_code == 404


def test_get_list_with_items():
    """Test retrieving a list with multiple items."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    create_response = client.post("/api/v1/lists", json={"name": "My List"}, headers=headers)
    list_id = create_response.json()["id"]
    
    client.post(f"/api/v1/lists/{list_id}/items", json={"tmdb_id": 12345, "media_type": "movie"}, headers=headers)
    client.post(f"/api/v1/lists/{list_id}/items", json={"tmdb_id": 67890, "media_type": "tv"}, headers=headers)
    
    response = client.get(f"/api/v1/lists/{list_id}", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["items"]) == 2
    assert data["items"][0]["tmdb_id"] == 12345
    assert data["items"][0]["media_type"] == "movie"
    assert data["items"][1]["tmdb_id"] == 67890
    assert data["items"][1]["media_type"] == "tv"


def test_add_item_to_nonexistent_list():
    """Test adding item to non-existent list."""
    token = create_test_user()
    headers = {"Authorization": f"Bearer {token}"}
    
    random_uuid = uuid.uuid4()
    item_data = {"tmdb_id": 12345, "media_type": "movie"}
    response = client.post(f"/api/v1/lists/{random_uuid}/items", json=item_data, headers=headers)
    
    assert response.status_code == 404
