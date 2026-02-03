from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.db_models import User
from app.schemas.stats import GlobalStats, UserStats
from app.services.stats_service import get_global_stats, get_user_stats

router = APIRouter()


@router.get("/global", response_model=GlobalStats)
async def get_global_statistics(
    db: Annotated[Session, Depends(get_db)],
) -> GlobalStats:
    try:
        return await get_global_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get global stats: {str(e)}")


@router.get("/user", response_model=UserStats)
async def get_user_statistics(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
) -> UserStats:
    try:
        return await get_user_stats(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user stats: {str(e)}")
