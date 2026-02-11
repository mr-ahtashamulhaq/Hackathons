from services import carbon_intensity_service as cis

def test_insert_and_query_lowest_times(tmp_path, monkeypatch):
    monkeypatch.setattr(cis, "DB_DIR", tmp_path)
    monkeypatch.setattr(cis, "DB_PATH", tmp_path / "carbon_intensity.db")

    cis.init_db()

    cis.insert_reading("Toronto", 120.0, "2026-01-01T00:00:00+00:00")
    cis.insert_reading("Toronto", 80.0,  "2026-01-01T01:00:00+00:00")
    cis.insert_reading("Toronto", 200.0, "2026-01-01T02:00:00+00:00")

    lowest = cis.lowest_intensity_times("Toronto", limit=2)

    assert len(lowest) == 2
    assert lowest[0][1] == 80.0   # smallest
    assert lowest[1][1] == 120.0  # second smallest