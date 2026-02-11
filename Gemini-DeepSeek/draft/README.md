# Transit Accessibility App – Frontend

This is the web frontend for the Transit Accessibility App, built with React, Vite, and TypeScript.  
It focuses on accessibility-first UI and is designed to integrate with the FastAPI backend.

## Tech Stack
- React 18
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Leaflet (maps)

## Getting Started

### Prerequisites
- Node.js 18+

### Install & Run
```bash
cd frontend
npm install
npm run dev
````

The app will be available at:

```
http://localhost:3000
```

## Pages Implemented

### Home

* Entry point
* Navigation to Map page

### Map

* Interactive map using Leaflet + OpenStreetMap
* Route polyline and markers (mock data)
* Bottom panel with:

  * Route summary
  * Estimated time & distance
  * Accessibility indicators
  * Service alerts placeholder
* Ready for backend integration

## Accessibility Notes

* Semantic HTML structure
* Keyboard-accessible controls
* Clear visual hierarchy
* Placeholder states for missing data

## Backend Integration

* No direct API calls yet
* Components are structured to consume backend data when endpoints are ready

## Status

* MVP UI complete
* Map rendering stable
* Using placeholder data only