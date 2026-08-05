from pathlib import Path
from typing import Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[3]
REPOSITORY_ROOT = BACKEND_ROOT.parent


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str = Field(min_length=32)
    jwt_expires_in_hours: int = Field(default=8, gt=0, le=168)
    cors_origin: str = "http://localhost:3000"
    environment: Literal["development", "test", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    database_pool_min_size: int = Field(default=1, ge=1)
    database_pool_max_size: int = Field(default=10, ge=1)
    database_command_timeout_seconds: float = Field(default=30, gt=0)
    resource_max_upload_mb: int = Field(default=50, gt=0, le=100)
    google_drive_service_account_file: str | None = None
    google_drive_folder_id: str | None = None
    google_drive_oauth_client_id: str | None = None
    google_drive_oauth_client_secret: str | None = None
    google_drive_oauth_client_file: str | None = None
    google_drive_oauth_redirect_uri: str = (
        "http://localhost:3001/api/personnel/online-sessions/google/callback"
    )
    evolution_api_url: str | None = None
    evolution_api_key: str | None = None
    evolution_api_instance: str | None = None
    nvidia_api_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_api_key: str | None = None
    nvidia_ai_model: str = "nvidia/llama-3.3-nemotron-super-49b-v1.5"
    model_config = SettingsConfigDict(
        env_file=(
            REPOSITORY_ROOT / ".env",
            BACKEND_ROOT / ".env",
        ),
        extra="ignore",
    )

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        return value.upper()

    @model_validator(mode="after")
    def validate_pool_sizes(self):
        if self.database_pool_max_size < self.database_pool_min_size:
            raise ValueError(
                "DATABASE_POOL_MAX_SIZE doit être supérieur ou égal "
                "à DATABASE_POOL_MIN_SIZE."
            )
        return self


def get_settings() -> Settings:
    return Settings()
