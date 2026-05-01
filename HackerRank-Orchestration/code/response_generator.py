"""
response_generator.py — Phase 4: Response Generation
======================================================
Produces the final user-facing response and internal justification
for each support ticket, based on classification, risk decision,
and retrieved corpus chunks.

Core cases:
  ESCALATED → Return a safe, human-handoff message. No answer attempted.
  REPLIED   → Prompt Groq LLM with retrieved chunks as the ONLY allowed
              knowledge source. Strict grounding enforced via system prompt.

Grounding strategy:
  - Only the top-3 retrieved chunks are injected into the prompt.
  - The system prompt explicitly forbids the LLM from using outside knowledge.
  - Scores are included so the LLM can naturally weight stronger evidence.
  - If the LLM call fails, a safe rule-based response is returned.
"""

from __future__ import annotations

import os
import re
import sys
from typing import Any

from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Escalation templates
# ---------------------------------------------------------------------------

_ESCALATION_RESPONSE = (
    "Thank you for reaching out. This issue requires assistance from our "
    "support team and cannot be resolved through automated support. "
    "Please contact our support team directly, and a specialist will help "
    "you as soon as possible."
)

_ESCALATION_REASONS = {
    "lost_or_stolen_card":          "Issue involves a lost or stolen card — must be handled by a human agent.",
    "fraud_or_unauthorized_activity": "Issue involves potential fraud or unauthorized activity.",
    "billing_dispute":              "Issue involves a billing dispute requiring manual review.",
    "account_access_or_locked":     "Issue involves account access or a locked account — security sensitive.",
    "security_concern":             "Issue involves a security or privacy concern.",
    "request_type_is_invalid":      "Issue is invalid, gibberish, or out of scope.",
    "issue_too_short_or_ambiguous": "Issue text is too short or ambiguous to classify safely.",
    "low_retrieval_confidence_score": "No strong matching documents found in the knowledge base.",
}

# Fallback reply when LLM is unavailable
_FALLBACK_REPLY = (
    "Thank you for contacting support. Based on our knowledge base, "
    "we were unable to automatically retrieve a precise answer to your query. "
    "Please try rephrasing your question or contact our support team directly."
)


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _format_docs_for_prompt(retrieved_docs: list[dict[str, Any]], top_n: int = 3) -> str:
    """Format the top-N retrieved chunks into a readable prompt block."""
    lines: list[str] = []
    for i, doc in enumerate(retrieved_docs[:top_n], 1):
        score   = doc.get("score", 0.0)
        section = doc.get("section", "")
        text    = doc.get("text", "").strip()[:600]   # cap per-chunk to stay in token budget
        lines.append(
            f"[SOURCE {i}] (score={score:.3f}) {section}\n{text}"
        )
    return "\n\n".join(lines)


def _grounding_score(response: str, retrieved_docs: list[dict[str, Any]], top_n: int = 3) -> float:
    """
    Improvement 2: Simple word-overlap grounding check.
    Returns fraction of meaningful response words found in the retrieved docs.
    Triggers fallback if overlap < GROUNDING_MIN.
    """
    # Strip stopwords and short tokens
    _STOPWORDS = {
        "the", "a", "an", "is", "in", "it", "of", "to", "and", "or",
        "for", "on", "with", "this", "that", "are", "be", "by", "as",
        "at", "if", "we", "you", "your", "can", "our", "from", "will",
        "not", "have", "has", "was", "were", "do", "did", "does",
        "please", "thank", "hello", "hi", "may", "also", "any",
    }
    corpus_text = " ".join(
        doc.get("text", "") for doc in retrieved_docs[:top_n]
    ).lower()
    response_words = [
        w for w in re.findall(r"[a-z]{4,}", response.lower())
        if w not in _STOPWORDS
    ]
    if not response_words:
        return 1.0  # trivially short — don't block
    matched = sum(1 for w in response_words if w in corpus_text)
    return matched / len(response_words)


GROUNDING_MIN = 0.30   # at least 30% of response words must appear in retrieved docs


def _build_justification_for_escalation(flags: list[str], company: str, top_score: float = 0.0) -> str:
    """Improvement 3: Standardised escalation justification."""
    reasons: list[str] = []
    for flag in flags:
        matched = next(
            (v for k, v in _ESCALATION_REASONS.items() if flag.startswith(k)),
            None,
        )
        if matched and matched not in reasons:
            reasons.append(matched)

    if not reasons:
        reasons = ["Issue could not be resolved safely through automated support."]

    reason_str = "; ".join(reasons)
    return f"Escalated due to: {reason_str}. Retrieval confidence: {top_score:.3f}."


