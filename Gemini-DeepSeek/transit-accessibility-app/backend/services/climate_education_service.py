import random
from typing import Dict, Any, Optional


class ClimateEducationService:
    def __init__(self) -> None:
        self.tips = [
            {
                "title": "Cleaner trips, same destination",
                "tip": "If you can shift your departure time to when grid carbon intensity is lower, electric transit indirectly emits less CO2."
            },
            {
                "title": "Walking segments count",
                "tip": "Short walking transfers can reduce emissions compared to short car rides—and often reduce congestion, too."
            },
            {
                "title": "Why carbon intensity matters",
                "tip": "Carbon intensity is how much CO2 is emitted per unit of electricity. It changes hourly depending on what powers the grid."
            },
            {
                "title": "Small changes add up",
                "tip": "Choosing transit over driving on repeat trips can add up to meaningful CO2 savings over a month."
            },
        ]

    def random_tip(self) -> Dict[str, Any]:
        return random.choice(self.tips)

    def tip_for_context(self, has_smoke: bool = False) -> Dict[str, Any]:
        if has_smoke:
            return {
                "title": "Smoke-aware travel",
                "tip": "During wildfire smoke, consider minimizing long outdoor transfers and choose routes with indoor stations when possible."
            }
        return self.random_tip()
