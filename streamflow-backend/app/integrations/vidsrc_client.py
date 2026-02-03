from app.config import settings


class VidsrcClient:
    def __init__(self):
        self.primary_domain = settings.VIDSRC_PRIMARY_DOMAIN
        self.fallback_domains = settings.vidsrc_fallback_domains_list

    def get_movie_embed_url(self, tmdb_id: int) -> dict[str, str | list[str]]:
        primary_url = f"{self.primary_domain}/movie/{tmdb_id}"
        fallback_urls = [f"{domain}/movie/{tmdb_id}" for domain in self.fallback_domains]

        return {
            "primary_url": primary_url,
            "fallback_urls": fallback_urls,
        }

    def get_tv_embed_url(
        self, tmdb_id: int, season: int, episode: int
    ) -> dict[str, str | list[str]]:
        primary_url = f"{self.primary_domain}/tv/{tmdb_id}/{season}/{episode}"
        fallback_urls = [
            f"{domain}/tv/{tmdb_id}/{season}/{episode}" for domain in self.fallback_domains
        ]

        return {
            "primary_url": primary_url,
            "fallback_urls": fallback_urls,
        }


vidsrc_client = VidsrcClient()
