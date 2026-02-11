import React, { useState, useEffect } from 'react';
import WeatherCard from './WeatherCard';
import CO2Card from './CO2Card';
import { Bell, MapPin, Menu, Bus, Train, TrainFront, ChevronDown, Star, Search, EyeOff } from 'lucide-react';
import RouteCard from '../Transit/RouteCard';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import OSRMMap from '../Map/OSRMMap';
import { routeService } from '../../services/routeService';
import VerifyDisability from '../Auth/VerifyDisability';



const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('bus');
  const [activeFilters, setActiveFilters] = useState(['accessible']);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDisabilityModal, setShowDisabilityModal] = useState(false);

  // Fetch routes from backend when component mounts or when search changes
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!homeSearchQuery) {
        // Use default mock routes if no search query
        setRoutes(getDefaultRoutes());
        return;
      }

      setLoading(true);
      try {
        // Get user location for carbon intensity
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const backendRoutes = await routeService.planRoute({
              origin: 'Current Location',
              destination: homeSearchQuery,
              accessibility_priority: 'balanced',
              optimize: 'balanced',
              lat: latitude,
              lon: longitude
            });

            // Transform backend routes to match frontend format
            const transformedRoutes = backendRoutes.map((route, index) => ({
              id: index + 1,
              type: route.mode,
              recommended: route.accessibility_score > 90,
              station: route.destination,
              distance: `${(route.estimated_time_minutes * 0.5).toFixed(1)} km`,
              duration: `${route.estimated_time_minutes} mins`,
              arrivalTime: calculateArrivalTime(route.estimated_time_minutes),
              cost: calculateCost(route.mode, route.estimated_time_minutes),
              co2: route.estimated_co2_kg ? `${Math.round(route.estimated_co2_kg * 1000)}g` : '0g',
              co2Label: 'Save CO₂',
              badge: getBadgeForScore(route.accessibility_score),
              tags: getRouteTags(route),
              envAlert: getEnvAlert(route)
            }));

            setRoutes(transformedRoutes);
          },
          (error) => {
            console.log('Geolocation error:', error);
            setRoutes(getDefaultRoutes());
          }
        );
      } catch (error) {
        console.error('Failed to fetch routes:', error);
        setRoutes(getDefaultRoutes());
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [homeSearchQuery]);

  // Helper functions
  const getDefaultRoutes = () => [
    {
      id: 1,
      type: 'bus',
      recommended: true,
      station: 'Meskel Square Station',
      distance: '6.5 km',
      duration: '25 mins',
      arrivalTime: '8:50 pm',
      cost: '$1.80',
      co2: '320g',
      co2Label: 'Save CO₂',
      badge: { type: 'good', text: 'Good' },
      tags: ['Accessible'],
      envAlert: 'This route produces 38% less emissions than driving.'
    },
    {
      id: 2,
      type: 'bus',
      recommended: false,
      station: 'Addis Ketema Station',
      distance: '5.0 km',
      duration: '40 mins',
      arrivalTime: '8:30 pm',
      cost: '$1.50',
      co2: '200g',
      co2Label: 'Save CO₂',
      badge: { type: 'moderate', text: 'Moderate' },
      tags: ['Accessible'],
      envAlert: 'Air quality is moderate on this route.'
    },
    {
      id: 3,
      type: 'train',
      recommended: true,
      station: 'Light Rail Station',
      distance: '7.2 km',
      duration: '18 mins',
      arrivalTime: '8:25 pm',
      cost: '$2.00',
      co2: '150g',
      co2Label: 'Save CO₂',
      badge: { type: 'good', text: 'Good' },
      tags: ['Accessible', 'Fast'],
      envAlert: 'Clean electric transport option.'
    },
    {
      id: 4,
      type: 'mrt',
      recommended: false,
      station: 'Metro Line 1',
      distance: '8.1 km',
      duration: '22 mins',
      arrivalTime: '8:35 pm',
      cost: '$2.50',
      co2: '120g',
      co2Label: 'Save CO₂',
      badge: { type: 'excellent', text: 'Excellent' },
      tags: ['Accessible', 'Climate Friendly'],
      envAlert: 'Lowest emissions option available.'
    }
  ];

  const calculateArrivalTime = (minutes) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const calculateCost = (mode, minutes) => {
    const baseCosts = { bus: 1.5, subway: 2.0, train: 2.0, mrt: 2.5 };
    const cost = (baseCosts[mode] || 1.5) + (minutes / 60);
    return `$${cost.toFixed(2)}`;
  };

  const getBadgeForScore = (score) => {
    if (score >= 95) return { type: 'excellent', text: 'Excellent' };
    if (score >= 85) return { type: 'good', text: 'Good' };
    if (score >= 70) return { type: 'moderate', text: 'Moderate' };
    return { type: 'bad', text: 'Limited' };
  };

  const getRouteTags = (route) => {
    const tags = [];
    if (route.wheelchair_accessible) tags.push('Accessible');
    if (route.has_elevator) tags.push('Elevator');
    if (route.audio_assistance_available) tags.push('Audio Aid');
    if (route.estimated_co2_kg && route.estimated_co2_kg < 0.2) tags.push('Climate Friendly');
    return tags;
  };

  const getEnvAlert = (route) => {
    if (route.co2_saved_vs_car_kg > 5) {
      return `This route saves ${route.co2_saved_vs_car_kg.toFixed(1)}kg CO₂ compared to driving!`;
    } else if (route.carbon_intensity_gco2_per_kwh && route.carbon_intensity_gco2_per_kwh < 150) {
      return 'Low carbon intensity - great time to travel!';
    }
    return 'Eco-friendly transit option.';
  };

  const filteredRoutes = routes.filter(r => r.type === activeTab);
  const navigate = useNavigate();


  return (
    <div className={`home-screen screen ${searchQuery ? 'searching' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? 0 : '-280px',
        width: '280px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        zIndex: 1000,
        transition: 'left 0.3s ease',
        boxShadow: isSidebarOpen ? '2px 0 8px rgba(0, 0, 0, 0.15)' : 'none'
      }}>
        <Sidebar />
      </div>

      {/* Real OSRM Map Background Container */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'auto'  // Enable mouse interactions
      }}>
        <OSRMMap
          center={[3.1390, 101.6869]} // Kuala Lumpur
          zoom={13}
          markers={[
            {
              lat: 3.1390,
              lon: 101.6869,
              popup: "Your Location - Kuala Lumpur"
            },
            {
              lat: 3.1570,
              lon: 101.7120,
              popup: "Meskel Square Station"
            }
          ]}
          routes={[
            {
              distance_m: 6500,
              duration_s: 1800,
              geometry: {
                type: "LineString",
                coordinates: [
                  [101.6869, 3.1390],  // Start: Kuala Lumpur (lng, lat)
                  [101.6950, 3.1450],  // Intermediate point
                  [101.7000, 3.1520],  // Intermediate point  
                  [101.7120, 3.1570]   // End: Meskel Square Station (lng, lat)
                ]
              }
            }
          ]}
        />
      </div>

      {/* Conditional Header/UI based on search state */}
      {!searchQuery ? (
        <>
          {/* Header (App Bar) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#EAEAEA', color: '#000000', position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 10 }}>
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="icon-btn-ghost"
                onClick={() => setIsSidebarOpen(true)}>
                <Menu size={24} color="#343A40" />
              </button>
            </div>
            {/* Center */}
            <h2 style={{ margin: 0, fontSize: '18px' }}>Welcome, Chuba</h2>

            {/* Right */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button className="icon-btn-ghost"
                onClick={() => setShowDisabilityModal(true)}
                title="Accessibility Options">
                <EyeOff size={24} color="#343A40" />
              </button>
              <button className="icon-btn-ghost"
                onClick={() => navigate('/notifications')}>
                <Bell size={24} color="#343A40" />
              </button>
            </div>
          </div>

          {/* Top Container - 10% of screen */}
          <div style={{
            height: '10%',
            position: 'relative',
            backgroundColor: '#FFFFFF',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            margin: 0,
            marginTop: '56px',
            zIndex: 5
          }}>
            {/* Live Location Header */}
            <div className="home-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px 24px', margin: 0, backgroundColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="menu-btn-mobile" style={{ display: 'none' }}>
                  <Menu size={24} color="#343A40" />
                </div>
                <div className="home-greeting">
                  <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '6px' }}>Welcome Back!</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                    <MapPin size={16} color="#D32F2F" fill="#D32F2F" />
                    <h2 style={{ margin: 0, fontSize: '18px' }}>Kuala Lumpur, Malaysia</h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Container - remaining screen */}
          <div style={{
            flex: 1,
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            overflow: 'auto',
            margin: 0,
            zIndex: 2,
            paddingBottom: '56px',
            pointerEvents: 'none'  // Allow map interactions through overlay
          }}>
            <div className="home-content" style={{
              padding: '16px 24px 200px 24px',
              margin: 0,
              pointerEvents: 'auto'  // Re-enable interactions for UI elements
            }}>
              <div className="home-grid">
                <WeatherCard />
                <CO2Card />
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="home-search-results-fixed">
            <div className="sheet-handle"></div>

            <div className="search-bar-container">
              <div className="search-bar">
                <Search
                  color="#4A90E2"
                  size={20}
                />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Where do you want to go?"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  color="#000000"
                  size={20}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (searchQuery.trim()) {
                      navigate('/searchroute', {
                        state: { searchQuery: searchQuery.trim() }
                      });
                    }
                  }}
                />
              </div>
            </div>


            <div className="results-panel-content">
              <div className="results-header-row">
                <h3 className="section-title-white">Suggested Routes</h3>
                <span className="cancel-search-btn" onClick={() => setSearchQuery('')}>Cancel</span>
              </div>

              {/* Filters Row */}
              <div className="filters-scroll-row">
                <div className="filter-chip dropdown">
                  <span>Depart Now</span>
                  <ChevronDown size={14} />
                </div>
                <div className={`filter-chip ${activeFilters.includes('co2') ? 'active' : ''}`}
                  onClick={() => setActiveFilters(prev => prev.includes('co2') ? prev.filter(f => f !== 'co2') : [...prev, 'co2'])}>
                  Lowest CO₂
                </div>
                <div className={`filter-chip ${activeFilters.includes('accessible') ? 'active' : ''}`}
                  onClick={() => setActiveFilters(prev => prev.includes('accessible') ? prev.filter(f => f !== 'accessible') : [...prev, 'accessible'])}>
                  Accessible
                </div>
                <div className="filter-chip">Save</div>
              </div>

              {/* Transport Type Tabs */}
              <div className="transport-tabs-row">
                <div className={`transport-tab-item ${activeTab === 'bus' ? 'active' : ''}`} onClick={() => setActiveTab('bus')}>
                  <Bus size={20} />
                  <span>Bus</span>
                  {activeTab === 'bus' && <div className="active-indicator" />}
                </div>
                <div className={`transport-tab-item ${activeTab === 'train' ? 'active' : ''}`} onClick={() => setActiveTab('train')}>
                  <Train size={20} />
                  <span>Train</span>
                  {activeTab === 'train' && <div className="active-indicator" />}
                </div>
                <div className={`transport-tab-item ${activeTab === 'mrt' ? 'active' : ''}`} onClick={() => setActiveTab('mrt')}>
                  <TrainFront size={20} />
                  <span>MRT/LRT</span>
                  {activeTab === 'mrt' && <div className="active-indicator" />}
                </div>
              </div>

              <div className="results-list-wrapper">
                {filteredRoutes.length > 0 ? (
                  <>
                    {filteredRoutes[0].recommended && (
                      <div className="recommended-label">
                        <Star size={12} fill="#FBC02D" color="#FBC02D" />
                        <span>Recommended</span>
                      </div>
                    )}
                    <div className="routes-list-inline">
                      {filteredRoutes.map(route => (
                        <RouteCard key={route.id} route={route} />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="no-results-msg">No routes found for this transport type.</div>
                )}
              </div>
            </div>
          </div>

        </>
      )}

      {/* Blue Search Container - Fixed behind other containers */}
      <div
        className="search-container"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px',
          backgroundColor: '#054777',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',

        }}
      >
        {/* Static Handle Bar */}
        <div style={{
          width: '100%',
          padding: '16px',
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            backgroundColor: '#CED4DA',
            borderRadius: '2px',
          }} />
        </div>

        {/* Container Content */}
        <div style={{
          flex: 1,
          padding: '0 16px 16px 16px',
          overflowY: 'auto',
        }}>
          {/* Search Bar Container */}
          <div className="search-bar-container" style={{ marginBottom: '16px' }}>
            <div className="search-bar">
              <MapPin
                color="#000000"
                size={20}
              />
              <input
                type="text"
                className="search-input"
                placeholder="Where do you want to go?"
                value={homeSearchQuery}
                onChange={(e) => setHomeSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && homeSearchQuery.trim()) {
                    navigate('/searchroute', {
                      state: { searchQuery: homeSearchQuery.trim() }
                    });
                  }
                }}
                style={{ fontWeight: '600', color: '#000000' }}
              />
              <Search
                color="#000000"
                size={20}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  if (homeSearchQuery.trim()) {
                    navigate('/searchroute', {
                      state: { searchQuery: homeSearchQuery.trim() }
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Disability Verification Modal */}
      <VerifyDisability
        isOpen={showDisabilityModal}
        onClose={() => setShowDisabilityModal(false)}
      />
    </div>
  );
};

export default Home;
