from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

from services.climate_service import ClimateEngine
from services.electricity_maps_service import ElectricityMapsService

router = APIRouter(prefix="/api", tags=["Impact Tracking"])

climate_engine = ClimateEngine()
_emaps = ElectricityMapsService()


class TripRequest(BaseModel):
    distance_km: float = Field(..., gt=0, description="Distance traveled in kilometers")
    mode: str = Field(..., description="Transit mode: 'bus', 'walk', 'bike', 'subway', 'car'")

    # Optional: enable live grid carbon-intensity & best-time suggestions
    lat: Optional[float] = Field(None, description="Latitude (for live carbon intensity)")
    lon: Optional[float] = Field(None, description="Longitude (for live carbon intensity)")
    include_recommended_times: bool = Field(False, description="If true, include low-emission departure times")


class ImpactResponse(BaseModel):
    mode: str
    distance_km: float
    baseline_car_kg: float
    actual_kg: float
    co2_saved_kg: float
    points_earned: int

    carbon_intensity_gco2_per_kwh: Optional[float] = None
    recommended_departure_times: Optional[List[Dict[str, Any]]] = None


@router.post("/calculate-impact", response_model=ImpactResponse)
async def calculate_impact(trip: TripRequest):
    if trip.distance_km < 0:
        raise HTTPException(status_code=400, detail="Distance cannot be negative")

    valid_modes = ["bus", "walk", "bike", "subway", "car", "train", "skytrain", "electric"]
    if trip.mode.lower() not in valid_modes:
        raise HTTPException(status_code=400, detail=f"Invalid mode. Must be one of: {', '.join(valid_modes)}")

    carbon_intensity = None
    recommended = None

    # Step 5: If lat/lon + API key exist, use live grid intensity
    if trip.lat is not None and trip.lon is not None:
        latest = _emaps.latest_carbon_intensity(lat=trip.lat, lon=trip.lon)
        if isinstance(latest, dict):
            # try common keys
            carbon_intensity = latest.get("carbonIntensity") or latest.get("carbon_intensity") or latest.get("value")

        # Step 5: recommend low-emission travel times
        if trip.include_recommended_times:
            recommended = _emaps.recommend_low_emission_times(lat=trip.lat, lon=trip.lon, top_n=3, horizon_hours=24) or None

    result = climate_engine.calculate_savings(
        distance_km=trip.distance_km,
        mode=trip.mode,
        carbon_gco2_per_kwh=float(carbon_intensity) if carbon_intensity is not None else None
    )

    if recommended is not None:
        result["recommended_departure_times"] = recommended

    return result
