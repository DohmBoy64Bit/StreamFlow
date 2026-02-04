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
    query: str | None = None,
    page: int = 1,
    genre: int | None = None,
    year: int | None = None,
    rating: float | None = None,
) -> dict[str, Any]:
    filters = {}
    if genre:
        filters["with_genres"] = genre
    if year:
        filters["first_air_date_year"] = year
    if rating:
        filters["vote_average.gte"] = rating

    # Tiered Routing Logic
    if not query and filters:
        # 1. Browsing/Discovery Mode (No query, just filters)
        data = await tmdb_client.discover_tv(filters=filters, page=page)
    else:
        # 2. Focused Keyword Search (Query present, filters may be present)
        # Note: TMDB /search/tv ignores filters, so we must apply them locally if present
        if query:
            data = await tmdb_client.search_tv(query=query, page=page)
        else:
            # Fallback to popular if no query and no filters
            return await tmdb_client.get_popular_tv(page=page) # type: ignore[return-value]

    # Quality and Filter Control
    if "results" in data:
        filtered_results = []
        for item in data["results"]:
            # A. High-Quality Checks
            if not item.get("poster_path") or not item.get("first_air_date"):
                continue

            # B. Local Filter Enforcement (Only needed if query was present since /search ignores filters)
            if query and filters:
                if genre and genre not in item.get("genre_ids", []):
                    continue
                if year:
                    first_air_date = item.get("first_air_date", "")
                    if first_air_date[:4] != str(year):
                        continue
                if rating and item.get("vote_average", 0) < rating:
                    continue

            filtered_results.append(item)
            
        data["results"] = filtered_results
        
    return data
