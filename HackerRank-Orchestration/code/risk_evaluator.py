"""
risk_evaluator.py — Phase 3: Risk + Decision Engine
=====================================================
Determines whether a support ticket should receive an automated reply
or be escalated to a human agent.

Decision Logic:
  The evaluator runs two independent gates in order:

  GATE 1 — Keyword / Rule-based
    Hard rules that ALWAYS escalate regardless of retrieval quality.
    Covers sensitive, legally/financially risky, or ambiguous cases.

  GATE 2 — Retrieval Confidence
    If GATE 1 passes, inspect the top retrieval score.
    A score below CONFIDENCE_THRESHOLD means the corpus cannot ground a
    trustworthy answer → escalate rather than hallucinate.

  Only if BOTH gates pass does the system reply.
"""

from __future__ import annotations

from typing import Any

# ---------------------------------------------------------------------------
# Constants / Thresholds
# ---------------------------------------------------------------------------

# Minimum cosine similarity for "strong" retrieval grounding.
# Raised to 0.40 (Phase 6): tighter gate reduces weak-answer hallucination risk.
# Genuine matches in this corpus consistently score 0.60+.
CONFIDENCE_THRESHOLD = 0.40

# Uncertain zone: bug tickets need stronger evidence than general queries.
# If score < UNCERTAIN_BUG_THRESHOLD and request is a bug → escalate.
UNCERTAIN_BUG_THRESHOLD = 0.45

# ---------------------------------------------------------------------------
# Sensitive keyword taxonomy
# Each entry is (flag_label, set_of_trigger_phrases)
# ---------------------------------------------------------------------------
_SENSITIVE_RULES: list[tuple[str, list[str]]] = [
    (
        "fraud_or_unauthorized_activity",
        [
            "fraud", "unauthorized", "charge i did not make",
            "someone else", "not me", "hacked", "compromised",
        ],
    ),
    (
        "lost_or_stolen_card",
        [
            "stolen card", "lost card", "card was stolen", "card stolen",
            "lost my card", "card lost", "my card is missing",
            "lost or stolen", "stolen visa", "report a lost",
            "card stolen", "cheques stolen", "cheques were stolen",
        ],
    ),
    (
        "billing_dispute",
        [
            "billing dispute", "wrong charge", "overcharged", "double charged",
            "refund", "chargeback", "disputed charge",
        ],
    ),
    (
        "account_access_or_locked",
        [
            "locked out", "account locked", "suspended account",
            "account suspended", "banned", "cannot access my account",
            "access denied",
        ],
    ),
    (
        "security_concern",
        [
            "security breach", "data breach", "phishing", "suspicious",
            "identity theft", "privacy concern", "data leak",
        ],
    ),
]

# request_types that always escalate
_ALWAYS_ESCALATE_TYPES = {"invalid"}

# Issue length heuristic — very short issues lack enough context
_MIN_ISSUE_CHARS = 8


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _check_sensitive_keywords(text: str) -> list[str]:
    """Return list of triggered rule labels for sensitive content."""
    text_lower = text.lower()
    triggered: list[str] = []
    for label, phrases in _SENSITIVE_RULES:
        if any(p in text_lower for p in phrases):
            triggered.append(label)
    return triggered


def _top_score(retrieved_docs: list[dict[str, Any]]) -> float:
    """Return the highest similarity score from retrieved documents."""
    if not retrieved_docs:
        return 0.0
    return max(float(doc.get("score", 0.0)) for doc in retrieved_docs)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def evaluate(
    issue: str,
    classification: dict[str, str],
    retrieved_docs: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Evaluate risk and decide whether to reply or escalate.

    Parameters
    ----------
    issue           : Raw support issue text.
    classification  : Output of classifier.classify() — {request_type, product_area, company}.
    retrieved_docs  : Output of retriever.retrieve() — list of chunk dicts with 'score' key.

    Returns
    -------
    {
        "status"   : "replied" | "escalated",
        "flags"    : list[str]  # reasons driving the decision
    }
    """
    flags:    list[str] = []
    escalate: bool      = False

    # ── GATE 1A: Automatic escalation by request_type ───────────────────────
    req_type = classification.get("request_type", "invalid")
    if req_type in _ALWAYS_ESCALATE_TYPES:
        flags.append(f"request_type_is_{req_type}")
        escalate = True

    # ── GATE 1B: Issue too short / ambiguous ────────────────────────────────
    if len(issue.strip()) < _MIN_ISSUE_CHARS:
        flags.append("issue_too_short_or_ambiguous")
        escalate = True

    # ── GATE 1C: Sensitive keyword matching ─────────────────────────────────
    triggered = _check_sensitive_keywords(issue)
    if triggered:
        flags.extend(triggered)
        escalate = True

    # ── GATE 2: Retrieval confidence ─────────────────────────────────────────
    top = _top_score(retrieved_docs)
    if top < CONFIDENCE_THRESHOLD:
        flags.append(f"low_retrieval_confidence_score_{top:.3f}")
        escalate = True
    elif req_type == "bug" and top < UNCERTAIN_BUG_THRESHOLD:
        # Uncertain zone: bugs need stronger grounding to avoid wrong answers
        flags.append(f"bug_uncertain_zone_score_{top:.3f}")
        escalate = True
    else:
        flags.append(f"retrieval_confidence_ok_score_{top:.3f}")

    # ── Final decision ───────────────────────────────────────────────────────
    status = "escalated" if escalate else "replied"

    return {
        "status": status,
        "flags":  flags,
    }
