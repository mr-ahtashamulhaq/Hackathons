from fastapi import APIRouter, HTTPException, Query
from services.maps_service import geocode, route_osrm

router = APIRouter(prefix="/api/maps", tags=["Maps"])

@router.get("/geocode")
async def maps_geocode(
    q: str = Query(..., min_length=2),
    limit: int = Query(5, ge=1, le=10),
):
    try:
        results = await geocode(q, limit=limit)
        cleaned = []
        for item in results:
            cleaned.append({
                "display_name": item.get("display_name"),
                "lat": float(item["lat"]),
                "lon": float(item["lon"]),
                "type": item.get("type"),
            })
        return {"query": q, "results": cleaned}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Geocoding failed: {e}")

@router.get("/route")
async def maps_route(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    profile: str = Query("foot", pattern="^(foot|driving|cycling)$"),
):
    try:
        data = await route_osrm(origin_lat, origin_lon, dest_lat, dest_lon, profile=profile)
        if data.get("code") != "Ok" or not data.get("routes"):
            raise HTTPException(status_code=400, detail="No route found")

        r0 = data["routes"][0]
        return {
            "profile": profile,
            "distance_m": r0.get("distance"),
            "duration_s": r0.get("duration"),
            "geometry": r0.get("geometry"),  
            "legs": r0.get("legs", []),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Routing failed: {e}")
