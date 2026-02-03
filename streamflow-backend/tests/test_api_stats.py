import os
import uuid
from unittest.mock import AsyncMock, patch

os.environ["TESTING"] = "true"

from fastapi.testclient import TestClient

from app.schemas.movie import Genre, MovieDetails
from app.schemas.tv import TVDetails
from main import app

client = TestClient(app)


def create_test_user():
    username = f"statsuser_{uuid.uuid4().hex[:8]}"
    user_data = {"username": username, "password": "testpassword123"}
    response = client.post("/api/v1/auth/register", json=user_data)
    return username, response.json()


def login_user(username):
    login_data = {"username": username, "password": "testpassword123"}
    response = client.post("/api/v1/auth/login", json=login_data)
    return response.json()["access_token"]


def save_watch_position(token, tmdb_id, media_type, position, season=0, episode=0):
    watch_data = {
        "tmdb_id": tmdb_id,
        "media_type": media_type,
        "position": position,
        "season_number": season,
        "episode_number": episode,
    }
    client.post(
        "/api/v1/watch/history",
        json=watch_data,
        headers={"Authorization": f"Bearer {token}"},
    )


@patch("app.services.stats_service.tmdb_client")
def test_get_global_stats_empty(mock_tmdb_client):
    response = client.get("/api/v1/stats/global")

    assert response.status_code == 200
    data = response.json()
    assert "most_watched_movies" in data
    assert "most_watched_tv_shows" in data
    assert "trending_this_week" in data
    assert len(data["most_watched_movies"]) == 0
    assert len(data["most_watched_tv_shows"]) == 0
    assert len(data["trending_this_week"]) == 0


@patch("app.services.stats_service.tmdb_client")
def test_get_global_stats_with_data(mock_tmdb_client):
    mock_movie = MovieDetails(
        id=999999,
        title="Test Movie For Stats",
        overview="A test movie...",
        poster_path="/poster.jpg",
        vote_average=8.4,
        vote_count=27000,
        genres=[Genre(id=18, name="Drama")],
    )
    mock_tmdb_client.get_movie_details = AsyncMock(return_value=mock_movie)

    username, _ = create_test_user()
    token = login_user(username)

    save_watch_position(token, 999999, "movie", 120)
    save_watch_position(token, 999999, "movie", 240)

    response = client.get("/api/v1/stats/global")

    assert response.status_code == 200
    data = response.json()
    assert len(data["most_watched_movies"]) > 0
    movie_ids = [m["tmdb_id"] for m in data["most_watched_movies"]]
    assert 999999 in movie_ids
    test_movie = next(m for m in data["most_watched_movies"] if m["tmdb_id"] == 999999)
    assert test_movie["title"] == "Test Movie For Stats"
    assert test_movie["watch_count"] >= 1


@patch("app.services.stats_service.tmdb_client")
def test_get_user_stats_authenticated(mock_tmdb_client):
    mock_movie = MovieDetails(
        id=550,
        title="Fight Club",
        overview="A ticking-time-bomb insomniac...",
        poster_path="/poster.jpg",
        vote_average=8.4,
        vote_count=27000,
        genres=[Genre(id=18, name="Drama"), Genre(id=53, name="Thriller")],
    )
    mock_tmdb_client.get_movie_details = AsyncMock(return_value=mock_movie)

    username, _ = create_test_user()
    token = login_user(username)

    save_watch_position(token, 550, "movie", 120)
    save_watch_position(token, 551, "movie", 200)

    response = client.get(
        "/api/v1/stats/user",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "total_watch_time_seconds" in data
    assert "top_genres" in data
    assert "most_rewatched" in data
    assert "watch_timeline" in data
    assert data["total_watch_time_seconds"] == 320


@patch("app.services.stats_service.tmdb_client")
def test_get_user_stats_unauthenticated(mock_tmdb_client):
    response = client.get("/api/v1/stats/user")

    assert response.status_code == 401


@patch("app.services.stats_service.tmdb_client")
def test_get_user_stats_with_tv_shows(mock_tmdb_client):
    mock_tv = TVDetails(
        id=1396,
        name="Breaking Bad",
        overview="A high school chemistry teacher...",
        poster_path="/tv_poster.jpg",
        number_of_seasons=5,
        number_of_episodes=62,
        vote_average=9.5,
        vote_count=13000,
        genres=[Genre(id=18, name="Drama"), Genre(id=80, name="Crime")],
        seasons=[],
    )
    mock_tmdb_client.get_tv_details = AsyncMock(return_value=mock_tv)

    username, _ = create_test_user()
    token = login_user(username)

    save_watch_position(token, 1396, "tv", 300, season=1, episode=1)
    save_watch_position(token, 1396, "tv", 400, season=1, episode=2)

    response = client.get(
        "/api/v1/stats/user",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_watch_time_seconds"] == 700
    assert len(data["watch_timeline"]) == 2


@patch("app.services.stats_service.tmdb_client")
def test_get_user_stats_empty_history(mock_tmdb_client):
    username, _ = create_test_user()
    token = login_user(username)

    response = client.get(
        "/api/v1/stats/user",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total_watch_time_seconds"] == 0
    assert len(data["top_genres"]) == 0
    assert len(data["most_rewatched"]) == 0
    assert len(data["watch_timeline"]) == 0
