import React, { useState } from 'react';
import TransportTabs from './TransportTabs';
import RouteCard from './RouteCard';
import { ArrowLeft, Search, Leaf, Footprints, Bus as BusIcon, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TransitSearch = () => {
    const navigate = useNavigate();
    const [selectedRoute, setSelectedRoute] = useState(null);

    // Mock Data based on Screenshot
    const routes = [
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
            station: 'Meskel Square Station',
            distance: '5.0 km',
            duration: '40 mins',
            arrivalTime: '8:30 pm',
            cost: '$1.50',
            co2: '200g',
            co2Label: 'Save CO₂',
            badge: { type: 'moderate', text: 'Moderate' },
            tags: ['Accessible'],
            isRisk: true,
            riskText: 'Risky Area (Bad Pollution)',
            envAlert: 'Air quality is unhealthy on this route. Masks are recommended.'
        }
    ];

    const handleBack = () => {
        if (selectedRoute) {
            setSelectedRoute(null);
        } else {
            navigate('/home');
        }
    };

    return (
        <div className="screen transit-search-screen">
            {/* Map Header */}
            <div className="search-map-header">
                <div className="map-overlay-header">
                    <button className="icon-btn-ghost" onClick={handleBack}>
                        <ArrowLeft size={24} color="#343A40" />
                    </button>
                    <span className="header-title">Welcome, Chuba!</span>
                    <div style={{ width: 24 }}></div>
                </div>
                <div className="search-pill-floating">
                    <div className="search-pill-content">
                        <Search size={18} color="#6C757D" />
                        <span>Meskel Square Station</span>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet */}
            <div className={`bottom-sheet ${selectedRoute ? 'expanded' : ''}`}>
                <div className="sheet-handle"></div>

                {!selectedRoute ? (
                    <>
                        <div className="sheet-header">
                            <h3>Suggested Routes</h3>
                        </div>
                        <TransportTabs />
                        <div className="routes-list">
                            {routes.map(route => (
                                <div key={route.id} onClick={() => setSelectedRoute(route)}>
                                    <RouteCard route={route} />
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="route-detail-view">
                        <div className="route-detail-header">
                            <div className="route-type-title">{selectedRoute.type === 'bus' ? 'Bus' : 'Train'}</div>
                            <div className="close-btn" onClick={() => setSelectedRoute(null)}>×</div>
                        </div>

                        {selectedRoute.recommended && <div className="rec-badge">★ RECOMMENDED</div>}
                        {selectedRoute.isRisk && <div className="risk-badge">⚠ {selectedRoute.riskText}</div>}

                        <div className="route-main-info">
                            <div className="route-station">{selectedRoute.station}</div>
                            <div className="route-cost">{selectedRoute.cost}</div>
                        </div>
                        <div className="route-sub-info">{selectedRoute.distance} | {selectedRoute.duration} | Arrival time: {selectedRoute.arrivalTime}</div>

                        <div className="route-tags-row">
                            {selectedRoute.tags.map((tag, idx) => (
                                <span key={idx} className="tag-pill">{tag}</span>
                            ))}
                            <span className="tag-pill co2-pill"><Leaf size={12} /> {selectedRoute.co2}</span>
                            <span className={`tag-pill badge-${selectedRoute.badge.type}`}>{selectedRoute.badge.text}</span>
                        </div>

                        {/* Environmental Alert */}
                        <div className={`env-alert ${selectedRoute.isRisk ? 'risk' : ''}`}>
                            {selectedRoute.envAlert}
                        </div>

                        {/* Time Selector */}
                        <div className="time-selector-row">
                            <button className="time-select-btn">Select Time</button>
                            <div className="stepper">
                                <button>-</button>
                                <span>1</span>
                                <button>+</button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="timeline-steps">
                            <div className="timeline-item">
                                <div className="timeline-icon-container">
                                    <Footprints size={18} color="#00C853" />
                                </div>
                                <div className="timeline-content">
                                    <div className="step-title">Walk to Shola Market</div>
                                    <div className="step-time">8:00 PM</div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-icon-container">
                                    <BusIcon size={18} color="#00C853" />
                                </div>
                                <div className="timeline-content">
                                    <div className="step-title">Board Bus Route: Shola → Meskel</div>
                                    <div className="step-time">8:08 PM</div>
                                </div>
                            </div>
                            <div className="timeline-item">
                                <div className="timeline-icon-container">
                                    <CheckCircle size={18} color="#00C853" fill="#00C853" />
                                </div>
                                <div className="timeline-content">
                                    <div className="step-title">Arrive at Meskel Square Station</div>
                                    <div className="step-time">8:50 PM</div>
                                </div>
                            </div>
                        </div>

                        <button className="start-trip-btn">Start Trip</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransitSearch;
