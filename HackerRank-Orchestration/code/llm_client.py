"""
llm_client.py — Centralized LLM execution with Groq API
=========================================================
Handles making requests to the Groq API using the OpenAI-compatible endpoint.
Enforces JSON output and provides a fallback model mechanism.
"""

import json
import os
import sys
import time
from typing import Any

import httpx
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

def generate_json(system_prompt: str, user_prompt: str) -> dict[str, Any]:
    """
    Calls Groq API to generate a strict JSON response.
    Returns the parsed JSON dictionary. A special key `_raw` is injected 
    containing the exact string returned by the LLM for testing/debugging.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.0
    }

    try:
        _MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]
        last_exc: Exception = RuntimeError("No models tried")

        for model in _MODELS:
            payload["model"] = model
            # Retry each model up to 3 times with exponential backoff
            for attempt in range(3):
                try:
                    with httpx.Client(timeout=15.0) as client:
                        resp = client.post(GROQ_ENDPOINT, headers=headers, json=payload)
                    if resp.status_code == 429:
                        wait = 2 ** attempt  # 1s, 2s, 4s
                        print(f"[llm_client] Rate limited (429). Waiting {wait}s before retry {attempt+1}/2...", file=sys.stderr)
                        time.sleep(wait)
                        continue
                    if resp.status_code != 200:
                        print(f"[llm_client] Model '{model}' failed ({resp.status_code}). Trying next model...", file=sys.stderr)
                        last_exc = RuntimeError(f"HTTP {resp.status_code}")
                        break  # try next model
                    # Success
                    data = resp.json()
                    raw_content = data["choices"][0]["message"]["content"]
                    parsed = json.loads(raw_content)
                    parsed["_raw"] = raw_content
                    return parsed
                except (httpx.TimeoutException, httpx.NetworkError) as net_exc:
                    last_exc = net_exc
                    wait = 2 ** attempt
                    print(f"[llm_client] Network error: {net_exc}. Retrying in {wait}s...", file=sys.stderr)
                    time.sleep(wait)
            # All retries exhausted for this model

        raise last_exc

    except Exception as e:
        print(f"[llm_client] API call or parsing failed: {e}", file=sys.stderr)
        raise
