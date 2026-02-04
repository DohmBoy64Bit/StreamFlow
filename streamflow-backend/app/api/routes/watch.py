from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.db_models import User
from app.schemas.watch import (
    SaveWatchPositionRequest,
    WatchHistoryItem,
    WatchHistoryResponse,
    WatchPositionResponse,
)
from app.services.watch_service import get_resume_position, get_watch_history, record_watch_position

router = APIRouter()


@router.post("/history")
async def save_watch_position(
    request: SaveWatchPositionRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    try:
        watch_entry = await record_watch_position(
            db,
            current_user.id,
            request.tmdb_id,
            request.media_type,
            request.position,
            request.season_number,
            request.episode_number,
        )
        return {"message": "Watch position saved", "id": str(watch_entry.id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save watch position: {str(e)}")


@router.get("/resume/{tmdb_id}", response_model=WatchPositionResponse)
async def get_resume_position_endpoint(
    tmdb_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    media_type: str = Query(..., pattern="^(movie|tv|episode)$"),
    season: int = Query(default=0, ge=0),
    episode: int = Query(default=0, ge=0),
) -> WatchPositionResponse:
    try:
        position = await get_resume_position(db, current_user.id, tmdb_id, media_type, season, episode)
        return WatchPositionResponse(position=position)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get resume position: {str(e)}")


@router.get("/history", response_model=WatchHistoryResponse)
async def get_watch_history_endpoint(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> WatchHistoryResponse:
    try:
        history = await get_watch_history(db, current_user.id, limit, offset)
        items = [
            WatchHistoryItem(
                id=str(item["id"]),
                tmdb_id=item["tmdb_id"],
                media_type=item["media_type"],
                title=item["title"],
                poster_path=item["poster_path"],
                season_number=item["season_number"],
                episode_number=item["episode_number"],
                last_position=item["last_position"],
                watched_at=item["watched_at"].isoformat(),
            )
            for item in history
        ]
        return WatchHistoryResponse(items=items, total=len(items))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get watch history: {str(e)}")
