# Transit App - Frontend

A mobile-first React web application for accessible public transportation, matching the Figma design specifications.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm start
```
Opens the app at `http://localhost:3000`

### Production Build
```bash
npm run build
```

## 📱 Features

### Authentication
- Splash screen with auto-transition
- Login with biometric support
- Account registration
- Disability verification modal

### Dashboard
- Live weather information
- CO₂ savings tracker
- Voice-enabled search bar
- Interactive map view

### Transit Search
- Filter options (Depart Now, Lowest CO₂, Accessible)
- Multiple transport modes (Bus, Train, MRT/LRT)
- Route comparison cards
- Real-time information

### Journey Tracking
- Environmental impact notifications
- Step-by-step itinerary
- Active trip guidance
- Quick stop functionality

### Accessibility
- Disability mode FAB button
- Accessible navigation
- Screen reader support ready
- High contrast options

## 🎨 Design System

### Colors
- Primary Navy: `#002B49`
- Success Green: `#00C853`
- Alert Red: `#D32F2F`
- Warning Orange: `#FF9800`

### Layout
- Maximum width: 480px (mobile-optimized)
- Responsive design
- Touch-friendly interactions

## 🔧 Backend Integration

The frontend is ready for backend integration. Key integration points:

1. **Authentication APIs**: Login, registration, biometric auth
2. **Weather Data**: Real-time weather and air quality
3. **Transit Data**: Routes, schedules, fares
4. **CO₂ Tracking**: Environmental impact calculations
5. **Map Services**: Location services and route visualization

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/          # Authentication screens
│   ├── Dashboard/     # Home and dashboard cards
│   ├── Transit/       # Search and route components
│   ├── Journey/       # Trip tracking components
│   └── Navigation/    # Bottom nav and FAB
├── App.jsx            # Main app with routing
├── App.css            # Global styles
└── index.js           # Entry point
```

## 🎯 Logo Placeholder

The logo placeholder is located in `src/components/Auth/SplashScreen.jsx` (line 7).
Currently uses 🚌 emoji - replace with your actual logo image.

## 🌐 Routes

- `/` - Redirects to login
- `/login` - Login screen
- `/register` - Account creation
- `/home` - Main dashboard
- `/search` - Transit search
- `/journey-details` - Route details
- `/active-trip` - Active journey tracking
- `/trips` - Trip history
- `/disability` - Accessibility settings
- `/games` - Gamification features
- `/profile` - User profile

## 📦 Dependencies

- React 18.2.0
- React Router DOM 6.20.0
- React Scripts 5.0.1

## 🎨 Figma Design

This app was built to match the Transit app Figma design specifications with:
- Exact color matching
- Component accuracy
- Mobile-first approach
- Accessibility features

## 📝 Notes

- Maps are currently placeholders - integrate with Google Maps, Mapbox, or similar
- All forms log to console - connect to your backend API
- Logo spaces are ready for your branding
- All components are modular and easy to customize

---

Built with ❤️ for accessible public transportation
