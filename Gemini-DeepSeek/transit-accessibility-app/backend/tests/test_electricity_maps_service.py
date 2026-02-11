import pytest

try:
    from backend.services.electricity_maps_service import ElectricityMapsService
except Exception:  # fallback if running with sys.path hacks
    from electricity_maps_service import ElectricityMapsService


def test_emaps_no_key_returns_none_and_empty():
    s = ElectricityMapsService()
    s.api_key = ""  # force "no key"

    assert s.latest_carbon_intensity(49.28, -123.12) is None
    assert s.forecast_carbon_intensity(49.28, -123.12) is None
    assert s.recommend_low_emission_times(49.28, -123.12) == []


def test_emaps_recommend_times_sorts_lowest_first(monkeypatch):
    s = ElectricityMapsService()
    s.api_key = "dummy"  # bypass key check if your code uses it

    # Avoid any HTTP by stubbing forecast output
    def fake_forecast(lat, lon, horizon_hours=24):
        return [
            {"datetime": "t3", "carbonIntensity": 250},
            {"datetime": "t1", "carbonIntensity": 100},
            {"datetime": "t2", "carbonIntensity": 150},
        ]

    monkeypatch.setattr(s, "forecast_carbon_intensity", fake_forecast)

    out = s.recommend_low_emission_times(49.28, -123.12, top_n=2, horizon_hours=24)
    assert out == [
        {"time": "t1", "carbonIntensity": 100.0},
        {"time": "t2", "carbonIntensity": 150.0},
    ]
