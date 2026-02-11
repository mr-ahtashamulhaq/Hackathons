import React, { useState, useEffect } from 'react';
import { CloudSun, Zap } from 'lucide-react';
import { climateService } from '../../services/climateService';
import { userService } from '../../services/userService';

const WeatherCard = () => {
    const [carbonIntensity, setCarbonIntensity] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user's geolocation for carbon intensity
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;
                            
                            // Fetch carbon intensity
                            const intensity = await climateService.getLiveCarbonIntensity(latitude, longitude);
                            setCarbonIntensity(intensity);
                        },
                        (error) => {
                            console.log('Geolocation not available:', error);
                        }
                    );
                }

                // Fetch user stats
                const stats = await userService.getUserStats();
                setUserStats(stats);
            } catch (error) {
                console.error('Failed to fetch weather data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Calculate air quality based on carbon intensity
    const getAirQualityInfo = () => {
        if (!carbonIntensity || !carbonIntensity.raw) {
            return { value: 78, status: 'Good', color: '#4CAF50' };
        }

        const intensity = carbonIntensity.raw.carbonIntensity || 0;
        
        if (intensity < 100) return { value: intensity, status: 'Excellent', color: '#00C853' };
        if (intensity < 200) return { value: intensity, status: 'Good', color: '#4CAF50' };
        if (intensity < 300) return { value: intensity, status: 'Moderate', color: '#FF9800' };
        return { value: intensity, status: 'Poor', color: '#F44336' };
    };

    const airQuality = getAirQualityInfo();
    const co2Saved = userStats?.total_co2_saved_kg || 47.3;

    return (
        <div className="card weather-card">
            <div className="weather-header">
                <div>
                    <div className="weather-title">Live Climate</div>
                    <div style={{ fontSize: '11px', color: '#6C757D' }}>
                        You have saved {co2Saved}kg CO₂ this week
                    </div>
                </div>
                {carbonIntensity ? (
                    <Zap size={20} color="#002B49" />
                ) : (
                    <CloudSun size={20} color="#002B49" />
                )}
            </div>

            <div className="weather-main-row" style={{ alignItems: 'stretch' }}>
                <div className="aqi-box">
                    <div className="aqi-val">{loading ? '...' : airQuality.value}</div>
                    <div className="aqi-label">Carbon Intensity</div>
                </div>

                <div className="weather-grid" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className={`stat-status ${airQuality.status.toLowerCase()}`} style={{ backgroundColor: airQuality.color + '20', color: airQuality.color }}>
                        <div className="status-val">{airQuality.status}</div>
                        <div className="status-label">Grid Quality</div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                        <div className="stat-chip temp">
                            <div className="stat-val">20°C</div>
                            <div className="stat-lbl">Temperature</div>
                        </div>
                        <div className="stat-chip humid">
                            <div className="stat-val">
                                {carbonIntensity?.raw?.carbonIntensity ? 
                                    `${Math.round(carbonIntensity.raw.carbonIntensity)}` : '90'}
                            </div>
                            <div className="stat-lbl">gCO₂/kWh</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherCard;
