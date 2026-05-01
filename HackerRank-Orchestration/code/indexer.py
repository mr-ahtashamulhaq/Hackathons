"""
indexer.py — Phase 1: Corpus Indexing
======================================
Traverses the data/ directory, parses all Markdown files, and produces
structured text chunks with metadata ready for downstream retrieval.

Chunking strategy: Header-based splitting.
  • Split each document on Markdown headings (# / ## / ### …).
  • Headings become the section_title of every chunk that follows them.
  • Chunks smaller than MIN_CHUNK_CHARS are merged upward into the
    previous chunk to avoid meaningless tiny fragments.
  • Chunks larger than MAX_CHUNK_CHARS are hard-split at the nearest
    paragraph boundary to keep context windows manageable.

Each chunk dictionary has the shape:
  {
    "id":           str,   # unique identifier  "<company>_<file_stem>_<idx>"
    "company":      str,   # "claude" | "hackerrank" | "visa"
    "source":       str,   # relative path from data/ root
    "section":      str,   # most-recent heading text (or filename if none)
    "text":         str    # actual content (heading included for context)
  }
"""

from __future__ import annotations

import io
import json
import re
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Repository root is one directory above this file
_REPO_ROOT  = Path(__file__).resolve().parent.parent
_DATA_DIR   = _REPO_ROOT / "data"
_INDEX_OUT  = _REPO_ROOT / "code" / "corpus_index.json"

# Company directory names (top-level folders inside data/)
_COMPANIES  = {"claude", "hackerrank", "visa"}

# Chunking thresholds (characters)
MIN_CHUNK_CHARS = 150    # merge chunks shorter than this with the previous one
MAX_CHUNK_CHARS = 2_000  # hard-split chunks longer than this

# Markdown heading regex: matches lines that start with 1-6 '#' characters
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)


# ---------------------------------------------------------------------------
# Step 1: load_documents
# ---------------------------------------------------------------------------

def load_documents(data_dir: str | Path = _DATA_DIR) -> list[dict[str, Any]]:
    """
    Recursively walk *data_dir* and load every ``*.md`` file.

    Returns a list of document dicts:
        {
            "company":  str,   # top-level folder name under data/
            "source":   str,   # path relative to data_dir
            "filename": str,   # stem of the file
            "raw_text": str    # full markdown content
        }
    """
    data_dir = Path(data_dir)
    documents: list[dict[str, Any]] = []

    for md_file in sorted(data_dir.rglob("*.md")):
        rel_path = md_file.relative_to(data_dir)
        parts    = rel_path.parts

        # Skip top-level index.md catalog files (TOC, not help content)
        if md_file.name == "index.md" and len(parts) == 2:
            continue

        # Determine owning company from top-level folder
        company = parts[0].lower() if parts[0].lower() in _COMPANIES else "unknown"

        try:
            raw_text = md_file.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            print(f"[indexer] WARNING: could not read {md_file}: {exc}", file=sys.stderr)
            continue

        if not raw_text.strip():
            continue  # skip empty files

        documents.append(
            {
                "company":  company,
                "source":   str(rel_path).replace("\\", "/"),
                "filename": md_file.stem,
                "raw_text": raw_text,
            }
        )

    return documents


# ---------------------------------------------------------------------------
# Step 2: chunk_documents
# ---------------------------------------------------------------------------

