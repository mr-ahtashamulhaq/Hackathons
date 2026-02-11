import sys
from pathlib import Path

# --- Make backend/services importable in tests ---
SERVICES_DIR = Path(__file__).resolve().parents[1] / "services"
sys.path.insert(0, str(SERVICES_DIR))

# --- Auto-load .env for tests (so no PyCharm config is needed) ---
try:
    from dotenv import load_dotenv
except Exception:
    load_dotenv = None


def pytest_sessionstart(session):
    """
    Load .env automatically at the start of the pytest session.
    Looks for .env at the repo root.
    """
    if load_dotenv is None:
        return

    repo_root = Path(__file__).resolve().parents[2]
    env_path = repo_root / ".env"
    load_dotenv(dotenv_path=env_path, override=False)