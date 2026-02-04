import uuid

from sqlalchemy.orm import Session

from app.models.db_models import WatchHistory
from app.repositories.history_repo import (
    get_user_watch_history,
    get_watch_position,
    save_watch_position,
)


def record_watch_position(
    db: Session,
    user_id: uuid.UUID,
    tmdb_id: int,
    media_type: str,
    position: int,
    season: int = 0,
    episode: int = 0,
) -> WatchHistory:
    return save_watch_position(db, user_id, tmdb_id, media_type, season, episode, position)


def get_resume_position(
    db: Session,
    user_id: uuid.UUID,
    tmdb_id: int,
    media_type: str,
    season: int = 0,
    episode: int = 0,
) -> int:
    watch_entry = get_watch_position(db, user_id, tmdb_id, media_type, season, episode)
    return watch_entry.last_position if watch_entry else 0


def get_watch_history(
    db: Session, user_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> list[WatchHistory]:
    return get_user_watch_history(db, user_id, limit, offset)
