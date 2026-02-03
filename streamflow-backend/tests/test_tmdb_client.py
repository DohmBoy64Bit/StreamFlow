import pytest
from unittest.mock import AsyncMock, patch
import httpx
from app.integrations.tmdb_client import TMDBClient
from app.core.exceptions import ExternalAPIError


@pytest.fixture
async def tmdb_client():
    client = TMDBClient()
    yield client
    await client.close()


@pytest.fixture
def mock_movie_list_response():
    return {
        "page": 1,
        "results": [
            {
                "id": 550,
                "title": "Fight Club",
                "poster_path": "/path.jpg",
                "backdrop_path": "/backdrop.jpg",
                "overview": "A great movie",
                "release_date": "1999-10-15",
                "vote_average": 8.4,
                "vote_count": 20000,
                "genre_ids": [18, 53],
            }
        ],
        "total_pages": 10,
        "total_results": 200,
    }


@pytest.fixture
def mock_tv_list_response():
    return {
        "page": 1,
        "results": [
            {
                "id": 1396,
                "name": "Breaking Bad",
                "poster_path": "/path.jpg",
                "backdrop_path": "/backdrop.jpg",
                "overview": "A great show",
                "first_air_date": "2008-01-20",
                "vote_average": 9.2,
                "vote_count": 15000,
                "genre_ids": [18, 80],
            }
        ],
        "total_pages": 10,
        "total_results": 200,
    }


@pytest.fixture
def mock_movie_details_response():
    return {
        "id": 550,
        "title": "Fight Club",
        "overview": "A great movie",
        "poster_path": "/path.jpg",
        "backdrop_path": "/backdrop.jpg",
        "release_date": "1999-10-15",
        "runtime": 139,
        "vote_average": 8.4,
        "vote_count": 20000,
        "genres": [{"id": 18, "name": "Drama"}],
        "tagline": "Mischief. Mayhem. Soap.",
        "status": "Released",
        "credits": {
            "cast": [
                {
                    "id": 287,
                    "name": "Brad Pitt",
                    "character": "Tyler Durden",
                    "profile_path": "/path.jpg",
                }
            ]
        },
        "videos": {
            "results": [
                {
                    "id": "video1",
                    "key": "dQw4w9WgXcQ",
                    "name": "Official Trailer",
                    "site": "YouTube",
                    "type": "Trailer",
                }
            ]
        },
    }


@pytest.fixture
def mock_tv_details_response():
    return {
        "id": 1396,
        "name": "Breaking Bad",
        "overview": "A great show",
        "poster_path": "/path.jpg",
        "backdrop_path": "/backdrop.jpg",
        "first_air_date": "2008-01-20",
        "last_air_date": "2013-09-29",
        "number_of_seasons": 5,
        "number_of_episodes": 62,
        "vote_average": 9.2,
        "vote_count": 15000,
        "genres": [{"id": 18, "name": "Drama"}],
        "tagline": "All bad things must come to an end.",
        "status": "Ended",
        "seasons": [
            {
                "id": 3572,
                "name": "Season 1",
                "season_number": 1,
                "episode_count": 7,
                "poster_path": "/path.jpg",
                "air_date": "2008-01-20",
                "overview": "First season",
            }
        ],
        "credits": {
            "cast": [
                {
                    "id": 17419,
                    "name": "Bryan Cranston",
                    "character": "Walter White",
                    "profile_path": "/path.jpg",
                }
            ]
        },
        "videos": {
            "results": [
                {
                    "id": "video1",
                    "key": "HhesaQXLuRY",
                    "name": "Official Trailer",
                    "site": "YouTube",
                    "type": "Trailer",
                }
            ]
        },
    }


@pytest.fixture
def mock_season_details_response():
    return {
        "id": 3572,
        "name": "Season 1",
        "season_number": 1,
        "poster_path": "/path.jpg",
        "air_date": "2008-01-20",
        "overview": "First season",
        "episodes": [
            {
                "id": 62085,
                "name": "Pilot",
                "overview": "First episode",
                "episode_number": 1,
                "season_number": 1,
                "still_path": "/path.jpg",
                "air_date": "2008-01-20",
                "runtime": 58,
                "vote_average": 8.5,
                "vote_count": 5000,
            }
        ],
    }


@pytest.fixture
def mock_genre_list_response():
    return {
        "genres": [
            {"id": 18, "name": "Drama"},
            {"id": 80, "name": "Crime"},
        ]
    }


