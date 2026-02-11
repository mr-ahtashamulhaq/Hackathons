import os
import google.generativeai as genai
from PIL import Image
import io


class VisionService:
    def __init__(self):
        # Configure the Gemini API
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ WARNING: GEMINI_API_KEY not found. Vision service will fail.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_image(self, image_bytes: bytes) -> dict:
        """
        Analyzes an image for accessibility hazards using Gemini Vision.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes))

            prompt = (
                "Analyze this image of a transit station or bus stop for accessibility issues. "
                "Identify hazards like: snow obstruction, broken elevators, uneven pavement, or construction. "
                "Return a JSON response with: "
                "1. 'description' (one sentence summary), "
                "2. 'hazards' (list of specific issues found), "
                "3. 'safe_for_wheelchair' (boolean), "
                "4. 'accessibility_score' (1-10)."
            )

            response = self.model.generate_content([prompt, image])

            # Clean up Markdown formatting (Gemini loves adding ```json)
            text_response = response.text.replace('```json', '').replace('```', '').strip()

            # PARSE THE JSON (The new part)
            import json
            try:
                return json.loads(text_response)
            except json.JSONDecodeError:
                # If parsing fails, just return the text so we can debug
                return {"raw_analysis": text_response}

        except Exception as e:
            print(f"❌ Vision Error: {e}")
            return {"error": "Failed to analyze image", "details": str(e)}