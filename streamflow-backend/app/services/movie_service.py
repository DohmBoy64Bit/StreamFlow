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

    data = await tmdb_client.search_multi(query=query, page=page, filters=filters)
    
    # Filter results for quality and watchability
    if "results" in data:
        filtered_results = []
        for item in data["results"]:
            media_type = item.get("media_type")
            
            # 1. Must be a movie or TV show
            if media_type not in ["movie", "tv"]:
                continue
                
            # 2. Must have a poster (high correlation with metadata quality)
            if not item.get("poster_path"):
                continue
                
            # 3. Must have a release/air date (prevents unreleased/placeholder entries)
            if media_type == "movie":
                if not item.get("release_date"):
                    continue
            elif media_type == "tv":
                if not item.get("first_air_date"):
                    continue
            
            filtered_results.append(item)
            
        data["results"] = filtered_results
        
    return data
