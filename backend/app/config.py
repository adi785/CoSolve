import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Samarthya - AI Societal Challenge Platform"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./samarthya.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "samarthya-dev-insecure-secret-key-38291480183")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    # AI configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock") # "openai", "gemini", or "mock"
    
    # Upload storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"))
    
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "evidence"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "attachments"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "prototypes"), exist_ok=True)
