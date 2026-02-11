from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.assistant_service import process_assistant_query
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class AssistantQueryRequest(BaseModel):
    text: str

@router.post("/query")
async def assistant_query(req: AssistantQueryRequest):
    """Voice assistant endpoint - no API key needed"""
    try:
        result = await process_assistant_query(req.text, openai_client=None)
        return result
    except Exception as e:
        logger.error(f"Assistant query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))