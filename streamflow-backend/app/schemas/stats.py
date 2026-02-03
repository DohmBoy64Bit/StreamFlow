from datetime import datetime

from pydantic import BaseModel


class ContentStat(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_path: str | None
    watch_count: int


class GlobalStats(BaseModel):
    most_watched_movies: list[ContentStat]
    most_watched_tv_shows: list[ContentStat]
    trending_this_week: list[ContentStat]


class GenreStat(BaseModel):
    id: int
    name: str
    count: int


class WatchTimelineItem(BaseModel):
    tmdb_id: int
    media_type: str
    title: str
    poster_path: str | None
    season_number: int | None
    episode_number: int | None
    last_position: int
    watched_at: datetime


class UserStats(BaseModel):
    total_watch_time_seconds: int
    top_genres: list[GenreStat]
    most_rewatched: list[ContentStat]
    watch_timeline: list[WatchTimelineItem]
