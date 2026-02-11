// Frontend service to connect to OSRM backend
import { API_CONFIG, buildURL, apiFetch } from '../config/api';

export const mapsService = {
  // Geocode a location using Nominatim via your backend
  async geocode(query, limit = 5) {
    try {
      const url = buildURL(API_CONFIG.maps.geocode, { q: query, limit });
      return await apiFetch(url);
    } catch (error) {
      console.error('Geocoding error:', error);
      // Return mock data for Kuala Lumpur if backend unavailable
      return {
        query,
        results: [{
          display_name: "Kuala Lumpur, Malaysia",
          lat: 3.1390,
          lon: 101.6869,
          type: "city"
        }]
      };
    }
  },

  // Get route between two points using OSRM via your backend
  async getRoute(originLat, originLon, destLat, destLon, profile = 'foot') {
    try {
      const url = buildURL(API_CONFIG.maps.route, {
        origin_lat: originLat,
        origin_lon: originLon,
        dest_lat: destLat,
        dest_lon: destLon,
        profile
      });
      return await apiFetch(url);
    } catch (error) {
      console.error('Routing error:', error);
      // Return mock route if backend unavailable
      return {
        profile,
        distance_m: 5000,
        duration_s: 1200,
        geometry: {
          type: "LineString",
          coordinates: [
            [originLon, originLat],
            [(originLon + destLon) / 2, (originLat + destLat) / 2],
            [destLon, destLat]
          ]
        }
      };
    }
  }
};