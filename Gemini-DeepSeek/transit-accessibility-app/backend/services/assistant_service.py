import re
import random
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta

# Mock environmental and location data
MOCK_ENVIRONMENT = {
    "location": "Toronto",
    "temperature": "20°C",
    "air_quality": "78 (Good)",
    "humidity": "90%",
    "co2_saved_week": "47.3 kg"
}

# Mock locations for navigation
MOCK_LOCATIONS = {
    "union station": {"lat": 43.6452, "lon": -79.3806, "display_name": "Union Station, Toronto"},
    "cn tower": {"lat": 43.6426, "lon": -79.3871, "display_name": "CN Tower, Toronto"},
    "downtown": {"lat": 43.6532, "lon": -79.3832, "display_name": "Downtown Toronto"},
    "airport": {"lat": 43.6777, "lon": -79.6248, "display_name": "Toronto Pearson Airport"},
    "subway station": {"lat": 43.6426, "lon": -79.3871, "display_name": "Nearest Subway Station"},
    "bus stop": {"lat": 43.6532, "lon": -79.3832, "display_name": "Main Bus Stop"},
    "shopping mall": {"lat": 43.6532, "lon": -79.3832, "display_name": "Eaton Centre"},
    "hospital": {"lat": 43.6568, "lon": -79.3908, "display_name": "Toronto General Hospital"},
    "university": {"lat": 43.6629, "lon": -79.3957, "display_name": "University of Toronto"},
    "library": {"lat": 43.6677, "lon": -79.3948, "display_name": "Toronto Public Library"},
    "my current location": {"lat": 43.6532, "lon": -79.3832, "display_name": "Your Current Location"},
    "here": {"lat": 43.6532, "lon": -79.3832, "display_name": "Current Location"},
    "shloka market": {"lat": 43.6500, "lon": -79.3850, "display_name": "Shloka Market Bus Stop"}
}

# Conversation state tracker
conversation_states = {}

# System language setting
current_language = "english"

# Language translations for Sara's responses
language_responses = {
    "english": {
        "intro": "Hi this is \"Sara\"... your AI Agent..\n\nYou are in {location}.\n\nThe temperature is {temperature}. Air quality index is {air_quality}. Humidity is {humidity}.\n\nYou've saved {co2_saved_week} of CO₂ this week..\n\nWhere do you want to go?",
        "language_change": "Sure...what language do you want to change to...",
        "changing_language": "Changing...."
    },
    "french": {
        "intro": "Bonjour, ici Sara…\n\nVotre agent IA…\n\nVous êtes actuellement à {location}.\n\nLa température est de {temperature}. L'indice de qualité de l'air est {air_quality}. L'humidité est de {humidity}.\n\nVous avez économisé {co2_saved_week} de CO₂ cette semaine..\n\nOù souhaitez-vous aller ?",
        "language_change": "Bien sûr... dans quelle langue souhaitez-vous changer...",
        "changing_language": "Changement en cours...."
    },
    "spanish": {
        "intro": "Hola, soy Sara…\n\nTu agente de IA…\n\nEstás en {location}.\n\nLa temperatura es {temperature}. El índice de calidad del aire es {air_quality}. La humedad es {humidity}.\n\nHas ahorrado {co2_saved_week} de CO₂ esta semana..\n\n¿A dónde quieres ir ?",
        "language_change": "Claro... ¿a qué idioma quieres cambiar...",
        "changing_language": "Cambiando...."
    }
}

# Mock user profile data
user_profile = {
    'name': 'James Johnson',
    'email': 'James.Johnson@email.com', 
    'phone': '+0712 667 2030',
    'co2_saved': 47.3,
    'trees_equivalent': 2.1,
    'eco_distance': 142,
    'eco_trips': 38,
    'has_profile_picture': True
}

# Mock notification data
notifications_data = {
    'today': [
        {
            'id': 1,
            'time': '4:40 PM',
            'type': 'arrival',
            'message': 'You have reached Giza Mall at 4:40 PM'
        },
        {
            'id': 2, 
            'time': '2:15 PM',
            'type': 'journey_start',
            'message': 'Your journey from Union Station to Downtown Toronto started at 2:15 PM'
        },
        {
            'id': 3,
            'time': '11:30 AM', 
            'type': 'co2_achievement',
            'message': 'Congratulations! You saved 2.3 kg of CO₂ on your morning commute'
        }
    ],
    'yesterday': [
        {
            'id': 4,
            'time': '6:20 PM',
            'type': 'arrival', 
            'message': 'You arrived at Toronto General Hospital at 6:20 PM'
        },
        {
            'id': 5,
            'time': '3:45 PM',
            'type': 'bus_delay',
            'message': 'Bus Route 34 was delayed by 8 minutes at 3:45 PM'
        }
    ]
}

# Mock trip data
trip_data = {
    'monthly_co2_saved': 47.3,
    'monthly_goal_progress': 79,
    'highest_savings_day': {
        'date': 'January 14th',
        'amount': 1.6
    },
    'eco_tip': 'Taking the bus instead of driving can save up to 2.6 kg of CO₂ per trip!',
    'recent_trips': [
        {
            'id': 1,
            'date': 'January 22nd',
            'transport': 'Bus',
            'destination': 'Meskel Square',
            'co2_saved': 1.3
        },
        {
            'id': 2,
            'date': 'January 21st',
            'transport': 'MRT',
            'destination': 'City Center',
            'co2_saved': 0.9
        },
        {
            'id': 3,
            'date': 'January 20th',
            'transport': 'Bus',
            'destination': 'University Campus',
            'co2_saved': 1.1
        },
        {
            'id': 4,
            'date': 'January 19th',
            'transport': 'Train',
            'destination': 'Shopping Mall',
            'co2_saved': 0.8
        }
    ]
}

