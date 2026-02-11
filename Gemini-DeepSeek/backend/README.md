chore/backend-structure
# Transit Accessibility App - Backend API

FastAPI-based REST API providing accessibility-first transit planning, climate impact tracking, and user engagement features.

## Architecture

The backend follows a modular architecture:

- **`main.py`** - Application entry point; registers all routers and middleware
- **`routes/`** - API endpoint modules organized by feature domain
- **`services/`** - Business logic and external service integrations

## API Endpoints

### Health & Status

#### `GET /`
Root endpoint confirming API is running.

#### `GET /health`
Health check endpoint for load balancers and monitoring.

---

### Climate Impact & Gamification

#### `POST /api/calculate-impact`
Calculate environmental impact of a transit trip and award gamification points.

**Parameters:**
- `distance_km` (float, required) - Distance traveled in kilometers (must be positive)
- `mode` (string, required) - Transit mode: `bus`, `walk`, `bike`, `subway`, or `car`

---

### Accessibility Information

#### `GET /api/station/{station_id}/accessibility`
Retrieve comprehensive accessibility information for a transit station.

**Parameters:**
- `station_id` (path, required) - Unique identifier for the transit station

#### `GET /api/alerts`
Retrieve real-time accessibility alerts (e.g., broken elevators, service disruptions).

**Query Parameters:**
- `station_id` (optional) - Filter alerts by specific station

**Response:**
```json
{
  "alerts": [
    {
      "alert_id": "alert_001",
      "station_id": "stn_downtown",
      "station_name": "Downtown Station",
      "severity": "high",
      "message": "Main elevator out of service for maintenance",
      "affected_accessibility": ["wheelchair", "mobility_impaired"],
      "estimated_resolution_time": "2 hours"
    }
  ],
  "total_alerts": 1
}
```

---

### Route Planning

#### `POST /api/route/plan`
Plan a transit route with accessibility considerations.

**Query Parameters:**
- `origin` (required) - Starting location/address
- `destination` (required) - Destination location/address
- `accessibility_priority` (optional) - Route optimization: `accessibility` (default) or `time`

**Response:**
```json
[
  {
    "route_id": "route_001",
    "origin": "123 Main St",
    "destination": "456 Oak Ave",
    "mode": "bus",
    "estimated_time_minutes": 25,
    "stops_count": 5,
    "accessibility_score": 95.0,
    "has_elevator": true,
    "wheelchair_accessible": true,
    "audio_assistance_available": true
  }
]
```

---

---

### Route Planning

#### `POST /api/route/plan`
Plan a transit route with accessibility considerations.

**Parameters:**
- `origin` (query, required) - Starting location/address
- `destination` (query, required) - Destination location/address
- `accessibility_priority` (query, optional) - `accessibility` (default) or `time` - determines route optimization

---

### User Engagement & Gamification

#### `GET /api/user/{user_id}/stats`
Retrieve user's eco-friendly transit engagement statistics including CO2 saved, trips taken, points earned, and badges unlocked.

**Parameters:**
- `user_id` (path, required) - Unique user identifier

---

## Module Structure

### Routes Modules

- **`routes/health.py`** - Health check and status endpoints
- **`routes/climate.py`** - Climate impact calculation and gamification
- **`routes/accessibility.py`** - Station accessibility info and alerts
- **`routes/routing.py`** - Route planning with accessibility scoring
- **`routes/users.py`** - User statistics and engagement tracking

### Services

- **`services/climate_service.py`** - Climate impact calculation engine

---

## Running the API

### Development Mode
## Development Guidelines

### Adding New Endpoints

1. **Create or update route module** in `backend/routes/`
2. **Define Pydantic models** for request/response validation
3. **Implement endpoint logic** using FastAPI decorators
4. **Register router** in `main.py` using `app.include_router()`
5. **Document endpoint** in this README

### Code Organization

- Keep `main.py` minimal - only router registration and middleware
- Place endpoint logic in appropriate route modules
- Use Pydantic models for request/response validation
- Implement business logic in service modules
- Use dependency injection for shared resources

### Branching Strategy

- **Never commit directly to `main`**
- Create feature branches: `feature/endpoint-name`
- Create bugfix branches: `bugfix/issue-description`
- Submit pull requests for code review before merging

---

## API Routes

- `GET /` → API status
- `GET /health` → Health check
- `POST /api/calculate-impact` → CO₂ savings & points
- `GET /api/station/{station_id}/accessibility`
- `GET /api/alerts`
- `POST /api/route/plan`
- `GET /api/user/{user_id}/stats`

---

## TODO

- [ ] Replace mock data with database integration
- [ ] Integrate real transit APIs (GTFS, Google Transit)
- [ ] Add authentication and user management
- [ ] Implement real-time accessibility alert system
- [ ] Add rate limiting and API key management
- [ ] Set up logging and monitoring
- [ ] Add comprehensive test coverage

_Last updated backend documentation structure._