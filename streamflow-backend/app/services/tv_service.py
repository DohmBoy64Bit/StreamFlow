from typing import Any

from app.integrations.tmdb_client import tmdb_client
from app.schemas.tv import SeasonDetails, TVDetails, TVListResponse


async def get_trending_tv(page: int = 1) -> TVListResponse:
    return await tmdb_client.get_trending(media_type="tv", time_window="week", page=page)  # type: ignore[return-value]


async def get_popular_tv(page: int = 1) -> TVListResponse:
    return await tmdb_client.get_popular_tv(page=page)


async def get_tv_details(tmdb_id: int) -> TVDetails:
    return await tmdb_client.get_tv_details(tmdb_id=tmdb_id)


async def get_season_details(tmdb_id: int, season_number: int) -> SeasonDetails:
    return await tmdb_client.get_season_details(tmdb_id=tmdb_id, season_number=season_number)


async def search_tv(
    query: str,
    page: int = 1,
    genre: int | None = None,
    year: int | None = None,
) -> dict[str, Any]:
    filters = {}
    if genre:
        filters["with_genres"] = genre
    if year:
        filters["first_air_date_year"] = year

    return await tmdb_client.search_multi(query=query, page=page, filters=filters)
