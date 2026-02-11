# backend/services/transit_service.py
import os


class TransitService:
    def __init__(self):
        # Zakaria will eventually put Google Maps / Here.com API keys here
        self.api_key = os.getenv("TRANSIT_API_KEY")

    def get_routes(self, origin: str, destination: str):
        """
        Retrieves route options from A to B.

        TODO (Zakaria): Replace this MOCK data with real API calls.
        """
        print(f"DEBUG: Fetching routes from {origin} to {destination}")

        # MOCK DATA: This allows Shlok and Anish to test their parts
        # without waiting for the real Transit API to be built.
        return [
            {
                "id": "route_1",
                "mode": "bus",
                "line": "504 King",
                "distance_km": 5.5,
                "duration_min": 25,
                "accessibility": {"wheelchair": True}
            },
            {
                "id": "route_2",
                "mode": "car",  # Uber/Lyft
                "line": "Private",
                "distance_km": 5.5,
                "duration_min": 15,
                "accessibility": {"wheelchair": False}
            }
        ]