@pytest.mark.asyncio
async def test_get_trending_movies(tmdb_client, mock_movie_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_list_response
        result = await tmdb_client.get_trending("movie", "week", 1)
        
        assert result.page == 1
        assert len(result.results) == 1
        assert result.results[0].title == "Fight Club"
        mock_request.assert_called_once_with("/trending/movie/week", {"page": 1})


@pytest.mark.asyncio
async def test_get_trending_tv(tmdb_client, mock_tv_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_tv_list_response
        result = await tmdb_client.get_trending("tv", "week", 1)
        
        assert result.page == 1
        assert len(result.results) == 1
        assert result.results[0].name == "Breaking Bad"


@pytest.mark.asyncio
async def test_get_popular_movies(tmdb_client, mock_movie_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_list_response
        result = await tmdb_client.get_popular_movies(1)
        
        assert result.page == 1
        assert len(result.results) == 1
        assert result.results[0].title == "Fight Club"
        mock_request.assert_called_once_with("/movie/popular", {"page": 1})


@pytest.mark.asyncio
async def test_get_top_rated_movies(tmdb_client, mock_movie_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_list_response
        result = await tmdb_client.get_top_rated_movies(1)
        
        assert result.page == 1
        assert len(result.results) == 1
        mock_request.assert_called_once_with("/movie/top_rated", {"page": 1})


@pytest.mark.asyncio
async def test_get_popular_tv(tmdb_client, mock_tv_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_tv_list_response
        result = await tmdb_client.get_popular_tv(1)
        
        assert result.page == 1
        assert len(result.results) == 1
        assert result.results[0].name == "Breaking Bad"
        mock_request.assert_called_once_with("/tv/popular", {"page": 1})


@pytest.mark.asyncio
async def test_get_movie_details(tmdb_client, mock_movie_details_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_details_response
        result = await tmdb_client.get_movie_details(550)
        
        assert result.id == 550
        assert result.title == "Fight Club"
        assert result.runtime == 139
        assert len(result.cast) == 1
        assert result.cast[0].name == "Brad Pitt"
        assert len(result.videos) == 1
        assert result.videos[0].key == "dQw4w9WgXcQ"
        mock_request.assert_called_once_with("/movie/550", {"append_to_response": "credits,videos"})


@pytest.mark.asyncio
async def test_get_tv_details(tmdb_client, mock_tv_details_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_tv_details_response
        result = await tmdb_client.get_tv_details(1396)
        
        assert result.id == 1396
        assert result.name == "Breaking Bad"
        assert result.number_of_seasons == 5
        assert len(result.seasons) == 1
        assert result.seasons[0].name == "Season 1"
        assert len(result.cast) == 1
        assert result.cast[0].name == "Bryan Cranston"
        mock_request.assert_called_once_with("/tv/1396", {"append_to_response": "credits,videos"})


@pytest.mark.asyncio
async def test_get_season_details(tmdb_client, mock_season_details_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_season_details_response
        result = await tmdb_client.get_season_details(1396, 1)
        
        assert result.id == 3572
        assert result.name == "Season 1"
        assert result.season_number == 1
        assert len(result.episodes) == 1
        assert result.episodes[0].name == "Pilot"
        assert result.episodes[0].runtime == 58
        mock_request.assert_called_once_with("/tv/1396/season/1")


@pytest.mark.asyncio
async def test_search_multi(tmdb_client):
    mock_response = {
        "page": 1,
        "results": [
            {"id": 550, "media_type": "movie", "title": "Fight Club"}
        ],
        "total_pages": 1,
        "total_results": 1,
    }
    
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_response
        result = await tmdb_client.search_multi("Fight Club", page=1)
        
        assert result["page"] == 1
        assert len(result["results"]) == 1
        mock_request.assert_called_once_with("/search/multi", {"query": "Fight Club", "page": 1})


@pytest.mark.asyncio
async def test_search_multi_with_filters(tmdb_client):
    mock_response = {"page": 1, "results": [], "total_pages": 1, "total_results": 0}
    
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_response
        filters = {"year": 1999, "with_genres": "18"}
        result = await tmdb_client.search_multi("Fight", page=1, filters=filters)
        
        assert result["page"] == 1
        mock_request.assert_called_once_with(
            "/search/multi", {"query": "Fight", "page": 1, "year": 1999, "with_genres": "18"}
        )


@pytest.mark.asyncio
async def test_get_genres(tmdb_client, mock_genre_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_genre_list_response
        result = await tmdb_client.get_genres("movie")
        
        assert len(result.genres) == 2
        assert result.genres[0].name == "Drama"
        assert result.genres[1].name == "Crime"
        mock_request.assert_called_once_with("/genre/movie/list")


@pytest.mark.asyncio
async def test_caching_works(tmdb_client, mock_movie_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_list_response
        
        result1 = await tmdb_client.get_popular_movies(1)
        result2 = await tmdb_client.get_popular_movies(1)
        
        assert result1.results[0].title == result2.results[0].title
        mock_request.assert_called_once()


@pytest.mark.asyncio
async def test_api_error_handling(tmdb_client):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.side_effect = ExternalAPIError("TMDB API error: 404 - Not Found")
        
        with pytest.raises(ExternalAPIError) as exc_info:
            await tmdb_client.get_movie_details(999999)
        
        assert "TMDB API error: 404" in str(exc_info.value)


@pytest.mark.asyncio
async def test_network_error_handling(tmdb_client):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.side_effect = ExternalAPIError("TMDB API request failed: Connection failed")
        
        with pytest.raises(ExternalAPIError) as exc_info:
            await tmdb_client.get_popular_movies()
        
        assert "TMDB API request failed" in str(exc_info.value)


@pytest.mark.asyncio
async def test_cache_expiration(tmdb_client, mock_movie_list_response):
    with patch.object(tmdb_client, "_make_request", new_callable=AsyncMock) as mock_request:
        mock_request.return_value = mock_movie_list_response
        
        result1 = await tmdb_client.get_popular_movies(1)
        
        cache_key = "popular_movies_1"
        tmdb_client.cache[cache_key].expires_at = 0
        
        result2 = await tmdb_client.get_popular_movies(1)
        
        assert mock_request.call_count == 2
