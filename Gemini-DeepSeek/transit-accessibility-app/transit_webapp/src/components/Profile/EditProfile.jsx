import React from 'react';
import { ArrowLeft, Bell, EyeOff, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-screen screen">
            {/* Header */}
            <div className="profile-header">
                <button className="icon-btn-ghost" onClick={() => navigate('/profile')}>
                    <ArrowLeft size={24} color="#343A40" />
                </button>
                <span className="header-title">Welcome, Chuba!</span>
                <button className="icon-btn-ghost" onClick={() => navigate('/notifications')}>
                    <Bell size={24} color="#343A40" />
                </button>
            </div>

            <div className="profile-content">
                <div className="profile-section-title">
                    <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '20px 0 4px 0' }}>Edit Profile</h2>
                    <p style={{ fontSize: '14px', color: '#6C757D', margin: 0 }}>Edit your account details</p>
                </div>

                {/* Avatar Edit */}
                <div className="edit-avatar-container">
                    <div className="profile-avatar-large">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" alt="Profile" />
                        <div className="avatar-camera-btn">
                            <Camera size={20} color="white" />
                        </div>
                    </div>
                </div>

                <div className="edit-form">
                    <div className="form-group">
                        <label>User Name</label>
                        <input type="text" defaultValue="James Johnson" />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Email</label>
                            <span className="form-action-text">Edit Your Email</span>
                        </div>
                        <input type="email" defaultValue="james.johnson@email.com" />
                    </div>

                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Mobile Number</label>
                            <span className="form-action-text">Edit Your Mobile Number</span>
                        </div>
                        <input type="tel" placeholder="Enter your number" />
                    </div>

                    <div className="form-group">
                        <label>Change Password/Biometrics</label>
                        <div className="input-with-icon">
                            <input type="password" placeholder="Enter your old password" />
                            <EyeOff size={18} color="#ADB5BD" />
                        </div>
                        <div className="input-with-icon" style={{ marginTop: '12px' }}>
                            <input type="password" placeholder="Enter your new password" />
                            <EyeOff size={18} color="#ADB5BD" />
                        </div>
                    </div>

                    <div className="form-buttons-row">
                        <button className="btn-secondary">Edit Your Biometrics</button>
                        <button className="btn-primary-orange" onClick={() => navigate('/profile')}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;
