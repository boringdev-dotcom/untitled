"""Download public-domain scripture texts from Project Gutenberg and other sources.

Usage:  uv run download-scriptures
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.request import urlretrieve

SCRIPTURES_DIR = Path(__file__).resolve().parents[3] / "scriptures"

SOURCES: dict[str, list[tuple[str, str]]] = {
    "hinduism": [
        (
            "bhagavad_gita.txt",
            "https://www.gutenberg.org/cache/epub/2388/pg2388.txt",
        ),
    ],
    "islam": [
        (
            "quran.txt",
            "https://www.gutenberg.org/cache/epub/2800/pg2800.txt",
        ),
    ],
    "christianity": [
        (
            "bible_kjv.txt",
            "https://www.gutenberg.org/cache/epub/10/pg10.txt",
        ),
    ],
    "buddhism": [
        (
            "dhammapada.txt",
            "https://www.gutenberg.org/cache/epub/2017/pg2017.txt",
        ),
    ],
    "judaism": [
        # JPS 1917 Tanakh
        (
            "tanakh.txt",
            "https://www.gutenberg.org/cache/epub/8710/pg8710.txt",
        ),
    ],
}


def main() -> None:
    for faith, files in SOURCES.items():
        faith_dir = SCRIPTURES_DIR / faith
        faith_dir.mkdir(parents=True, exist_ok=True)
        for filename, url in files:
            dest = faith_dir / filename
            if dest.exists():
                print(f"  [skip] {dest} already exists")
                continue
            print(f"  Downloading {url} -> {dest}")
            urlretrieve(url, dest)
            print(f"  [done] {dest.name} ({dest.stat().st_size:,} bytes)")

    print("\nAll scriptures downloaded.")


if __name__ == "__main__":
    main()
