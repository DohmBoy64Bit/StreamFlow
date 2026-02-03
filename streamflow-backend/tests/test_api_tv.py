from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.schemas.tv import Episode, Season, SeasonDetails, TVDetails, TVListItem, TVListResponse
from main import app

client = TestClient(app)


@pytest.fixture
def mock_tv_list_response():
    return TVListResponse(
        page=1,
        results=[
            TVListItem(
                id=1396,
                name="Breaking Bad",
                poster_path="/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
                backdrop_path="/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
                overview="A high school chemistry teacher...",
                first_air_date="2008-01-20",
                vote_average=8.9,
                vote_count=12000,
                genre_ids=[18, 80],
            ),
            TVListItem(
                id=1399,
                name="Game of Thrones",
                poster_path="/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
                backdrop_path="/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
                overview="Seven noble families fight...",
                first_air_date="2011-04-17",
                vote_average=8.4,
                vote_count=15000,
                genre_ids=[18, 10765, 10759],
            ),
        ],
        total_pages=500,
        total_results=10000,
    )


@pytest.fixture
def mock_tv_details():
    return TVDetails(
        id=1396,
        name="Breaking Bad",
        overview="A high school chemistry teacher...",
        poster_path="/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        backdrop_path="/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        first_air_date="2008-01-20",
        last_air_date="2013-09-29",
        number_of_seasons=5,
        number_of_episodes=62,
        vote_average=8.9,
        vote_count=12000,
        genres=[{"id": 18, "name": "Drama"}, {"id": 80, "name": "Crime"}],
        seasons=[
            Season(
                id=3572,
                name="Season 1",
                season_number=1,
                episode_count=7,
                poster_path="/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
                air_date="2008-01-20",
                overview="High school chemistry teacher...",
            )
        ],
        cast=[
            {
                "id": 17419,
                "name": "Bryan Cranston",
                "character": "Walter White",
                "profile_path": "/7Jahy5LZX2Fo8fGJltMlecsUhQ4.jpg",
            }
        ],
        videos=[
            {
                "id": "533ec654c3a36854480003eb",
                "key": "HhesaQXLuRY",
                "name": "Official Trailer",
                "site": "YouTube",
                "type": "Trailer",
            }
        ],
        tagline="All Hail the King",
        status="Ended",
    )


@pytest.fixture
def mock_season_details():
    return SeasonDetails(
        id=3572,
        name="Season 1",
        season_number=1,
        episodes=[
            Episode(
                id=62085,
                name="Pilot",
                overview="When an unassuming high school chemistry teacher...",
                episode_number=1,
                season_number=1,
                still_path="/ydlY3iPfeOAvu8gVqrxPoMvzNCn.jpg",
                air_date="2008-01-20",
                runtime=58,
                vote_average=7.7,
                vote_count=500,
            ),
            Episode(
                id=62086,
                name="Cat's in the Bag...",
                overview="Walt and Jesse attempt to tie up loose ends...",
                episode_number=2,
                season_number=1,
                still_path="/tjDNvbokPLtEnpFyFj7hPjeH9Bh.jpg",
                air_date="2008-01-27",
                runtime=48,
                vote_average=7.5,
                vote_count=450,
            ),
        ],
        poster_path="/1BP4xYv9ZG4ZVHkL7ocOziBbSYH.jpg",
        air_date="2008-01-20",
        overview="High school chemistry teacher...",
    )


@pytest.mark.asyncio
async def test_get_trending_tv(mock_tv_list_response):
    with patch("app.services.tv_service.tmdb_client.get_trending", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_tv_list_response
        response = client.get("/api/v1/tv/trending")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 2
        assert data["results"][0]["name"] == "Breaking Bad"


@pytest.mark.asyncio
async def test_get_trending_tv_with_pagination(mock_tv_list_response):
    with patch("app.services.tv_service.tmdb_client.get_trending", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_tv_list_response
        response = client.get("/api/v1/tv/trending?page=2")
        assert response.status_code == 200
        mock_get.assert_called_once()


@pytest.mark.asyncio
async def test_get_popular_tv(mock_tv_list_response):
    with patch("app.services.tv_service.tmdb_client.get_popular_tv", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_tv_list_response
        response = client.get("/api/v1/tv/popular")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 2


@pytest.mark.asyncio
async def test_get_tv_details(mock_tv_details):
    with patch("app.services.tv_service.tmdb_client.get_tv_details", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_tv_details
        response = client.get("/api/v1/tv/1396")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1396
        assert data["name"] == "Breaking Bad"
        assert data["number_of_seasons"] == 5
        assert data["number_of_episodes"] == 62
        assert len(data["seasons"]) == 1
        assert len(data["cast"]) == 1


@pytest.mark.asyncio
async def test_get_season_details(mock_season_details):
    with patch(
        "app.services.tv_service.tmdb_client.get_season_details", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_season_details
        response = client.get("/api/v1/tv/1396/season/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 3572
        assert data["name"] == "Season 1"
        assert data["season_number"] == 1
        assert len(data["episodes"]) == 2
        assert data["episodes"][0]["name"] == "Pilot"
        assert data["episodes"][0]["episode_number"] == 1


@pytest.mark.asyncio
async def test_search_tv():
    mock_search_result = {
        "page": 1,
        "results": [
            {
                "id": 1396,
                "name": "Breaking Bad",
                "media_type": "tv",
                "overview": "A high school chemistry teacher...",
                "poster_path": "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
                "first_air_date": "2008-01-20",
                "vote_average": 8.9,
            }
        ],
        "total_pages": 1,
        "total_results": 1,
    }

    with patch("app.services.tv_service.tmdb_client.search_multi", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_search_result
        response = client.get("/api/v1/tv/search?query=breaking+bad")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "Breaking Bad"


@pytest.mark.asyncio
async def test_search_tv_with_filters():
    mock_search_result = {
        "page": 1,
        "results": [],
        "total_pages": 0,
        "total_results": 0,
    }

    with patch("app.services.tv_service.tmdb_client.search_multi", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = mock_search_result
        response = client.get("/api/v1/tv/search?query=drama&genre=18&year=2020")
        assert response.status_code == 200
        mock_search.assert_called_once()
        call_kwargs = mock_search.call_args.kwargs
        assert call_kwargs["query"] == "drama"
        assert call_kwargs["filters"]["with_genres"] == 18
        assert call_kwargs["filters"]["first_air_date_year"] == 2020


@pytest.mark.asyncio
async def test_search_tv_missing_query():
    response = client.get("/api/v1/tv/search")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_pagination_validation():
    response = client.get("/api/v1/tv/trending?page=0")
    assert response.status_code == 422

    response = client.get("/api/v1/tv/trending?page=1001")
    assert response.status_code == 422

    with patch("app.services.tv_service.tmdb_client.get_trending", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = TVListResponse(page=1, results=[], total_pages=0, total_results=0)
        response = client.get("/api/v1/tv/trending?page=1")
        assert response.status_code == 200
