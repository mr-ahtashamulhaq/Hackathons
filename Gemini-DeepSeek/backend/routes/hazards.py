from fastapi import APIRouter, Query
from typing import List, Optional

from services.climate_hazards_service import ClimateHazardsService

router = APIRouter(prefix="/api/climate", tags=["Climate (Hazards)"])
_haz = ClimateHazardsService()


@router.get("/hazards")
def get_climate_hazards(
    lat: float = Query(...),
    lon: float = Query(...),
    impairments: Optional[str] = Query(None, description="Comma-separated impairments (e.g., 'asthma,vision,wheelchair')")
):
    impairment_list: List[str] = []
    if impairments:
        impairment_list = [x.strip() for x in impairments.split(",") if x.strip()]

    return _haz.get_hazards(lat=lat, lon=lon, impairments=impairment_list)
