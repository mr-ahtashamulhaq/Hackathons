// Route Planning and Accessibility Service
import { API_CONFIG, buildURL, apiFetch } from '../config/api';

export const routeService = {
  /**
   * Plan accessible routes between two locations
   * @param {Object} routeData - Route planning parameters
   * @param {string} routeData.origin - Origin location
   * @param {string} routeData.destination - Destination location
   * @param {string} routeData.accessibility_priority - 'accessibility' or 'time'
   * @param {string} routeData.optimize - 'balanced' | 'time' | 'accessibility' | 'emissions'
   * @param {number} routeData.lat - Latitude (optional)
   * @param {number} routeData.lon - Longitude (optional)
   */
  async planRoute(routeData) {
    try {
      const url = buildURL(`${API_CONFIG.baseURL}/api/route/plan`, routeData);
      return await apiFetch(url, { method: 'POST' });
    } catch (error) {
      console.error('Plan route error:', error);
      // Return mock data as fallback
      return [
        {
          route_id: "route_001",
          origin: routeData.origin,
          destination: routeData.destination,
          mode: "bus",
          estimated_time_minutes: 25,
          stops_count: 5,
          accessibility_score: 95.0,
          has_elevator: true,
          wheelchair_accessible: true,
          audio_assistance_available: true,
          estimated_co2_kg: 0.32,
          co2_saved_vs_car_kg: 2.18
        }
      ];
    }
  },

  /**
   * Get accessibility information for a station
   * @param {string} stationId - Station ID
   */
  async getStationAccessibility(stationId) {
    try {
      const url = `${API_CONFIG.baseURL}/api/station/${stationId}/accessibility`;
      return await apiFetch(url);
    } catch (error) {
      console.error('Get station accessibility error:', error);
      return null;
    }
  },

  /**
   * Get accessibility alerts
   * @param {string} stationId - Station ID (optional)
   */
  async getAccessibilityAlerts(stationId = null) {
    try {
      const params = stationId ? { station_id: stationId } : {};
      const url = buildURL(`${API_CONFIG.baseURL}/api/alerts`, params);
      return await apiFetch(url);
    } catch (error) {
      console.error('Get accessibility alerts error:', error);
      return [];
    }
  }
};

export default routeService;
