"""
retriever.py — Phase 1, Step 2: Retrieval System
==================================================
Loads the structured corpus index (corpus_index.json) built by indexer.py,
generates/caches embeddings, and exposes a single retrieve() function for
semantic search over the support corpus.

Design choices:
  Model : sentence-transformers / all-MiniLM-L6-v2
          - Fully local (no API key), 80 MB, fast on CPU
          - 384-dim vectors; cosine similarity is the standard metric
          - Top public benchmark performer for retrieval tasks at this size

  Storage: Precompute all chunk embeddings once, persist as a .npz file
           alongside the JSON index.  On subsequent calls the .npz is loaded
           in < 1 second instead of re-encoding 6 000+ chunks.

  Search : Pure NumPy cosine similarity (no FAISS required at this scale).
           6 756 chunks × 384 dims ≈ 10 MB matrix — matrix multiply fits in RAM.

Filtering:
  • company="claude" / "hackerrank" / "visa" → restrict search to those chunks.
  • If company is provided but no chunk from that company reaches a minimum
    confidence score, fallback to full corpus search is performed automatically.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

import numpy as np

# ---------------------------------------------------------------------------
# Paths (resolved relative to this file so imports work from any cwd)
# ---------------------------------------------------------------------------
_CODE_DIR  = Path(__file__).resolve().parent
_REPO_ROOT = _CODE_DIR.parent
_INDEX_PATH = _CODE_DIR / "corpus_index.json"
_EMB_CACHE  = _CODE_DIR / "embeddings_cache.npz"

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
_MODEL_NAME       = "all-MiniLM-L6-v2"
_DEFAULT_TOP_K    = 5
_MIN_SCORE        = 0.20   # below this, a match is considered "no result"
_FALLBACK_SCORE   = 0.35   # if filtered results all below this → fallback

# Lazy globals so the model is only loaded once per process
_model    = None   # SentenceTransformer instance
_chunks   = None   # list[dict] from corpus_index.json
_emb_mat  = None   # np.ndarray shape (N, 384)  – normalised


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_model():
    """Load the sentence-transformer model (once per process)."""
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print(f"[retriever] Loading embedding model '{_MODEL_NAME}' ...", flush=True)
        _model = SentenceTransformer(_MODEL_NAME)
        print("[retriever] Model loaded.", flush=True)
    return _model


def _l2_normalize(mat: np.ndarray) -> np.ndarray:
    """Row-wise L2 normalisation (in-place safe)."""
    norms = np.linalg.norm(mat, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)   # avoid division by zero
    return mat / norms


def _load_index() -> list[dict[str, Any]]:
    """Load corpus chunks from disk."""
    if not _INDEX_PATH.exists():
        raise FileNotFoundError(
            f"Corpus index not found at {_INDEX_PATH}. "
            "Run indexer.build_index() first."
        )
    with open(_INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _build_embedding_matrix(chunks: list[dict[str, Any]]) -> np.ndarray:
    """Encode all chunk texts and return an L2-normalised matrix."""
    model = _load_model()
    texts = [c["text"] for c in chunks]
    print(f"[retriever] Encoding {len(texts)} chunks — this may take ~1 min on first run …")
    # batch_size=64 is efficient on CPU without excessive RAM
    mat = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True,
    )
    return _l2_normalize(mat.astype(np.float32))


def _load_or_build_cache() -> tuple[list[dict[str, Any]], np.ndarray]:
    """
    Return (chunks, embedding_matrix).

    If a valid cache exists it is loaded; otherwise embeddings are computed
    and cached to disk.
    """
    global _chunks, _emb_mat

    if _chunks is not None and _emb_mat is not None:
        return _chunks, _emb_mat   # already in memory

    chunks = _load_index()

    if _EMB_CACHE.exists():
        print(f"[retriever] Loading cached embeddings from {_EMB_CACHE.name} …")
        data = np.load(_EMB_CACHE)
        mat  = data["embeddings"]
        # Sanity check: cache must match current index length
        if len(mat) == len(chunks):
            _chunks, _emb_mat = chunks, mat
            print(f"[retriever] Cache OK — {len(chunks)} chunks loaded.")
            return _chunks, _emb_mat
        else:
            print("[retriever] Cache mismatch — rebuilding …")

    # Build fresh
    mat = _build_embedding_matrix(chunks)
    np.savez_compressed(str(_EMB_CACHE), embeddings=mat)
    print(f"[retriever] Embeddings cached to {_EMB_CACHE.name}")

    _chunks, _emb_mat = chunks, mat
    return _chunks, _emb_mat


def _cosine_scores(query_vec: np.ndarray, mat: np.ndarray) -> np.ndarray:
    """
    Return cosine similarity scores for a query against all rows in mat.
    Both query_vec and mat rows must already be L2-normalised.
    """
    return mat @ query_vec.reshape(-1)   # shape (N,)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def warm_up() -> None:
    """
    Pre-load model and embeddings.  Call once at startup to avoid cold-start
    latency on the first retrieve() call.
    """
    _load_or_build_cache()


def retrieve(
    query:   str,
    company: str | None = None,
    top_k:   int = _DEFAULT_TOP_K,
) -> list[dict[str, Any]]:
    """
    Return the *top_k* most relevant corpus chunks for *query*.

    Parameters
    ----------
    query   : The raw support issue or question text.
    company : Optional company filter: "claude" | "hackerrank" | "visa".
              When set, results are first drawn from that company's chunks.
              If no company result exceeds _FALLBACK_SCORE, falls back to
              a full-corpus search so the caller always gets useful results.
    top_k   : Number of results to return (default 5).

    Returns
    -------
    List of chunk dicts, each enriched with a "score" key (float, 0–1).
    """
    chunks, mat = _load_or_build_cache()
    model = _load_model()

    # Encode query (normalised)
    q_vec = model.encode([query], convert_to_numpy=True).astype(np.float32)
    q_vec = _l2_normalize(q_vec)[0]   # shape (384,)

    all_scores: np.ndarray = _cosine_scores(q_vec, mat)   # (N,)

    # ── Company-filtered search ─────────────────────────────────────────────
    if company:
        company_lc = company.lower()
        mask = np.array(
            [c.get("company", "").lower() == company_lc for c in chunks],
            dtype=bool,
        )

        if mask.any():
            # Scores within the company subset
            filtered_scores = np.where(mask, all_scores, -1.0)
            top_idx = int(filtered_scores.argmax())
            best_company_score = float(filtered_scores[top_idx])

            if best_company_score >= _FALLBACK_SCORE:
                # Good match found inside the company — use filtered results
                top_indices = np.argsort(filtered_scores)[::-1][:top_k]
                return _build_results(chunks, filtered_scores, top_indices)

    # ── Full-corpus search (fallback or no company specified) ────────────────
    top_indices = np.argsort(all_scores)[::-1][:top_k]
    return _build_results(chunks, all_scores, top_indices)


def _build_results(
    chunks:  list[dict[str, Any]],
    scores:  np.ndarray,
    indices: np.ndarray,
) -> list[dict[str, Any]]:
    """Package selected chunks into result dicts with a score field."""
    results = []
    for idx in indices:
        chunk = dict(chunks[idx])          # shallow copy — don't mutate cache
        chunk["score"] = round(float(scores[idx]), 4)
        results.append(chunk)
    return results


def is_confident(results: list[dict[str, Any]], threshold: float = _MIN_SCORE) -> bool:
    """
    Returns True if at least one result exceeds *threshold*.
    Downstream modules use this to decide whether to escalate.
    """
    return bool(results) and results[0]["score"] >= threshold
