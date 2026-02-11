try:
    from backend.services.emissions_service import EmissionsService
except Exception:
    from emissions_service import EmissionsService


def test_emissions_service_distance_estimate_reasonable():
    s = EmissionsService()

    # 60 min bus @ 18 km/h -> ~18 km
    d = s.estimate_distance_km("bus", 60)
    assert 17.0 <= d <= 19.0

    # Ensure it never returns 0
    assert s.estimate_distance_km("bus", 0) > 0


def test_emissions_service_route_emissions_includes_expected_fields():
    s = EmissionsService()
    out = s.estimate_route_emissions("bus", minutes=30)

    # Minimal contract: same keys ClimateEngine returns
    assert "actual_kg" in out
    assert "co2_saved_kg" in out
    assert "baseline_car_kg" in out


def test_emissions_service_electric_respects_carbon_intensity():
    s = EmissionsService()

    low = s.estimate_route_emissions("subway", minutes=30, carbon_gco2_per_kwh=0.0)
    high = s.estimate_route_emissions("subway", minutes=30, carbon_gco2_per_kwh=900.0)

    assert low["actual_kg"] < high["actual_kg"]
    assert low["co2_saved_kg"] > high["co2_saved_kg"]
