import os
import uuid

os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def create_test_user():
    username = f"watchuser_{uuid.uuid4().hex[:8]}"
    user_data = {"username": username, "password": "testpassword123"}
    response = client.post("/api/v1/auth/register", json=user_data)
    return username, response.json()


def login_user(username):
    login_data = {"username": username, "password": "testpassword123"}
    response = client.post("/api/v1/auth/login", json=login_data)
    return response.json()["access_token"]


def test_save_watch_position_movie_authenticated():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = {
        "tmdb_id": 550,
        "media_type": "movie",
        "position": 120,
        "season_number": 0,
        "episode_number": 0,
    }

    response = client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "id" in data


def test_save_watch_position_tv_authenticated():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = {
        "tmdb_id": 1396,
        "media_type": "tv",
        "position": 300,
        "season_number": 1,
        "episode_number": 1,
    }

    response = client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "id" in data


def test_save_watch_position_unauthenticated():
    watch_data = {
        "tmdb_id": 550,
        "media_type": "movie",
        "position": 120,
        "season_number": 0,
        "episode_number": 0,
    }

    response = client.post("/api/v1/watch/history", json=watch_data)

    assert response.status_code == 401


def test_get_resume_position_movie_authenticated():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = {
        "tmdb_id": 550,
        "media_type": "movie",
        "position": 150,
        "season_number": 0,
        "episode_number": 0,
    }
    client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/v1/watch/resume/550?media_type=movie&season=0&episode=0",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["position"] == 150


def test_get_resume_position_tv_authenticated():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = {
        "tmdb_id": 1396,
        "media_type": "tv",
        "position": 450,
        "season_number": 2,
        "episode_number": 3,
    }
    client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/v1/watch/resume/1396?media_type=tv&season=2&episode=3",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["position"] == 450


def test_get_resume_position_not_found():
    username, _ = create_test_user()
    token = login_user(username)

    response = client.get(
        "/api/v1/watch/resume/9999?media_type=movie&season=0&episode=0",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["position"] == 0


def test_get_resume_position_unauthenticated():
    response = client.get("/api/v1/watch/resume/550?media_type=movie&season=0&episode=0")

    assert response.status_code == 401


def test_get_watch_history_authenticated():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = [
        {"tmdb_id": 550, "media_type": "movie", "position": 120, "season_number": 0, "episode_number": 0},
        {"tmdb_id": 1396, "media_type": "tv", "position": 300, "season_number": 1, "episode_number": 1},
        {"tmdb_id": 1396, "media_type": "tv", "position": 150, "season_number": 1, "episode_number": 2},
    ]

    for data in watch_data:
        client.post(
            "/api/v1/watch/history",
            json=data,
            headers={"Authorization": f"Bearer {token}"},
        )

    response = client.get(
        "/api/v1/watch/history",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert len(data["items"]) == 3


def test_get_watch_history_pagination():
    username, _ = create_test_user()
    token = login_user(username)

    for i in range(5):
        watch_data = {
            "tmdb_id": 1000 + i,
            "media_type": "movie",
            "position": 100 * i,
            "season_number": 0,
            "episode_number": 0,
        }
        client.post(
            "/api/v1/watch/history",
            json=watch_data,
            headers={"Authorization": f"Bearer {token}"},
        )

    page1 = client.get(
        "/api/v1/watch/history?limit=2&offset=0",
        headers={"Authorization": f"Bearer {token}"},
    )
    page2 = client.get(
        "/api/v1/watch/history?limit=2&offset=2",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert page1.status_code == 200
    assert page2.status_code == 200

    page1_data = page1.json()
    page2_data = page2.json()

    assert len(page1_data["items"]) == 2
    assert len(page2_data["items"]) == 2
    assert page1_data["items"][0]["id"] != page2_data["items"][0]["id"]


def test_get_watch_history_unauthenticated():
    response = client.get("/api/v1/watch/history")

    assert response.status_code == 401


def test_get_vidsrc_player_url_movie():
    response = client.get("/api/v1/vidsrc/player/550?media_type=movie")

    assert response.status_code == 200
    data = response.json()
    assert "primary_url" in data
    assert "fallback_urls" in data
    assert "/movie/550" in data["primary_url"]


def test_get_vidsrc_player_url_tv():
    response = client.get("/api/v1/vidsrc/player/1396?media_type=tv&season=1&episode=1")

    assert response.status_code == 200
    data = response.json()
    assert "primary_url" in data
    assert "fallback_urls" in data
    assert "/tv/1396/1/1" in data["primary_url"]


def test_get_vidsrc_player_url_default_movie():
    response = client.get("/api/v1/vidsrc/player/550")

    assert response.status_code == 200
    data = response.json()
    assert "primary_url" in data
    assert "/movie/550" in data["primary_url"]


def test_update_existing_watch_position():
    username, _ = create_test_user()
    token = login_user(username)

    watch_data = {
        "tmdb_id": 550,
        "media_type": "movie",
        "position": 120,
        "season_number": 0,
        "episode_number": 0,
    }
    client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    updated_data = {
        "tmdb_id": 550,
        "media_type": "movie",
        "position": 240,
        "season_number": 0,
        "episode_number": 0,
    }
    client.post(
        "/api/v1/watch/history",
        json=updated_data,
        headers={"Authorization": f"Bearer {token}"},
    )

    response = client.get(
        "/api/v1/watch/resume/550?media_type=movie&season=0&episode=0",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["position"] == 240

    history_response = client.get(
        "/api/v1/watch/history",
        headers={"Authorization": f"Bearer {token}"},
    )
    history_data = history_response.json()
    assert len(history_data["items"]) == 1
