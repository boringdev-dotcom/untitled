from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://localhost:5432/council"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-3.1-pro-preview"
    embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = 768
    rag_top_k: int = 8
    chunk_size: int = 500
    chunk_overlap: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
