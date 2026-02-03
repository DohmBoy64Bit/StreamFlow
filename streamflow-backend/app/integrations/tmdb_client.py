import time
from typing import Any

import httpx

from app.config import settings
from app.core.exceptions import ExternalAPIError
from app.schemas.movie import GenreListResponse, MovieDetails, MovieListResponse
from app.schemas.tv import SeasonDetails, TVDetails, TVListResponse


class CacheEntry:
    def __init__(self, data: Any, ttl: int):
        self.data = data
        self.expires_at = time.time() + ttl


class TMDBClient:
    def __init__(self):
        self.base_url = settings.TMDB_BASE_URL
        self.api_key = settings.TMDB_API_KEY
        self.cache: dict[str, CacheEntry] = {}
        self.client = httpx.AsyncClient(
            timeout=10.0,
            headers={
                "Content-Type": "application/json",
            },
        )

    async def close(self):
        await self.client.aclose()

    def _get_from_cache(self, key: str) -> Any | None:
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry.expires_at:
                return entry.data
            else:
                del self.cache[key]
        return None

    def _set_cache(self, key: str, data: Any, ttl: int):
        self.cache[key] = CacheEntry(data, ttl)

    async def _make_request(self, endpoint: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        try:
            request_params = params.copy() if params else {}
            request_params["api_key"] = self.api_key
            response = await self.client.get(f"{self.base_url}{endpoint}", params=request_params)
            response.raise_for_status()
            return response.json()  # type: ignore[no-any-return]
        except httpx.HTTPStatusError as e:
            raise ExternalAPIError(f"TMDB API error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            raise ExternalAPIError(f"TMDB API request failed: {str(e)}")

    async def get_trending(
        self, media_type: str = "all", time_window: str = "week", page: int = 1
    ) -> MovieListResponse | TVListResponse:
        cache_key = f"trending_{media_type}_{time_window}_{page}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request(f"/trending/{media_type}/{time_window}", {"page": page})

        if media_type == "tv":
            result: MovieListResponse | TVListResponse = TVListResponse(**data)
        else:
            result = MovieListResponse(**data)

        self._set_cache(cache_key, result, ttl=3600)  # 1 hour
        return result

    async def get_popular_movies(self, page: int = 1) -> MovieListResponse:
        cache_key = f"popular_movies_{page}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request("/movie/popular", {"page": page})
        result = MovieListResponse(**data)
        self._set_cache(cache_key, result, ttl=3600)  # 1 hour
        return result

    async def get_top_rated_movies(self, page: int = 1) -> MovieListResponse:
        cache_key = f"top_rated_movies_{page}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request("/movie/top_rated", {"page": page})
        result = MovieListResponse(**data)
        self._set_cache(cache_key, result, ttl=3600)  # 1 hour
        return result

    async def get_popular_tv(self, page: int = 1) -> TVListResponse:
        cache_key = f"popular_tv_{page}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request("/tv/popular", {"page": page})
        result = TVListResponse(**data)
        self._set_cache(cache_key, result, ttl=3600)  # 1 hour
        return result

    async def get_movie_details(self, tmdb_id: int) -> MovieDetails:
        cache_key = f"movie_details_{tmdb_id}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request(
            f"/movie/{tmdb_id}", {"append_to_response": "credits,videos"}
        )

        cast = []
        if "credits" in data and "cast" in data["credits"]:
            cast = [
                {
                    "id": member["id"],
                    "name": member["name"],
                    "character": member["character"],
                    "profile_path": member.get("profile_path"),
                }
                for member in data["credits"]["cast"][:10]  # Limit to top 10
            ]

        videos = []
        if "videos" in data and "results" in data["videos"]:
            videos = [
                {
                    "id": video["id"],
                    "key": video["key"],
                    "name": video["name"],
                    "site": video["site"],
                    "type": video["type"],
                }
                for video in data["videos"]["results"]
                if video["type"] == "Trailer" and video["site"] == "YouTube"
            ]

        movie_data = {
            "id": data["id"],
            "title": data["title"],
            "overview": data["overview"],
            "poster_path": data.get("poster_path"),
            "backdrop_path": data.get("backdrop_path"),
            "release_date": data.get("release_date"),
            "runtime": data.get("runtime"),
            "vote_average": data["vote_average"],
            "vote_count": data["vote_count"],
            "genres": data.get("genres", []),
            "cast": cast,
            "videos": videos,
            "tagline": data.get("tagline"),
            "status": data.get("status"),
        }

        result = MovieDetails(**movie_data)
        self._set_cache(cache_key, result, ttl=86400)  # 24 hours
        return result

    async def get_tv_details(self, tmdb_id: int) -> TVDetails:
        cache_key = f"tv_details_{tmdb_id}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request(
            f"/tv/{tmdb_id}", {"append_to_response": "credits,videos"}
        )

        cast = []
        if "credits" in data and "cast" in data["credits"]:
            cast = [
                {
                    "id": member["id"],
                    "name": member["name"],
                    "character": member["character"],
                    "profile_path": member.get("profile_path"),
                }
                for member in data["credits"]["cast"][:10]  # Limit to top 10
            ]

        videos = []
        if "videos" in data and "results" in data["videos"]:
            videos = [
                {
                    "id": video["id"],
                    "key": video["key"],
                    "name": video["name"],
                    "site": video["site"],
                    "type": video["type"],
                }
                for video in data["videos"]["results"]
                if video["type"] == "Trailer" and video["site"] == "YouTube"
            ]

        seasons = []
        if "seasons" in data:
            seasons = [
                {
                    "id": season["id"],
                    "name": season["name"],
                    "season_number": season["season_number"],
                    "episode_count": season["episode_count"],
                    "poster_path": season.get("poster_path"),
                    "air_date": season.get("air_date"),
                    "overview": season.get("overview"),
                }
                for season in data["seasons"]
            ]

        tv_data = {
            "id": data["id"],
            "name": data["name"],
            "overview": data["overview"],
            "poster_path": data.get("poster_path"),
            "backdrop_path": data.get("backdrop_path"),
            "first_air_date": data.get("first_air_date"),
            "last_air_date": data.get("last_air_date"),
            "number_of_seasons": data["number_of_seasons"],
            "number_of_episodes": data["number_of_episodes"],
            "vote_average": data["vote_average"],
            "vote_count": data["vote_count"],
            "genres": data.get("genres", []),
            "seasons": seasons,
            "cast": cast,
            "videos": videos,
            "tagline": data.get("tagline"),
            "status": data.get("status"),
        }

        result = TVDetails(**tv_data)
        self._set_cache(cache_key, result, ttl=86400)  # 24 hours
        return result

    async def get_season_details(self, tmdb_id: int, season_number: int) -> SeasonDetails:
        cache_key = f"season_details_{tmdb_id}_{season_number}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request(f"/tv/{tmdb_id}/season/{season_number}")

        episodes = []
        if "episodes" in data:
            episodes = [
                {
                    "id": episode["id"],
                    "name": episode["name"],
                    "overview": episode["overview"],
                    "episode_number": episode["episode_number"],
                    "season_number": episode["season_number"],
                    "still_path": episode.get("still_path"),
                    "air_date": episode.get("air_date"),
                    "runtime": episode.get("runtime"),
                    "vote_average": episode.get("vote_average", 0.0),
                    "vote_count": episode.get("vote_count", 0),
                }
                for episode in data["episodes"]
            ]

        season_data = {
            "id": data["id"],
            "name": data["name"],
            "season_number": data["season_number"],
            "episodes": episodes,
            "poster_path": data.get("poster_path"),
            "air_date": data.get("air_date"),
            "overview": data.get("overview"),
        }

        result = SeasonDetails(**season_data)
        self._set_cache(cache_key, result, ttl=86400)  # 24 hours
        return result

    async def search_multi(
        self,
        query: str,
        page: int = 1,
        filters: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        cache_key = f"search_{query}_{page}_{filters}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        params: dict[str, Any] = {"query": query, "page": page}
        if filters:
            params.update(filters)

        data = await self._make_request("/search/multi", params)
        self._set_cache(cache_key, data, ttl=3600)  # 1 hour
        return data

    async def get_genres(self, media_type: str = "movie") -> GenreListResponse:
        cache_key = f"genres_{media_type}"
        cached = self._get_from_cache(cache_key)
        if cached:
            return cached  # type: ignore[no-any-return]

        data = await self._make_request(f"/genre/{media_type}/list")
        result = GenreListResponse(**data)
        self._set_cache(cache_key, result, ttl=31536000)  # 1 year (effectively indefinite)
        return result


tmdb_client = TMDBClient()
