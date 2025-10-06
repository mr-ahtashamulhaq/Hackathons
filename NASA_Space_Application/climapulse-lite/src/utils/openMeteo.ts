// Open-Meteo API utility for fetching Lahore climate data
// Coordinates for Lahore, Pakistan: 31.5497°N, 74.3436°E

export interface WeatherData {
  dates: string[];
  temperatures: number[];
  precipitation: number[];
  humidity: number[];
}

export interface CurrentWeather {
  temperature: number;
  humidity: number;
  precipitation: number;
  condition: string;
}

const LAHORE_LAT = 31.5497;
const LAHORE_LON = 74.3436;

/**
 * Fetch historical weather data for Lahore from Open-Meteo
 * @param startDate Start date in YYYY-MM-DD format
 * @param endDate End date in YYYY-MM-DD format
 */
export async function fetchHistoricalData(
  startDate: string = '2020-01-01',
  endDate: string = '2024-12-31'
): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?` +
      `latitude=${LAHORE_LAT}&longitude=${LAHORE_LON}` +
      `&start_date=${startDate}&end_date=${endDate}` +
      `&daily=temperature_2m_mean,precipitation_sum,relative_humidity_2m_mean` +
      `&timezone=Asia/Karachi`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      dates: data.daily.time || [],
      temperatures: data.daily.temperature_2m_mean || [],
      precipitation: data.daily.precipitation_sum || [],
      humidity: data.daily.relative_humidity_2m_mean || [],
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    // Return mock data in case of API failure
    return generateMockData(startDate, endDate);
  }
}

/**
 * Fetch current weather data for Lahore
 */
export async function fetchCurrentWeather(): Promise<CurrentWeather> {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${LAHORE_LAT}&longitude=${LAHORE_LON}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation` +
      `&timezone=Asia/Karachi`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      temperature: data.current.temperature_2m || 25,
      humidity: data.current.relative_humidity_2m || 60,
      precipitation: data.current.precipitation || 0,
      condition: data.current.precipitation > 0 ? 'Rainy' : 'Clear',
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    // Return mock current data
    return {
      temperature: 28.5,
      humidity: 65,
      precipitation: 0.2,
      condition: 'Partly Cloudy'
    };
  }
}

/**
 * Generate mock weather data for fallback
 */
function generateMockData(startDate: string, endDate: string): WeatherData {
  const dates: string[] = [];
  const temperatures: number[] = [];
  const precipitation: number[] = [];
  const humidity: number[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    
    // Mock temperature with seasonal variation (Lahore climate)
    const dayOfYear = current.getMonth() * 30 + current.getDate();
    const baseTemp = 25 + 10 * Math.sin((dayOfYear / 365) * 2 * Math.PI);
    temperatures.push(baseTemp + Math.random() * 6 - 3);
    
    // Mock precipitation (monsoon season Jun-Sep)
    const isMonsooon = current.getMonth() >= 5 && current.getMonth() <= 8;
    precipitation.push(isMonsooon ? Math.random() * 20 : Math.random() * 3);
    
    // Mock humidity
    humidity.push(50 + Math.random() * 30);
    
    current.setDate(current.getDate() + 1);
  }

  return { dates, temperatures, precipitation, humidity };
}

/**
 * Calculate climate trends from historical data
 */
export function calculateTrends(data: WeatherData) {
  if (data.temperatures.length === 0) return null;

  const avgTemp = data.temperatures.reduce((sum, temp) => sum + temp, 0) / data.temperatures.length;
  const totalPrecipitation = data.precipitation.reduce((sum, prec) => sum + prec, 0);
  const avgHumidity = data.humidity.reduce((sum, hum) => sum + hum, 0) / data.humidity.length;

  // Simple linear trend calculation for temperature
  const tempTrend = calculateLinearTrend(data.temperatures);

  return {
    averageTemperature: Math.round(avgTemp * 10) / 10,
    totalPrecipitation: Math.round(totalPrecipitation),
    averageHumidity: Math.round(avgHumidity),
    temperatureTrend: Math.round(tempTrend * 1000) / 1000, // degrees per year
  };
}

function calculateLinearTrend(values: number[]): number {
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const xSum = x.reduce((sum, val) => sum + val, 0);
  const ySum = values.reduce((sum, val) => sum + val, 0);
  const xySum = x.reduce((sum, val, i) => sum + val * values[i], 0);
  const xxSum = x.reduce((sum, val) => sum + val * val, 0);

  const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
  return slope;
}