import uuid

from sqlalchemy.orm import Session

from app.integrations.tmdb_client import tmdb_client
from app.models.db_models import WatchHistory
from app.repositories.history_repo import (
    get_user_watch_history,
    get_watch_position,
    save_watch_position,
)


async def record_watch_position(
    db: Session,
    user_id: uuid.UUID,
    tmdb_id: int,
    media_type: str,
    position: int,
    season: int = 0,
    episode: int = 0,
) -> WatchHistory:
    return save_watch_position(db, user_id, tmdb_id, media_type, season, episode, position)


async def get_resume_position(
    db: Session,
    user_id: uuid.UUID,
    tmdb_id: int,
    media_type: str,
    season: int = 0,
    episode: int = 0,
) -> int:
    watch_entry = get_watch_position(db, user_id, tmdb_id, media_type, season, episode)
    return watch_entry.last_position if watch_entry else 0


async def get_watch_history(
    db: Session, user_id: uuid.UUID, limit: int = 20, offset: int = 0
) -> list[dict]:
    history = get_user_watch_history(db, user_id, limit, offset)
    enriched_history = []
    
    for item in history:
        # Create a base dict from the model
        item_data = {
            "id": item.id,
            "tmdb_id": item.tmdb_id,
            "media_type": item.media_type,
            "season_number": item.season_number,
            "episode_number": item.episode_number,
            "last_position": item.last_position,
            "watched_at": item.watched_at,
            "title": f"TMDB ID: {item.tmdb_id}", # Fallback
            "poster_path": None
        }
        
        try:
            if item.media_type == "movie":
                details = await tmdb_client.get_movie_details(item.tmdb_id)
                item_data["title"] = details.title
                item_data["poster_path"] = details.poster_path
            elif item.media_type == "tv":
                details = await tmdb_client.get_tv_details(item.tmdb_id)
                item_data["title"] = details.name
                item_data["poster_path"] = details.poster_path
        except Exception as e:
            print(f"Failed to fetch metadata for {item.media_type} {item.tmdb_id}: {e}")
            
        enriched_history.append(item_data)
        
    return enriched_history
