# backend/test_vision.py
import os
from dotenv import load_dotenv
from services.vision_service import VisionService

# 1. Load env variables (API Key)
load_dotenv()


def run_test():
    # 2. Check if image exists
    img_path = "test_image.jpg"
    if not os.path.exists(img_path):
        print(f"❌ Error: Please save an image named '{img_path}' in this folder first.")
        return

    print(f"👀 Analyzing {img_path} with Gemini Vision...")

    # 3. Read image as bytes (simulating an upload)
    with open(img_path, "rb") as f:
        image_bytes = f.read()

    # 4. Initialize Service
    service = VisionService()

    # 5. Get Result
    result = service.analyze_image(image_bytes)

    print("\n--- ANALYSIS RESULT ---")
    print(result)


if __name__ == "__main__":
    run_test()