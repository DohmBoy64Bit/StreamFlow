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
    query: str | None = None,
    page: int = 1,
    genre: int | None = None,
    year: int | None = None,
    rating: float | None = None,
    deep_search: bool = False,
) -> dict[str, Any]:
    filters = {}
    if genre:
        filters["with_genres"] = genre
    if year:
        filters["year"] = year
    if rating:
        filters["vote_average.gte"] = rating

    # Tiered Routing Logic
    if deep_search and query:
        # 1. Deep Search Mode (Broad multi-search)
        data = await tmdb_client.search_multi(query=query, page=page, filters=filters)
    elif not query and filters:
        # 2. Browsing/Discovery Mode (No query, just filters)
        data = await tmdb_client.discover_movies(filters=filters, page=page)
    else:
        # 3. Focused Keyword Search (Query present, filters may be present)
        # Note: TMDB /search/movie ignores filters, so we must apply them locally if present
        if query:
            data = await tmdb_client.search_movies(query=query, page=page)
        else:
            # Fallback to popular if no query and no filters
            return await tmdb_client.get_popular_movies(page=page) # type: ignore[return-value]

    # Quality and Filter Control
    if "results" in data:
        filtered_results = []
        for item in data["results"]:
            media_type = item.get("media_type")
            
            # A. High-Quality Checks
            # For Deep Search, we must ensure it's a movie or TV show
            if deep_search and media_type and media_type not in ["movie", "tv"]:
                continue
            if not item.get("poster_path") or not (item.get("release_date") or item.get("first_air_date")):
                continue

            # B. Local Filter Enforcement (Only needed if query was present since /search ignore filters)
            # discovery mode already filters server-side
            if query and filters and not (deep_search and media_type):
                if genre and genre not in item.get("genre_ids", []):
                    continue
                if year:
                    release_date = item.get("release_date") or item.get("first_air_date") or ""
                    if release_date[:4] != str(year):
                        continue
                if rating and item.get("vote_average", 0) < rating:
                    continue

            filtered_results.append(item)
            
        data["results"] = filtered_results
        
    return data
