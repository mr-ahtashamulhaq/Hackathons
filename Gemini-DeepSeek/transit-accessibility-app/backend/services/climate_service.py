from typing import Optional, Dict, Any


class ClimateEngine:
    def __init__(self):
        # Emission factors (kg CO2 per km) - direct tailpipe style estimates
        self.EMISSION_CAR = 0.171
        self.EMISSION_BUS = 0.089
        self.EMISSION_WALK = 0.0
        self.EMISSION_BIKE = 0.0

        # Electric-mode energy intensity (kWh per passenger-km) - conservative demo default.
        # Tune later with local transit assumptions.
        self.ELECTRIC_KWH_PER_KM = 0.05

        # If we don't have live carbon intensity, use a mild default (gCO2/kWh).
        self.DEFAULT_GRID_GCO2_PER_KWH = 150.0

    def _electric_emissions_kg(self, distance_km: float, carbon_gco2_per_kwh: Optional[float]) -> float:
        ci = float(carbon_gco2_per_kwh) if carbon_gco2_per_kwh is not None else self.DEFAULT_GRID_GCO2_PER_KWH
        kwh = distance_km * self.ELECTRIC_KWH_PER_KM
        return (kwh * ci) / 1000.0  # g -> kg

    def calculate_savings(
        self,
        distance_km: float,
        mode: str,
        carbon_gco2_per_kwh: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates kg of CO2 saved by NOT driving a car.
        Adds optional carbon intensity for electric modes (subway/skytrain-like).
        """
        mode_l = (mode or "").lower().strip()

        baseline_emissions = distance_km * self.EMISSION_CAR

        if mode_l == "bus":
            actual_emissions = distance_km * self.EMISSION_BUS
        elif mode_l in ["walk", "bike"]:
            actual_emissions = 0.0
        elif mode_l in ["subway", "train", "skytrain", "electric"]:
            actual_emissions = self._electric_emissions_kg(distance_km, carbon_gco2_per_kwh)
        elif mode_l == "car":
            actual_emissions = baseline_emissions
        else:
            # unknown mode -> assume car
            actual_emissions = baseline_emissions

        saved_kg = baseline_emissions - actual_emissions
        if saved_kg < 0:
            saved_kg = 0.0

        points = int(saved_kg * 100)

        return {
            "mode": mode,
            "distance_km": distance_km,
            "baseline_car_kg": round(baseline_emissions, 3),
            "actual_kg": round(actual_emissions, 3),
            "co2_saved_kg": round(saved_kg, 3),
            "points_earned": points,
            "carbon_intensity_gco2_per_kwh": None if carbon_gco2_per_kwh is None else round(float(carbon_gco2_per_kwh), 2),
        }
