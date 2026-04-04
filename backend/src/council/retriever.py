from __future__ import annotations

from council.config import settings
from council.db import get_connection
from council.embeddings import embed_single
from council.schemas import ScriptureChunk


class ScriptureRetriever:
    def retrieve(
        self, query: str, faith: str, top_k: int | None = None
    ) -> list[ScriptureChunk]:
        top_k = top_k or settings.rag_top_k
        query_embedding = embed_single(query)
        conn = get_connection()
        rows = conn.execute(
            """
            SELECT id, faith, book, chapter, verse_range, content
            FROM scripture_chunks
            WHERE faith = %s
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """,
            (faith, _to_pg_vector(query_embedding), top_k),
        ).fetchall()
        return [
            ScriptureChunk(
                id=row[0],
                faith=row[1],
                book=row[2],
                chapter=row[3],
                verse_range=row[4],
                content=row[5],
            )
            for row in rows
        ]


def _to_pg_vector(vec: list[float]) -> str:
    return "[" + ",".join(str(v) for v in vec) + "]"


retriever = ScriptureRetriever()
