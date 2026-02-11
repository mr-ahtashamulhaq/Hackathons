import React, { useState } from 'react';
import { ScanFace, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateAccount = ({ onRegister }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        mobile: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registration data:', formData);

        // Mock registration success
        if (onRegister) {
            onRegister();
            navigate('/home');
        }
    };

    return (
        <div className="screen" style={{ overflow: 'hidden', height: '100vh' }}>
            <div className="auth-container">
                <div className="auth-header" style={{ marginBottom: '20px' }}>
                    <img src="/logo.jpg" alt="TransitEase Logo" className="login-brand-logo" />
                    <h1 style={{ margin: '8px 0 4px 0' }}>Create Account</h1>
                    <p style={{ margin: '0 0 16px 0' }}>Sign up to get started</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="mobile">Mobile Number</label>
                        <input
                            type="tel"
                            id="mobile"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter your mobile number"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            required
                        />
                    </div>

                    <div className="biometric-section" style={{ marginTop: '-10px', marginBottom: '10px' }}>
                        <p style={{ marginBottom: '12px', fontWeight: '600', color: '#002B49', fontSize: '14px' }}>
                            Scan to Register Biometrics
                        </p>
                        <div className="biometric-icons">
                            <div className="biometric-icon">
                                <ScanFace size={28} color="#002B49" />
                            </div>
                            <div className="biometric-icon">
                                <Fingerprint size={28} color="#002B49" />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0px', marginBottom: '16px' }}>
                        Create Account
                    </button>
                </form>

                <div style={{ marginTop: '-5px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6C757D', margin: 0 }}>
                        Already have an account? <span
                            onClick={() => navigate('/login')}
                            style={{ color: '#002B49', fontWeight: '700', cursor: 'pointer' }}
                        >Login</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateAccount;
