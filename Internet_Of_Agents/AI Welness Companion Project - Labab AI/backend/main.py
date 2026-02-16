from fastapi import FastAPI
from pydantic import BaseModel
import os, httpx
from dotenv import load_dotenv
from openai import AsyncOpenAI

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

class TextIn(BaseModel):
    text: str

import random

# Simple crisis keywords
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self-harm", 
    "harm myself", "want to die", "i cant go on", "i can't go on"
]

# Fallback empathetic responses when OpenAI is unavailable
FALLBACK_RESPONSES = {
    "positive": [
        "That's wonderful to hear! 🌟 I'm so glad you're feeling good. What's bringing you joy today?",
        "Your positive energy is amazing! Keep embracing those good vibes. 💫",
        "I love hearing that! Remember to savor these moments of happiness. ✨"
    ],
    "neutral": [
        "I hear you. Sometimes things just feel... okay, and that's perfectly fine. How can I support you today?",
        "Thanks for sharing with me. I'm here to listen and help however I can. 💙",
        "I appreciate you opening up. What's on your mind?"
    ],
    "negative": [
        "I'm sorry you're going through a tough time. Your feelings are valid, and I'm here for you. 💙",
        "That sounds really challenging. Remember, it's okay to not be okay sometimes. I'm here to listen.",
        "Thank you for trusting me with how you feel. You're not alone in this. 🤗"
    ],
    "anxious": [
        "Anxiety can be overwhelming. Would you like to try a quick breathing exercise together? 🌊",
        "I understand how unsettling anxiety can feel. Let's take this one step at a time. You've got this! 💪",
        "When anxiety creeps in, remember: this feeling is temporary. I'm here with you. 🫂"
    ]
}

def get_fallback_response(text):
    """Generate a fallback response based on simple keyword matching"""
    text_lower = text.lower()
    
    # Check for emotional keywords
    positive_words = ["happy", "great", "good", "wonderful", "excited", "joy", "love"]
    negative_words = ["sad", "bad", "awful", "terrible", "upset", "hurt", "pain"]
    anxious_words = ["anxious", "worry", "scared", "fear", "nervous", "stress"]
    
    if any(word in text_lower for word in anxious_words):
        return random.choice(FALLBACK_RESPONSES["anxious"])
    elif any(word in text_lower for word in positive_words):
        return random.choice(FALLBACK_RESPONSES["positive"])
    elif any(word in text_lower for word in negative_words):
        return random.choice(FALLBACK_RESPONSES["negative"])
    else:
        return random.choice(FALLBACK_RESPONSES["neutral"])


@app.get("/")
def root():
    return {"message": "Backend is running!"}

@app.post("/analyze")
async def analyze(input: TextIn):
    text = input.text

    # 1) crisis check
    lowered = text.lower()
    crisis = {"crisis": False, "message": ""}
    for kw in CRISIS_KEYWORDS:
        if kw in lowered:
            crisis = {
                "crisis": True,
                "message": "⚠️ Crisis detected. If you're in immediate danger please contact local emergency services or a crisis hotline."
            }
            break

    # 2) mood detection via Hugging Face Inference API
    mood = None
    if HF_API_TOKEN:
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        async with httpx.AsyncClient(timeout=30) as hf_client:
            try:
                # Using a different sentiment model that's more stable
                resp = await hf_client.post(
                    "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
                    headers=headers,
                    json={"inputs": text}
                )
                if resp.status_code == 200:
                    mood = resp.json()
                else:
                    # Fallback to basic sentiment if model fails
                    mood = {"error": f"HF API unavailable (status {resp.status_code})"}
            except Exception as e:
                mood = {"error": str(e)}
    else:
        mood = {"error": "HF_API_TOKEN not set"}

    # 3) companion reply (OpenAI with fallback)
    companion_reply = ""
    if OPENAI_API_KEY:
        try:
            completion = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a friendly, casual and supportive mental health companion named Luna. Keep responses empathetic, concise, and encourage safe actions. Do NOT give medical advice."},
                    {"role": "user", "content": text}
                ],
                max_tokens=250,
                temperature=0.7
            )
            companion_reply = completion.choices[0].message.content.strip()
        except Exception as e:
            # Use fallback if OpenAI fails
            companion_reply = get_fallback_response(text)
            companion_reply += "\n\n_Note: Running in offline mode. AI features limited._"
    else:
        # Use fallback if no API key
        companion_reply = get_fallback_response(text)

    return {
        "companion": companion_reply,
        "mood": mood,
        "crisis": crisis
    }
