try:
    from backend.services.climate_education_service import ClimateEducationService
except Exception:
    from climate_education_service import ClimateEducationService


def test_education_random_tip_has_expected_shape():
    s = ClimateEducationService()
    tip = s.random_tip()
    assert "title" in tip and isinstance(tip["title"], str)
    assert "tip" in tip and isinstance(tip["tip"], str)
    assert tip["title"].strip()
    assert tip["tip"].strip()


def test_education_smoke_context_tip():
    s = ClimateEducationService()
    tip = s.tip_for_context(has_smoke=True)
    assert "Smoke" in tip["title"] or "smoke" in tip["tip"].lower()
