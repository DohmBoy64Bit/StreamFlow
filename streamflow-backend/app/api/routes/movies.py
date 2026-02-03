from typing import Any

from fastapi import APIRouter, Query

from app.schemas.movie import MovieDetails, MovieListResponse
from app.services import movie_service

router = APIRouter(prefix="/movies", tags=["movies"])


@router.get("/trending", response_model=MovieListResponse)
async def get_trending_movies(
    page: int = Query(1, ge=1, le=1000, description="Page number")
) -> MovieListResponse:
    return await movie_service.get_trending_movies(page=page)


@router.get("/popular", response_model=MovieListResponse)
async def get_popular_movies(
    page: int = Query(1, ge=1, le=1000, description="Page number")
) -> MovieListResponse:
    return await movie_service.get_popular_movies(page=page)


@router.get("/top-rated", response_model=MovieListResponse)
async def get_top_rated_movies(
    page: int = Query(1, ge=1, le=1000, description="Page number")
) -> MovieListResponse:
    return await movie_service.get_top_rated_movies(page=page)


@router.get("/search")
async def search_movies(
    query: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, le=1000, description="Page number"),
    genre: int | None = Query(None, description="Genre ID filter"),
    year: int | None = Query(None, ge=1900, le=2100, description="Release year filter"),
) -> dict[str, Any]:
    return await movie_service.search_movies(query=query, page=page, genre=genre, year=year)


@router.get("/{tmdb_id}", response_model=MovieDetails)
async def get_movie_details(tmdb_id: int) -> MovieDetails:
    return await movie_service.get_movie_details(tmdb_id=tmdb_id)
