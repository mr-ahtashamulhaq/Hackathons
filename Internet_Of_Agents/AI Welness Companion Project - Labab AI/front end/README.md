AI Wellness Companion - Merged Frontend + Backend

## Backend

cd backend
python -m venv venv
# activate venv
# Linux/Mac: source venv/bin/activate
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your keys
uvicorn main:app --reload --port 8000

## Frontend
cd ../
# Frontend at 'AI Welness Companion Project - Labab AI'
cd "AI Welness Companion Project - Labab AI"
npm install
npm run dev

The frontend is patched to call backend POST /analyze at http://localhost:8000/analyze
