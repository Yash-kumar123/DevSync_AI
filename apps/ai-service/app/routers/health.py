from fastapi import APIRouter, status

from app.schemas.health import HealthResponse

router = APIRouter(prefix="/health")


@router.get("", response_model=HealthResponse, status_code=status.HTTP_200_OK)
async def health_check() -> HealthResponse:
    """Report service availability without contacting AI providers."""
    return HealthResponse(status="ok")
