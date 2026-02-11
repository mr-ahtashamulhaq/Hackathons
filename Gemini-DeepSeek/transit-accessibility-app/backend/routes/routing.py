from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict

from services.emissions_service import EmissionsService
from services.electricity_maps_service import ElectricityMapsService

router = APIRouter(prefix="/api", tags=["Route Planning"])

_emit = EmissionsService()
_emaps = ElectricityMapsService()


class RouteOption(BaseModel):
    route_id: str
    origin: str
    destination: str
    mode: str
    estimated_time_minutes: int
    stops_count: int
    accessibility_score: float = Field(..., ge=0, le=100)
    has_elevator: bool
    wheelchair_accessible: bool
    audio_assistance_available: bool

    # New (optional) climate fields
    estimated_co2_kg: Optional[float] = None
    co2_saved_vs_car_kg: Optional[float] = None
    carbon_intensity_gco2_per_kwh: Optional[float] = None


@router.post("/route/plan", response_model=List[RouteOption])
async def plan_accessible_route(
    origin: str = Query(...),
    destination: str = Query(...),
    accessibility_priority: Optional[str] = Query("balanced", description="'accessibility' or 'time'"),
    optimize: Optional[str] = Query("balanced", description="'balanced' | 'time' | 'accessibility' | 'emissions'"),
    lat: Optional[float] = Query(None, description="Latitude (for live carbon intensity)"),
    lon: Optional[float] = Query(None, description="Longitude (for live carbon intensity)"),
):
    # Mock routes (existing behavior)
    routes = [
        RouteOption(
            route_id="route_001",
            origin=origin,
            destination=destination,
            mode="bus",
            estimated_time_minutes=25,
            stops_count=5,
            accessibility_score=95.0,
            has_elevator=True,
            wheelchair_accessible=True,
            audio_assistance_available=True
        ),
        RouteOption(
            route_id="route_002",
            origin=origin,
            destination=destination,
            mode="subway",
            estimated_time_minutes=15,
            stops_count=3,
            accessibility_score=85.0,
            has_elevator=True,
            wheelchair_accessible=True,
            audio_assistance_available=False
        )
    ]

    # Step 5: pull live carbon intensity if provided
    carbon_intensity = None
    if lat is not None and lon is not None:
        latest = _emaps.latest_carbon_intensity(lat=lat, lon=lon)
        if isinstance(latest, dict):
            carbon_intensity = latest.get("carbonIntensity") or latest.get("carbon_intensity") or latest.get("value")
            try:
                carbon_intensity = float(carbon_intensity) if carbon_intensity is not None else None
            except Exception:
                carbon_intensity = None

    # Attach emissions to each route
    enriched: List[RouteOption] = []
    for r in routes:
        est = _emit.estimate_route_emissions(r.mode, r.estimated_time_minutes, carbon_gco2_per_kwh=carbon_intensity)
        r.estimated_co2_kg = est["actual_kg"]
        r.co2_saved_vs_car_kg = est["co2_saved_kg"]
        r.carbon_intensity_gco2_per_kwh = est.get("carbon_intensity_gco2_per_kwh")
        enriched.append(r)

    # Part 1.2: optimize by least pollution if requested
    if (optimize or "").lower() == "emissions":
        enriched.sort(key=lambda x: (x.estimated_co2_kg if x.estimated_co2_kg is not None else 1e9))

    # Keep your existing accessibility_priority behavior (stubbed)
    return enriched
