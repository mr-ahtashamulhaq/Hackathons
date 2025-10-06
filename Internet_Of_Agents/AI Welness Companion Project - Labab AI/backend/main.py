from fastapi import FastAPI
from pydantic import BaseModel
import os, httpx
from dotenv import load_dotenv
import openai

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HF_API_TOKEN = os.getenv("HF_API_TOKEN")

openai.api_key = OPENAI_API_KEY

class TextIn(BaseModel):
    text: str

# Simple crisis keywords
CRISIS_KEYWORDS = [
    "suicide", "kill myself", "end my life", "self-harm", 
    "harm myself", "want to die", "i cant go on", "i can't go on"
]

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
        async with httpx.AsyncClient(timeout=30) as client:
            try:
                resp = await client.post(
                    "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base",
                    headers=headers,
                    json={"inputs": text}
                )
                if resp.status_code == 200:
                    mood = resp.json()
                else:
                    mood = {"error": f"Hugging Face error {resp.status_code}: {await resp.aread()}"}
            except Exception as e:
                mood = {"error": str(e)}
    else:
        mood = {"error": "HF_API_TOKEN not set"}

    # 3) companion reply (OpenAI)
    companion_reply = "Sorry, companion not configured."
    if OPENAI_API_KEY:
        try:
            completion = await openai.ChatCompletion.acreate(
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
            companion_reply = f"OpenAI error: {e}"

    return {
        "companion": companion_reply,
        "mood": mood,
        "crisis": crisis
    }
