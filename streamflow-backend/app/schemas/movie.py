from pydantic import BaseModel, Field


class Genre(BaseModel):
    id: int
    name: str


class CastMember(BaseModel):
    id: int
    name: str
    character: str
    profile_path: str | None = None


class Video(BaseModel):
    id: str
    key: str
    name: str
    site: str
    type: str


class MovieListItem(BaseModel):
    id: int
    title: str
    poster_path: str | None = None
    backdrop_path: str | None = None
    overview: str
    release_date: str | None = None
    vote_average: float
    vote_count: int
    genre_ids: list[int] = Field(default_factory=list)


class MovieDetails(BaseModel):
    id: int
    title: str
    overview: str
    poster_path: str | None = None
    backdrop_path: str | None = None
    release_date: str | None = None
    runtime: int | None = None
    vote_average: float
    vote_count: int
    genres: list[Genre] = Field(default_factory=list)
    cast: list[CastMember] = Field(default_factory=list)
    videos: list[Video] = Field(default_factory=list)
    tagline: str | None = None
    status: str | None = None


class MovieListResponse(BaseModel):
    page: int
    results: list[MovieListItem]
    total_pages: int
    total_results: int


class GenreListResponse(BaseModel):
    genres: list[Genre]
