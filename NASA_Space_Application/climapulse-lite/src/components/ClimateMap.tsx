'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { CurrentWeather } from '@/utils/openMeteo';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface ClimateMapProps {
  currentWeather?: CurrentWeather | null;
}

export default function ClimateMap({ currentWeather }: ClimateMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      
      // Fix for default markers in Next.js
      delete (leaflet.default.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const lahorePosition: [number, number] = [31.5497, 74.3436];

  if (!isClient || !L) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        📍 Lahore, Pakistan
      </h3>
      
      <div className="h-64 rounded-lg overflow-hidden border">
        <MapContainer
          center={lahorePosition}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={lahorePosition}>
            <Popup>
              <div className="text-center">
                <strong>Lahore, Pakistan</strong><br />
                31.5497°N, 74.3436°E
                {currentWeather && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <div className="text-sm font-medium">Current Weather</div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(currentWeather.temperature)}°C
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentWeather.condition}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Humidity: {Math.round(currentWeather.humidity)}% •{' '}
                      Precipitation: {currentWeather.precipitation}mm
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Quick Stats */}
      {currentWeather && (
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-blue-600 font-medium">Temperature</div>
            <div className="text-2xl font-bold text-blue-800">
              {Math.round(currentWeather.temperature)}°C
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="text-green-600 font-medium">Humidity</div>
            <div className="text-2xl font-bold text-green-800">
              {Math.round(currentWeather.humidity)}%
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        📡 Data source: Open-Meteo API • 🗺️ Map: OpenStreetMap
      </div>
    </div>
  );
}