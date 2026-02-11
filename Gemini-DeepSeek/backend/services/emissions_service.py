from typing import Optional, Dict, Any
from services.climate_service import ClimateEngine


class EmissionsService:
    def __init__(self) -> None:
        self.engine = ClimateEngine()

        # simple speed assumptions to convert minutes -> km for mock routes
        self.SPEED_KMH = {
            "bus": 18.0,
            "subway": 30.0,
            "train": 30.0,
            "skytrain": 30.0,
            "walk": 5.0,
            "bike": 15.0,
            "car": 35.0,
        }

    def estimate_distance_km(self, mode: str, minutes: int) -> float:
        m = (mode or "").lower().strip()
        speed = self.SPEED_KMH.get(m, 20.0)
        return max(0.1, (minutes / 60.0) * speed)

    def estimate_route_emissions(
        self,
        mode: str,
        minutes: int,
        carbon_gco2_per_kwh: Optional[float] = None
    ) -> Dict[str, Any]:
        dist = self.estimate_distance_km(mode=mode, minutes=minutes)
        return self.engine.calculate_savings(dist, mode, carbon_gco2_per_kwh=carbon_gco2_per_kwh)
