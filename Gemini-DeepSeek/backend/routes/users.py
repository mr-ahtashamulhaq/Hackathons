# backend/routes/users.py
# User engagement and gamification endpoints

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["Gamification"])


# Routes

@router.get("/user/{user_id}/stats")
async def get_user_stats(user_id: str):
    """
    Retrieve user's eco-friendly transit engagement statistics
    
    **Functionality:**
    - Tracks CO2 saved through sustainable transit choices
    - Displays gamification points and badges earned
    - Shows contribution to environmental goals
    
    **Parameters:**
    - user_id: Unique user identifier
    
    **Returns:**
    - Total CO2 saved (kg)
    - Total trips taken
    - Points earned
    - Badges/achievements unlocked
    - Sustainability streak
    
    **Note:** Currently returns mock data. To be integrated with user database.
    """
    # TODO: Query user profile and trip history from database
    mock_stats = {
        "user_id": user_id,
        "total_co2_saved_kg": 127.5,
        "total_trips": 42,
        "total_points": 12750,
        "badges": [
            {"badge_id": "eco_warrior", "name": "Eco Warrior", "description": "Completed 10 sustainable trips"},
            {"badge_id": "carbon_hero", "name": "Carbon Hero", "description": "Saved 100kg of CO2"}
        ],
        "sustainability_streak_days": 14,
        "ranking": "Gold Tier"
    }
    return mock_stats
