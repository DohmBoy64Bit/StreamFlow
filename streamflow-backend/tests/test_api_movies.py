from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.schemas.movie import MovieDetails, MovieListItem, MovieListResponse
from main import app

client = TestClient(app)


@pytest.fixture
def mock_movie_list_response():
    return MovieListResponse(
        page=1,
        results=[
            MovieListItem(
                id=550,
                title="Fight Club",
                poster_path="/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
                backdrop_path="/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
                overview="A ticking-time-bomb insomniac...",
                release_date="1999-10-15",
                vote_average=8.4,
                vote_count=26280,
                genre_ids=[18, 53, 35],
            ),
            MovieListItem(
                id=278,
                title="The Shawshank Redemption",
                poster_path="/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                backdrop_path="/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
                overview="Framed in the 1940s...",
                release_date="1994-09-23",
                vote_average=8.7,
                vote_count=23000,
                genre_ids=[18, 80],
            ),
        ],
        total_pages=500,
        total_results=10000,
    )


@pytest.fixture
def mock_movie_details():
    return MovieDetails(
        id=550,
        title="Fight Club",
        overview="A ticking-time-bomb insomniac...",
        poster_path="/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
        backdrop_path="/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg",
        release_date="1999-10-15",
        runtime=139,
        vote_average=8.4,
        vote_count=26280,
        genres=[{"id": 18, "name": "Drama"}, {"id": 53, "name": "Thriller"}],
        cast=[
            {
                "id": 287,
                "name": "Brad Pitt",
                "character": "Tyler Durden",
                "profile_path": "/cckcYc2v0yh1tc9QjRelptcOBko.jpg",
            }
        ],
        videos=[
            {
                "id": "533ec654c3a36854480003eb",
                "key": "SUXWAEX2jlg",
                "name": "Official Trailer",
                "site": "YouTube",
                "type": "Trailer",
            }
        ],
        tagline="Mischief. Mayhem. Soap.",
        status="Released",
    )


@pytest.mark.asyncio
async def test_get_trending_movies(mock_movie_list_response):
    with patch(
        "app.services.movie_service.tmdb_client.get_trending", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_movie_list_response
        response = client.get("/api/v1/movies/trending")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 2
        assert data["results"][0]["title"] == "Fight Club"


@pytest.mark.asyncio
async def test_get_trending_movies_with_pagination(mock_movie_list_response):
    with patch(
        "app.services.movie_service.tmdb_client.get_trending", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_movie_list_response
        response = client.get("/api/v1/movies/trending?page=2")
        assert response.status_code == 200
        mock_get.assert_called_once()


@pytest.mark.asyncio
async def test_get_popular_movies(mock_movie_list_response):
    with patch(
        "app.services.movie_service.tmdb_client.get_popular_movies", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_movie_list_response
        response = client.get("/api/v1/movies/popular")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 2


@pytest.mark.asyncio
async def test_get_top_rated_movies(mock_movie_list_response):
    with patch(
        "app.services.movie_service.tmdb_client.get_top_rated_movies", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_movie_list_response
        response = client.get("/api/v1/movies/top-rated")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 2


@pytest.mark.asyncio
async def test_get_movie_details(mock_movie_details):
    with patch(
        "app.services.movie_service.tmdb_client.get_movie_details", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = mock_movie_details
        response = client.get("/api/v1/movies/550")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 550
        assert data["title"] == "Fight Club"
        assert data["runtime"] == 139
        assert len(data["cast"]) == 1
        assert len(data["videos"]) == 1


@pytest.mark.asyncio
async def test_search_movies():
    mock_search_result = {
        "page": 1,
        "results": [
            {
                "id": 550,
                "title": "Fight Club",
                "media_type": "movie",
                "overview": "A ticking-time-bomb insomniac...",
                "poster_path": "/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg",
                "release_date": "1999-10-15",
                "vote_average": 8.4,
            }
        ],
        "total_pages": 1,
        "total_results": 1,
    }

    with patch(
        "app.services.movie_service.tmdb_client.search_multi", new_callable=AsyncMock
    ) as mock_search:
        mock_search.return_value = mock_search_result
        response = client.get("/api/v1/movies/search?query=fight+club")
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["results"]) == 1
        assert data["results"][0]["title"] == "Fight Club"


@pytest.mark.asyncio
async def test_search_movies_with_filters():
    mock_search_result = {
        "page": 1,
        "results": [],
        "total_pages": 0,
        "total_results": 0,
    }

    with patch(
        "app.services.movie_service.tmdb_client.search_multi", new_callable=AsyncMock
    ) as mock_search:
        mock_search.return_value = mock_search_result
        response = client.get("/api/v1/movies/search?query=action&genre=28&year=2020")
        assert response.status_code == 200
        mock_search.assert_called_once()
        call_kwargs = mock_search.call_args.kwargs
        assert call_kwargs["query"] == "action"
        assert call_kwargs["filters"]["with_genres"] == 28
        assert call_kwargs["filters"]["year"] == 2020


@pytest.mark.asyncio
async def test_search_movies_missing_query():
    response = client.get("/api/v1/movies/search")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_pagination_validation():
    response = client.get("/api/v1/movies/trending?page=0")
    assert response.status_code == 422

    response = client.get("/api/v1/movies/trending?page=1001")
    assert response.status_code == 422

    with patch(
        "app.services.movie_service.tmdb_client.get_trending", new_callable=AsyncMock
    ) as mock_get:
        mock_get.return_value = MovieListResponse(
            page=1, results=[], total_pages=0, total_results=0
        )
        response = client.get("/api/v1/movies/trending?page=1")
        assert response.status_code == 200
