import React, { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
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
        console.log('Login data:', formData);

        // Mock authentication success
        if (onLogin) {
            onLogin();
            navigate('/home');
        }
    };

    return (
        <div className="screen" style={{ overflow: 'hidden', height: '100vh', backgroundColor: '#FFFFFF', position: 'relative' }}>
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">
                        <img src="/logo.jpg" alt="TransitEase Logo" className="login-brand-logo" />
                    </div>
                    <h1>Hi, Welcome Back!</h1>
                    <p>Sign in to continue</p>
                </div>

                <button
                    type="button"
                    className="btn btn-success mb-20"
                    style={{ justifyContent: 'center' }}
                    onClick={handleSubmit}
                >
                    <Fingerprint size={20} />
                    <span>Login with Biometrics</span>
                </button>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
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

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">
                        Login
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: '#6C757D' }}>
                        Don't have an account? <span
                            onClick={() => navigate('/register')}
                            style={{ color: '#002B49', fontWeight: '700', cursor: 'pointer' }}
                        >Register</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
