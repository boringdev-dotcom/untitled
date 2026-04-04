from __future__ import annotations

from google import genai
from google.genai.types import EmbedContentConfig

from council.config import settings

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.gemini_api_key)
    return _client


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Embed a batch of texts using Gemini embedding model.

    Returns a list of embedding vectors (list of floats) in the same order.
    """
    client = _get_client()
    result = client.models.embed_content(
        model=settings.embedding_model,
        contents=texts,
        config=EmbedContentConfig(
            output_dimensionality=settings.embedding_dimensions,
        ),
    )
    return [e.values for e in result.embeddings]


def embed_single(text: str) -> list[float]:
    return embed_texts([text])[0]
