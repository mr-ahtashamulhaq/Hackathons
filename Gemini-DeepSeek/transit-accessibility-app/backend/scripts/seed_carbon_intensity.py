from datetime import datetime, timedelta, timezone
import random

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from services.carbon_intensity_service import init_db, insert_reading
def seed(location: str = "Toronto", hours: int = 24) -> None:
    init_db()

    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(hours=hours)

    for i in range(hours):
        ts = start + timedelta(hours=i)
        hour = ts.hour

        base = 80 if (0 <= hour <= 6) else 140 if (7 <= hour <= 10) else 120 if (11 <= hour <= 16) else 160 if (17 <= hour <= 20) else 100
        value = max(20, base + random.uniform(-10, 10))

        insert_reading(location, value, ts.isoformat())

    print(f"Seeded {hours} readings for {location} into SQLite DB.")

if __name__ == "__main__":
    seed()
