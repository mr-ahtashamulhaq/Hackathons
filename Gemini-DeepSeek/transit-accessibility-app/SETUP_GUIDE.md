# Transit Accessibility App - Backend API

FastAPI-based REST API providing accessibility-first transit planning, climate impact tracking, and AI-powered assistance features.

## Architecture

The backend follows a modular architecture:

- **`main.py`** - Application entry point; registers all routers and middleware, includes AI service endpoints
- **`routes/`** - API endpoint modules organized by feature domain
- **`services/`** - Business logic and external service integrations (Chat, Vision, Transit, Climate)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+ installed
- Git installed
- GEMINI_API_KEY (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd transit-accessibility-app
   ```

2. **Set Up Python Virtual Environment**
   ```bash
   # Create virtual environment
   python -m venv .venv

   # Activate virtual environment
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp ../.env.example ../.env
   
   # Edit .env and add your API key:
   # GEMINI_API_KEY=your_actual_api_key_here
   ```

5. **Run the Application**
   ```bash
   # From the backend directory
   python main.py
   
   # OR using uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Access the API**
   - API Root: http://localhost:8000/
   - Interactive Docs (Swagger): http://localhost:8000/docs
   - Alternative Docs (ReDoc): http://localhost:8000/redoc

---

## 📚 API Endpoints

### Health & Status

#### `GET /`
Root endpoint confirming API is running.

#### `GET /health`
Health check endpoint for load balancers and monitoring.

---

### AI Services (NEW! ✨)

#### `POST /api/vision/analyze`
Analyze transit station images for accessibility hazards using Gemini Vision AI.

**Request:** Multipart form data with image file
**Response:**
```json
{
  "description": "Transit station entrance with visible ramp",
  "hazards": ["none detected"],
  "safe_for_wheelchair": true,
  "accessibility_score": 9
}
```

#### `POST /api/chat/interpret-speech`
Clean up messy speech-to-text input using AI.

**Request:**
```json
{
  "text": "I want to go to... un... un... onion station"
}
```

**Response:**
```json
{
  "corrected_destination": "Union Station",
  "original_text": "I want to go to... un... un... onion station"
}
```

#### `POST /api/chat/synthesize`
Create friendly trip summaries from transit, climate, and vision data.

**Request:**
```json
{
  "transit": "Bus 504, 15 mins away",
  "climate": "0.4kg CO2 saved",
  "vision": "Ramp Detected: True"
}
```

**Response:**
```json
{
  "message": "Great news! The 504 arrives in 15 minutes and has a wheelchair ramp available. You'll save 0.4kg of CO2 on this trip! 🌍"
}
```

---

### Climate Impact & Gamification

#### `POST /api/calculate-impact`
Calculate environmental impact of a transit trip and award gamification points.

**Request:**
```json
{
  "distance_km": 5.0,
  "mode": "bus"
}
```

**Response:**
```json
{
  "mode": "bus",
  "distance_km": 5.0,
  "baseline_car_kg": 0.855,
  "actual_kg": 0.445,
  "co2_saved_kg": 0.410,
  "points_earned": 41
}
```

---

### Accessibility Information

#### `GET /api/station/{station_id}/accessibility`
Retrieve comprehensive accessibility information for a transit station.

**Response:**
```json
{
  "station_id": "stn_001",
  "station_name": "Downtown Station",
  "features": [
    {
      "feature_id": "elevator_1",
      "feature_name": "Main Entrance Elevator",
      "is_available": true,
      "description": "Accessible elevator with audio and Braille buttons"
    }
  ],
  "wheelchair_accessible": true,
  "audio_announcements": true,
  "visual_displays": true,
  "elevators_working": true,
  "accessible_restrooms": true
}
```

#### `GET /api/alerts`
Retrieve real-time accessibility alerts.

**Query Parameters:**
- `station_id` (optional) - Filter alerts by specific station

#### `POST /api/accessibility/needs`
Convert user's accessibility needs text into structured flags.

**Request:**
```json
{
  "text": "I use a wheelchair and need step-free access"
}
```

**Response:**
```json
{
  "needs_step_free": true,
  "max_transfers": null,
  "avoid_long_walks": false,
  "needs_audio": false,
  "needs_visual": false
}
```

---

### Route Planning

#### `POST /api/route/plan`
Plan a transit route with accessibility considerations.

**Query Parameters:**
- `origin` (required) - Starting location
- `destination` (required) - Destination location
- `accessibility_priority` (optional) - `accessibility`, `time`, or `balanced`

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

### User Engagement & Gamification

#### `GET /api/user/{user_id}/stats`
Retrieve user's eco-friendly transit engagement statistics.

**Response:**
```json
{
  "user_id": "user_123",
  "total_co2_saved_kg": 127.5,
  "total_trips": 42,
  "total_points": 12750,
  "badges": [
    {
      "badge_id": "eco_warrior",
      "name": "Eco Warrior",
      "description": "Completed 10 sustainable trips"
    }
  ],
  "sustainability_streak_days": 14,
  "ranking": "Gold Tier"
}
```

---

## 🧪 Testing

### Run Tests
```bash
# Install test dependencies (if not already installed)
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run specific test file
pytest tests/test_chat_service.py

# Run with verbose output
pytest -v

# Run and show print statements
pytest -s
```

### Manual Testing with Test Files

The project includes standalone test files for manual testing:

```bash
# Test Vision Service
python tests/test_vision.py

# Test Chat Service
python tests/test_chat.py
```

---

## 📂 Module Structure

### Routes Modules

- **`routes/health.py`** - Health check and status endpoints
- **`routes/climate.py`** - Climate impact calculation and gamification
- **`routes/accessibility.py`** - Station accessibility info, alerts, and needs interpretation
- **`routes/routing.py`** - Route planning with accessibility scoring
- **`routes/users.py`** - User statistics and engagement tracking

### Services

- **`services/chat_service.py`** - Gemini AI chat synthesis and speech interpretation
- **`services/vision_service.py`** - Gemini Vision AI image analysis for accessibility hazards
- **`services/transit_service.py`** - Transit routing and route information (mock data for now)
- **`services/climate_service.py`** - Climate impact calculation engine with emissions factors

---

## 🔧 Development Guidelines

### Adding New Endpoints

1. **Create or update route module** in `backend/routes/`
2. **Define Pydantic models** for request/response validation
3. **Implement endpoint logic** using FastAPI decorators
4. **Register router** in `main.py` using `app.include_router()` OR add directly to main.py for AI services
5. **Document endpoint** in this README
6. **Add tests** in `backend/tests/`

### Code Organization

- Keep `main.py` focused on app initialization and AI service endpoints
- Place feature endpoints in appropriate route modules
- Use Pydantic models for request/response validation
- Implement business logic in service modules
- Use dependency injection for shared resources

### Branching Strategy

- **Never commit directly to `main`**
- Create feature branches: `feature/endpoint-name`
- Create bugfix branches: `bugfix/issue-description`
- Submit pull requests for code review before merging

---

## 🔐 Environment Variables

Create a `.env` file in the project root with:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL_ID=gemini-2.5-flash

# Maps Configuration (Optional - for future features)
# GOOGLE_MAPS_API_KEY=your_maps_api_key
```

---

## 📋 TODO

- [ ] Replace mock data with database integration
- [ ] Integrate real transit APIs (GTFS, Google Transit)
- [ ] Add authentication and user management
- [ ] Implement real-time accessibility alert system
- [ ] Add rate limiting and API key management
- [ ] Set up logging and monitoring
- [ ] Add comprehensive test coverage
- [ ] Create frontend integration
- [ ] Deploy to production environment

---

## 🛠️ Tech Stack

- **Framework:** FastAPI 0.115.0
- **AI/ML:** Google Generative AI (Gemini 2.5 Flash)
- **Image Processing:** Pillow
- **Server:** Uvicorn
- **Validation:** Pydantic
- **Testing:** Pytest

---

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

---
