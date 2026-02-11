import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, ArrowUp, Search, Train, Bus, TrainFront } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OSRMMap from '../Map/OSRMMap';

const ActiveTrip = () => {
    const navigate = useNavigate();
    const [drawerPosition, setDrawerPosition] = useState(85);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTripRoute, setActiveTripRoute] = useState(null);
    const drawerRef = useRef(null);
    const startYRef = useRef(0);
    const startPosRef = useRef(0);

    // Load active trip route data from localStorage
    useEffect(() => {
        const storedRoute = localStorage.getItem('activeTripRoute');
        if (storedRoute) {
            try {
                const routeData = JSON.parse(storedRoute);
                setActiveTripRoute(routeData);
            } catch (error) {
                console.error('Error parsing stored route:', error);
            }
        }
    }, []);

    const handleDragStart = (e) => {
        setIsDragging(true);
        startYRef.current = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        startPosRef.current = drawerPosition;
    };

    const handleDragMove = useCallback((e) => {
        if (!isDragging) return;

        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const deltaY = startYRef.current - currentY;
        const newPosition = Math.max(20, Math.min(85, startPosRef.current + (deltaY / window.innerHeight) * 100));

        setDrawerPosition(newPosition);
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Snap to positions
        if (drawerPosition < 50) {
            setDrawerPosition(30);
        } else {
            setDrawerPosition(85);
        }
    }, [drawerPosition]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        } else {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

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
                            popup: activeTripRoute?.station || "Meskel Square Station"
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
                                    [101.7120, 3.1570]   // End: 
                                    //  Square Station (lng, lat)
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
                <h2 style={{ margin: 0, fontSize: '18px' }}>Welcome, Chuba!</h2>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="icon-btn-ghost"
                        onClick={() => navigate('/notifications')}>
                        <Bell size={24} color="#343A40" />
                    </button>
                </div>
            </div>

            {/* Green Action Banner */}
            <div style={{
                position: 'fixed',
                top: '72px',
                left: '16px',
                right: '16px',
                backgroundColor: '#078800',
                borderRadius: '12px',
                padding: '25px 18px',
                zIndex: 5,
                boxShadow: '1px 13px 10px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <ArrowUp size={24} color="#FFFFFF" />
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>
                    Take Bus to Shola Market
                </div>
            </div>

            {/* Blue Details Card */}
            <div
                ref={drawerRef}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${drawerPosition}vh`,
                    backgroundColor: '#054777',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    zIndex: 50,
                    transition: isDragging ? 'none' : 'height 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                {/* Drag Handle */}
                <div
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                    style={{
                        width: '100%',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        touchAction: 'none',
                        flexShrink: 0
                    }}>
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#CED4DA',
                        borderRadius: '2px'
                    }} />
                </div>

                {/* Scrollable Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '0 20px 120px 20px'
                }}>
                    {/* Duration Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '16px'
                    }}>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: '2px solid #FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#FFFFFF'
                        }}>
                            ✕
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {activeTripRoute?.type === 'train' ? <Train size={28} color="#FFFFFF" /> :
                                    activeTripRoute?.type === 'mrt' ? <TrainFront size={28} color="#FFFFFF" /> :
                                        <Bus size={28} color="#FFFFFF" />}
                                {activeTripRoute?.duration || '23 Min'}
                            </div>
                            <div style={{ fontSize: '14px', color: '#FFFFFF', opacity: 0.9, textAlign: 'center' }}>
                                5.1 km | 8:15 PM
                            </div>
                        </div>
                        <button style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: '2px solid #FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#FFFFFF'
                        }}>
                            <Search size={20} />
                        </button>
                    </div>

                    {/* Walk Section - Combined Card */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        marginBottom: '16px'
                    }}>
                        {/* Brown Outer Container */}
                        <div style={{
                            backgroundColor: '#AC7F5E',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '12px'
                        }}>
                            {/* White Top Section */}
                            <div style={{
                                backgroundColor: '#ffffff',
                                padding: '8px 12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                borderRadius: '8px',
                                maxWidth: 'fit-content'
                            }}>
                                <span>🚶</span>
                                <span>Walk 8 mins to</span>
                            </div>
                        </div>

                        {/* White Details Section */}
                        <div style={{ padding: '16px' }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '4px', marginTop: 'px' }}>
                                Shola Market
                            </div>
                            <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '10px' }}>
                                680 m left
                            </div>

                            {/* Divider Line */}
                            <div style={{ width: '100%', height: '0.5px', backgroundColor: '#AC7F5E', marginBottom: '16px' }} />

                            {/* Route Visualization */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>

                                {/* Vertical Line */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '2px', height: '10px', backgroundColor: '#CED4DA' }} />
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#CED4DA', borderRadius: '50%' }} />
                                    <div style={{ width: '2px', height: '20px', backgroundColor: '#CED4DA' }} />
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#CED4DA', borderRadius: '50%' }} />
                                </div>

                                {/* Text Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#6C757D', marginTop: '10px', marginBottom: '10px' }}>
                                        Start from Cherry Residence
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6C757D' }}>
                                        Turn Right onto Jalan Cherry 2
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wait For Section - Combined Card */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '16px'
                    }}>
                        {/* Brown Outer Container */}
                        <div style={{
                            backgroundColor: '#AC7F5E',
                            borderRadius: '8px',
                            padding: '12px 16px',
                        }}>
                            {/* White Top Section */}
                            <div style={{
                                backgroundColor: '#ffffff',
                                padding: '8px 12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '8px',
                                maxWidth: 'fit-content'
                            }}>
                                <span>🚌</span>
                                <span>Wait for S210 Bus</span>
                            </div>
                        </div>

                        {/* White Details Section */}
                        <div style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                                    S210 - Shola Market Bus Stop
                                </div>
                                <div style={{
                                    backgroundColor: '#E1E1E1',
                                    border: '1px solid #000000',
                                    color: '#000000',
                                    padding: '4px 12px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    8 mins
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ fontSize: '13px', color: '#6C757D' }}>
                                    600 m left
                                </div>
                                <div style={{ fontSize: '12px', color: '#000000', fontWeight: '600' }}>
                                    15, 40 mins
                                </div>
                            </div>

                            {/* Divider Line */}
                            <div style={{ width: '100%', height: '0.5px', backgroundColor: '#AC7F5E', marginBottom: '16px' }} />

                            {/* Route Visualization */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>

                                {/* Vertical Line */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#0088FF', borderRadius: '50%' }} />
                                    <div style={{ width: '2px', height: '20px', backgroundColor: '#0088FF' }} />
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#0088FF', borderRadius: '50%' }} />
                                    <div style={{ width: '2px', height: '20px', backgroundColor: '#0088FF' }} />
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#0088FF', borderRadius: '50%' }} />
                                    <div style={{ width: '2px', height: '22px', backgroundColor: '#0088FF' }} />
                                    <div style={{ width: '8px', height: '8px', backgroundColor: '#0088FF', borderRadius: '50%' }} />
                                </div>

                                {/* Text Content */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '12px', color: '#6C757D', marginTop: '-2px', marginBottom: '13px' }}>
                                        Shola Market Bus Stop
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '14px' }}>
                                        SMK Khai Lan
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '14px' }}>
                                        Chevrolet Hospital
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '10px' }}>
                                        {activeTripRoute?.station || 'Meskel Square Station'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stop Button */}
                    <button
                        onClick={() => navigate('/Home')}
                        style={{
                            width: '100%',
                            marginTop: '20px',
                            backgroundColor: '#FF0000',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '18px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 8px rgba(255,0,0,0.3)'
                        }}
                    >
                        STOP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveTrip;