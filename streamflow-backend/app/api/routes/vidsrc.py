from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from app.integrations.vidsrc_client import vidsrc_client
from app.schemas.watch import PlayerUrlResponse

router = APIRouter()


@router.get("/player/{tmdb_id}", response_model=PlayerUrlResponse)
async def get_player_url(
    tmdb_id: int,
    media_type: Literal["movie", "tv"] = Query(default="movie"),
    season: int = Query(default=1, ge=1),
    episode: int = Query(default=1, ge=1),
) -> PlayerUrlResponse:
    try:
        if media_type == "movie":
            url_data = vidsrc_client.get_movie_embed_url(tmdb_id)
        else:
            url_data = vidsrc_client.get_tv_embed_url(tmdb_id, season, episode)

        return PlayerUrlResponse(
            primary_url=str(url_data["primary_url"]),
            fallback_urls=[str(url) for url in url_data["fallback_urls"]],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate player URL: {str(e)}")
