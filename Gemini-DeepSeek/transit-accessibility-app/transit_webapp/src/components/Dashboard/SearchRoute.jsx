import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Bell, MapPin, Menu, Bus, Train, TrainFront, ChevronDown, LocateFixed, Search } from 'lucide-react';
import RouteCard from '../Transit/RouteCard';
import { useNavigate, useLocation } from 'react-router-dom';
import OSRMMap from '../Map/OSRMMap';
import { buildURL, API_CONFIG } from '../../config/api';
import { routeService } from '../../services/routeService';

const SearchRoute = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get search query from navigation state
    const initialSearchQuery = location.state?.searchQuery || '';

    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [activeTab, setActiveTab] = useState('bus');
    const [activeFilters, setActiveFilters] = useState(['accessible']);
    const [drawerPosition, setDrawerPosition] = useState(65);
    const [isDragging, setIsDragging] = useState(false);
    const [isDepartDropdownOpen, setIsDepartDropdownOpen] = useState(false);
    const [selectedDepartOption, setSelectedDepartOption] = useState('Depart Now');
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const [showRecommendation, setShowRecommendation] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null); // Store selected location from search
    const [mapCenter, setMapCenter] = useState([3.1390, 101.6869]); // Kuala Lumpur default
    const [fetchedRoutes, setFetchedRoutes] = useState([]); // Routes from backend
    const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
    const drawerRef = useRef(null);
    const startYRef = useRef(0);
    const startPosRef = useRef(0);
    const departDropdownRef = useRef(null);
    const departButtonRef = useRef(null);
    const dropdownMenuRef = useRef(null);

    // Base route templates - station names will be updated based on search
    const baseRoutes = [
        {
            id: 1,
            type: 'bus',
            recommended: true,
            station: 'Bus Station',
            distance: '6.5 km',
            duration: '25 mins',
            arrivalTime: '8:50 pm',
            cost: '$1.80',
            co2: '320g',
            co2Label: 'Save CO₂',
            badge: { type: 'good', text: 'Good' },
            tags: ['Accessible']
        },
        {
            id: 2,
            type: 'bus',
            recommended: false,
            station: 'Bus Station',
            distance: '5.0 km',
            duration: '40 mins',
            arrivalTime: '8:30 pm',
            cost: '$1.50',
            co2: '200g',
            co2Label: 'Save CO₂',
            badge: { type: 'moderate', text: 'Moderate' },
            tags: ['Accessible'],
            isRisk: true,
            riskText: 'Risky Area (Bad Pollution)'
        },
        {
            id: 3,
            type: 'train',
            recommended: true,
            station: 'Train Station',
            distance: '3.2 km',
            duration: '15 mins',
            arrivalTime: '8:45 pm',
            cost: '$2.50',
            co2: '150g',
            co2Label: 'Save CO₂',
            badge: { type: 'good', text: 'Fast' },
            tags: ['Accessible']
        },
        {
            id: 4,
            type: 'mrt',
            recommended: true,
            station: 'MRT Station',
            distance: '2.2 km',
            duration: '10 mins',
            arrivalTime: '8:35 pm',
            cost: '$3.50',
            co2: '200g',
            co2Label: 'Save CO₂',
            badge: { type: 'good', text: 'Fast' },
            tags: ['Accessible']
        },
        {
            id: 5,
            type: 'mrt',
            recommended: false,
            station: 'LRT Station',
            distance: '2.2 km',
            duration: '10 mins',
            arrivalTime: '8:35 pm',
            cost: '$3.50',
            co2: '200g',
            co2Label: 'Save CO₂',
            badge: { type: 'bad', text: 'Bad' },
            tags: ['Accessible'],
            isRisk: true,
            riskText: 'Risky Area (Bad Pollution)'
        }
    ];

    // Function to search for places using backend API
    const searchPlaces = async (query) => {
        if (!query || query.length < 2) {
            // setSearchResults([]); // Removed unused state setter
            return;
        }

        setIsSearching(true);
        try {
            console.log('Searching for:', query);
            const url = buildURL(API_CONFIG.maps.geocode, { q: query, limit: 5 });
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Search results:', data);

            if (data.results && Array.isArray(data.results)) {
                setSearchResults(data.results);
            } else {
                console.warn('No results found or invalid response format');
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching places:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // NEW: Handle when user selects a location from search results
    const handleSelectLocation = async (result) => {
        console.log('Selected location:', result);
        
        // Update selected location and map center
        setSelectedLocation(result);
        setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
        setSearchQuery(result.display_name);
        setSearchResults([]); // Close dropdown
        
        // Fetch real routes from backend for this location
        await fetchRoutesForLocation(result);
    };

    // NEW: Fetch routes from backend for selected location
    const fetchRoutesForLocation = async (location) => {
        setIsLoadingRoutes(true);
        try {
            const backendRoutes = await routeService.planRoute({
                origin: 'Current Location',
                destination: location.display_name,
                accessibility_priority: 'balanced',
                optimize: 'balanced',
                lat: parseFloat(location.lat),
                lon: parseFloat(location.lon)
            });

            // Transform backend routes to match frontend format
            const transformedRoutes = backendRoutes.map((route, index) => ({
                id: index + 1,
                type: route.mode,
                recommended: route.accessibility_score > 90,
                station: route.destination || location.display_name,
                distance: `${((route.estimated_time_minutes * 0.5) || 5).toFixed(1)} km`,
                duration: `${route.estimated_time_minutes} mins`,
                arrivalTime: calculateArrivalTime(route.estimated_time_minutes),
                cost: calculateCost(route.mode, route.estimated_time_minutes),
                co2: route.estimated_co2_kg ? `${Math.round(route.estimated_co2_kg * 1000)}g` : '0g',
                co2Label: 'Save CO₂',
                badge: getBadgeForScore(route.accessibility_score),
                tags: getRouteTags(route),
                envAlert: route.co2_saved_vs_car_kg 
                    ? `Saves ${route.co2_saved_vs_car_kg.toFixed(1)}kg CO₂ vs driving!`
                    : 'Eco-friendly transit option'
            }));

            setFetchedRoutes(transformedRoutes);
        } catch (error) {
            console.error('Failed to fetch routes:', error);
            // Use mock data as fallback
            setFetchedRoutes(createRoutesFromSearch(location.display_name));
        } finally {
            setIsLoadingRoutes(false);
        }
    };

    // Helper functions for route transformation
    const calculateArrivalTime = (minutes) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + minutes);
        return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const calculateCost = (mode, minutes) => {
        const baseCosts = { bus: 1.5, subway: 2.0, train: 2.0, mrt: 2.5 };
        const cost = (baseCosts[mode] || 1.5) + (minutes / 60);
        return `$${cost.toFixed(2)}`;
    };

    const getBadgeForScore = (score) => {
        if (score >= 95) return { type: 'excellent', text: 'Excellent' };
        if (score >= 85) return { type: 'good', text: 'Good' };
        if (score >= 70) return { type: 'moderate', text: 'Moderate' };
        return { type: 'bad', text: 'Limited' };
    };

    const getRouteTags = (route) => {
        const tags = [];
        if (route.wheelchair_accessible) tags.push('Accessible');
        if (route.has_elevator) tags.push('Elevator');
        if (route.audio_assistance_available) tags.push('Audio Aid');
        if (route.estimated_co2_kg && route.estimated_co2_kg < 0.2) tags.push('Climate Friendly');
        return tags;
    };

    // Function to create routes based on search results (fallback)
    const createRoutesFromSearch = (searchQuery) => {
        try {
            if (!searchQuery || searchQuery.trim() === '') {
                return baseRoutes.map(route => ({
                    ...route,
                    station: `${route.station.includes('MRT') ? 'MRT' : route.station.includes('LRT') ? 'LRT' : route.station.includes('Train') ? 'Train' : 'Bus'} Station`
                }));
            }

            // Clean the search query
            const cleanQuery = searchQuery.trim();
            console.log('Creating routes for query:', cleanQuery);

            return baseRoutes.map(route => ({
                ...route,
                station: route.type === 'bus' ? `${cleanQuery} Bus Station` :
                    route.type === 'train' ? `${cleanQuery} Train Station` :
                        route.type === 'mrt' ? (route.id === 5 ? `${cleanQuery} LRT Station` : `${cleanQuery} MRT Station`) :
                            `${cleanQuery} Station`
            }));
        } catch (error) {
            console.error('Error creating routes from search:', error);
            return baseRoutes; // Fallback to base routes
        }
    };

    // Use fetched routes if available, otherwise create from search query
    const routes = fetchedRoutes.length > 0 ? fetchedRoutes : createRoutesFromSearch(searchQuery);

    const filteredRoutes = routes.filter(r => r.type === activeTab);

    // Show recommendation when routes are available
    useEffect(() => {
        if (filteredRoutes.length > 0) {
            setShowRecommendation(true);
        }
    }, [filteredRoutes]); // Dependency array fixed

    // Search for places when query changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchPlaces(searchQuery);
        }, 300); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchQuery]); // Dependency array fixed

    // Show recommendation when routes are available
    useEffect(() => {
        if (searchQuery && filteredRoutes.length > 0) {
            setShowRecommendation(true);
        }
    }, [searchQuery, filteredRoutes]);

    // Draggable drawer handlers
    const handleDragStart = (e) => {
        setIsDragging(true);
        startYRef.current = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        startPosRef.current = drawerPosition;
    };

    const handleDragMove = useCallback((e) => {
        if (!isDragging) return;

        const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
        const deltaY = startYRef.current - currentY;
        const newPosition = Math.max(20, Math.min(65, startPosRef.current + (deltaY / window.innerHeight) * 100));

        setDrawerPosition(newPosition);
    }, [isDragging]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Snap to positions
        if (drawerPosition < 30) {
            setDrawerPosition(20);
        } else if (drawerPosition > 50) {
            setDrawerPosition(65);
        } else {
            setDrawerPosition(40);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (departDropdownRef.current && !departDropdownRef.current.contains(event.target) &&
                dropdownMenuRef.current && !dropdownMenuRef.current.contains(event.target)) {
                setIsDepartDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const departOptions = [
        'Depart Now',
        'Leave at 8:00 PM',
        'Leave at 8:30 PM',
        'Leave at 9:00 PM',
        'Arrive by 8:00 PM',
        'Arrive by 8:30 PM',
        'Arrive by 9:00 PM'
    ];


    return (
        <div className={`home-screen screen ${searchQuery ? 'searching' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative' }}>

            {/* Real OSRM Map Background Container */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
                pointerEvents: 'auto'  // Enable mouse interactions
            }}>
                <OSRMMap 
                    center={mapCenter} // Dynamic map center based on search
                    zoom={selectedLocation ? 15 : 13}
                    markers={selectedLocation ? [
                        {
                            lat: selectedLocation.lat,
                            lon: selectedLocation.lon,
                            popup: selectedLocation.display_name
                        }
                    ] : [
                        {
                            lat: 3.1390,
                            lon: 101.6869,
                            popup: "Your Location - Kuala Lumpur"
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
                        onClick={() => navigate('/home')}>
                        <ArrowLeft size={24} color="#343A40" />
                    </button>
                </div>
                {/* Center */}
                <h2 style={{ margin: 0, fontSize: '18px' }}>Search Routes</h2>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="icon-btn-ghost"
                        onClick={() => navigate('/notifications')}>
                        <Bell size={24} color="#343A40" />
                    </button>
                </div>
            </div>

            {/* Top Container - 10% of screen */}
            <div style={{
                height: '10%',
                position: 'relative',
                backgroundColor: '#FFFFFF',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                margin: 0,
                marginTop: '56px',
                zIndex: 5,
                pointerEvents: 'auto'  // Keep UI elements interactive
            }}>
                {/* Live Location Header */}
                <div className="home-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px 24px', margin: 0, backgroundColor: 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="menu-btn-mobile" style={{ display: 'none' }}>
                            <Menu size={24} color="#343A40" />
                        </div>
                        <div className="home-greeting">
                            <div style={{ fontSize: '14px', color: '#6C757D', marginBottom: '6px' }}>Your current location</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                <MapPin size={16} color="#D32F2F" fill="#D32F2F" />
                                <h2 style={{ margin: 0, fontSize: '18px' }}>Kuala Lumpur, Malaysia</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Container - 80% of screen */}
            <div style={{
                flex: 1,
                position: 'relative',
                backgroundColor: 'transparent',
                overflow: 'hidden',
                margin: 0,
                zIndex: 5,
                pointerEvents: 'none'  // Allow map interactions through this container
            }}>
            </div>

            {/* GPS Location Button */}
            <button
                onClick={() => {
                    console.log('Center map on user location');
                    // Add your GPS centering logic here
                }}
                style={{
                    position: 'fixed',
                    bottom: '150px',
                    right: '20px',
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 200,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                <LocateFixed size={24} color="#054777" />
            </button>

            {/* Draggable Container */}
            <div
                ref={drawerRef}
                className="draggable-container"
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${drawerPosition}vh`,
                    backgroundColor: '#054777',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px',
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
                    transition: isDragging ? 'none' : 'height 0.3s ease',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
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
                    }}
                >
                    <div style={{
                        width: '40px',
                        height: '4px',
                        backgroundColor: '#CED4DA',
                        borderRadius: '2px',
                    }} />
                </div>

                {/* Drawer Content */}
                <div style={{
                    flex: 1,
                    padding: '0 16px 16px 16px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                }}>
                    {/* Search Bar Container */}
                    <div className="search-bar-container" style={{ marginBottom: '16px', position: 'relative' }}>
                        <div className="search-bar">
                            <MapPin
                                color="#000000"
                                size={20}
                            />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Where do you want to go?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ fontWeight: '600', color: '#000000' }}
                            />
                            {isSearching ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6C757D' }}>
                                    Searching...
                                </div>
                            ) : (
                                <Search
                                    color="#000000"
                                    size={20}
                                    style={{ cursor: 'pointer' }}
                                />
                            )}
                        </div>
                        
                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                zIndex: 1000,
                                marginTop: '4px'
                            }}>
                                {searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectLocation(result)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: index < searchResults.length - 1 ? '1px solid #E9ECEF' : 'none',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F9FA'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <MapPin size={16} color="#054777" />
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: '500', color: '#343A40' }}>
                                                    {result.display_name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#6C757D' }}>
                                                    {result.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Suggested Routes Header */}
                    <div style={{
                        marginBottom: '16px',
                        fontSize: '14px',
                        fontWeight: '50',
                        color: '#FFFFFF'
                    }}>
                        Suggested Routes
                    </div>

                    {/* Filters Row */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', position: 'relative', zIndex: 1 }}>
                        <div ref={departDropdownRef} style={{ position: 'relative' }}>
                            <div
                                ref={departButtonRef}
                                onClick={(e) => {
                                    const rect = departButtonRef.current.getBoundingClientRect();
                                    setDropdownPosition({
                                        top: rect.bottom + 4,
                                        left: rect.left
                                    });
                                    setIsDepartDropdownOpen(!isDepartDropdownOpen);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: '1px solid #00C853',
                                    backgroundColor: selectedDepartOption !== 'Depart Now' ? '#00C853' : '#fff',
                                    color: selectedDepartOption !== 'Depart Now' ? '#fff' : '#00C853',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>{selectedDepartOption}</span>
                                <ChevronDown size={14} color={selectedDepartOption !== 'Depart Now' ? '#fff' : '#00C853'} style={{ transform: isDepartDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </div>
                        </div>
                        <div
                            onClick={() => setActiveFilters(prev => prev.includes('co2') ? prev.filter(f => f !== 'co2') : [...prev, 'co2'])}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #CED4DA',
                                backgroundColor: activeFilters.includes('co2') ? '#00C853' : '#fff',
                                color: activeFilters.includes('co2') ? '#fff' : '#343A40',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Lowest CO₂
                        </div>
                        <div
                            onClick={() => setActiveFilters(prev => prev.includes('accessible') ? prev.filter(f => f !== 'accessible') : [...prev, 'accessible'])}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #CED4DA',
                                backgroundColor: activeFilters.includes('accessible') ? '#00C853' : '#fff',
                                color: activeFilters.includes('accessible') ? '#fff' : '#343A40',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Accessible
                        </div>
                        <div
                            onClick={() => setActiveFilters(prev => prev.includes('Safe Air Quality') ? prev.filter(f => f !== 'Safe Air Quality') : [...prev, 'Safe Air Quality'])}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #CED4DA',
                                backgroundColor: activeFilters.includes('Safe Air Quality') ? '#00C853' : '#fff',
                                color: activeFilters.includes('Safe Air Quality') ? '#fff' : '#343A40',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Safe Air Quality
                        </div>
                        <div
                            onClick={() => setActiveFilters(prev => prev.includes('cheapest') ? prev.filter(f => f !== 'cheapest') : [...prev, 'cheapest'])}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #CED4DA',
                                backgroundColor: activeFilters.includes('cheapest') ? '#00C853' : '#fff',
                                color: activeFilters.includes('cheapest') ? '#fff' : '#343A40',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Cheapest
                        </div>
                        <div
                            onClick={() => setActiveFilters(prev => prev.includes('fastest') ? prev.filter(f => f !== 'fastest') : [...prev, 'fastest'])}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                border: '1px solid #CED4DA',
                                backgroundColor: activeFilters.includes('fastest') ? '#00C853' : '#fff',
                                color: activeFilters.includes('fastest') ? '#fff' : '#343A40',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Fastest
                        </div>
                    </div>

                    {/* Transport Type Tabs */}
                    <div style={{
                        display: 'flex',
                        gap: '0',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'transparent'
                    }}>
                        <div
                            onClick={() => setActiveTab('bus')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 8px',
                                cursor: 'pointer',
                                position: 'relative',
                                color: activeTab === 'bus' ? '#FFFF00' : '#FFFFFF',
                                backgroundColor: activeTab === 'bus' ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                                borderBottom: activeTab === 'bus' ? '3px solid #FFFF00' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Bus size={24} color={activeTab === 'bus' ? '#FFFF00' : '#FFFFFF'} />
                            <span style={{ fontSize: '12px', fontWeight: activeTab === 'bus' ? '600' : '400' }}>Bus</span>
                        </div>
                        <div
                            onClick={() => setActiveTab('train')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 8px',
                                cursor: 'pointer',
                                position: 'relative',
                                color: activeTab === 'train' ? '#FFFF00' : '#FFFFFF',
                                backgroundColor: activeTab === 'train' ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                                borderBottom: activeTab === 'train' ? '3px solid #FFFF00' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Train size={24} color={activeTab === 'train' ? '#FFFF00' : '#FFFFFF'} />
                            <span style={{ fontSize: '12px', fontWeight: activeTab === 'train' ? '600' : '400' }}>Train</span>
                        </div>
                        <div
                            onClick={() => setActiveTab('mrt')}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px 8px',
                                cursor: 'pointer',
                                position: 'relative',
                                color: activeTab === 'mrt' ? '#FFFF00' : '#FFFFFF',
                                backgroundColor: activeTab === 'mrt' ? 'rgba(255, 193, 7, 0.1)' : 'transparent',
                                borderBottom: activeTab === 'mrt' ? '3px solid #FFFF00' : '3px solid transparent',
                                transition: 'all 0.2s'
                            }}
                        >
                            <TrainFront size={24} color={activeTab === 'mrt' ? '#FFFF00' : '#FFFFFF'} />
                            <span style={{ fontSize: '12px', fontWeight: activeTab === 'mrt' ? '600' : '400' }}>MRT/LRT</span>
                        </div>
                    </div>

                    {/* Routes List */}
                    <div style={{ paddingBottom: '50px' }}>
                        {isLoadingRoutes ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#FFFFFF' }}>
                                <div style={{ fontSize: '16px', marginBottom: '8px' }}>🔍 Finding best routes...</div>
                                <div style={{ fontSize: '14px', color: '#CED4DA' }}>Checking accessibility & emissions</div>
                            </div>
                        ) : filteredRoutes.length > 0 ? (
                            <>
                                {selectedLocation && (
                                    <div style={{ 
                                        marginBottom: '16px', 
                                        padding: '12px', 
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                        borderRadius: '8px',
                                        color: '#FFFFFF',
                                        fontSize: '14px'
                                    }}>
                                        📍 Showing routes to: <strong>{selectedLocation.display_name}</strong>
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {filteredRoutes.map(route => (
                                        <div
                                            key={route.id}
                                            onClick={() => {
                                                try {
                                                    // Store selected station data for next components
                                                    setSelectedStation(route);
                                                    localStorage.setItem('selectedRoute', JSON.stringify(route));
                                                    console.log('Selected route:', route);

                                                    if (route.id === 1) {
                                                        navigate('/journey-details');
                                                    } else if (route.id === 2) {
                                                        navigate('/journey-details-2');
                                                    } else if (route.id === 3) {
                                                        navigate('/journey-details');
                                                    } else if (route.id === 4) {
                                                        navigate('/journey-details');
                                                    } else if (route.id === 5) {
                                                        navigate('/journey-details-2');
                                                    } else {
                                                        navigate('/Transit');
                                                    }
                                                } catch (error) {
                                                    console.error('Error selecting route:', error);
                                                    // Fallback navigation
                                                    navigate('/journey-details');
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <RouteCard route={route} />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px', color: '#6C757D' }}>No routes found for this transport type.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Recommendation Container */}
            {showRecommendation && (
                <div
                    onClick={() => {
                        try {
                            // Get the first recommended route
                            const recommendedRoute = routes.find(route => route.recommended) || routes[0];
                            if (recommendedRoute) {
                                localStorage.setItem('selectedRoute', JSON.stringify(recommendedRoute));
                                console.log('Selected recommended route:', recommendedRoute);
                            }
                            navigate('/journey-details');
                        } catch (error) {
                            console.error('Error selecting recommended route:', error);
                            navigate('/journey-details');
                        }
                    }}
                    style={{
                        position: 'fixed',
                        top: '160px',
                        left: '16px',
                        right: '16px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '16px 20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        animation: 'slideDown 0.3s ease-out'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#000000',
                            marginBottom: '4px'
                        }}>
                            Best Route for you..
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: '#6C757D',
                            fontWeight: '400'
                        }}>
                            Tap to save 100kg CO₂
                        </div>
                    </div>
                    <button
                        style={{
                            backgroundColor: '#00C853',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0, 200, 83, 0.3)',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#00A844';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#00C853';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        Save CO₂
                    </button>
                </div>
            )}

            {/* Dropdown Menu - Fixed Position Outside Container */}
            {isDepartDropdownOpen && (
                <div
                    ref={dropdownMenuRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                        zIndex: 10000,
                        minWidth: '180px',
                        maxHeight: '250px',
                        overflowY: 'auto'
                    }}
                >
                    {departOptions.map((option, index) => (
                        <div
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Selected:', option);
                                setSelectedDepartOption(option);
                                setIsDepartDropdownOpen(false);
                            }}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                backgroundColor: selectedDepartOption === option ? '#00C853' : 'transparent',
                                borderBottom: index < departOptions.length - 1 ? '1px solid #E9ECEF' : 'none',
                                fontSize: '14px',
                                color: selectedDepartOption === option ? '#FFFFFF' : '#343A40',
                                fontWeight: selectedDepartOption === option ? '600' : '400',
                                transition: 'background-color 0.2s',
                                borderRadius: index === 0 ? '12px 12px 0 0' : index === departOptions.length - 1 ? '0 0 12px 12px' : '0'
                            }}
                            onMouseEnter={(e) => {
                                if (selectedDepartOption !== option) {
                                    e.currentTarget.style.backgroundColor = '#F8F9FA';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (selectedDepartOption !== option) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchRoute;
