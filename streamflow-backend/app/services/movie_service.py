from typing import Any

from app.integrations.tmdb_client import tmdb_client
from app.schemas.movie import MovieDetails, MovieListResponse


async def get_trending_movies(page: int = 1) -> MovieListResponse:
    return await tmdb_client.get_trending(media_type="movie", time_window="week", page=page)  # type: ignore[return-value]


async def get_popular_movies(page: int = 1) -> MovieListResponse:
    return await tmdb_client.get_popular_movies(page=page)


async def get_top_rated_movies(page: int = 1) -> MovieListResponse:
    return await tmdb_client.get_top_rated_movies(page=page)


async def get_movie_details(tmdb_id: int) -> MovieDetails:
    return await tmdb_client.get_movie_details(tmdb_id=tmdb_id)


async def search_movies(
    query: str,
    page: int = 1,
    genre: int | None = None,
    year: int | None = None,
    rating: float | None = None,
) -> dict[str, Any]:
    filters = {}
    if genre:
        filters["with_genres"] = genre
    if year:
        filters["year"] = year
    if rating:
        filters["vote_average.gte"] = rating

    return await tmdb_client.search_multi(query=query, page=page, filters=filters)
