from fastapi import APIRouter
from ..schemas import HealthResponse

router = APIRouter(prefix="/api/v1", tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def get_health() -> HealthResponse:
    """Report that API server is responding."""
    return HealthResponse(status="ok", service="bonevista-xray-reconstruction")
