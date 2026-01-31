"""
Research-Grade Spatio-Temporal Analytics Backend
Configuration via Pydantic Settings
"""
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",  # Ignore extra env vars like PYTHON_VERSION
    )
    
    # Application
    app_name: str = "District Evolution Analytics API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/i_ascap"
    db_pool_min_size: int = 2
    db_pool_max_size: int = 10
    db_command_timeout: int = 60
    db_query_timeout: int = 30  # Statement timeout in seconds
    
    # Logging
    log_level: str = "INFO"  # DEBUG, INFO, WARNING, ERROR, CRITICAL
    
    # Rate Limiting
    rate_limit_per_minute: int = 60
    rate_limit_burst: int = 20
    
    @property
    def requires_ssl(self) -> bool:
        """Check if database URL requires SSL (e.g., Neon, Supabase)."""
        return "neon.tech" in self.database_url or "sslmode=require" in self.database_url
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://i-ascap.vercel.app",
        "https://i-ascap-git-main-satyamsinhjis-projects.vercel.app",
    ]
    
    # Data Paths
    data_dir: str = "/app/data"
    lineage_csv_path: str = "/app/data/v1/district_lineage.csv"
    
    # Analytics
    bootstrap_iterations: int = 1000
    confidence_level: float = 0.95
    coverage_ratio_tolerance: float = 0.05  # ±5%
    
    # Versioning
    dataset_version: str = "v1.5_harmonized"
    boundary_version: str = "2024-01-15"


@lru_cache
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
