import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Gamepad2, User, Accessibility } from 'lucide-react';

const BottomNav = ({ onDisabilityClick }) => {
    // Handle disability button click with the same logic as DisabilityFAB
    const handleDisabilityClick = () => {
        if (onDisabilityClick) {
            onDisabilityClick();
        }
    };

    return (
        <div className="bottom-nav" style={{ position: 'relative' }}>
            <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/trips" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Map size={24} />
                <span>My Trips</span>
            </NavLink>

            {/* Floating Disability Mode Button with enhanced functionality */}
            <button
                className="disability-mode-button"
                style={{
                    position: 'absolute',
                    top: '-30px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ff0000',
                    border: '4px solid #FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(255, 0, 0, 0.4)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    overlay: 'visible',
                }}
                onClick={handleDisabilityClick}
                aria-label="Open disability assistance options"
                title="Accessibility Options - Click for disability assistance including voice navigation for blind users"
            >
                <Accessibility size={32} color="#FFFFFF" />
            </button>

            <NavLink to="/disability" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Map size={24} />
                <span>Disability</span>
            </NavLink>
            <NavLink to="/games" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Gamepad2 size={24} />
                <span>Games</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;

