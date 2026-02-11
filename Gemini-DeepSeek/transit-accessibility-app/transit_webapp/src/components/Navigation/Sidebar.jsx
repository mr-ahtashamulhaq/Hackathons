import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Gamepad2, User } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="sidebar" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#FFFFFF'
        }}>
            <div className="sidebar-logo" style={{
                padding: '20px',
                borderBottom: '1px solid #E9ECEF'
            }}>
                <img src="/logo.jpg" alt="TransitEase Logo" className="sidebar-brand-logo" />
            </div>

            <nav className="sidebar-nav" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: '20px 0'
            }}>
                <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    color: isActive ? '#007AFF' : '#000000',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: isActive ? '600' : '400',
                    borderLeft: isActive ? '4px solid #007AFF' : '4px solid transparent',
                    backgroundColor: isActive ? '#F0F8FF' : 'transparent'
                })}>
                    <Home size={24} />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/trips" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    color: isActive ? '#007AFF' : '#000000',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: isActive ? '600' : '400',
                    borderLeft: isActive ? '4px solid #007AFF' : '4px solid transparent',
                    backgroundColor: isActive ? '#F0F8FF' : 'transparent'
                })}>
                    <Map size={24} />
                    <span>My Trips</span>
                </NavLink>
                <NavLink to="/games" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    color: isActive ? '#007AFF' : '#000000',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: isActive ? '600' : '400',
                    borderLeft: isActive ? '4px solid #007AFF' : '4px solid transparent',
                    backgroundColor: isActive ? '#F0F8FF' : 'transparent'
                })}>
                    <Gamepad2 size={24} />
                    <span>Games</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 24px',
                    color: isActive ? '#007AFF' : '#000000',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: isActive ? '600' : '400',
                    borderLeft: isActive ? '4px solid #007AFF' : '4px solid transparent',
                    backgroundColor: isActive ? '#F0F8FF' : 'transparent'
                })}>
                    <User size={24} />
                    <span>Profile</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer" style={{
                padding: '20px',
                borderTop: '1px solid #E9ECEF'
            }}>
                <div className="user-info" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div className="user-avatar" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: '#007AFF',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>C</div>
                    <div className="user-details">
                        <div className="user-name" style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#000000'
                        }}>Chuba</div>
                        <div className="user-role" style={{
                            fontSize: '12px',
                            color: '#6C757D'
                        }}>Premium Member</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
