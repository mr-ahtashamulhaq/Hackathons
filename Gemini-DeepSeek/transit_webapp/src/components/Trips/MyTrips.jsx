import React, { useState } from 'react';
import { Lightbulb, Menu, LogOut, Bus, Bike, Building2, Footprints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';

const MyTrips = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const weeklyData = [
        { day: 'Mon', value: 1.2 },
        { day: 'Tue', value: 2.1 },
        { day: 'Wed', value: 1.8 },
        { day: 'Thu', value: 2.6 },
        { day: 'Fri', value: 1.6 },
        { day: 'Sat', value: 3.2 },
        { day: 'Sun', value: 2.9 }
    ];

    const recentTrips = [
        {
            id: 1,
            from: 'Home',
            to: 'Office',
            time: 'Today, 8:30 AM',
            co2: '2.3 kg',
            icon: Bus,
            color: '#007AFF'
        },
        {
            id: 2,
            from: 'Office',
            to: 'Gym',
            time: 'Yesterday, 6:15 PM',
            co2: '1.8 kg',
            icon: Bike,
            color: '#34C759'
        },
        {
            id: 3,
            from: 'Home',
            to: 'Downtown',
            time: 'Yesterday, 9:00 AM',
            co2: '3.5 kg',
            icon: Building2,
            color: '#AF52DE'
        },
        {
            id: 4,
            from: 'Café',
            to: 'Park',
            time: 'Jan 26, 2:30 PM',
            co2: '0.9 kg',
            icon: Footprints,
            color: '#FF9500'
        },
        {
            id: 5,
            from: 'Home',
            to: 'Office',
            time: 'Jan 26, 8:45 AM',
            co2: '2.3 kg',
            icon: Bus,
            color: '#007AFF'
        },
        {
            id: 6,
            from: 'Office',
            to: 'Home',
            time: 'Jan 25, 5:00 PM',
            co2: '2.1 kg',
            icon: Bike,
            color: '#34C759'
        }
    ];

    const maxWeeklyValue = 3.2;

    return (
        <div className="trips-screen screen">
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
                    onClick={() => navigate('/login')}>
                     <LogOut size={24} color="#343A40" />
                    </button>
                </div>
            </div>

            <div className="trips-header" style={{ marginTop: '56px' }}>
                <h1 className="eco-title">Eco Journey</h1>
                <p className="eco-subtitle">Track your environmental impact</p>
            </div>

            <div className="eco-tip-banner" style={{ backgroundColor: '#ECFEFF' }}>
                <div className="tip-icon-container">
                    <Lightbulb size={24} color="#FFFFFF" fill="#FFEB3B" />
                </div>
                <div className="tip-content">
                    <h3>Eco Tip of the Day</h3>
                    <p>Taking the bus instead of driving can save up to 2.6 kg of CO₂ per trip!</p>
                </div>
            </div>

            <div className="eco-card monthly-progress">
                <h3>Monthly CO₂ Progress</h3>
                <div className="gauge-container">
                    <svg className="gauge-svg" viewBox="0 0 100 50">
                        {/* Background arc */}
                        <path
                            d="M 10 45 A 35 35 0 0 1 90 45"
                            fill="none"
                            stroke="#E9ECEF"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        {/* Progress arc (79%) */}
                        <path
                            d="M 10 45 A 35 35 0 0 1 90 45"
                            fill="none"
                            stroke="#002B49"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="110"
                            strokeDashoffset="23"
                        />
                    </svg>
                    <div className="gauge-info">
                        <span className="gauge-value">47.3</span>
                        <span className="gauge-label">kg CO₂ saved</span>
                    </div>
                </div>
                <p className="goal-text">79% of monthly goal (60 kg)</p>
            </div>

            <div className="eco-card weekly-impact">
                <h3>This Week's Impact</h3>
                <div className="bar-chart-container">
                    <div className="y-axis">
                        <span>3.2</span>
                        <span>2.4</span>
                        <span>1.6</span>
                        <span>0.8</span>
                        <span>0</span>
                    </div>
                    <div className="bars-and-labels">
                        <div className="bars-container">
                            {weeklyData.map((d, i) => (
                                <div key={i} className="bar-wrapper">
                                    <div
                                        className="chart-bar"
                                        style={{ height: `${(d.value / maxWeeklyValue) * 100}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="x-axis">
                            {weeklyData.map((d, i) => (
                                <span key={i}>{d.day}</span>
                            ))}
                        </div>
                    </div>
                    <div className="y-axis-label">kg CO₂</div>
                </div>
            </div>

            <div className="recent-trips" style={{ padding: '24px 4px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#000000' }}>Recent Trips</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentTrips.map((trip) => {
                        const IconComponent = trip.icon;
                        return (
                            <div key={trip.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#EEEEEE'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}>
                                {/* Icon Container */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '10px',
                                    backgroundColor: trip.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <IconComponent size={24} color="#FFFFFF" />
                                </div>

                                {/* Trip Details */}
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#000000',
                                        marginBottom: '4px'
                                    }}>
                                        {trip.from} → {trip.to}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6C757D'
                                    }}>
                                        {trip.time}
                                    </div>
                                </div>

                                {/* CO2 Saved */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#34C759',
                                        marginBottom: '2px'
                                    }}>
                                        {trip.co2}
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: '#6C757D'
                                    }}>
                                        CO₂ saved
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyTrips;
