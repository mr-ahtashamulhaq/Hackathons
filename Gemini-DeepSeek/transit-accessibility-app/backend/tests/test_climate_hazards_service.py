try:
    from backend.services.climate_hazards_service import ClimateHazardsService
except Exception:
    from climate_hazards_service import ClimateHazardsService


# Minimal KML with ONE polygon that contains (lat=49.28, lon=-123.12)
_FAKE_SMOKE_KML = """<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <Placemark>
      <name>Medium Smoke</name>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              -123.30,49.20,0 -123.00,49.20,0 -123.00,49.40,0 -123.30,49.40,0 -123.30,49.20,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>
  </Document>
</kml>
"""

# Minimal FIRMS CSV with one nearby point
_FAKE_FIRMS_CSV = "latitude,longitude\n49.281,-123.121\n"


def test_hazards_smoke_detected_and_alerts_for_asthma(monkeypatch):
    s = ClimateHazardsService()
    s.firms_key = ""  # force FIRMS off for this test

    def fake_fetch(url: str):
        return _FAKE_SMOKE_KML

    monkeypatch.setattr(s, "_fetch_text", fake_fetch)

    out = s.get_hazards(lat=49.28, lon=-123.12, impairments=["asthma"])

    assert any(h["type"] == "wildfire_smoke" for h in out["hazards"])
    # asthma-specific guidance should appear
    assert any("Air quality" in a for a in out["alerts"])


def test_hazards_firms_enabled_detects_nearby_fire(monkeypatch):
    s = ClimateHazardsService()
    s.firms_key = "dummy"

    def fake_fetch(url: str):
        if "firms.modaps.eosdis.nasa.gov" in url:
            return _FAKE_FIRMS_CSV
        return _FAKE_SMOKE_KML

    monkeypatch.setattr(s, "_fetch_text", fake_fetch)

    out = s.get_hazards(lat=49.28, lon=-123.12, impairments=["respiratory"])
    assert any(h["type"] == "active_fire_nearby" for h in out["hazards"])
    assert out["fire_detail"]["count"] == 1
