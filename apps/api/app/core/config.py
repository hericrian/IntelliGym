from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "IntelliGym API"
    environment: Literal["development", "production", "test"] = "development"
    frontend_url: str = "http://localhost:5173"
    backend_cors_origins: str = "http://localhost:5173"

    firebase_project_id: str | None = Field(default=None, alias="FIREBASE_PROJECT_ID")
    firebase_client_email: str | None = Field(default=None, alias="FIREBASE_CLIENT_EMAIL")
    firebase_private_key: str | None = Field(default=None, alias="FIREBASE_PRIVATE_KEY")

    ai_provider: str | None = Field(default=None, alias="AI_PROVIDER")
    ai_api_key: str | None = Field(default=None, alias="AI_API_KEY")
    ai_model: str | None = Field(default=None, alias="AI_MODEL")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
