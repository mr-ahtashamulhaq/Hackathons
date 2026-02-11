// API Configuration for Transit Accessibility App
// Centralized configuration for backend API endpoints

// Get API base URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API endpoints configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  
  // Maps & Routing endpoints
  maps: {
    geocode: `${API_BASE_URL}/api/maps/geocode`,
    route: `${API_BASE_URL}/api/maps/route`,
  },
  
  // Accessibility endpoints
  accessibility: {
    alerts: `${API_BASE_URL}/api/accessibility/alerts`,
    stations: `${API_BASE_URL}/api/accessibility/stations`,
  },
  
  // Climate & Carbon endpoints
  climate: {
    calculateImpact: `${API_BASE_URL}/api/calculate-impact`,
    carbonIntensity: `${API_BASE_URL}/api/climate/carbon-intensity/latest`,
    recommendTimes: `${API_BASE_URL}/api/climate/carbon-intensity/recommend-times`,
    lowestIntensity: `${API_BASE_URL}/api/climate/lowest-intensity`,
  },
  
  // User & Auth endpoints
  users: {
    stats: `${API_BASE_URL}/api/user`,
    profile: `${API_BASE_URL}/api/users/profile`,
    points: `${API_BASE_URL}/api/users/points`,
    badges: `${API_BASE_URL}/api/users/badges`,
  },
  
  // Route planning
  routing: {
    plan: `${API_BASE_URL}/api/route/plan`,
  },
  
  // Health check
  health: `${API_BASE_URL}/api/health`,
};

// Helper function to build URL with query parameters
export const buildURL = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Helper function for API fetch with error handling
export const apiFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

export default API_CONFIG;
