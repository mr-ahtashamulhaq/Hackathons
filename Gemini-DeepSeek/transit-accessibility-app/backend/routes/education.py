from fastapi import APIRouter, Query
from services.climate_education_service import ClimateEducationService

router = APIRouter(prefix="/api/climate", tags=["Climate (Education)"])
_edu = ClimateEducationService()


@router.get("/education/tip")
def get_tip(has_smoke: bool = Query(False)):
    return _edu.tip_for_context(has_smoke=has_smoke)
