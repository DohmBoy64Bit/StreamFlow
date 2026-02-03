import uuid
from datetime import datetime, timedelta

from sqlalchemy import distinct, func, select
from sqlalchemy.orm import Session

from app.models.db_models import WatchHistory


def get_most_watched_movie(db: Session, limit: int = 10) -> list[dict]:
    stmt = (
        select(
            WatchHistory.tmdb_id,
            func.count(WatchHistory.id).label("watch_count"),
        )
        .where(WatchHistory.media_type == "movie")
        .group_by(WatchHistory.tmdb_id)
        .order_by(func.count(WatchHistory.id).desc())
        .limit(limit)
    )
    results = db.execute(stmt).all()
    return [{"tmdb_id": row.tmdb_id, "watch_count": row.watch_count} for row in results]


def get_most_watched_tv_show(db: Session, limit: int = 10) -> list[dict]:
    stmt = (
        select(
            WatchHistory.tmdb_id,
            func.count(distinct(WatchHistory.user_id)).label("watch_count"),
        )
        .where(WatchHistory.media_type == "tv")
        .group_by(WatchHistory.tmdb_id)
        .order_by(func.count(distinct(WatchHistory.user_id)).desc())
        .limit(limit)
    )
    results = db.execute(stmt).all()
    return [{"tmdb_id": row.tmdb_id, "watch_count": row.watch_count} for row in results]


def get_trending_this_week(db: Session, limit: int = 10) -> list[dict]:
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    stmt = (
        select(
            WatchHistory.tmdb_id,
            WatchHistory.media_type,
            func.count(WatchHistory.id).label("watch_count"),
        )
        .where(WatchHistory.watched_at >= one_week_ago)
        .group_by(WatchHistory.tmdb_id, WatchHistory.media_type)
        .order_by(func.count(WatchHistory.id).desc())
        .limit(limit)
    )
    results = db.execute(stmt).all()
    return [
        {"tmdb_id": row.tmdb_id, "media_type": row.media_type, "watch_count": row.watch_count}
        for row in results
    ]


def get_user_total_watch_time(db: Session, user_id: uuid.UUID) -> int:
    stmt = select(func.sum(WatchHistory.last_position)).where(WatchHistory.user_id == user_id)
    result = db.execute(stmt).scalar()
    return result or 0


def get_user_top_genres(db: Session, user_id: uuid.UUID, limit: int = 5) -> list[dict]:
    stmt = (
        select(WatchHistory.tmdb_id, WatchHistory.media_type)
        .where(WatchHistory.user_id == user_id)
        .distinct()
    )
    results = db.execute(stmt).all()
    return [{"tmdb_id": row.tmdb_id, "media_type": row.media_type} for row in results]


def get_user_most_rewatched(db: Session, user_id: uuid.UUID, limit: int = 10) -> list[dict]:
    stmt = (
        select(
            WatchHistory.tmdb_id,
            WatchHistory.media_type,
            func.count(WatchHistory.id).label("watch_count"),
        )
        .where(WatchHistory.user_id == user_id)
        .group_by(WatchHistory.tmdb_id, WatchHistory.media_type)
        .having(func.count(WatchHistory.id) > 1)
        .order_by(func.count(WatchHistory.id).desc())
        .limit(limit)
    )
    results = db.execute(stmt).all()
    return [
        {"tmdb_id": row.tmdb_id, "media_type": row.media_type, "watch_count": row.watch_count}
        for row in results
    ]


def get_user_watch_timeline(db: Session, user_id: uuid.UUID, limit: int = 50) -> list[WatchHistory]:
    stmt = (
        select(WatchHistory)
        .where(WatchHistory.user_id == user_id)
        .order_by(WatchHistory.watched_at.desc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())