# Mock games data
games_data = {
    'total_points': 1247,
    'day_streak': 7,
    'badges_earned': 8,
    'badges_total': 10,
    'badges': [
        {'id': 1, 'name': 'First Journey', 'icon': '🚌', 'earned': True, 'description': 'Completed your first eco trip'},
        {'id': 2, 'name': 'Week Warrior', 'icon': '🔥', 'earned': True, 'description': 'Maintained a 7-day streak'},
        {'id': 3, 'name': 'Bike Champion', 'icon': '🚲', 'earned': True, 'description': 'Used cycling transport'},
        {'id': 4, 'name': 'Tree Saver', 'icon': '🌳', 'earned': True, 'description': 'Saved significant CO2'},
        {'id': 5, 'name': 'Metro Master', 'icon': '🚇', 'earned': False, 'description': 'Use metro transport more'},
        {'id': 6, 'name': 'Eco Hero', 'icon': '⭐', 'earned': False, 'description': 'Reach advanced environmental goals'}
    ],
    'weekly_progress': [10, 14, 12, 15],
    'active_challenges': [
        {
            'id': 1,
            'name': 'Cycle to work',
            'description': 'Complete 3 more bike rides',
            'progress': '2/5',
            'reward': 500
        }
    ],
    'trivia_questions': [
        {
            'question': 'Which mode of transport has the lowest CO2 emissions per passenger?',
            'options': ['Private Car', 'Electric Bus', 'Metro/Train', 'Walking'],
            'correct': 3
        },
        {
            'question': 'How much CO2 does a typical tree absorb per year?',
            'options': ['5 kilograms', '22 kilograms', '100 kilograms', '50 kilograms'],
            'correct': 1
        },
        {
            'question': 'What percentage of global emissions come from transport?',
            'options': ['Around 10%', 'Around 16%', 'Around 25%', 'Around 40%'],
            'correct': 1
        }
    ]
}

async def process_assistant_query(text: str, openai_client=None) -> Dict[str, Any]:
    """Process natural language transit query with Sara conversation flow."""
    
    # Initialize conversation if first interaction or if explicitly requested
    if (not conversation_states.get("current_state") or 
        text.lower().strip() in ['initialize', 'init', 'start']):
        return initialize_sara_conversation()
    
    # Get current state
    state = conversation_states.get("current_state", "intro")
    user_input = text.lower().strip()
    
    # Handle different conversation stages  
    if state == "intro":
        # Check if user wants to check profile
        if any(phrase in user_input for phrase in ['profile', 'my profile', 'check my profile', 'profile details']):
            return handle_profile_request()
        # Check if user wants to check notifications
        elif any(phrase in user_input for phrase in ['notification', 'notifications', 'check notifications', 'my notifications']):
            return handle_notifications_request()
        # Check if user wants to change language
        elif any(phrase in user_input for phrase in ['language', 'system language', 'change language', 'change system language']):
            return handle_language_change_request()
        # Check if user wants to check trips
        elif any(phrase in user_input for phrase in ['trips', 'my trips', 'past trips', 'carbon', 'co2', 'savings', 'see my past trips', 'carbon saved']):
            return handle_trips_request()
        # Check if user wants to play games or check eco coach
        elif any(phrase in user_input for phrase in ['games', 'play games', 'eco coach', 'gaming', 'game', 'play game', 'eco coach progress']):
            return handle_games_request()
        else:
            return handle_destination_request(text)
    elif state == "profile_display":
        return handle_profile_options(text)
    elif state == "profile_edit":
        return handle_profile_edit_request(text)
    elif state == "awaiting_biometrics":
        return handle_biometric_verification(text)
    elif state == "notifications_menu":
        return handle_notifications_time_selection(text)
    elif state == "showing_notifications":
        return handle_notifications_response(text)
    elif state == "language_menu":
        return handle_language_selection(text)
    elif state == "showing_trips":
        return handle_trips_response(text)
    elif state == "games_menu":
        return handle_games_menu_selection(text)
    elif state == "playing_co2_clicker":
        return handle_co2_clicker_game(text)
    elif state == "playing_trivia":
        return handle_trivia_game(text)
    elif state == "showing_badges":
        return handle_badges_response(text)
    elif state == "showing_progress":
        return handle_progress_response(text)
    elif state == "showing_challenges":
        return handle_challenges_response(text)
    elif state == "awaiting_transport":
        return handle_transport_selection(text)
    elif state == "awaiting_preferences":
        return handle_preferences(text)
    elif state == "ready_to_start":
        return handle_journey_start(text)
    elif state == "journey_active":
        return handle_journey_updates(text)
    elif state == "at_bus_stop":
        return handle_bus_arrival(text)
    elif state == "on_bus":
        return handle_bus_journey(text)
    elif state == "walking_to_destination":
        return handle_final_walking(text)
    else:
        # Reset and start over
        return initialize_sara_conversation()

