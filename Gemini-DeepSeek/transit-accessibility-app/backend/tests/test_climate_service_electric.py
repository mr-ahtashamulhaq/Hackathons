try:
    from backend.services.climate_service import ClimateEngine
except Exception:
    from climate_service import ClimateEngine


def test_climate_engine_electric_uses_carbon_intensity():
    engine = ClimateEngine()

    # distance chosen for easy sanity check
    distance_km = 10.0

    # With 0 gCO2/kWh, electric emissions should be ~0 (in your model)
    r0 = engine.calculate_savings(distance_km, mode="subway", carbon_gco2_per_kwh=0.0)
    assert r0["actual_kg"] == 0.0
    assert r0["co2_saved_kg"] > 0

    # With high carbon intensity, electric emissions should increase (saved should decrease)
    r_high = engine.calculate_savings(distance_km, mode="subway", carbon_gco2_per_kwh=800.0)
    assert r_high["actual_kg"] > 0.0
    assert r_high["co2_saved_kg"] < r0["co2_saved_kg"]
