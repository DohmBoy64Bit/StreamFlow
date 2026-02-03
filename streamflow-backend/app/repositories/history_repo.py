import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.db_models import WatchHistory


def save_watch_position(
    db: Session,
    user_id: uuid.UUID,
    tmdb_id: int,
    media_type: str,
    season: int,
    episode: int,
    position: int,
) -> WatchHistory:
    stmt = select(WatchHistory).where(
        WatchHistory.user_id == user_id,
        WatchHistory.tmdb_id == tmdb_id,
        WatchHistory.media_type == media_type,
        WatchHistory.season_number == season,
        WatchHistory.episode_number == episode,
    )
    existing = db.execute(stmt).scalar_one_or_none()

    if existing:
        update_stmt = (
            update(WatchHistory)
            .where(WatchHistory.id == existing.id)
            .values(last_position=position, watched_at=datetime.utcnow())
        )
        db.execute(update_stmt)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        watch_entry = WatchHistory(
            user_id=user_id,
            tmdb_id=tmdb_id,
            media_type=media_type,
            season_number=season,
            episode_number=episode,
            last_position=position,
            watched_at=datetime.utcnow(),
        )
        db.add(watch_entry)
        db.commit()
        db.refresh(watch_entry)
        return watch_entry


def get_watch_position(
    db: Session, user_id: uuid.UUID, tmdb_id: int, media_type: str, season: int, episode: int
) -> WatchHistory | None:
    stmt = select(WatchHistory).where(
        WatchHistory.user_id == user_id,
        WatchHistory.tmdb_id == tmdb_id,
        WatchHistory.media_type == media_type,
        WatchHistory.season_number == season,
        WatchHistory.episode_number == episode,
    )
    return db.execute(stmt).scalar_one_or_none()


def get_user_watch_history(
    db: Session, user_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> list[WatchHistory]:
    stmt = (
        select(WatchHistory)
        .where(WatchHistory.user_id == user_id)
        .order_by(WatchHistory.watched_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(db.execute(stmt).scalars().all())