def chunk_documents(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Split each document into header-delimited chunks.

    Returns a flat list of chunk dicts (see module docstring for schema).
    """
    all_chunks: list[dict[str, Any]] = []

    for doc in documents:
        raw      = doc["raw_text"]
        company  = doc["company"]
        source   = doc["source"]
        filename = doc["filename"]

        chunks = _split_by_headings(raw, company, source, filename)
        chunks = _merge_small_chunks(chunks)
        chunks = _split_large_chunks(chunks)

        # Assign final IDs
        for idx, chunk in enumerate(chunks):
            chunk["id"] = f"{company}_{filename}_{idx}"

        all_chunks.extend(chunks)

    return all_chunks


def _split_by_headings(
    text: str, company: str, source: str, filename: str
) -> list[dict[str, Any]]:
    """Split *text* at every Markdown heading."""
    positions = [(m.start(), m.group(2).strip()) for m in _HEADING_RE.finditer(text)]

    if not positions:
        # No headings → treat whole file as one chunk
        return [
            {
                "company": company,
                "source":  source,
                "section": filename,
                "text":    text.strip(),
            }
        ]

    chunks: list[dict[str, Any]] = []

    # Text before the first heading (often YAML front-matter / preamble)
    preamble = text[: positions[0][0]].strip()
    if preamble:
        chunks.append(
            {
                "company": company,
                "source":  source,
                "section": filename,  # use filename as section label for preamble
                "text":    preamble,
            }
        )

    for i, (start, heading) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(text)
        body = text[start:end].strip()
        if body:
            chunks.append(
                {
                    "company": company,
                    "source":  source,
                    "section": heading,
                    "text":    body,
                }
            )

    return chunks


def _merge_small_chunks(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Merge any chunk shorter than MIN_CHUNK_CHARS into the preceding chunk."""
    if not chunks:
        return chunks

    merged: list[dict[str, Any]] = [chunks[0]]
    for chunk in chunks[1:]:
        if len(chunk["text"]) < MIN_CHUNK_CHARS:
            # Append text to previous chunk; keep previous chunk's section label
            merged[-1]["text"] += "\n\n" + chunk["text"]
        else:
            merged.append(chunk)

    return merged


def _split_large_chunks(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Hard-split any chunk longer than MAX_CHUNK_CHARS at paragraph boundaries."""
    result: list[dict[str, Any]] = []
    for chunk in chunks:
        if len(chunk["text"]) <= MAX_CHUNK_CHARS:
            result.append(chunk)
            continue

        sub_chunks = _paragraph_split(chunk["text"], MAX_CHUNK_CHARS)
        for part in sub_chunks:
            result.append(
                {
                    "company": chunk["company"],
                    "source":  chunk["source"],
                    "section": chunk["section"],
                    "text":    part,
                }
            )

    return result


def _paragraph_split(text: str, max_chars: int) -> list[str]:
    """Split *text* into parts ≤ max_chars, breaking at blank lines."""
    paragraphs = re.split(r"\n{2,}", text)
    parts:  list[str] = []
    current = ""

    for para in paragraphs:
        if current and len(current) + len(para) + 2 > max_chars:
            parts.append(current.strip())
            current = para
        else:
            current = (current + "\n\n" + para).strip() if current else para

    if current.strip():
        parts.append(current.strip())

    return parts or [text]


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _hard_cap_chunks(chunks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Safety net: forcibly truncate any chunk whose text exceeds MAX_CHUNK_CHARS
    (should rarely trigger after _split_large_chunks, but keeps the index lean).
    """
    for c in chunks:
        if len(c["text"]) > MAX_CHUNK_CHARS:
            c["text"] = c["text"][:MAX_CHUNK_CHARS].rstrip() + " …"
    return chunks


# ---------------------------------------------------------------------------
# Step 3: build_index
# ---------------------------------------------------------------------------

def build_index(
    data_dir: str | Path = _DATA_DIR,
    save_path: str | Path | None = _INDEX_OUT,
) -> list[dict[str, Any]]:
    """Full pipeline: load → chunk → (optionally save) → return chunks."""
    documents = load_documents(data_dir)
    chunks    = chunk_documents(documents)
    chunks    = _hard_cap_chunks(chunks)

    if save_path:
        save_file = Path(save_path)
        save_file.parent.mkdir(parents=True, exist_ok=True)
        with open(save_file, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)
        print(f"[indexer] Saved {len(chunks)} chunks -> {save_file}")

    return chunks


# ---------------------------------------------------------------------------
# Public helpers used by downstream modules
# ---------------------------------------------------------------------------

def load_index(index_path: str | Path = _INDEX_OUT) -> list[dict[str, Any]]:
    """Load a previously saved index from disk."""
    with open(index_path, "r", encoding="utf-8") as f:
        return json.load(f)
