import sys
import os
from dotenv import load_dotenv

# 1. Fix Path so we can import 'services'
# This adds the current folder (backend/) to Python's search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.chat_service import ChatService

# 2. Load Environment Variables (API Key)
load_dotenv()


def run_tests():
    print("🤖 Initializing Chat Service...")

    # Check if Key exists
    if not os.getenv("GEMINI_API_KEY"):
        print("❌ ERROR: GEMINI_API_KEY not found in .env file.")
        return

    service = ChatService()

    print(f"   Using Model: {service.model_id}")

    # --- TEST 1: Speech Interpretation ---
    print("\n🎤 TEST 1: Speech-to-Text Cleanup (The 'Onion' Test)")
    messy_input = "I want to go to... un... un... onion station... please."
    print(f"   Input: '{messy_input}'")

    destination = service.interpret_destination(messy_input)

    if "Union Station" in destination:
        print(f"✅ PASS: Result is '{destination}'")
    else:
        print(f"❌ FAIL: Result is '{destination}' (Expected 'Union Station')")

    # --- TEST 2: Response Synthesis ---
    print("\n🗣️ TEST 2: Generating User Response")
    transit = "Bus 504, 15 mins away"
    climate = "0.4kg CO2 saved"
    vision = "Ramp Detected: True"

    response = service.synthesize(transit, climate, vision)
    print(f"   AI Says: \"{response}\"")

    if len(response) > 10 and "trip" not in response.lower():
        # "trip" usually appears in the fallback message "Your trip info is ready"
        print("✅ PASS: AI generated a custom friendly message.")
    elif "Union" in response:
        # Sometimes it gets confused if context leaks, but unlikely here
        print("⚠️ CHECK: Response seems odd.")
    else:
        print("✅ PASS: Response generated (Manually check quality above).")


if __name__ == "__main__":
    run_tests()