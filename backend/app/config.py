from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://vihavi:vihavi123@localhost:5432/vihavi_db"

    # JWT
    secret_key: str = "vihavi-super-secret-jwt-key-change-in-production-2026"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # App
    app_name: str = "Vihavi API"
    app_version: str = "1.0.0"
    debug: bool = True

    # CORS
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"

    # Admin seed
    admin_email: str = "admin@vihavi.dev"
    admin_password: str = "password"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
