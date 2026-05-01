"""
main.py — Phase 5: Pipeline Orchestration
==========================================
End-to-end triage pipeline that:
  1. Loads and warms up the corpus index + embeddings (once).
  2. Reads each row from the input CSV.
  3. For each ticket: classify → retrieve → evaluate risk → generate response.
  4. Writes results to output.csv in the required strict column order.

Usage:
  python main.py                                 # processes support_tickets.csv
  python main.py --input path/to/tickets.csv     # custom input
  python main.py --sample                        # processes sample_support_tickets.csv

Output:
  support_tickets/output.csv
"""

from __future__ import annotations

import csv
import io
import os
import re
import sys
import time
import argparse
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# ── Path setup (works from any cwd) ────────────────────────────────────────
_REPO_ROOT     = Path(__file__).resolve().parent.parent
_CODE_DIR      = Path(__file__).resolve().parent
sys.path.insert(0, str(_CODE_DIR))

from indexer           import build_index, load_index, _INDEX_OUT
from retriever         import warm_up, retrieve
from classifier        import classify
from risk_evaluator    import evaluate
from response_generator import generate

# ── File paths ──────────────────────────────────────────────────────────────
_TICKETS_DIR    = _REPO_ROOT / "support_tickets"
_INPUT_CSV      = _TICKETS_DIR / "support_tickets.csv"
_SAMPLE_CSV     = _TICKETS_DIR / "sample_support_tickets.csv"
_OUTPUT_CSV     = _TICKETS_DIR / "output.csv"

# ── Output schema (exact column order required by evaluator) ────────────────
_OUTPUT_COLS = [
    "issue", "subject", "company",
    "response", "product_area", "status",
    "request_type", "justification",
]

# ── Company-specific escalation messages ─────────────────────────────────────
_ESCALATION_MESSAGES = {
    "visa":       "Please contact Visa support directly for further assistance with this issue.",
    "hackerrank": "Please reach out to HackerRank support directly for further assistance.",
    "claude":     "Please contact Claude support directly for further assistance.",
}
_ESCALATION_DEFAULT = "Please contact support for further assistance."


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _escalation_response(company: str) -> str:
    return _ESCALATION_MESSAGES.get(company.lower(), _ESCALATION_DEFAULT)


def _normalise_company(raw: str) -> str:
    """Lower-case and validate company field; return 'unknown' if unclear."""
    if not raw or raw.strip().lower() in ("", "none", "nan", "n/a"):
        return "unknown"
    return raw.strip().lower()


def _normalise_area(area: str) -> str:
    """Improvement 5: lowercase, replace spaces with underscores, strip noise."""
    if not area:
        return "general_support"
    return re.sub(r"\s+", "_", area.strip().lower())[:40]


def _safe_field(value: str, fallback: str = "N/A") -> str:
    """Ensure no empty fields make it into the CSV output."""
    v = (value or "").strip()
    return v if v else fallback


def _process_row(row: dict, row_idx: int) -> dict:
    """Run the full pipeline for a single ticket row."""
    issue       = row.get("Issue",   "").strip()
    subject     = row.get("Subject", "").strip()
    company_raw = row.get("Company", "")
    company     = _normalise_company(company_raw)

    # ── 1. Classify ─────────────────────────────────────────────────────────
    classification = classify(issue, subject, company if company != "unknown" else None)
    inferred_company = classification.get("company", "unknown")
    effective_company = inferred_company if inferred_company != "unknown" else company

    # ── 2. Retrieve ─────────────────────────────────────────────────────────
    retrieved_docs = retrieve(
        query   = f"{subject} {issue}".strip(),
        company = effective_company if effective_company != "unknown" else None,
        top_k   = 5,
    )

    # ── 3. Risk evaluation ───────────────────────────────────────────────────
    decision = evaluate(issue, classification, retrieved_docs)
    status   = decision["status"]
    flags    = decision["flags"]

    # ── 4. Response generation ───────────────────────────────────────────────
    if status == "escalated":
        response      = _escalation_response(effective_company)
        justification = f"Escalated. Reasons: {', '.join(flags)}"
    else:
        gen = generate(
            issue          = issue,
            classification = classification,
            retrieved_docs = retrieved_docs,
            status         = status,
            risk_flags     = flags,
        )
        response      = gen["response"]
        justification = gen["justification"]

    return {
        "issue":         _safe_field(issue),
        "subject":       subject or "",
        "company":       company_raw.strip() or "None",
        "response":      _safe_field(response),
        "product_area":  _normalise_area(classification.get("product_area", "")),
        "status":        status.capitalize(),
        "request_type":  _safe_field(classification.get("request_type", ""), "product_issue"),
        "justification": _safe_field(justification),
    }


