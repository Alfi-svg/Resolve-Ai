import json
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "upay_resolveai.db"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Upay ResolveAI Engine"
    VERSION: str = "1.0.0"
    ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    DATABASE_URL: str = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH}"
    POSTGRES_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/upay_resolveai"

    DEMO_AI_MODE: bool = True
    AI_PROVIDER: str = "demo_deterministic"

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
