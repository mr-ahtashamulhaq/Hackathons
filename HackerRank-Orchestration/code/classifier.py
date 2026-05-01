"""
classifier.py — Phase 2: Classification Layer
==============================================
Extracts structured metadata (request_type, product_area, company) from an
incoming support ticket using a hybrid approach.

Approach:
  1. Primary: LLM-based classification (if OPENAI_API_KEY is present).
     Uses standard JSON schema enforcement via OpenAI's API.
  2. Fallback: Deterministic Rule-based heuristics.
     Used automatically if no API keys are configured, ensuring the system
     always runs and passes automated tests without network dependencies.
"""

from __future__ import annotations

import json
import os
import re
import sys
from typing import Any

import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ---------------------------------------------------------------------------
# Constants & Allowed Values
# ---------------------------------------------------------------------------

VALID_REQUEST_TYPES = {"product_issue", "feature_request", "bug", "invalid"}
VALID_COMPANIES     = {"claude", "hackerrank", "visa"}

# ---------------------------------------------------------------------------
# Rule-Based / Heuristic Fallback Engine
# ---------------------------------------------------------------------------

def _rule_based_classify(issue: str, subject: str, company: str | None) -> dict[str, str]:
    """Fallback deterministic classifier using keyword matching."""
    text = f"{subject} {issue}".lower()

    # 1. Infer Company
    inferred_company = company.lower() if company and company.lower() in VALID_COMPANIES else None
    if not inferred_company:
        if "claude" in text or "anthropic" in text or "subscription" in text:
            inferred_company = "claude"
        elif "hackerrank" in text or "coding test" in text or "assessment" in text:
            inferred_company = "hackerrank"
        elif "visa" in text or "card" in text or "merchant" in text:
            inferred_company = "visa"
        else:
            inferred_company = "unknown"

    # 2. Infer Request Type
    # Invalid: extremely short or known gibberish patterns
    if len(text.strip()) < 10 or "asdf" in text or "random text" in text:
        req_type = "invalid"
    # Feature requests
    elif any(kw in text for kw in ["add", "feature", "wish", "it would be nice", "support for"]):
        req_type = "feature_request"
    # Bugs / Outages
    elif any(kw in text for kw in ["failed", "deducted", "not loading", "down", "error", "broken", "stolen"]):
        req_type = "bug"
    # Default to normal support
    else:
        req_type = "product_issue"

    # 3. Infer Product Area
    if "log in" in text or "login" in text or "password" in text or "account" in text:
        area = "authentication"
    elif "payment" in text or "money" in text or "card" in text or "billing" in text:
        area = "payments"
    elif "dark mode" in text or "ui" in text:
        area = "user_interface"
    elif "not loading" in text or "down" in text:
        area = "infrastructure"
    elif "coding test" in text or "assessment" in text:
        area = "assessments"
    else:
        area = "general_support"

    if req_type == "invalid":
        area = "unknown"

    return {
        "request_type": req_type,
        "product_area": area,
        "company": inferred_company
    }


# ---------------------------------------------------------------------------
# LLM API Engine (Groq via llm_client)
# ---------------------------------------------------------------------------

def _llm_classify(issue: str, subject: str, company: str | None) -> dict[str, str]:
    """Uses Groq API via llm_client to classify the ticket."""
    from llm_client import generate_json
    
    system_prompt = (
        "You are a strict classifier. Always return valid JSON with keys:\n"
        "request_type, product_area, company.\n\n"
        "Allowed request_type values:\n"
        "product_issue (normal usage/help/support questions),\n"
        "feature_request (asking for new functionality),\n"
        "bug (something broken, failed, not working, error, system issue),\n"
        "invalid (irrelevant, spam, gibberish).\n\n"
        "product_area: Infer a meaningful category (e.g. authentication, billing, payments, user_interface, assessments).\n\n"
        "company: If company is unclear but the issue mentions 'coding test', 'assessment' or 'hackerrank', infer 'hackerrank'. "
        "If it mentions 'card', 'visa', or 'merchant', infer 'visa'. "
        "If it mentions 'claude' or 'anthropic', infer 'claude'. "
        "Otherwise use 'unknown' if not provided.\n\n"
        "Do not explain. Do not add text outside JSON."
    )

    user_content = f"Company Context: {company}\nSubject: {subject}\nIssue: {issue}"

    try:
        result = generate_json(system_prompt, user_content)
        
        # We pop the _raw field just for internal debugging returning clean dict
        raw = result.pop("_raw", "")
        
        # Safety checks against hallucinations
        if result.get("request_type") not in VALID_REQUEST_TYPES:
            result["request_type"] = "product_issue"
        if result.get("company") not in VALID_COMPANIES:
            result["company"] = "unknown"
            
        return {
            "request_type": result.get("request_type", "invalid"),
            "product_area": result.get("product_area", "general"),
            "company": result.get("company", "unknown"),
            "_raw": raw # Pass raw back for the test script
        }
        
    except Exception as e:
        print(f"[classifier] LLM call failed ({e}). Falling back to rules.", file=sys.stderr)
        return _rule_based_classify(issue, subject, company)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def classify(issue: str, subject: str = "", company: str | None = None) -> dict[str, str]:
    """
    Classifies a support ticket into structured metadata.
    
    Returns:
        dict: {"request_type": str, "product_area": str, "company": str}
    """
    if os.getenv("GROQ_API_KEY"):
        return _llm_classify(issue, subject, company)
    else:
        return _rule_based_classify(issue, subject, company)