# ---------------------------------------------------------------------------
# Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(input_csv: Path, output_csv: Path, verbose: bool = True) -> None:
    """Full pipeline: load → process all rows → write output."""

    # Wrap stdout for UTF-8 safety on Windows
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    print("=" * 60)
    print("  SUPPORT TRIAGE PIPELINE")
    print("=" * 60)

    # ── Warm up corpus index + embeddings ───────────────────────────────────
    print("\n[1/4] Loading corpus index and embeddings ...")
    t0 = time.time()
    if not _INDEX_OUT.exists():
        print("      Index not found — building from data/ ...")
        build_index()
    warm_up()   # loads embeddings into memory (from cache if available)
    print(f"      Ready in {time.time() - t0:.1f}s")

    # ── Read input ───────────────────────────────────────────────────────────
    print(f"\n[2/4] Reading input: {input_csv}")
    with open(input_csv, encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        rows   = list(reader)
    print(f"      {len(rows)} tickets found.")

    # ── Process each row ─────────────────────────────────────────────────────
    print(f"\n[3/4] Processing tickets ...")
    results:  list[dict] = []
    failures: list[int]  = []

    for idx, row in enumerate(rows, 1):
        try:
            if verbose:
                issue_preview = (row.get("Issue", "") or "")[:50]
                print(f"      [{idx:03d}/{len(rows)}] {issue_preview} ...")
            result = _process_row(row, idx)
            results.append(result)
        except Exception as exc:
            print(f"      [ERROR] Row {idx} failed: {exc}", file=sys.stderr)
            failures.append(idx)
            # Append a safe escalation placeholder so output row count matches
            results.append({
                "issue":         row.get("Issue", ""),
                "subject":       row.get("Subject", ""),
                "company":       row.get("Company", ""),
                "response":      _ESCALATION_DEFAULT,
                "product_area":  "",
                "status":        "Escalated",
                "request_type":  "invalid",
                "justification": f"Pipeline error on row {idx}: {exc}",
            })

    # ── Write output ─────────────────────────────────────────────────────────
    print(f"\n[4/4] Writing output: {output_csv}")
    output_csv.parent.mkdir(parents=True, exist_ok=True)
    with open(output_csv, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=_OUTPUT_COLS)
        writer.writeheader()
        writer.writerows(results)
    print(f"      Wrote {len(results)} rows.")

    # ── Summary ──────────────────────────────────────────────────────────────
    elapsed  = time.time() - t0
    replied  = sum(1 for r in results if r["status"].lower() == "replied")
    escalated = sum(1 for r in results if r["status"].lower() == "escalated")

    print("\n" + "=" * 60)
    print("  PIPELINE COMPLETE")
    print(f"  Total rows  : {len(results)}")
    print(f"  Replied     : {replied}")
    print(f"  Escalated   : {escalated}")
    print(f"  Failures    : {len(failures)}" + (f" (rows: {failures})" if failures else ""))
    print(f"  Total time  : {elapsed:.1f}s")
    print(f"  Output      : {output_csv}")
    print("=" * 60)

    # ── Print 3 sample rows ──────────────────────────────────────────────────
    print("\n  SAMPLE OUTPUT ROWS (3):")
    print("-" * 60)
    for r in results[:3]:
        print(f"  Issue       : {r['issue'][:70]}")
        print(f"  Status      : {r['status']}  |  type: {r['request_type']}  |  area: {r['product_area']}")
        print(f"  Response    : {r['response'][:120]} ...")
        print(f"  Justification: {r['justification'][:100]} ...")
        print()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Support Triage Pipeline")
    parser.add_argument(
        "--input", "-i",
        default=None,
        help="Path to input CSV (default: support_tickets/support_tickets.csv)"
    )
    parser.add_argument(
        "--sample", "-s",
        action="store_true",
        help="Run on sample_support_tickets.csv instead of the full dataset"
    )
    parser.add_argument(
        "--output", "-o",
        default=str(_OUTPUT_CSV),
        help="Path to output CSV (default: support_tickets/output.csv)"
    )
    args = parser.parse_args()

    if args.sample:
        input_path = _SAMPLE_CSV
    elif args.input:
        input_path = Path(args.input)
    else:
        input_path = _INPUT_CSV

    run_pipeline(input_csv=input_path, output_csv=Path(args.output))