def initialize_sara_conversation() -> Dict[str, Any]:
    """Initialize conversation with Sara introduction."""
    global current_language
    conversation_states["current_state"] = "intro"
    conversation_states["origin"] = None
    conversation_states["destination"] = None
    conversation_states["transport"] = None
    conversation_states["selected_route"] = None
    
    # Get response template based on current language
    response_template = language_responses[current_language]["intro"]
    
    response = response_template.format(
        location=MOCK_ENVIRONMENT["location"],
        temperature=MOCK_ENVIRONMENT["temperature"],
        air_quality=MOCK_ENVIRONMENT["air_quality"],
        humidity=MOCK_ENVIRONMENT["humidity"],
        co2_saved_week=MOCK_ENVIRONMENT["co2_saved_week"]
    )
    
    return {
        "response": response,
        "data": {"state": "intro", "environment": MOCK_ENVIRONMENT, "language": current_language}
    }

def handle_destination_request(text: str) -> Dict[str, Any]:
    """Handle user's destination request."""
    origin, destination = extract_locations(text)
    
    if not origin or not destination:
        return {
            "response": "I didn't catch that. Please tell me where you want to go from and to. For example: 'I want to go from Union Station to CN Tower'",
            "data": {"state": "intro"}
        }
    
    # Store the route
    conversation_states["origin"] = origin
    conversation_states["destination"] = destination
    conversation_states["current_state"] = "awaiting_transport"
    
    response = f"""Okay! You want to go from {origin} to {destination}. Which type of transport would you like to take?

You can choose Bus, Train, or MRT/LRT."""
    
    return {
        "response": response,
        "data": {"state": "awaiting_transport", "origin": origin, "destination": destination}
    }

def handle_transport_selection(text: str) -> Dict[str, Any]:
    """Handle transport type selection."""
    transport_type = extract_transport_type(text)
    
    if not transport_type:
        return {
            "response": "Please choose a transport type: Bus, Train, or MRT/LRT.",
            "data": {"state": "awaiting_transport"}
        }
    
    conversation_states["transport"] = transport_type
    conversation_states["current_state"] = "awaiting_preferences"
    
    # Generate mock route options
    routes = generate_mock_routes(transport_type)
    
    response = f"""Here are the suggested routes for {transport_type} transport...

Route 1: 5.8 kilometers, estimated travel time 24 minutes. You will arrive at 8:38 PM. Cost is $1.50. CO₂ saved compared to driving: 1.2 kg.

Route 2: 6.2 kilometers, estimated travel time 22 minutes. You will arrive at 8:36 PM. Cost is $1.20. CO₂ saved: 1.0 kg.

Route 3: 5.5 kilometers, estimated travel time 26 minutes. You will arrive at 8:40 PM. Cost is $1.80. CO₂ saved: 1.3 kg.

Do you want me to recommend routes that save more CO₂, or cheaper routes, or do you have any preferences like departure time?"""
    
    return {
        "response": response,
        "data": {"state": "awaiting_preferences", "routes": routes}
    }

def handle_preferences(text: str) -> Dict[str, Any]:
    """Handle user preferences for route selection."""
    conversation_states["current_state"] = "ready_to_start"
    
    # Parse user preferences
    if "eco" in text.lower() or "co2" in text.lower() or "environment" in text.lower():
        selected_route = "Route 3 (Most Eco-friendly)"
    elif "cheap" in text.lower() or "cost" in text.lower():
        selected_route = "Route 2 (Most Economical)"
    else:
        selected_route = "Route 1 (Balanced)"
    
    conversation_states["selected_route"] = selected_route
    
    response = f"""Got it! You want an eco-friendly route with less walking. For {conversation_states["transport"]} transport, the most eco-friendly option with minimal walking is Route 3.

Distance: 5.5 kilometers
Estimated travel time: 26 minutes
Arrival time: 8:26 PM
Cost: $1.80
CO₂ saved: 1.3 kg
Walking distance: 300 meters from current location to bus stop, 100 meters from stop to destination.

Would you like me to start navigation now?"""
    
    return {
        "response": response,
        "data": {"state": "ready_to_start", "selected_route": selected_route}
    }

def handle_journey_start(text: str) -> Dict[str, Any]:
    """Handle journey start confirmation."""
    if "start" in text.lower() or "okay" in text.lower() or "yes" in text.lower():
        conversation_states["current_state"] = "journey_active"
        
        response = """Final confirmation before starting the journey...

You will be walking to Shloka Market bus stop from 8:00 PM to 8:08 PM, approximately 300 meters.

At 8:10 PM, the bus will arrive. You will take it to the 3rd stop, then continue directly to your destination.

Estimated bus travel time: 18 minutes. You will arrive at your destination at 8:26 PM.

Total distance: 5.5 kilometers. Cost: $1.80. Walking distance: 400 meters total.

This route produces 38% less emissions and avoids poor air quality. You save 1.3kg CO₂ using this route..

Starting Journey....

The journey has been started... Start by walking to Shloka Market bus stop at 8:00 PM. It should take about 8 minutes to walk there."""
        
        return {
            "response": response,
            "data": {"state": "journey_active", "step": "walking_to_bus_stop"}
        }
    else:
        return {
            "response": "Let me know when you're ready to start the journey. Just say 'start journey' or 'okay'.",
            "data": {"state": "ready_to_start"}
        }

