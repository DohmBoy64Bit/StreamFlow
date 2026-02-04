from typing import Any

from fastapi import APIRouter, Query

from app.schemas.movie import GenreListResponse
from app.schemas.tv import SeasonDetails, TVDetails, TVListResponse
from app.services import tv_service

router = APIRouter()


@router.get("/genres", response_model=GenreListResponse)
async def get_tv_genres() -> GenreListResponse:
    return await tv_service.get_genres()  # type: ignore[return-value]


@router.get("/trending", response_model=TVListResponse)
async def get_trending_tv(
    page: int = Query(1, ge=1, le=1000, description="Page number"),
) -> TVListResponse:
    return await tv_service.get_trending_tv(page=page)


@router.get("/popular", response_model=TVListResponse)
async def get_popular_tv(
    page: int = Query(1, ge=1, le=1000, description="Page number"),
) -> TVListResponse:
    return await tv_service.get_popular_tv(page=page)


@router.get("/search")
async def search_tv(
    query: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, le=1000, description="Page number"),
    genre: int | None = Query(None, description="Genre ID filter"),
    year: int | None = Query(None, ge=1900, le=2100, description="First air date year filter"),
) -> dict[str, Any]:
    return await tv_service.search_tv(query=query, page=page, genre=genre, year=year)


@router.get("/{tmdb_id}", response_model=TVDetails)
async def get_tv_details(tmdb_id: int) -> TVDetails:
    return await tv_service.get_tv_details(tmdb_id=tmdb_id)


@router.get("/{tmdb_id}/season/{season_number}", response_model=SeasonDetails)
async def get_season_details(tmdb_id: int, season_number: int) -> SeasonDetails:
    return await tv_service.get_season_details(tmdb_id=tmdb_id, season_number=season_number)
