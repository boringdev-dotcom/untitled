from __future__ import annotations

import psycopg
from pgvector.psycopg import register_vector

from council.config import settings

_conn: psycopg.Connection | None = None
_vector_registered: bool = False


def get_connection() -> psycopg.Connection:
    """Return a shared connection. Does NOT register pgvector types —
    call init_db() first to ensure the extension exists."""
    global _conn
    if _conn is None or _conn.closed:
        _conn = psycopg.connect(settings.database_url, autocommit=True)
    return _conn


def _ensure_vector_registered() -> None:
    global _vector_registered
    if not _vector_registered:
        register_vector(get_connection())
        _vector_registered = True


def init_db() -> None:
    conn = get_connection()

    # Extension must exist before we can register the type
    conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    _ensure_vector_registered()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS scripture_chunks (
            id BIGSERIAL PRIMARY KEY,
            faith TEXT NOT NULL,
            book TEXT NOT NULL,
            chapter TEXT,
            verse_range TEXT,
            content TEXT NOT NULL,
            embedding vector(%s),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    """ % settings.embedding_dimensions)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_scripture_chunks_faith
        ON scripture_chunks (faith)
    """)
    conn.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes
                WHERE indexname = 'idx_scripture_chunks_embedding'
            ) THEN
                CREATE INDEX idx_scripture_chunks_embedding
                ON scripture_chunks
                USING hnsw (embedding vector_cosine_ops);
            END IF;
        END
        $$;
    """)


def close_db() -> None:
    global _conn, _vector_registered
    if _conn is not None and not _conn.closed:
        _conn.close()
    _conn = None
    _vector_registered = False
