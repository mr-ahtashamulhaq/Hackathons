import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Auth Components
import SplashScreen from './components/Auth/SplashScreen';
import CreateAccount from './components/Auth/CreateAccount';
import Login from './components/Auth/Login';
import VerifyDisability from './components/Auth/VerifyDisability';

// Dashboard Components
import Home from './components/Dashboard/Home';
import SearchRoute from './components/Dashboard/SearchRoute';
import Games from './components/Dashboard/Games';

// Transit Components
import TransitSearch from './components/Transit/TransitSearch';

// Journey Components
import JourneyDetails from './components/Journey/JourneyDetails';
import JourneyDetails2 from './components/Journey/JourneyDetails2';
import ActiveTrip from './components/Journey/ActiveTrip';

// Profile Components
import Profile from './components/Profile/Profile';
import EditProfile from './components/Profile/EditProfile';
import Notifications from './components/Profile/Notifications';
import MyTrips from './components/Trips/MyTrips';

// Navigation Components
import BottomNav from './components/Navigation/BottomNav';

// Voice Assistant Component
import VoiceAssistant from './components/VoiceAssistant/VoiceAssistant';




// Protected Route Component
const ProtectedRoute = ({ children, isLoggedIn }) => {
    const location = useLocation();

    if (!isLoggedIn) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

function App() {
    const [showSplash, setShowSplash] = useState(true);
    const [isDisabilityModalOpen, setIsDisabilityModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Initialize state from local storage
        return localStorage.getItem('isLoggedIn') === 'true';
    });

    useEffect(() => {
        // Show splash screen for 2 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const handleLogin = (status) => {
        setIsLoggedIn(status);
        localStorage.setItem('isLoggedIn', status);
    };

    if (showSplash) {
        return <SplashScreen />;
    }

    return (
        <Router>
            <div className="app-container">
                <Routes>
                    {/* Auth Routes */}
                    <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} replace />} />
                    <Route path="/login" element={<Login onLogin={() => handleLogin(true)} />} />
                    <Route path="/register" element={<CreateAccount onRegister={() => handleLogin(true)} />} />

                    {/* Main App Routes (Protected) */}
                    <Route path="/home" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <Home />
                        </ProtectedRoute>
                    } />
                    <Route path="/search" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <TransitSearch />
                        </ProtectedRoute>
                    } />
                    <Route path="/searchroute" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <SearchRoute />
                        </ProtectedRoute>
                    } />
                    <Route path="/journey-details" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <JourneyDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/journey-details-2" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <JourneyDetails2 />
                        </ProtectedRoute>
                    } />
                    <Route path="/active-trip" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <ActiveTrip
                                currentAction="Walk to Shola Market"
                                destination="City Center"
                            />
                        </ProtectedRoute>
                    } />

                    {/* Profile Routes (Protected) */}
                    <Route path="/profile" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <Profile onLogout={() => handleLogin(false)} />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile/edit" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <EditProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <Notifications />
                        </ProtectedRoute>
                    } />

                    {/* Placeholder Routes for Bottom Nav (Protected) */}
                    <Route path="/trips" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <MyTrips />
                        </ProtectedRoute>
                    } />
                    <Route path="/games" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <Games />
                        </ProtectedRoute>
                    } />

                    {/* Voice Assistant Route for Blind Mode (Protected) */}
                    <Route path="/voice-assistant" element={
                        <ProtectedRoute isLoggedIn={isLoggedIn}>
                            <VoiceAssistant />
                        </ProtectedRoute>
                    } />
                </Routes>

                {/* Show Bottom Nav only if logged in and not on auth pages */}
                {isLoggedIn && !['/login', '/register'].includes(window.location.pathname) && (
                    <>
                        {/* Fixed Bottom Nav Container */}
                        <div style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 100,
                            pointerEvents: 'none'
                        }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                <BottomNav onDisabilityClick={() => setIsDisabilityModalOpen(true)} />
                            </div>
                        </div>
                    </>
                )}

                {/* Disability Verification Modal */}
                <VerifyDisability
                    isOpen={isDisabilityModalOpen}
                    onClose={() => setIsDisabilityModalOpen(false)}
                />
            </div>
        </Router>
    );
}

export default App;
