from typing import Literal

from pydantic import BaseModel, Field


class SaveWatchPositionRequest(BaseModel):
    tmdb_id: int = Field(..., gt=0)
    media_type: Literal["movie", "tv", "episode"]
    position: int = Field(..., ge=0)
    season_number: int = Field(default=0, ge=0)
    episode_number: int = Field(default=0, ge=0)


class WatchPositionResponse(BaseModel):
    position: int


class WatchHistoryItem(BaseModel):
    id: str
    tmdb_id: int
    media_type: str
    season_number: int
    episode_number: int
    last_position: int
    watched_at: str


class WatchHistoryResponse(BaseModel):
    items: list[WatchHistoryItem]
    total: int


class PlayerUrlRequest(BaseModel):
    tmdb_id: int = Field(..., gt=0)
    media_type: Literal["movie", "tv"] = Field(default="movie")
    season: int = Field(default=1, ge=1)
    episode: int = Field(default=1, ge=1)


class PlayerUrlResponse(BaseModel):
    primary_url: str
    fallback_urls: list[str]
