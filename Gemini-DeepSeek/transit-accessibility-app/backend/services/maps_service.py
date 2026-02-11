import httpx
from typing import Any, Dict, List

NOMINATIM_BASE = "https://nominatim.openstreetmap.org"
OSRM_BASE = "https://router.project-osrm.org"

HEADERS = {
    "User-Agent": "transit-accessibility-app/1.0 (school project)"
}

async def geocode(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    params = {"q": query, "format": "json", "limit": limit}
    async with httpx.AsyncClient(timeout=20.0, headers=HEADERS) as client:
        r = await client.get(f"{NOMINATIM_BASE}/search", params=params)
        r.raise_for_status()
        return r.json()

async def route_osrm(
    origin_lat: float, origin_lon: float,
    dest_lat: float, dest_lon: float,
    profile: str = "foot",
) -> Dict[str, Any]:
    coords = f"{origin_lon},{origin_lat};{dest_lon},{dest_lat}"
    params = {"overview": "full", "geometries": "geojson", "steps": "true"}
    async with httpx.AsyncClient(timeout=20.0, headers=HEADERS) as client:
        r = await client.get(f"{OSRM_BASE}/route/v1/{profile}/{coords}", params=params)
        r.raise_for_status()
        return r.json()
