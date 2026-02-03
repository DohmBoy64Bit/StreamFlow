import pytest

from app.integrations.vidsrc_client import VidsrcClient


@pytest.fixture
def vidsrc_client():
    return VidsrcClient()


def test_get_movie_embed_url(vidsrc_client):
    tmdb_id = 550
    result = vidsrc_client.get_movie_embed_url(tmdb_id)

    assert "primary_url" in result
    assert "fallback_urls" in result
    assert f"/movie/{tmdb_id}" in result["primary_url"]
    assert isinstance(result["fallback_urls"], list)


def test_get_tv_embed_url(vidsrc_client):
    tmdb_id = 1396
    season = 1
    episode = 1
    result = vidsrc_client.get_tv_embed_url(tmdb_id, season, episode)

    assert "primary_url" in result
    assert "fallback_urls" in result
    assert f"/tv/{tmdb_id}/{season}/{episode}" in result["primary_url"]
    assert isinstance(result["fallback_urls"], list)


def test_get_movie_embed_url_structure():
    client = VidsrcClient()

    tmdb_id = 550
    result = client.get_movie_embed_url(tmdb_id)

    assert result["primary_url"].endswith(f"/movie/{tmdb_id}")
    assert all(url.endswith(f"/movie/{tmdb_id}") for url in result["fallback_urls"])


def test_get_tv_embed_url_structure():
    client = VidsrcClient()

    tmdb_id = 1396
    season = 2
    episode = 3
    result = client.get_tv_embed_url(tmdb_id, season, episode)

    assert result["primary_url"].endswith(f"/tv/{tmdb_id}/{season}/{episode}")
    assert all(
        url.endswith(f"/tv/{tmdb_id}/{season}/{episode}") for url in result["fallback_urls"]
    )


def test_fallback_urls_are_different_from_primary():
    client = VidsrcClient()

    tmdb_id = 550
    result = client.get_movie_embed_url(tmdb_id)

    for fallback_url in result["fallback_urls"]:
        assert fallback_url != result["primary_url"]
