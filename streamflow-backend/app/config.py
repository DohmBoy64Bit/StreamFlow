from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./streamflow.db"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 24

    TMDB_API_KEY: str
    TMDB_BASE_URL: str = "https://api.themoviedb.org/3"

    VIDSRC_PRIMARY_DOMAIN: str = "https://vidsrc.me/embed"
    VIDSRC_FALLBACK_DOMAINS: str = ""

    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    DEBUG: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def vidsrc_fallback_domains_list(self) -> list[str]:
        if not self.VIDSRC_FALLBACK_DOMAINS:
            return []
        return [domain.strip() for domain in self.VIDSRC_FALLBACK_DOMAINS.split(",")]


settings = Settings()  # type: ignore
