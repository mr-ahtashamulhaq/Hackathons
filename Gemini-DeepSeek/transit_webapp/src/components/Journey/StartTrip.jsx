import React, { useState, useRef } from 'react';
import { ArrowLeft, Bell, ArrowUp, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OSRMMap from '../Map/OSRMMap';

const StartTrip = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(true);
    const [dragPosition, setDragPosition] = useState(50); // Initial bottom position in px
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ y: 0, initialPosition: 50 });

    // Drag handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        dragStartRef.current = {
            y: clientY,
            initialPosition: dragPosition
        };
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - dragStartRef.current.y;
        const newPosition = dragStartRef.current.initialPosition - deltaY; // Subtract because dragging down should decrease bottom value
        
        // Constrain the position: minimum 40px from bottom (current position), maximum around 50vh from bottom
        const minPosition = 40; // Can't go lower than current position
        const maxPosition = window.innerHeight * 0.6; // Can drag up to about 60% of screen height
        
        const constrainedPosition = Math.max(minPosition, Math.min(maxPosition, newPosition));
        setDragPosition(constrainedPosition);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    // Add event listeners for touch and mouse
    React.useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e) => handleDragMove(e);
            const handleMouseUp = () => handleDragEnd();
            const handleTouchMove = (e) => handleDragMove(e);
            const handleTouchEnd = () => handleDragEnd();

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleTouchEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleTouchEnd);
            };
        }
    }, [isDragging, dragPosition]);

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
                     // Meskel Square, Philippines
                                        zoom={13}
                                        markers={[
                                            {
                                                lat: 14.5995,
                                                lon: 120.9842,
                                                popup: "Your Location - Meskel Square, Philippines"
                                            },
                                            {
                                                lat: 14.5960,
                                                lon: 121.0000,
                                                popup: "Meskel Square Station"
                                            }
                                        ]}
                                        routes={[]}
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
                backgroundColor: '#00C853',
                borderRadius: '12px',
                padding: '14px 18px',
                zIndex: 5,
                boxShadow: '1px 13px 10px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <ArrowUp size={24} color="#FFFFFF" />
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>
                    Take bus at Shloka Market
                </div>
            </div>

            {/* Blue Details Card */}
            <div style={{
                position: 'fixed',
                bottom: `${dragPosition}px`,
                left: 0,
                right: 0,
                backgroundColor: '#054777',
                borderTopLeftRadius: '20px',
                borderTopRightRadius: '20px',
                padding: '24px 20px',
                paddingBottom: '180px',
                zIndex: 50,
                maxHeight: '70vh',
                overflowY: 'auto',
                transition: isDragging ? 'none' : 'bottom 0.3s ease-out'
            }}>
                {/* Drag Handle */}
                <div 
                    style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        padding: '10px 0' // Increase touch area
                    }}
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                >
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#CED4DA',
                        borderRadius: '2px'
                    }} />
                </div>

                {/* Duration Header */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: '32px'
                }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>
                            23 Min
                        </div>
                        <div style={{ fontSize: '14px', color: '#FFFFFF', opacity: 0.9 }}>
                            5.1 km | 8:15 PM
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                </div>

                {/* Walk Section */}
                <div style={{ 
                    backgroundColor: '#8B6F47',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>🚶</span>
                    <span>Walk 8 mins to</span>
                </div>

                {/* Destination Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '16px'
                }}>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000', marginBottom: '4px' }}>
                        Shola Market
                    </div>
                    <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '12px' }}>
                        680 m left
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '4px' }}>
                        ⋯..... Start from Cherry Residence
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D' }}>
                        ⋯..... Turn Right onto Jalan Cherry 2
                    </div>
                </div>

                {/* Wait For Section */}
                <div style={{ 
                    backgroundColor: '#8B6F47',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    marginBottom: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span>🚌</span>
                    <span>Wait for</span>
                </div>

                {/* Bus Stop Card */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>
                            S210 - Shola Market Bus Stop
                        </div>
                        <div style={{
                            backgroundColor: '#00C853',
                            color: '#FFFFFF',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            8 mins
                        </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '12px' }}>
                        600 m left
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '8px' }}>
                        Shola Market Bus Stop
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '8px' }}>
                        SMK Khoi Lan
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D', marginBottom: '8px' }}>
                        Chevrolet Hospital
                    </div>
                    <div style={{ fontSize: '12px', color: '#6C757D' }}>
                        Meskel Square Station
                    </div>
                    <div style={{ fontSize: '12px', color: '#00C853', fontWeight: '600', marginTop: '8px' }}>
                        15, 40 mins
                    </div>
                </div>

                {/* Stop Button */}
                <button
                    onClick={() => navigate('/active-trip')}
                    style={{
                        width: '100%',
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
    );
};

export default StartTrip;