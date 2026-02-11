import React from 'react';
import { ArrowLeft, Bell, Edit2, Mail, User, Phone, Leaf, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onLogout }) => {
    const navigate = useNavigate();

    return (
        <div className="profile-screen screen">
            {/* Header */}
            <div className="profile-header">
                <button className="icon-btn-ghost" onClick={() => navigate('/home')}>
                    <ArrowLeft size={24} color="#343A40" />
                </button>
                <span className="header-title">Welcome, Chuba!</span>
                <button className="icon-btn-ghost" onClick={() => navigate('/notifications')}>
                    <Bell size={24} color="#343A40" />
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-section-title">
                    <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' , marginTop: '20px' }}>Profile</h2>
                    <p style={{ fontSize: '14px', color: '#6C757D', margin: 0 }}>Manage your account</p>
                </div>

                {/* User Summary Card */}
                <div className="user-summary-card">
                    <div className="profile-avatar-large">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" alt="Profile" />
                        <div className="avatar-edit-badge">
                            <Edit2 size={12} color="white" />
                        </div>
                    </div>
                    <div className="user-info-text">
                        <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px 0' }}>James Johnson</h3>
                        <p style={{ fontSize: '12px', color: '#ADB5BD', margin: '0 0 16px 0' }}>Member since Jan 2025</p>
                    </div>
                    <div className="co2-total-badge">
                        <Leaf size={16} color="#00C853" fill="#00C853" />
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#33691E' }}>47.3 kg CO₂</span>
                        <span style={{ fontSize: '12px', color: '#66BB6A', marginLeft: '4px' }}>saved total</span>
                    </div>
                </div>

                {/* Account Details Card */}
                <div className="account-details-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Account Details</h4>
                        <button
                            className="edit-link-btn"
                            onClick={() => navigate('/profile/edit')}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#4A90E2', fontWeight: '600', cursor: 'pointer' }}
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><Mail size={18} color="#6C757D" /></div>
                        <div className="detail-info">
                            <label>Email</label>
                            <p>james.johnson@email.com</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><User size={18} color="#6C757D" /></div>
                        <div className="detail-info">
                            <label>Username</label>
                            <p>James Johnson</p>
                        </div>
                    </div>

                    <div className="detail-item">
                        <div className="detail-icon"><Phone size={18} color="#6C757D" /></div>
                        <div className="detail-info">
                            <label>Mobile Number</label>
                            <p>0712 667 2030</p>
                        </div>
                    </div>
                </div>

                {/* Impact Summary Card */}
                <div style={{
                    backgroundColor: '#2B7FFF',
                    borderRadius: '16px',
                    padding: '16px',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                    marginBottom: '20px'
                }}>
                    <div style={{ fontSize: '16px', fontWeight: '400', marginBottom: '12px' }}>Your Impact</div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            borderRadius: '12px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '400', marginBottom: '4px' }}>47.3 kg</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Total CO₂ Saved</div>
                        </div>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            borderRadius: '12px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '400', marginBottom: '4px' }}>2.1</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Trees Equivalent</div>
                        </div>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            borderRadius: '12px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '400', marginBottom: '4px' }}>142 mi</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Eco Distance</div>
                        </div>
                        <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            borderRadius: '12px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '400', marginBottom: '4px' }}>38</div>
                            <div style={{ fontSize: '12px', opacity: 0.9 }}>Eco Trips</div>
                        </div>
                    </div>
                </div>

                {/* Buttons Section */}
                <div className="logout-section">
                    <button className="settings-btn" onClick={() => navigate('/profile/edit')}>
                        <Settings size={20} />
                        <span>Settings</span>
                    </button>
                    <button className="logout-btn" onClick={() => {
                        onLogout();
                        navigate('/login');
                    }}>
                        <LogOut size={20} />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
