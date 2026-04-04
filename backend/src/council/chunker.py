from __future__ import annotations

import re
from dataclasses import dataclass

from council.config import settings


@dataclass
class TextChunk:
    content: str
    chapter: str | None = None
    verse_range: str | None = None


def chunk_scripture(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[TextChunk]:
    """Split scripture text into overlapping chunks.

    Tries to respect paragraph / verse boundaries when possible.
    Falls back to word-boundary splitting for continuous prose.
    """
    chunk_size = chunk_size or settings.chunk_size
    chunk_overlap = chunk_overlap or settings.chunk_overlap

    paragraphs = _split_paragraphs(text)
    chunks: list[TextChunk] = []
    current_words: list[str] = []

    for para in paragraphs:
        words = para.split()
        if not words:
            continue

        if len(current_words) + len(words) <= chunk_size:
            current_words.extend(words)
        else:
            if current_words:
                chunks.append(TextChunk(content=" ".join(current_words)))
            # If this paragraph alone exceeds chunk_size, split it
            if len(words) > chunk_size:
                for sub_chunk in _split_words(words, chunk_size, chunk_overlap):
                    chunks.append(TextChunk(content=" ".join(sub_chunk)))
                current_words = []
            else:
                overlap_start = max(0, len(current_words) - chunk_overlap)
                current_words = current_words[overlap_start:] + words

    if current_words:
        chunks.append(TextChunk(content=" ".join(current_words)))

    # Drop chunks that are too short to be meaningful
    MIN_WORDS = 20
    chunks = [c for c in chunks if len(c.content.split()) >= MIN_WORDS]

    return chunks


def _split_paragraphs(text: str) -> list[str]:
    parts = re.split(r"\n\s*\n", text)
    return [p.strip() for p in parts if p.strip()]


def _split_words(
    words: list[str], chunk_size: int, overlap: int
) -> list[list[str]]:
    chunks: list[list[str]] = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(words[start:end])
        start = end - overlap
    return chunks
