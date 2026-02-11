import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, X, ChevronDown, Plus, Minus, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OSRMMap from '../Map/OSRMMap';

const JourneyDetails = () => {
    const navigate = useNavigate();
    const [departureTime] = useState('8:00 PM');

    const [minuteAdjustment, setMinuteAdjustment] = useState(15);
    const [selectedRoute, setSelectedRoute] = useState(null);

    // Load selected route data from localStorage
    useEffect(() => {
        const storedRoute = localStorage.getItem('selectedRoute');
        if (storedRoute) {
            try {
                const routeData = JSON.parse(storedRoute);
                setSelectedRoute(routeData);
            } catch (error) {
                console.error('Error parsing stored route:', error);
            }
        }
    }, []);

    const handleIncreaseTime = () => {
        setMinuteAdjustment(prev => Math.min(prev + 5, 60));
    };

    const handleDecreaseTime = () => {
        setMinuteAdjustment(prev => Math.max(prev - 5, 5));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* Real OSRM Map Background Container */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0
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

            {/* Header (App Bar) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: '#EAEAEA', color: '#000000', position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 10 }}>
                {/* Left */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="icon-btn-ghost"
                        onClick={() => navigate(-1)}>
                        <ArrowLeft size={24} color="#343A40" />
                    </button>
                </div>
                {/* Center */}
                <h2 style={{ margin: 0, fontSize: '18px' }}>Journey Details</h2>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="icon-btn-ghost"
                        onClick={() => navigate('/notifications')}>
                        <Bell size={24} color="#343A40" />
                    </button>
                </div>
            </div>

            {/* Green Impact Banner */}
            <div style={{
                position: 'fixed',
                top: '72px',
                left: '16px',
                right: '16px',
                backgroundColor: '#CDFF87',
                borderRadius: '12px',
                padding: '14px 18px',
                zIndex: 5,
                boxShadow: '1px 13px 10px rgba(0, 0, 0, 0.15)'
            }}>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000', marginBottom: '4px' }}>
                    This route produces 38% less emissions
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000', marginBottom: '4px' }}>
                    and avoids poor air quality.
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#000000' }}>
                    You save 320g CO₂ using this route
                </div>
            </div>

            {/* Blue Details Card */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#054777',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '20px',
                paddingBottom: '100px',
                zIndex: 50,
                maxHeight: '70vh',
                overflowY: 'auto'
            }}>
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
                            {selectedRoute?.type.charAt(0).toUpperCase() + selectedRoute?.type.slice(1) || 'Bus'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                            <span style={{ fontSize: '16px', color: '#FFA726' }}>⭐</span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#FFA726' }}>
                                {selectedRoute?.recommended ? 'Recommended' : 'Available'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#FFFFFF',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={20} color="#054777" />
                    </button>
                </div>

                {/* Station Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#FFFFFF' }}>
                        {selectedRoute?.station || 'Station'}
                    </div>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#054777'
                    }}>
                        {selectedRoute?.cost || '$1.80'}
                    </div>
                </div>

                {/* Route Details */}
                <div style={{ fontSize: '13px', color: '#FFFFFF', marginBottom: '16px', opacity: 0.9 }}>
                    {selectedRoute?.distance || '6.5 km'} | {selectedRoute?.duration || '30 mins'} | Arrival time: {selectedRoute?.arrivalTime || '8:58 pm'}
                </div>

                {/* Chips Row */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#054777'
                    }}>
                        Accessible
                    </div>
                    <div style={{
                        backgroundColor: '#E8F5E9',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#000000',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <Leaf size={12} color="#2E7D32" fill="#2E7D32" />
                        <span>{selectedRoute?.co2 || '320g CO₂'}</span>
                    </div>
                    <div style={{
                        backgroundColor: '#00C853',
                        padding: '6px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#000000'
                    }}>
                        Good
                    </div>
                </div>

                {/* Time Adjustment */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '50px', marginBottom: '20px' }}>
                    <div style={{
                        backgroundColor: '#0df76ece',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flex: 1
                    }}>
                        <span>Leave {departureTime}</span>
                        <ChevronDown size={16} color="#ffffff" />
                    </div>
                    <div style={{
                        backgroundColor: 'rgb(255, 255, 255)',
                        padding: '6px 8px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <button
                            onClick={handleDecreaseTime}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'rgb(153, 153, 153)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Minus size={16} color="#FFFFFF" />
                        </button>
                        <span style={{ fontSize: '13px', color: '#000000', minWidth: '40px', textAlign: 'center' }}>
                            {minuteAdjustment} Mins
                        </span>
                        <button
                            onClick={handleIncreaseTime}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(19, 19, 19, 0.91)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            <Plus size={16} color="#FFFFFF" />
                        </button>
                    </div>
                </div>

                {/* Journey Steps */}
                <div style={{ marginBottom: '20px' }}>
                    {/* Step 1 */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#00C853',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                        }}>
                            🚶
                        </div>
                        <div style={{ flex: 1, paddingTop: '8px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                                Walk to Shola Market
                            </div>
                            <div style={{ fontSize: '13px', color: '#FFFFFF', opacity: 0.8 }}>
                                8:00 PM
                            </div>
                        </div>
                    </div>

                    {/* Connector Line */}
                    <div style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: '19px', marginBottom: '8px' }} />

                    {/* Step 2 */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#00C853',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                        }}>
                            🚌
                        </div>
                        <div style={{ flex: 1, paddingTop: '8px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                                Board Bus Route: Shola → {selectedRoute?.station || 'Destination Station'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#FFFFFF', opacity: 0.8 }}>
                                8:05 PM
                            </div>
                        </div>
                    </div>

                    {/* Connector Line */}
                    <div style={{ width: '2px', height: '24px', backgroundColor: 'rgba(255,255,255,0.3)', marginLeft: '19px', marginBottom: '8px' }} />

                    {/* Step 3 */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#00C853',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                        }}>
                            ✓
                        </div>
                        <div style={{ flex: 1, paddingTop: '8px' }}>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF', marginBottom: '4px' }}>
                                Arrive at {selectedRoute?.station || 'Meskel Square Station'}
                            </div>
                            <div style={{ fontSize: '13px', color: '#FFFFFF', opacity: 0.8 }}>
                                8:50PM
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Trip Button */}
                <button
                    onClick={() => {
                        // Pass the route data to ActiveTrip
                        if (selectedRoute) {
                            localStorage.setItem('activeTripRoute', JSON.stringify(selectedRoute));
                        }
                        navigate('/active-trip');
                    }}
                    style={{
                        width: '100%',
                        backgroundColor: '#00C853',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                >
                    Start Trip
                </button>
            </div>
        </div>
    );
};

export default JourneyDetails;
