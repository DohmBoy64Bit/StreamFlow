import uuid

import pytest

from app.repositories.history_repo import (
    get_user_watch_history,
    get_watch_position,
    save_watch_position,
)
from app.repositories.user_repo import create_user


@pytest.fixture
def test_user(db_session):
    return create_user(db_session, "testuser", "hashed_password")


def test_save_watch_position_movie(db_session, test_user):
    watch_entry = save_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0, position=120
    )

    assert watch_entry.id is not None
    assert watch_entry.user_id == test_user.id
    assert watch_entry.tmdb_id == 550
    assert watch_entry.media_type == "movie"
    assert watch_entry.season_number == 0
    assert watch_entry.episode_number == 0
    assert watch_entry.last_position == 120


def test_save_watch_position_tv(db_session, test_user):
    watch_entry = save_watch_position(
        db_session,
        test_user.id,
        tmdb_id=1396,
        media_type="tv",
        season=1,
        episode=1,
        position=300,
    )

    assert watch_entry.id is not None
    assert watch_entry.user_id == test_user.id
    assert watch_entry.tmdb_id == 1396
    assert watch_entry.media_type == "tv"
    assert watch_entry.season_number == 1
    assert watch_entry.episode_number == 1
    assert watch_entry.last_position == 300


def test_save_watch_position_update_existing(db_session, test_user):
    save_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0, position=120
    )

    updated_entry = save_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0, position=240
    )

    assert updated_entry.last_position == 240

    all_entries = get_user_watch_history(db_session, test_user.id)
    assert len(all_entries) == 1


def test_get_watch_position(db_session, test_user):
    save_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0, position=120
    )

    watch_entry = get_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0
    )

    assert watch_entry is not None
    assert watch_entry.last_position == 120


def test_get_watch_position_not_found(db_session, test_user):
    watch_entry = get_watch_position(
        db_session, test_user.id, tmdb_id=9999, media_type="movie", season=0, episode=0
    )

    assert watch_entry is None


def test_get_user_watch_history(db_session, test_user):
    save_watch_position(
        db_session, test_user.id, tmdb_id=550, media_type="movie", season=0, episode=0, position=120
    )
    save_watch_position(
        db_session,
        test_user.id,
        tmdb_id=1396,
        media_type="tv",
        season=1,
        episode=1,
        position=300,
    )
    save_watch_position(
        db_session,
        test_user.id,
        tmdb_id=1396,
        media_type="tv",
        season=1,
        episode=2,
        position=150,
    )

    history = get_user_watch_history(db_session, test_user.id)

    assert len(history) == 3
    assert history[0].watched_at >= history[1].watched_at
    assert history[1].watched_at >= history[2].watched_at


def test_get_user_watch_history_pagination(db_session, test_user):
    for i in range(5):
        save_watch_position(
            db_session,
            test_user.id,
            tmdb_id=1000 + i,
            media_type="movie",
            season=0,
            episode=0,
            position=100 * i,
        )

    page1 = get_user_watch_history(db_session, test_user.id, limit=2, offset=0)
    page2 = get_user_watch_history(db_session, test_user.id, limit=2, offset=2)

    assert len(page1) == 2
    assert len(page2) == 2
    assert page1[0].id != page2[0].id


def test_get_user_watch_history_empty(db_session, test_user):
    history = get_user_watch_history(db_session, test_user.id)

    assert len(history) == 0
