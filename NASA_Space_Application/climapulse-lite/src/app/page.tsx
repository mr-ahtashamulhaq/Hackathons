'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import ClimateChart from '@/components/ClimateChart';
import ClimateMap from '@/components/ClimateMap';
import InsightBox from '@/components/InsightBox';
import { 
  fetchHistoricalData, 
  fetchCurrentWeather, 
  calculateTrends,
  WeatherData,
  CurrentWeather 
} from '@/utils/openMeteo';
import { generateClimateInsight, ClimateInsight } from '@/utils/gemini';

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(null);
  const [insight, setInsight] = useState<ClimateInsight | null>(null);
  const [loading, setLoading] = useState({
    weather: true,
    current: true,
    insight: false,
  });
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = async () => {
    try {
      setLoading(prev => ({ ...prev, weather: true }));
      const data = await fetchHistoricalData('2020-01-01', '2024-12-31');
      setWeatherData(data);
    } catch (err) {
      setError('Failed to load weather data');
      console.error('Error loading weather data:', err);
    } finally {
      setLoading(prev => ({ ...prev, weather: false }));
    }
  };

  const loadCurrentWeather = async () => {
    try {
      setLoading(prev => ({ ...prev, current: true }));
      const current = await fetchCurrentWeather();
      setCurrentWeather(current);
    } catch (err) {
      console.error('Error loading current weather:', err);
    } finally {
      setLoading(prev => ({ ...prev, current: false }));
    }
  };

  const generateInsights = useCallback(async () => {
    if (!weatherData) return;

    try {
      setLoading(prev => ({ ...prev, insight: true }));
      const trends = calculateTrends(weatherData);
      
      if (trends) {
        const generatedInsight = await generateClimateInsight(trends, '2020', '2024');
        setInsight(generatedInsight);
      }
    } catch (err) {
      console.error('Error generating insights:', err);
    } finally {
      setLoading(prev => ({ ...prev, insight: false }));
    }
  }, [weatherData]);

  // Load data on component mount
  useEffect(() => {
    loadWeatherData();
    loadCurrentWeather();
  }, []);

  // Generate insights when weather data is loaded
  useEffect(() => {
    if (weatherData && !insight) {
      generateInsights();
    }
  }, [weatherData, insight, generateInsights]);

  const regenerateInsights = () => {
    setInsight(null);
    generateInsights();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentTemp={currentWeather?.temperature} 
        condition={currentWeather?.condition}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {weatherData && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const trends = calculateTrends(weatherData);
              return trends ? [
                {
                  label: 'Avg Temperature',
                  value: `${trends.averageTemperature}°C`,
                  icon: '🌡️',
                  color: 'red'
                },
                {
                  label: 'Total Precipitation', 
                  value: `${trends.totalPrecipitation}mm`,
                  icon: '🌧️',
                  color: 'blue'
                },
                {
                  label: 'Avg Humidity',
                  value: `${trends.averageHumidity}%`,
                  icon: '💧',
                  color: 'green'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              )) : null;
            })()}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Temperature Chart */}
            {loading.weather ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-80 bg-gray-100 rounded"></div>
                </div>
              </div>
            ) : weatherData ? (
              <ClimateChart 
                data={weatherData} 
                type="temperature" 
                title="Temperature Trends (2020-2024)"
              />
            ) : null}
            
            {/* Precipitation Chart */}
            {loading.weather ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-80 bg-gray-100 rounded"></div>
                </div>
              </div>
            ) : weatherData ? (
              <ClimateChart 
                data={weatherData} 
                type="precipitation" 
                title="Precipitation Patterns (2020-2024)"
              />
            ) : null}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Map */}
            <ClimateMap currentWeather={currentWeather} />
            
            {/* AI Insights */}
            <InsightBox 
              insight={insight}
              loading={loading.insight}
              onRegenerate={regenerateInsights}
            />
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <div className="border-t pt-8">
            <p className="mb-2">
              🌍 <strong>ClimaPulse Lite</strong> • Built for NASA Space Apps Challenge 2025
            </p>
            <p>
              Data: <a href="https://open-meteo.com" className="text-blue-600 hover:underline">Open-Meteo</a> • 
              AI: <a href="https://ai.google.dev" className="text-blue-600 hover:underline">Gemini</a> • 
              Made with ❤️ for climate awareness
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
