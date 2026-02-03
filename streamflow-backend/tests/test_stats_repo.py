import uuid
from datetime import datetime, timedelta

import pytest

from app.repositories.history_repo import save_watch_position
from app.repositories.stats_repo import (
    get_most_watched_movie,
    get_most_watched_tv_show,
    get_trending_this_week,
    get_user_most_rewatched,
    get_user_top_genres,
    get_user_total_watch_time,
    get_user_watch_timeline,
)
from app.repositories.user_repo import create_user


@pytest.fixture
def test_user(db_session):
    return create_user(db_session, "testuser", "hashed_password")


@pytest.fixture
def test_user2(db_session):
    return create_user(db_session, "testuser2", "hashed_password2")


def test_get_most_watched_movie(db_session, test_user, test_user2):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user2.id, 550, "movie", 0, 0, 90)
    save_watch_position(db_session, test_user.id, 551, "movie", 0, 0, 100)

    results = get_most_watched_movie(db_session, limit=10)

    assert len(results) == 2
    assert results[0]["tmdb_id"] == 550
    assert results[0]["watch_count"] == 2
    assert results[1]["tmdb_id"] == 551
    assert results[1]["watch_count"] == 1


def test_get_most_watched_tv_show(db_session, test_user, test_user2):
    save_watch_position(db_session, test_user.id, 1396, "tv", 1, 1, 300)
    save_watch_position(db_session, test_user2.id, 1396, "tv", 1, 2, 300)
    save_watch_position(db_session, test_user.id, 1399, "tv", 1, 1, 200)

    results = get_most_watched_tv_show(db_session, limit=10)

    assert len(results) == 2
    assert results[0]["tmdb_id"] == 1396
    assert results[0]["watch_count"] == 2


def test_get_trending_this_week(db_session, test_user, test_user2):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user2.id, 550, "movie", 0, 0, 90)
    save_watch_position(db_session, test_user.id, 1396, "tv", 1, 1, 300)

    results = get_trending_this_week(db_session, limit=10)

    assert len(results) == 2
    assert results[0]["tmdb_id"] == 550
    assert results[0]["media_type"] == "movie"
    assert results[0]["watch_count"] == 2


def test_get_user_total_watch_time(db_session, test_user):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user.id, 551, "movie", 0, 0, 200)
    save_watch_position(db_session, test_user.id, 1396, "tv", 1, 1, 300)

    total_time = get_user_total_watch_time(db_session, test_user.id)

    assert total_time == 620


def test_get_user_total_watch_time_no_history(db_session, test_user):
    total_time = get_user_total_watch_time(db_session, test_user.id)

    assert total_time == 0


def test_get_user_top_genres(db_session, test_user):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user.id, 1396, "tv", 1, 1, 300)

    results = get_user_top_genres(db_session, test_user.id, limit=5)

    assert len(results) == 2
    assert {"tmdb_id": 550, "media_type": "movie"} in results
    assert {"tmdb_id": 1396, "media_type": "tv"} in results


def test_get_user_most_rewatched(db_session, test_user):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 240)
    save_watch_position(db_session, test_user.id, 551, "movie", 0, 0, 100)

    results = get_user_most_rewatched(db_session, test_user.id, limit=10)

    assert len(results) == 0


def test_get_user_watch_timeline(db_session, test_user):
    save_watch_position(db_session, test_user.id, 550, "movie", 0, 0, 120)
    save_watch_position(db_session, test_user.id, 551, "movie", 0, 0, 200)
    save_watch_position(db_session, test_user.id, 1396, "tv", 1, 1, 300)

    timeline = get_user_watch_timeline(db_session, test_user.id, limit=50)

    assert len(timeline) == 3
    assert timeline[0].watched_at >= timeline[1].watched_at
    assert timeline[1].watched_at >= timeline[2].watched_at


def test_get_user_watch_timeline_pagination(db_session, test_user):
    for i in range(5):
        save_watch_position(db_session, test_user.id, 1000 + i, "movie", 0, 0, 100 * i)

    timeline = get_user_watch_timeline(db_session, test_user.id, limit=3)

    assert len(timeline) == 3
