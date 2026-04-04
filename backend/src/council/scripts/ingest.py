"""Chunk, embed, and ingest scripture texts into PostgreSQL + pgvector.

Usage:  uv run ingest
"""
from __future__ import annotations

import sys
import time
from pathlib import Path

from council.chunker import chunk_scripture
from council.config import settings
from council.db import get_connection, init_db
from council.embeddings import embed_texts

SCRIPTURES_DIR = Path(__file__).resolve().parents[3] / "scriptures"

FAITH_BOOKS: dict[str, list[tuple[str, str]]] = {
    "hinduism": [("bhagavad_gita.txt", "Bhagavad Gita")],
    "islam": [("quran.txt", "Quran")],
    "christianity": [("bible_kjv.txt", "Bible (KJV)")],
    "buddhism": [("dhammapada.txt", "Dhammapada")],
    "judaism": [("tanakh.txt", "Tanakh")],
}

EMBED_BATCH_SIZE = 50


def _strip_gutenberg_header_footer(text: str) -> str:
    """Remove Project Gutenberg boilerplate from start and end."""
    start_markers = [
        "*** START OF THIS PROJECT GUTENBERG",
        "*** START OF THE PROJECT GUTENBERG",
        "***START OF THIS PROJECT GUTENBERG",
        "***START OF THE PROJECT GUTENBERG",
    ]
    end_markers = [
        "*** END OF THIS PROJECT GUTENBERG",
        "*** END OF THE PROJECT GUTENBERG",
        "***END OF THIS PROJECT GUTENBERG",
        "***END OF THE PROJECT GUTENBERG",
        "End of the Project Gutenberg",
        "End of Project Gutenberg",
    ]

    for marker in start_markers:
        idx = text.find(marker)
        if idx != -1:
            newline = text.find("\n", idx)
            if newline != -1:
                text = text[newline + 1:]
            break

    for marker in end_markers:
        idx = text.find(marker)
        if idx != -1:
            text = text[:idx]
            break

    return text.strip()


def main() -> None:
    if "--reset" in sys.argv:
        print("Resetting: dropping scripture_chunks table...")
        conn = get_connection()
        conn.execute("DROP TABLE IF EXISTS scripture_chunks")

    init_db()
    conn = get_connection()

    total_chunks = 0

    for faith, books in FAITH_BOOKS.items():
        for filename, book_name in books:
            filepath = SCRIPTURES_DIR / faith / filename
            if not filepath.exists():
                print(f"  [skip] {filepath} not found — run download-scriptures first")
                continue

            # Check if already ingested
            row = conn.execute(
                "SELECT COUNT(*) FROM scripture_chunks WHERE faith = %s AND book = %s",
                (faith, book_name),
            ).fetchone()
            if row and row[0] > 0:
                print(f"  [skip] {book_name} already ingested ({row[0]} chunks)")
                continue

            print(f"  Processing {book_name} ({faith})...")
            raw_text = filepath.read_text(encoding="utf-8", errors="replace")
            clean_text = _strip_gutenberg_header_footer(raw_text)

            chunks = chunk_scripture(clean_text)
            print(f"    {len(chunks)} chunks created")

            # Embed and insert in batches
            for batch_start in range(0, len(chunks), EMBED_BATCH_SIZE):
                batch = chunks[batch_start : batch_start + EMBED_BATCH_SIZE]
                texts = [c.content for c in batch]

                print(f"    Embedding batch {batch_start // EMBED_BATCH_SIZE + 1}/"
                      f"{(len(chunks) - 1) // EMBED_BATCH_SIZE + 1}...")
                embeddings = embed_texts(texts)

                for chunk, embedding in zip(batch, embeddings):
                    vec_str = "[" + ",".join(str(v) for v in embedding) + "]"
                    conn.execute(
                        """
                        INSERT INTO scripture_chunks
                            (faith, book, chapter, verse_range, content, embedding)
                        VALUES (%s, %s, %s, %s, %s, %s::vector)
                        """,
                        (
                            faith,
                            book_name,
                            chunk.chapter,
                            chunk.verse_range,
                            chunk.content,
                            vec_str,
                        ),
                    )

                total_chunks += len(batch)
                time.sleep(0.5)  # rate-limit courtesy

            print(f"    [done] {book_name}")

    print(f"\nIngestion complete. {total_chunks} new chunks inserted.")


if __name__ == "__main__":
    main()
