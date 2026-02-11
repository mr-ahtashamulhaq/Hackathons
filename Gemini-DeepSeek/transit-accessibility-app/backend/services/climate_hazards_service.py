import os
import csv
import math
from io import StringIO
from typing import Any, Dict, List, Optional, Tuple

import httpx
import xml.etree.ElementTree as ET


NOAA_LATEST_SMOKE_KML = "https://www.ospo.noaa.gov/Products/land/hms/data/latest_smoke_final.kml"


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def _point_in_poly(lon: float, lat: float, poly: List[Tuple[float, float]]) -> bool:
    # ray casting in lon/lat space
    inside = False
    n = len(poly)
    if n < 3:
        return False
    x, y = lon, lat
    for i in range(n):
        x1, y1 = poly[i]
        x2, y2 = poly[(i + 1) % n]
        if ((y1 > y) != (y2 > y)) and (x < (x2 - x1) * (y - y1) / (y2 - y1 + 1e-12) + x1):
            inside = not inside
    return inside


class ClimateHazardsService:
    """
    Part 2:
      - NOAA HMS smoke polygons (KML) for smoke/air-quality risk.
      - NASA FIRMS API (optional) for nearby fire detections.

    Returns "alerts" customized by impairment types.
    """

    def __init__(self) -> None:
        self.noaa_smoke_kml_url = os.getenv("NOAA_SMOKE_KML_URL", NOAA_LATEST_SMOKE_KML).strip()
        self.firms_key = os.getenv("NASA_FIRMS_MAP_KEY", "").strip()

    def get_hazards(self, lat: float, lon: float, impairments: Optional[List[str]] = None) -> Dict[str, Any]:
        impairments = [i.strip().lower() for i in (impairments or []) if i.strip()]

        smoke = self._smoke_risk(lat, lon)
        fires = self._firms_fires_near(lat, lon, radius_km=50.0) if self.firms_key else {"available": False, "count": 0, "closest_km": None}

        hazards: List[Dict[str, Any]] = []
        if smoke["present"]:
            hazards.append({"type": "wildfire_smoke", "severity": smoke["severity"], "source": "NOAA HMS"})
        if fires.get("count", 0) > 0:
            hazards.append({"type": "active_fire_nearby", "severity": "medium", "source": "NASA FIRMS", "closest_km": fires.get("closest_km")})

        alerts = self._impairment_alerts(hazards, impairments)

        return {
            "location": {"lat": lat, "lon": lon},
            "hazards": hazards,
            "smoke_detail": smoke,
            "fire_detail": fires,
            "alerts": alerts,
        }

    # ---------- NOAA smoke ----------
    def _smoke_risk(self, lat: float, lon: float) -> Dict[str, Any]:
        kml_text = self._fetch_text(self.noaa_smoke_kml_url)
        if not kml_text:
            return {"present": False, "severity": "unknown", "matched_polygons": 0}

        polys = self._parse_smoke_polygons(kml_text)

        matched = []
        severity_rank = {"light": 1, "medium": 2, "heavy": 3}
        best = ("unknown", 0)

        for poly, sev in polys:
            if _point_in_poly(lon, lat, poly):
                matched.append(sev)
                s = sev.lower()
                if severity_rank.get(s, 0) > best[1]:
                    best = (s, severity_rank.get(s, 0))

        if not matched:
            return {"present": False, "severity": "none", "matched_polygons": 0}

        return {"present": True, "severity": best[0], "matched_polygons": len(matched)}

    def _fetch_text(self, url: str) -> Optional[str]:
        try:
            with httpx.Client(timeout=12.0) as client:
                r = client.get(url)
            if r.status_code != 200:
                return None
            return r.text
        except Exception:
            return None

    def _parse_smoke_polygons(self, kml_text: str) -> List[Tuple[List[Tuple[float, float]], str]]:
        """
        Returns list of (poly_lonlat, severity_str).
        Tries to infer severity from <name> or <styleUrl>.
        """
        try:
            root = ET.fromstring(kml_text)
        except Exception:
            return []

        # KML often has namespaces; strip by searching with wildcard
        placemarks = root.findall(".//{*}Placemark")
        out: List[Tuple[List[Tuple[float, float]], str]] = []

        for pm in placemarks:
            name_el = pm.find(".//{*}name")
            style_el = pm.find(".//{*}styleUrl")
            name = (name_el.text or "").lower() if name_el is not None else ""
            style = (style_el.text or "").lower() if style_el is not None else ""

            severity = "unknown"
            for key in ("heavy", "medium", "light"):
                if key in name or key in style:
                    severity = key
                    break

            coord_el = pm.find(".//{*}Polygon//{*}outerBoundaryIs//{*}LinearRing//{*}coordinates")
            if coord_el is None or not coord_el.text:
                continue

            coords = []
            for token in coord_el.text.strip().split():
                parts = token.split(",")
                if len(parts) < 2:
                    continue
                try:
                    lo = float(parts[0])
                    la = float(parts[1])
                    coords.append((lo, la))
                except Exception:
                    continue

            if len(coords) >= 3:
                out.append((coords, severity))

        return out

    # ---------- NASA FIRMS (optional) ----------
    def _firms_fires_near(self, lat: float, lon: float, radius_km: float = 50.0, day_range: int = 1) -> Dict[str, Any]:
        """
        Uses FIRMS Area API CSV:
          /api/area/csv/[MAP_KEY]/[SOURCE]/[WEST,SOUTH,EAST,NORTH]/[DAY_RANGE]
        """
        west, south, east, north = self._bbox(lat, lon, radius_km)
        area = f"{west},{south},{east},{north}"
        source = "VIIRS_SNPP_NRT"

        url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{self.firms_key}/{source}/{area}/{int(day_range)}"
        csv_text = self._fetch_text(url)
        if not csv_text:
            return {"available": True, "count": 0, "closest_km": None}

        rows = list(csv.DictReader(StringIO(csv_text)))
        closest = None
        for r in rows:
            try:
                rlat = float(r.get("latitude") or r.get("LATITUDE"))
                rlon = float(r.get("longitude") or r.get("LONGITUDE"))
            except Exception:
                continue
            d = _haversine_km(lat, lon, rlat, rlon)
            if closest is None or d < closest:
                closest = d

        return {"available": True, "count": len(rows), "closest_km": None if closest is None else round(float(closest), 1)}

    def _bbox(self, lat: float, lon: float, radius_km: float) -> Tuple[float, float, float, float]:
        # rough bbox conversion
        dlat = radius_km / 111.0
        dlon = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-9)
        west = max(-180.0, lon - dlon)
        east = min(180.0, lon + dlon)
        south = max(-90.0, lat - dlat)
        north = min(90.0, lat + dlat)
        return (west, south, east, north)

    # ---------- impairment alerts ----------
    def _impairment_alerts(self, hazards: List[Dict[str, Any]], impairments: List[str]) -> List[str]:
        alerts: List[str] = []
        hazard_types = {h.get("type") for h in hazards}

        if "wildfire_smoke" in hazard_types:
            if any(i in impairments for i in ["asthma", "respiratory", "copd"]):
                alerts.append("Air quality may be affected by wildfire smoke. Consider delaying travel or wearing a well-fitting mask.")
            if any(i in impairments for i in ["vision", "low_vision"]):
                alerts.append("Smoke can reduce visibility. Allow extra time and prefer well-lit, familiar routes.")
            if any(i in impairments for i in ["mobility", "wheelchair"]):
                alerts.append("If you travel during smoke, plan for more indoor waiting and minimize long outdoor segments.")

        if "active_fire_nearby" in hazard_types and any(i in impairments for i in ["asthma", "respiratory", "copd"]):
            alerts.append("There are active fire detections nearby; air quality can change quickly. Check conditions before leaving.")

        # generic encouragement
        if hazards and "wildfire_smoke" in hazard_types:
            alerts.append("If possible, choose shorter trips and avoid long outdoor transfers during poorer air conditions.")

        return alerts
