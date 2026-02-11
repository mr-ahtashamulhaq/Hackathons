import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv


class ChatService:
    """
    Standardized on Gemini 2.5 Flash (Old SDK) for consistency with Vision Service.
    """

    def __init__(self) -> None:
        load_dotenv()
        self.api_key = os.getenv("GEMINI_API_KEY")

        # Enforce the model we agreed on
        self.model_id = "gemini-2.5-flash"

        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_id)
            except Exception as e:
                print(f"⚠️ ChatService Config Error: {e}")
        else:
            print("⚠️ ChatService Warning: GEMINI_API_KEY not found")

    def synthesize(self, transit: str, climate: str, vision: str) -> str:
        """
        Produce a user-friendly sentence.
        """
        # 1. Fallback if no AI
        if not self.model:
            ramp_status = "has a ramp" if "true" in str(vision).lower() else "ramp status unknown"
            return f"Trip info: {transit}. Climate: {climate}. Accessibility: {ramp_status}."

        # 2. Prompt
        prompt = (
            f"You are a helpful transit assistant. Write ONE friendly sentence for a rider based on this data:\n"
            f"- Transit: {transit}\n"
            f"- Climate Impact: {climate}\n"
            f"- Safety/Vision: {vision}\n\n"
            f"Mention the CO2 savings enthusiastically. If the vision data mentions a hazard, warn them gently."
        )

        # 3. Call AI
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"❌ Chat Gen Error: {e}")
            return "Your trip information is ready."

    def interpret_destination(self, messy_speech_text: str) -> str:
        """
        Decodes "Onion Station" -> "Union Station"
        """
        raw = (messy_speech_text or "").strip()
        if not raw:
            return ""

        # 1. Fallback if no AI
        if not self.model:
            return raw.title()

        # 2. Prompt
        prompt = (
            f"Correct the following messy speech-to-text into a valid transit destination name.\n"
            f"Input: '{raw}'\n"
            f"Context: The user is asking for a station, stop, or landmark.\n"
            f"Return ONLY the corrected name. No JSON. No quotes."
        )

        # 3. Call AI
        try:
            response = self.model.generate_content(prompt)
            text = response.text.strip()
            # Clean up if it adds quotes
            return text.replace('"', '').replace("'", "")
        except Exception as e:
            print(f"❌ Chat Interpret Error: {e}")
            return raw.title()

    # Backwards compatibility aliases
    def get_chat_response(self, transit, climate, vision):
        return self.synthesize(transit, climate, vision)

    def interpret_speech(self, text):
        return self.interpret_destination(text)