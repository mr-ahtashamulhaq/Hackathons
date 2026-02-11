from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from services.carbon_intensity_service import init_db, lowest_intensity_times, live_latest_intensity, live_recommend_times

router = APIRouter(prefix="/api/climate", tags=["Climate (Carbon Intensity)"])


class LowestIntensityItem(BaseModel):
    ts_utc: str
    carbon_gco2_per_kwh: float


class LiveIntensityResponse(BaseModel):
    raw: Dict[str, Any]


class RecommendTimeItem(BaseModel):
    time: Optional[str] = None
    carbonIntensity: float


@router.get("/lowest-intensity", response_model=List[LowestIntensityItem])
def get_lowest_intensity(
    location: str = Query(..., description="Location name, e.g. 'Vancouver'"),
    limit: int = Query(5, ge=1, le=24, description="How many best hours to return")
):
    init_db()
    rows = lowest_intensity_times(location, limit=limit)
    return [{"ts_utc": ts, "carbon_gco2_per_kwh": val} for ts, val in rows]


# Step 5: live intensity by user location (lat/lon)
@router.get("/carbon-intensity/latest", response_model=Optional[LiveIntensityResponse])
def get_live_carbon_intensity_latest(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    data = live_latest_intensity(lat=lat, lon=lon)
    if not data:
        return None
    return {"raw": data}


# Step 5: recommended low-emission departure times from forecast
@router.get("/carbon-intensity/recommend-times", response_model=List[RecommendTimeItem])
def recommend_low_emission_times(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    top_n: int = Query(3, ge=1, le=10),
    horizon_hours: int = Query(24, ge=1, le=72),
):
    return live_recommend_times(lat=lat, lon=lon, top_n=top_n, horizon_hours=horizon_hours)
