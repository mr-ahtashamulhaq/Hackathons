feature/map-page-skeleton
export default function MapView() {
  return (
    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
      <p className="text-gray-700 text-sm">
        Map placeholder (integration coming next)
      </p>
    </div>
  );
}
=======
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'

// Fix for default marker icon in react-leaflet
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

const userIcon = createCustomIcon('blue')
const destinationIcon = createCustomIcon('red')

interface MapViewProps {
  className?: string
  userLocation: [number, number]
  routePath: [number, number][]
}

function MapView({ className = '', userLocation, routePath }: MapViewProps) {
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={userLocation}
        zoom={13}
        className="h-full w-full"
        whenReady={() => {
        console.log('Leaflet map initialized')}}

        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Your Location</strong>
              <p className="text-gray-600">Starting point</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={routePath[routePath.length - 1]} icon={destinationIcon}>
          <Popup>
            <div className="text-sm">
              <strong>Destination</strong>
              <p className="text-gray-600">End point</p>
            </div>
          </Popup>
        </Marker>

        {/* Route polyline */}
        <Polyline
          positions={routePath}
          color="#3b82f6"
          weight={4}
          opacity={0.7}
        />
      </MapContainer>
    </div>
  )
}

export default MapView
main