# ---------------------------------------------------------------------------
# LLM-based reply generator
# ---------------------------------------------------------------------------

def _generate_llm_reply(
    issue:          str,
    classification: dict[str, str],
    retrieved_docs: list[dict[str, Any]],
) -> dict[str, str]:
    """Call Groq to produce a grounded reply using retrieved docs."""
    from llm_client import generate_json

    company      = classification.get("company", "the service")
    product_area = classification.get("product_area", "")
    doc_block    = _format_docs_for_prompt(retrieved_docs, top_n=3)
    top_score    = max((d.get("score", 0.0) for d in retrieved_docs), default=0.0)
    top_sections = ", ".join(
        f"'{d.get('section','')[:60]}'" for d in retrieved_docs[:3] if d.get("section")
    )

    system_prompt = (
        "You are a customer support agent. "
        "You MUST answer ONLY using the documentation excerpts provided below. "
        "Do NOT use any external knowledge or make up steps, links, or policies. "
        "If the documentation does not contain enough information, say so politely.\n\n"
        "Return valid JSON with exactly two keys:\n"
        '  "response"      : The user-facing reply (2-6 sentences, clear and actionable).\n'
        '  "justification" : Internal note (1-2 sentences) explaining which source was used and why.'
    )

    user_prompt = (
        f"Customer Issue: {issue}\n"
        f"Product Area  : {product_area}\n"
        f"Company       : {company}\n\n"
        f"--- DOCUMENTATION EXCERPTS ---\n"
        f"{doc_block}\n"
        f"--- END EXCERPTS ---\n\n"
        "Now generate the JSON response."
    )

    result = generate_json(system_prompt, user_prompt)
    result.pop("_raw", None)

    response      = result.get("response", "").strip()
    justification = result.get("justification", "").strip()

    if not response:
        response = _FALLBACK_REPLY

    # Improvement 2: Grounding check
    gs = _grounding_score(response, retrieved_docs)
    if gs < GROUNDING_MIN:
        print(f"[response_generator] Grounding check failed (overlap={gs:.2f}). Forcing escalation.", file=sys.stderr)
        raise ValueError(f"Response not grounded in corpus (overlap={gs:.2f})")

    # Trim responses > 600 chars to keep output concise (Improvement 5)
    if len(response) > 600:
        response = response[:597].rstrip() + "..."

    # Improvement 3: Standardised reply justification
    justification = (
        f"Replied using retrieved documentation with high confidence (score: {top_score:.3f}). "
        f"Relevant sections: [{top_sections}]."
    )

    return {"response": response, "justification": justification}


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate(
    issue:          str,
    classification: dict[str, str],
    retrieved_docs: list[dict[str, Any]],
    status:         str,
    risk_flags:     list[str] | None = None,
) -> dict[str, str]:
    """
    Generate the final response and justification for a support ticket.

    Parameters
    ----------
    issue           : Raw ticket issue text.
    classification  : Output of classifier.classify().
    retrieved_docs  : Output of retriever.retrieve() (with 'score' keys).
    status          : "replied" | "escalated" from risk_evaluator.evaluate().
    risk_flags      : Flags list from risk_evaluator (used to compose escalation justification).

    Returns
    -------
    {"response": str, "justification": str}
    """
    company   = classification.get("company", "unknown")
    top_score = max((d.get("score", 0.0) for d in retrieved_docs), default=0.0)

    # ── CASE 1: Escalation ────────────────────────────────────────────
    if status == "escalated":
        justification = _build_justification_for_escalation(
            flags=risk_flags or [],
            company=company,
            top_score=top_score,
        )
        return {
            "response":      _ESCALATION_RESPONSE,
            "justification": justification,
        }

    # ── CASE 2: Reply ───────────────────────────────────────────────────────
    # Try LLM-based grounded reply first
    if os.getenv("GROQ_API_KEY"):
        try:
            return _generate_llm_reply(issue, classification, retrieved_docs)
        except Exception as exc:
            print(f"[response_generator] LLM failed ({exc}). Using fallback.", file=sys.stderr)

    # Rule-based fallback if LLM is unavailable
    top_doc = retrieved_docs[0] if retrieved_docs else {}
    section = top_doc.get("section", "the relevant section")
    return {
        "response":      _FALLBACK_REPLY,
        "justification": f"LLM unavailable. Top retrieved source: '{section}'.",
    }
