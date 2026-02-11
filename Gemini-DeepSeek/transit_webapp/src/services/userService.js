// User Stats and Gamification Service
import { API_CONFIG, apiFetch } from '../config/api';

export const userService = {
  /**
   * Get user statistics including CO2 saved, trips, points, and badges
   * @param {string} userId - User ID
   */
  async getUserStats(userId = 'default_user') {
    try {
      const url = `${API_CONFIG.baseURL}/api/user/${userId}/stats`;
      return await apiFetch(url);
    } catch (error) {
      console.error('Get user stats error:', error);
      // Return mock data as fallback
      return {
        user_id: userId,
        total_co2_saved_kg: 47.3,
        total_trips: 32,
        total_points: 4730,
        badges: [
          {
            badge_id: "eco_warrior",
            name: "Eco Warrior",
            description: "Completed 10 sustainable trips"
          },
          {
            badge_id: "carbon_hero",
            name: "Carbon Hero",
            description: "Saved 100kg of CO2"
          }
        ],
        sustainability_streak_days: 7,
        ranking: "Silver Tier"
      };
    }
  },

  /**
   * Calculate trees equivalent for CO2 saved
   * @param {number} co2_kg - CO2 saved in kilograms
   * @returns {number} Number of trees equivalent
   */
  calculateTreesEquivalent(co2_kg) {
    // Average tree absorbs ~22kg CO2 per year
    return (co2_kg / 22).toFixed(1);
  }
};

export default userService;