def handle_journey_updates(text: str) -> Dict[str, Any]:
    """Handle real-time journey updates."""
    user_input = text.lower()
    
    if "shloka market" in user_input or "bus stop" in user_input:
        conversation_states["current_state"] = "at_bus_stop"
        
        response = """Perfect! You're at Shloka Market bus stop.

Please wait... The bus will arrive at 8:10 PM. It is about 100 meters away from your current location."""
        
        return {
            "response": response,
            "data": {"state": "at_bus_stop"}
        }
    else:
        return {
            "response": "Keep walking towards Shloka Market bus stop. You're making good progress!",
            "data": {"state": "journey_active"}
        }

def handle_bus_arrival(text: str) -> Dict[str, Any]:
    """Handle bus arrival and boarding."""
    user_input = text.lower()
    
    if "bus is here" in user_input or "bus arrived" in user_input:
        conversation_states["current_state"] = "on_bus"
        
        response = """Great! Now board the bus and have a seat. Wait for 3 stops to reach your destination area.

We are tracking your stops now..."""
        
        # Simulate tracking after a few seconds
        return {
            "response": response,
            "data": {"state": "on_bus", "stops_remaining": 3}
        }
    else:
        return {
            "response": "The bus should be arriving any moment now at 8:10 PM. Please wait at the bus stop.",
            "data": {"state": "at_bus_stop"}
        }

def handle_bus_journey(text: str) -> Dict[str, Any]:
    """Handle updates while on the bus."""
    user_input = text.lower()
    
    if "got down" in user_input or "off the bus" in user_input or "exited" in user_input:
        conversation_states["current_state"] = "walking_to_destination"
        
        response = """Excellent! Tracking your current location...

Great, now walk 100 meters towards the left and your destination will be on your right.

We are tracking your steps while you're walking..."""
        
        return {
            "response": response,
            "data": {"state": "walking_to_destination"}
        }
    else:
        # Simulate bus tracking
        response = """The next stop is your destination stop. Please ring the bell now and get ready to exit the bus."""
        
        return {
            "response": response,
            "data": {"state": "on_bus", "next_action": "prepare_to_exit"}
        }

def handle_final_walking(text: str) -> Dict[str, Any]:
    """Handle final walking to destination."""
    user_input = text.lower()
    
    if "thank you" in user_input or "end journey" in user_input or "arrived" in user_input:
        conversation_states["current_state"] = "completed"
        
        response = """You're very welcome! We are ending the journey now.

Journey Summary:
- Total travel time: 26 minutes
- CO₂ saved: 1.3 kg
- Total cost: $1.80
- You arrived safely at your destination!

Have a wonderful day! Feel free to ask me for navigation help anytime."""
        
        # Reset conversation state
        conversation_states.clear()
        
        return {
            "response": response,
            "data": {"state": "completed", "journey_ended": True}
        }
    else:
        # Simulate final approach
        response = """Keep walking... you're almost there!

Great! You are now at your destination. It should be on your right. You've successfully completed your journey!"""
        
        return {
            "response": response,
            "data": {"state": "walking_to_destination", "near_destination": True}
        }

def extract_transport_type(text: str) -> Optional[str]:
    """Extract transport type from user input."""
    text = text.lower()
    if "bus" in text:
        return "Bus"
    elif "train" in text:
        return "Train"
    elif "mrt" in text or "lrt" in text:
        return "MRT/LRT"
    return None

def generate_mock_routes(transport_type: str) -> list:
    """Generate mock route options."""
    base_time = datetime.now().replace(hour=20, minute=0, second=0, microsecond=0)
    
    routes = [
        {
            "id": 1,
            "distance": "5.8 km",
            "duration": "24 minutes",
            "arrival": (base_time + timedelta(minutes=38)).strftime("%I:%M %p"),
            "cost": "$1.50",
            "co2_saved": "1.2 kg"
        },
        {
            "id": 2,
            "distance": "6.2 km", 
            "duration": "22 minutes",
            "arrival": (base_time + timedelta(minutes=36)).strftime("%I:%M %p"),
            "cost": "$1.20",
            "co2_saved": "1.0 kg"
        },
        {
            "id": 3,
            "distance": "5.5 km",
            "duration": "26 minutes", 
            "arrival": (base_time + timedelta(minutes=40)).strftime("%I:%M %p"),
            "cost": "$1.80",
            "co2_saved": "1.3 kg"
        }
    ]
    return routes

