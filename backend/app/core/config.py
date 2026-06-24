from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql+asyncpg://gitpulse:gitpulse@localhost:5432/gitpulse"

    # Redis
    redis_url: str = "redis://localhost:6379"

    # GitHub
    github_token: str = ""  # optional

    # Groq
    groq_api_key: str = ""

    # CORS
    allowed_origins: str = "http://localhost:5173"

    # App
    app_version: str = "0.1.0"
    cache_ttl_seconds: int = 21_600  # 6 hours

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
