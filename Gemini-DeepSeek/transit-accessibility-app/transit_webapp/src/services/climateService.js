// Climate and Carbon Intensity Service
import { API_CONFIG, buildURL, apiFetch } from '../config/api';

export const climateService = {
  /**
   * Calculate CO2 impact for a trip
   * @param {Object} tripData - Trip information
   * @param {number} tripData.distance_km - Distance in kilometers
   * @param {string} tripData.mode - Transit mode (bus, walk, bike, subway, car, train)
   * @param {number} tripData.lat - Latitude (optional)
   * @param {number} tripData.lon - Longitude (optional)
   * @param {boolean} tripData.include_recommended_times - Include recommended departure times
   */
  async calculateImpact(tripData) {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/calculate-impact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Calculate impact error:', error);
      // Return mock data as fallback
      return {
        mode: tripData.mode,
        distance_km: tripData.distance_km,
        baseline_car_kg: 2.5,
        actual_kg: 0.5,
        co2_saved_kg: 2.0,
        points_earned: 200
      };
    }
  },

  /**
   * Get live carbon intensity for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async getLiveCarbonIntensity(lat, lon) {
    try {
      const url = buildURL(`${API_CONFIG.baseURL}/api/climate/carbon-intensity/latest`, { lat, lon });
      return await apiFetch(url);
    } catch (error) {
      console.error('Get carbon intensity error:', error);
      return null;
    }
  },

  /**
   * Get recommended low-emission travel times
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {number} top_n - Number of recommendations
   * @param {number} horizon_hours - Hours to look ahead
   */
  async getRecommendedTimes(lat, lon, top_n = 3, horizon_hours = 24) {
    try {
      const url = buildURL(`${API_CONFIG.baseURL}/api/climate/carbon-intensity/recommend-times`, {
        lat,
        lon,
        top_n,
        horizon_hours
      });
      return await apiFetch(url);
    } catch (error) {
      console.error('Get recommended times error:', error);
      return [];
    }
  },

  /**
   * Get lowest carbon intensity times for a location
   * @param {string} location - Location name
   * @param {number} limit - Number of results
   */
  async getLowestIntensityTimes(location, limit = 5) {
    try {
      const url = buildURL(`${API_CONFIG.baseURL}/api/climate/lowest-intensity`, {
        location,
        limit
      });
      return await apiFetch(url);
    } catch (error) {
      console.error('Get lowest intensity times error:', error);
      return [];
    }
  }
};

export default climateService;
