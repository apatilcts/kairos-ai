from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./backend/ai_mvp.db"
    
    # AI Models
    anthropic_api_key: str = ""
    gemini_api_key: str = ""  # Optional fallback
    ai_provider: str = "claude"  # "claude" or "gemini"
    
    # File Storage
    upload_dir: str = "uploads"
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    allowed_file_types: list = ["pdf", "docx", "txt"]
    
    # Vector Database
    vector_db_path: str = "./vector_db"
    vector_db_collection_name: str = "documents"
    embedding_model: str = "all-MiniLM-L6-v2"
    
    # Chat
    max_chat_history: int = 20
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        # Ensure case-insensitive environment variable matching
        case_sensitive = False

settings = Settings() 