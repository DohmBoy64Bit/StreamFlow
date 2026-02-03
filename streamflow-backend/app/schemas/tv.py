from pydantic import BaseModel, Field

from app.schemas.movie import CastMember, Genre, Video


class Episode(BaseModel):
    id: int
    name: str
    overview: str
    episode_number: int
    season_number: int
    still_path: str | None = None
    air_date: str | None = None
    runtime: int | None = None
    vote_average: float = 0.0
    vote_count: int = 0


class Season(BaseModel):
    id: int
    name: str
    season_number: int
    episode_count: int
    poster_path: str | None = None
    air_date: str | None = None
    overview: str | None = None


class TVListItem(BaseModel):
    id: int
    name: str
    poster_path: str | None = None
    backdrop_path: str | None = None
    overview: str
    first_air_date: str | None = None
    vote_average: float
    vote_count: int
    genre_ids: list[int] = Field(default_factory=list)


class TVDetails(BaseModel):
    id: int
    name: str
    overview: str
    poster_path: str | None = None
    backdrop_path: str | None = None
    first_air_date: str | None = None
    last_air_date: str | None = None
    number_of_seasons: int
    number_of_episodes: int
    vote_average: float
    vote_count: int
    genres: list[Genre] = Field(default_factory=list)
    seasons: list[Season] = Field(default_factory=list)
    cast: list[CastMember] = Field(default_factory=list)
    videos: list[Video] = Field(default_factory=list)
    tagline: str | None = None
    status: str | None = None


class SeasonDetails(BaseModel):
    id: int
    name: str
    season_number: int
    episodes: list[Episode] = Field(default_factory=list)
    poster_path: str | None = None
    air_date: str | None = None
    overview: str | None = None


class TVListResponse(BaseModel):
    page: int
    results: list[TVListItem]
    total_pages: int
    total_results: int
