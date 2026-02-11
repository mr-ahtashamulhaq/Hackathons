# backend/routes/health.py
# Health check and status endpoints

from fastapi import APIRouter

router = APIRouter(tags=["Health"])


@router.get("/")
def home():
    """
    Root endpoint - confirms API is running
    Returns: Basic service status message
    """
    return {
        "message": "Inclusive Transit API is running! 🚀",
        "status": "healthy",
        "service": "Transit Accessibility App Backend"
    }


@router.get("/health")
def health_check():
    """
    Health check endpoint for load balancers and monitoring
    Returns: Service health status
    """
    return {"status": "healthy", "service": "transit-api"}
