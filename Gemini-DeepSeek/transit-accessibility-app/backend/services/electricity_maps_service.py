import os
from typing import Any, Dict, List, Optional

import httpx

class ElectricityMapsService:
    """
    Minimal wrapper around Electricity Maps.
    Uses auth-token header and v3 endpoints.

    Works with sandbox token for demo purposes (data may be non-production).
    """

    def __init__(self) -> None:
        self.api_key = os.getenv("ELECTRICITY_MAPS_API_KEY", "").strip()
        self.base_url = os.getenv("ELECTRICITY_MAPS_BASE_URL", "https://api.electricitymap.org").strip()

    def _get_json(self, path: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if not self.api_key:
            return None
        try:
            url = f"{self.base_url}{path}"
            headers = {"auth-token": self.api_key}
            with httpx.Client(timeout=10.0) as client:
                r = client.get(url, headers=headers, params=params)
            if r.status_code != 200:
                return None
            return r.json()
        except Exception:
            return None

    def latest_carbon_intensity(self, lat: float, lon: float) -> Optional[Dict[str, Any]]:
        """
        GET /v3/carbon-intensity/latest?lat=...&lon=...
        Returns dict including carbonIntensity (gCO2eq/kWh) depending on API response shape.
        """
        return self._get_json("/v3/carbon-intensity/latest", {"lat": lat, "lon": lon})

    def forecast_carbon_intensity(self, lat: float, lon: float, horizon_hours: int = 24) -> Optional[List[Dict[str, Any]]]:
        """
        GET /v3/carbon-intensity/forecast?lat=...&lon=...&horizon=...
        Returns list under forecast/data depending on API response shape.
        """
        data = self._get_json("/v3/carbon-intensity/forecast", {"lat": lat, "lon": lon, "horizon": int(horizon_hours)})
        if not isinstance(data, dict):
            return None
        if isinstance(data.get("forecast"), list):
            return data["forecast"]
        if isinstance(data.get("data"), list):
            return data["data"]
        return None

    @staticmethod
    def _extract_ci_value(point: Dict[str, Any]) -> Optional[float]:
        for k in ("carbonIntensity", "carbon_intensity", "value"):
            v = point.get(k)
            try:
                if v is not None:
                    return float(v)
            except Exception:
                pass
        return None

    def recommend_low_emission_times(self, lat: float, lon: float, top_n: int = 3, horizon_hours: int = 24) -> List[Dict[str, Any]]:
        """
        Returns top_n times with lowest forecast carbon intensity.
        Output: [{"time": "...", "carbonIntensity": 123.0}, ...]
        """
        forecast = self.forecast_carbon_intensity(lat=lat, lon=lon, horizon_hours=horizon_hours)
        if not forecast:
            return []

        scored: List[Dict[str, Any]] = []
        for p in forecast:
            if not isinstance(p, dict):
                continue
            ci = self._extract_ci_value(p)
            if ci is None:
                continue
            scored.append({"time": p.get("datetime") or p.get("time"), "carbonIntensity": ci})

        scored.sort(key=lambda x: x["carbonIntensity"])
        return scored[: max(1, int(top_n))]
