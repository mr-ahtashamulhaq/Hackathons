import MapView from '../components/MapView'

// Backend-shaped placeholder object for future API integration
const mockTransitResponse = {
  route: {
    id: '99',
    name: '99 B-Line',
    direction: 'Eastbound to UBC'
  },
  trip: {
    estimatedTimeMinutes: 15,
    distanceKm: 2.3
  },
  accessibility: {
    wheelchairAccess: true,
    lowFloorBus: true,
    audioAnnouncements: null
  },
  alerts: [],
  geometry: {
    userLocation: [40.7128, -74.0060] as [number, number],
    routePath: [
      [40.7128, -74.0060],
      [40.7180, -74.0020],
      [40.7230, -73.9980],
      [40.7280, -73.9940]
    ] as [number, number][]
  }
}

function MapPage() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Full-screen map container */}
      <div className="flex-1 relative">
        <MapView 
          className="h-full w-full"
          userLocation={mockTransitResponse.geometry.userLocation}
          routePath={mockTransitResponse.geometry.routePath}
        />
      </div>

      {/* Bottom info panel - enriched with transit context */}
      <div className="bg-white shadow-lg border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          
          {/* Route Summary Section */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Route Summary
            </h2>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Route</span>
                <span className="text-sm font-medium text-gray-900">{mockTransitResponse.route.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Direction</span>
                <span className="text-sm font-medium text-gray-900">{mockTransitResponse.route.direction}</span>
              </div>
            </div>
          </div>

          {/* Trip Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
            {/* ETA */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Estimated Time
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {mockTransitResponse.trip.estimatedTimeMinutes} min
              </span>
            </div>

            {/* Distance */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                Distance
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {mockTransitResponse.trip.distanceKm} km
              </span>
            </div>
          </div>

          {/* Accessibility Status Section */}
          <div className="mb-4 pb-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Accessibility
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wheelchair Access</span>
                <span className={`text-sm font-medium flex items-center ${mockTransitResponse.accessibility.wheelchairAccess ? 'text-green-600' : 'text-gray-400'}`}>
                  {mockTransitResponse.accessibility.wheelchairAccess && (
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                  {mockTransitResponse.accessibility.wheelchairAccess ? 'Available' : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Low Floor Bus</span>
                <span className={`text-sm font-medium flex items-center ${mockTransitResponse.accessibility.lowFloorBus ? 'text-green-600' : 'text-gray-400'}`}>
                  {mockTransitResponse.accessibility.lowFloorBus && (
                    <svg 
                      className="w-4 h-4 mr-1" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                  {mockTransitResponse.accessibility.lowFloorBus ? 'Yes' : '--'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Audio Announcements</span>
                <span className="text-sm font-medium text-gray-400">
                  {mockTransitResponse.accessibility.audioAnnouncements === null ? '--' : mockTransitResponse.accessibility.audioAnnouncements ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Service Alerts
            </h2>
            <div className="flex items-center text-sm text-gray-600">
              <svg 
                className="w-5 h-5 mr-2 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>{mockTransitResponse.alerts.length === 0 ? 'No active alerts' : `${mockTransitResponse.alerts.length} active alert(s)`}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Start navigation"
            >
              Start Navigation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapPage
