"""
MahaGov-Pulse Core Configuration
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MahaGov-Pulse"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "mahagov-pulse-enterprise-super-secret-key-2026-mumbai"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Maharashtra State Configuration
    STATE_NAME: str = "Maharashtra"
    DEFAULT_SLA_HOURS: int = 48
    WARNING_SLA_HOURS: int = 36
    
    # SQLite / PostgreSQL Database URI
    DATABASE_URL: str = "sqlite+aiosqlite:///./mahagov_pulse.db"
    
    # CORS Origins
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:8001",
        "http://127.0.0.1:8001"
    ]
    
    # Sovereign Aadhaar Data Vault (ADV) Secret
    ADV_MASTER_SECRET: str = "MAHA_GOV_ADV_SOVEREIGN_KEY_2026_FIPS140_3"

    # Real e-KYC Gateway Configuration (Sandbox.co.in / Surepass / Cashfree / Setu / Mock)
    AADHAAR_GATEWAY_PROVIDER: str = "sandbox"  # "sandbox" | "surepass" | "cashfree" | "mock"
    AADHAAR_API_KEY: str = ""
    AADHAAR_API_SECRET: str = ""
    AADHAAR_BASE_URL: str = ""

    # Real DigiLocker / MeriPehchaan (National SSO) Credentials
    DIGILOCKER_CLIENT_ID: str = "MAHAGOV_PULSE_OFFICIAL_PROD"
    DIGILOCKER_CLIENT_SECRET: str = ""
    DIGILOCKER_REDIRECT_URI: str = "http://localhost:3000/api/auth/digilocker/callback"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()

