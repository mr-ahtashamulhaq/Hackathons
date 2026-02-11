import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers in React - simplified approach
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const OSRMMap = ({ center = [3.1390, 101.6869], zoom = 13, markers = [], routes = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current === null) {
      // Initialize map with all interactions enabled
      mapInstanceRef.current = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,           // Enable zoom controls
        dragging: true,              // Enable dragging
        touchZoom: true,             // Enable touch zoom
        doubleClickZoom: true,       // Enable double-click zoom
        scrollWheelZoom: true,       // Enable scroll wheel zoom
        boxZoom: true,               // Enable box zoom
        keyboard: true,              // Enable keyboard navigation
        attributionControl: true,    // Show attribution
        closePopupOnClick: true     // Close popups when clicking elsewhere
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c']
      }).addTo(mapInstanceRef.current);

      // Add scale control
      L.control.scale({
        position: 'bottomleft'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers and routes
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach(marker => {
      const leafletMarker = L.marker([marker.lat, marker.lon])
        .addTo(mapInstanceRef.current)
        .bindPopup(marker.popup || `Lat: ${marker.lat}, Lng: ${marker.lon}`);

      // Make markers clickable
      leafletMarker.on('click', () => {
        leafletMarker.openPopup();
      });
    });

    // Add routes
    routes.forEach(route => {
      if (route.geometry && route.geometry.coordinates) {
        // OSRM returns [lng, lat] but Leaflet expects [lat, lng]
        const latlngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        const polyline = L.polyline(latlngs, {
          color: 'blue',
          weight: 4,
          opacity: 0.7,
          interactive: true
        }).addTo(mapInstanceRef.current);

        // Add tooltip to routes
        polyline.bindTooltip(`Distance: ${route.distance_m ? (route.distance_m / 1000).toFixed(1) : 'Unknown'} km`);
      }
    });

    // Update map view smoothly when center changes
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true, duration: 1 });
    }

  }, [center, zoom, markers, routes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        height: '100%',
        width: '100%',
        position: 'absolute',
        zIndex: 0
      }}
    />
  );
};

export default OSRMMap;