def extract_locations(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Extract origin and destination from natural language."""
    text = text.lower().strip()
    
    # Pattern: "from X to Y"
    pattern1 = r'from\s+(.+?)\s+to\s+(.+?)(?:\.|$|\?|\s*$)'
    match = re.search(pattern1, text)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    
    # Pattern: "I want to go from X to Y"
    pattern2 = r'go from\s+(.+?)\s+to\s+(.+?)(?:\.|$|\?|\s*$)'
    match = re.search(pattern2, text)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    
    # Pattern: "start journey to Y" / "navigate to Y"
    pattern3 = r'(?:start journey to|navigate to|go to)\s+(.+?)(?:\.|$|\?|\s*$)'
    match = re.search(pattern3, text)
    if match:
        return "my current location", match.group(1).strip()
    
    # Pattern: "X to Y"
    pattern4 = r'^(.+?)\s+to\s+(.+?)(?:\.|$|\?|\s*$)'
    match = re.search(pattern4, text)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    
    return None, None

def handle_profile_request() -> Dict[str, Any]:
    """Handle user's request to check profile details."""
    conversation_states["current_state"] = "profile_display"
    
    response = f"""So according to your profile...

You have uploaded your profile picture...

Your name is "{user_profile['name']}"

Your email is "{user_profile['email']}"

Your phone number is "{user_profile['phone']}"

Your have create an Impact
{user_profile['co2_saved']} kg
Total CO₂ Saved
{user_profile['trees_equivalent']}
Trees Equivalent
{user_profile['eco_distance']} mi
Eco Distance
{user_profile['eco_trips']}
Eco Trips

Do you want to edit your profile details or Sign Out..."""
    
    return {
        "response": response,
        "data": {"state": "profile_display", "profile": user_profile}
    }

def handle_profile_options(text: str) -> Dict[str, Any]:
    """Handle user's choice to edit profile or sign out."""
    user_input = text.lower().strip()
    
    if any(phrase in user_input for phrase in ['edit', 'change', 'modify', 'update', 'edit profile', 'profile details']):
        conversation_states["current_state"] = "profile_edit"
        
        response = """Tell us what you want to change....

Verify your biometrics to save changes.."""
        
        return {
            "response": response,
            "data": {"state": "profile_edit"}
        }
    elif any(phrase in user_input for phrase in ['sign out', 'logout', 'log out', 'exit']):
        # Reset conversation state
        conversation_states.clear()
        
        response = """You have been signed out successfully. Thank you for using Sara!"""
        
        return {
            "response": response,
            "data": {"state": "signed_out"}
        }
    else:
        return {
            "response": "Please choose to either 'edit your profile details' or 'sign out'.",
            "data": {"state": "profile_display"}
        }

def handle_profile_edit_request(text: str) -> Dict[str, Any]:
    """Handle user's profile edit request with biometric verification."""
    user_input = text.lower().strip()
    
    # Check if user is providing change details and biometrics
    if 'email' in user_input and 'biometrics' in user_input:
        conversation_states["current_state"] = "awaiting_biometrics"
        conversation_states["pending_changes"] = text
        
        return {
            "response": "Verifying your biometrics...",
            "data": {"state": "awaiting_biometrics", "changes": text}
        }
    elif any(phrase in user_input for phrase in ['email', 'phone', 'name', 'password']):
        return {
            "response": "Please provide the change details and verify your biometrics to save changes.",
            "data": {"state": "profile_edit"}
        }
    else:
        return {
            "response": "Please tell me what you want to change - name, email, phone number, or password. Then provide your biometric verification.",
            "data": {"state": "profile_edit"}
        }

def handle_biometric_verification(text: str) -> Dict[str, Any]:
    """Handle biometric verification and profile update."""
    # Extract email change from pending changes
    pending_changes = conversation_states.get("pending_changes", "")
    
    # Simple email extraction (in real app, this would be more robust)
    import re
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', pending_changes)
    
    if email_match:
        new_email = email_match.group()
        # Update user profile (in real app, this would update database)
        user_profile['email'] = new_email
        
        # Clear state and return to intro after successful update
        conversation_states["current_state"] = "intro"
        conversation_states.pop("pending_changes", None)
        
        response = f"""Your email address has been successfully changed to {new_email}.. please check your email inbox and verify...

Returning to main menu..."""
        
        return {
            "response": response,
            "data": {"state": "profile_updated", "updated_profile": user_profile}
        }
    else:
        return {
            "response": "I couldn't process the email change. Please try again with your new email address and biometric verification.",
            "data": {"state": "profile_edit"}
        }

def handle_notifications_request() -> Dict[str, Any]:
    """Handle user's request to check notifications."""
    conversation_states["current_state"] = "notifications_menu"
    
    response = """Do you want to check today's notifications or yesterday's notifications..."""
    
    return {
        "response": response,
        "data": {"state": "notifications_menu"}
    }

def handle_notifications_time_selection(text: str) -> Dict[str, Any]:
    """Handle user's selection of notification timeframe."""
    user_input = text.lower().strip()
    
    selected_timeframe = None
    if any(phrase in user_input for phrase in ['today', "today's", 'today notifications']):
        selected_timeframe = 'today'
    elif any(phrase in user_input for phrase in ['yesterday', "yesterday's", 'yesterday notifications']):
        selected_timeframe = 'yesterday'
    else:
        return {
            "response": "Please choose 'today's notifications' or 'yesterday's notifications'.",
            "data": {"state": "notifications_menu"}
        }
    
    # Get notifications for selected timeframe
    notifications = notifications_data.get(selected_timeframe, [])
    conversation_states["current_state"] = "showing_notifications" 
    conversation_states["selected_timeframe"] = selected_timeframe
    
    if not notifications:
        response = f"You have no notifications for {selected_timeframe}."
    else:
        response = f"{selected_timeframe.capitalize()} you have few notifications...\n\n"
        
        for i, notification in enumerate(notifications, 1):
            if i == 1:
                response += f"First one is that {notification['message']}...\n\n"
            elif i == len(notifications):
                response += f"Then.... {notification['message']}."
            else:
                response += f"Then.... {notification['message']}...\n\n"
    
    return {
        "response": response,
        "data": {"state": "showing_notifications", "timeframe": selected_timeframe, "notifications": notifications}
    }

def handle_notifications_response(text: str) -> Dict[str, Any]:
    """Handle user's response after viewing notifications."""
    user_input = text.lower().strip()
    
    if any(phrase in user_input for phrase in ['thank you', 'thanks', 'ok thank you', 'okay thank you', 'ok thanks']):
        # Clear conversation state and return to intro
        conversation_states["current_state"] = "intro"
        conversation_states.pop("selected_timeframe", None)
        
        response = "You're welcome.. ending the conversation.."
        
        return {
            "response": response,
            "data": {"state": "conversation_ended"}
        }
    else:
        return {
            "response": "Is there anything else you'd like to know about your notifications? You can say 'thank you' when you're done.",
            "data": {"state": "showing_notifications"}
        }

def handle_language_change_request() -> Dict[str, Any]:
    """Handle user's request to change system language."""
    global current_language
    conversation_states["current_state"] = "language_menu"
    
    # Get response in current language
    response = language_responses[current_language]["language_change"]
    
    return {
        "response": response,
        "data": {"state": "language_menu", "current_language": current_language}
    }

def handle_language_selection(text: str) -> Dict[str, Any]:
    """Handle user's language selection."""
    global current_language
    user_input = text.lower().strip()
    
    new_language = None
    if any(phrase in user_input for phrase in ['french', 'français', 'change to french', 'french language']):
        new_language = 'french'
    elif any(phrase in user_input for phrase in ['spanish', 'español', 'change to spanish', 'spanish language']):
        new_language = 'spanish'
    elif any(phrase in user_input for phrase in ['english', 'change to english', 'english language']):
        new_language = 'english'
    else:
        return {
            "response": language_responses[current_language]["language_change"],
            "data": {"state": "language_menu"}
        }
    
    # Change language and provide transitional message
    old_language = current_language
    changing_response = language_responses[old_language]["changing_language"]
    
    # Update global language setting
    current_language = new_language
    
    # Clear conversation state and reinitialize with new language
    conversation_states["current_state"] = "intro"
    
    # Get new introduction in selected language
    new_intro_template = language_responses[new_language]["intro"]
    new_intro = new_intro_template.format(
        location=MOCK_ENVIRONMENT["location"],
        temperature=MOCK_ENVIRONMENT["temperature"], 
        air_quality=MOCK_ENVIRONMENT["air_quality"],
        humidity=MOCK_ENVIRONMENT["humidity"],
        co2_saved_week=MOCK_ENVIRONMENT["co2_saved_week"]
    )
    
    # Combine changing message with new intro
    full_response = changing_response + "\n\n" + new_intro
    
    return {
        "response": full_response,
        "data": {"state": "language_changed", "language": new_language, "previous_language": old_language}
    }

def handle_trips_request() -> Dict[str, Any]:
    """Handle user's request to check their trips and CO₂ savings."""
    conversation_states["current_state"] = "showing_trips"
    
    # Build comprehensive trips summary response
    response = f"""This month, you saved {trip_data['monthly_co2_saved']} kilograms of CO₂ by using public transport & this is {trip_data['monthly_goal_progress']}% of our monthly goal...

Your highest savings day was {trip_data['highest_savings_day']['date']} with {trip_data['highest_savings_day']['amount']} kilograms saved.

One Eco Tip of the day:
{trip_data['eco_tip']}

Here are your recent trips."""
    
    # Add first two trips
    recent_trips = trip_data['recent_trips'][:2]
    for i, trip in enumerate(recent_trips, 1):
        if i == 1:
            response += f"\nTrip One: {trip['date']}. {trip['transport']} to {trip['destination']}. CO₂ saved: {trip['co2_saved']} kilograms."
        elif i == 2:
            response += f"\nTrip Two: {trip['date']}. {trip['transport']} to {trip['destination']}. CO₂ saved: {trip['co2_saved']} kilograms."
    
    response += "\nSay 'next trip' to continue."
    
    return {
        "response": response,
        "data": {"state": "showing_trips", "trip_data": trip_data}
    }

def handle_trips_response(text: str) -> Dict[str, Any]:
    """Handle user's response after viewing trips."""
    user_input = text.lower().strip()
    
    if any(phrase in user_input for phrase in ['next trip', 'next', 'continue', 'more trips']):
        # Show additional trips
        recent_trips = trip_data['recent_trips'][2:4]  # Get next 2 trips
        
        if not recent_trips:
            response = "Those are all your recent trips. Thank you for choosing eco-friendly transport!"
        else:
            response = "Here are more recent trips."
            for i, trip in enumerate(recent_trips, 3):
                if i == 3:
                    response += f"\nTrip Three: {trip['date']}. {trip['transport']} to {trip['destination']}. CO₂ saved: {trip['co2_saved']} kilograms."
                elif i == 4:
                    response += f"\nTrip Four: {trip['date']}. {trip['transport']} to {trip['destination']}. CO₂ saved: {trip['co2_saved']} kilograms."
            
            response += "\nThose are all your recent trips. Great job on saving the environment!"
        
        return {
            "response": response,
            "data": {"state": "showing_trips"}
        }
    elif any(phrase in user_input for phrase in ['thank you', 'thanks', 'okay thank you', 'ok thank you', 'okay']):
        # Clear conversation state and return to intro
        conversation_states["current_state"] = "intro"
        
        response = "Your welcome.."
        
        return {
            "response": response,
            "data": {"state": "conversation_ended"}
        }
    else:
        return {
            "response": "Would you like to see more trips by saying 'next trip' or say 'thank you' when you're done?",
            "data": {"state": "showing_trips"}
        }

def handle_games_request() -> Dict[str, Any]:
    """Handle user's request to access games and eco coach."""
    conversation_states["current_state"] = "games_menu"
    
    response = f"""Welcome to Eco Coach! Here are your current stats...

You have {games_data['total_points']} total points and a {games_data['day_streak']}-day streak! 🔥

You have earned {games_data['badges_earned']} badges so far.

You have 2 playable games available:
- CO2 Clicker: Offset emissions by voice
- Eco Trivia: Test your environmental knowledge

You also have an active challenge: {games_data['active_challenges'][0]['name']} - you've completed {games_data['active_challenges'][0]['progress']} for {games_data['active_challenges'][0]['reward']} bonus points.

What would you like to do? You can say 'play CO2 clicker', 'play trivia', 'check my badges', 'check weekly progress', or 'check challenges'."""
    
    return {
        "response": response,
        "data": {"state": "games_menu", "games_data": games_data}
    }

def handle_games_menu_selection(text: str) -> Dict[str, Any]:
    """Handle user's selection from games menu."""
    user_input = text.lower().strip()
    
    if any(phrase in user_input for phrase in ['co2 clicker', 'clicker', 'play co2', 'play clicker']):
        conversation_states["current_state"] = "playing_co2_clicker"
        conversation_states["co2_saved_game"] = 0
        
        response = "Starting CO2 Clicker! Say 'tap' to offset 1 gram of CO2 emissions. Let's see how much you can save! Say 'stop' when you're done playing."
        
        return {
            "response": response,
            "data": {"state": "playing_co2_clicker", "co2_saved": 0}
        }
    elif any(phrase in user_input for phrase in ['trivia', 'play trivia', 'eco trivia', 'quiz']):
        conversation_states["current_state"] = "playing_trivia"
        conversation_states["trivia_question"] = 0
        conversation_states["trivia_score"] = 0
        
        first_question = games_data['trivia_questions'][0]
        response = f"""Starting Eco Trivia! I'll ask you 3 environmental questions. Here's question 1 of 3:

{first_question['question']}
A) {first_question['options'][0]}
B) {first_question['options'][1]}
C) {first_question['options'][2]}
D) {first_question['options'][3]}

Say the letter A, B, C, or D, or say the full answer."""
        
        return {
            "response": response,
            "data": {"state": "playing_trivia", "question": 0, "score": 0}
        }
    elif any(phrase in user_input for phrase in ['badges', 'check badges', 'my badges']):
        conversation_states["current_state"] = "showing_badges"
        
        earned_badges = [badge for badge in games_data['badges'] if badge['earned']]
        unearned_badges = [badge for badge in games_data['badges'] if not badge['earned']]
        
        response = f"You have earned {len(earned_badges)} badges out of {len(games_data['badges'])}:\n\n✅ Completed badges:\n"
        for badge in earned_badges[:4]:  # Show first 4 earned
            response += f"- {badge['name']}: {badge['description']}\n"
        
        if len(earned_badges) > 4:
            response += f"- And {len(earned_badges) - 4} more completed badges\n"
        
        response += "\n🔒 Still to unlock:\n"
        for badge in unearned_badges:
            response += f"- {badge['name']}: {badge['description']}\n"
        
        response += "\nKeep up the great work to unlock the remaining badges!"
        
        return {
            "response": response,
            "data": {"state": "showing_badges"}
        }
    elif any(phrase in user_input for phrase in ['progress', 'weekly progress', 'check progress']):
        conversation_states["current_state"] = "showing_progress"
        
        response = f"""Here's your 4-week streak progress:

Week 1: {games_data['weekly_progress'][0]} active days
Week 2: {games_data['weekly_progress'][1]} active days
Week 3: {games_data['weekly_progress'][2]} active days
Week 4: {games_data['weekly_progress'][3]} active days - your best week so far!

You're showing excellent consistency in your eco-friendly habits. Blue bars represent your streak days!"""
        
        return {
            "response": response,
            "data": {"state": "showing_progress"}
        }
    elif any(phrase in user_input for phrase in ['challenges', 'check challenges', 'active challenges']):
        conversation_states["current_state"] = "showing_challenges"
        
        challenge = games_data['active_challenges'][0]
        response = f"""You have 1 active challenge:

{challenge['name']} challenge: {challenge['description']} to finish this challenge. You've completed {challenge['progress']} total rides.

Reward: {challenge['reward']} bonus points when completed.

Keep cycling to work to complete this challenge and earn your bonus points!"""
        
        return {
            "response": response,
            "data": {"state": "showing_challenges"}
        }
    else:
        return {
            "response": "You can say 'play CO2 clicker', 'play trivia', 'check my badges', 'check weekly progress', or 'check challenges'. What would you like to do?",
            "data": {"state": "games_menu"}
        }

def handle_co2_clicker_game(text: str) -> Dict[str, Any]:
    """Handle CO2 clicker game interactions."""
    user_input = text.lower().strip()
    current_saved = conversation_states.get("co2_saved_game", 0)
    
    if any(phrase in user_input for phrase in ['tap', 'click', 'offset']):
        # Count how many "tap" commands in the input
        tap_count = user_input.count('tap') + user_input.count('click') + user_input.count('offset')
        if tap_count == 0:
            tap_count = 1
        
        new_saved = current_saved + tap_count
        conversation_states["co2_saved_game"] = new_saved
        
        if new_saved <= 5:
            response = f"Excellent! You've saved {new_saved} grams of CO2! Keep going! Say 'tap' to continue or 'stop' to finish."
        else:
            response = f"Fantastic! You've saved {new_saved} grams of CO2 total! Well done on offsetting emissions. Say 'tap' to keep playing or 'stop' to return to games menu."
        
        return {
            "response": response,
            "data": {"state": "playing_co2_clicker", "co2_saved": new_saved}
        }
    elif any(phrase in user_input for phrase in ['stop', 'finish', 'done', 'quit']):
        total_saved = conversation_states.get("co2_saved_game", 0)
        conversation_states["current_state"] = "games_menu"
        conversation_states.pop("co2_saved_game", None)
        
        response = f"Great gaming session! You saved {total_saved} grams of CO2. Returning to Eco Coach menu..."
        
        return {
            "response": response,
            "data": {"state": "games_menu"}
        }
    else:
        return {
            "response": "Say 'tap' to offset CO2 or 'stop' to finish the game.",
            "data": {"state": "playing_co2_clicker"}
        }

def handle_trivia_game(text: str) -> Dict[str, Any]:
    """Handle trivia game interactions."""
    user_input = text.lower().strip()
    current_question = conversation_states.get("trivia_question", 0)
    current_score = conversation_states.get("trivia_score", 0)
    
    questions = games_data['trivia_questions']
    
    if current_question >= len(questions):
        # Game finished
        conversation_states["current_state"] = "games_menu"
        conversation_states.pop("trivia_question", None)
        conversation_states.pop("trivia_score", None)
        
        response = f"Perfect! You got all {len(questions)} questions right! Score: {current_score} out of {len(questions)}. You're an eco knowledge champion! 🏆 Returning to games menu..."
        
        return {
            "response": response,
            "data": {"state": "games_menu"}
        }
    
    # Check answer
    question = questions[current_question]
    correct_answer = question['correct']
    
    user_answered_correct = False
    if user_input in ['a', 'b', 'c', 'd']:
        answer_index = ord(user_input) - ord('a')
        user_answered_correct = answer_index == correct_answer
    else:
        # Check if user said the full answer
        correct_option = question['options'][correct_answer].lower()
        user_answered_correct = correct_option in user_input
    
    # Update score
    new_score = current_score + (1 if user_answered_correct else 0)
    conversation_states["trivia_score"] = new_score
    
    # Move to next question
    next_question = current_question + 1
    conversation_states["trivia_question"] = next_question
    
    if user_answered_correct:
        response = "Correct! "
    else:
        response = f"The correct answer was {question['options'][correct_answer]}. "
    
    if next_question < len(questions):
        # Next question
        next_q = questions[next_question]
        response += f"Question {next_question + 1} of {len(questions)}:\n\n{next_q['question']}\nA) {next_q['options'][0]}\nB) {next_q['options'][1]}\nC) {next_q['options'][2]}\nD) {next_q['options'][3]}"
    else:
        # Game finished
        conversation_states["current_state"] = "games_menu"
        response += f"Game complete! Final Score: {new_score} out of {len(questions)}. "
        if new_score == len(questions):
            response += "Perfect score! You're an eco knowledge champion! 🏆"
        elif new_score >= len(questions) * 0.7:
            response += "Great job! You know your environmental facts!"
        else:
            response += "Good effort! Keep learning about environmental topics!"
        response += " Returning to games menu..."
    
    return {
        "response": response,
        "data": {"state": "playing_trivia" if next_question < len(questions) else "games_menu"}
    }

def handle_badges_response(text: str) -> Dict[str, Any]:
    """Handle response after showing badges."""
    return handle_generic_games_response(text)

def handle_progress_response(text: str) -> Dict[str, Any]:
    """Handle response after showing progress."""
    return handle_generic_games_response(text)

def handle_challenges_response(text: str) -> Dict[str, Any]:
    """Handle response after showing challenges."""
    return handle_generic_games_response(text)

def handle_generic_games_response(text: str) -> Dict[str, Any]:
    """Handle generic responses for games sections."""
    user_input = text.lower().strip()
    
    if any(phrase in user_input for phrase in ['thank you', 'thanks', 'okay thank you', 'ok thank you', 'okay', 'done']):
        conversation_states["current_state"] = "intro"
        
        response = "You're welcome! Keep up the fantastic eco-friendly gaming. You're making a real difference for the environment! Returning to main menu..."
        
        return {
            "response": response,
            "data": {"state": "conversation_ended"}
        }
    else:
        conversation_states["current_state"] = "games_menu"
        
        response = "Would you like to try something else? You can say 'play CO2 clicker', 'play trivia', 'check my badges', 'check weekly progress', or 'check challenges'."
        
        return {
            "response": response,
            "data": {"state": "games_menu"}
        }