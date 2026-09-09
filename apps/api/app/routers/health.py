from fastapi import APIRouter

from app.core.firebase_admin import is_firebase_admin_ready
from app.schemas import HealthCheckResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthCheckResponse)
def health_check() -> HealthCheckResponse:
    return HealthCheckResponse(
        status="ok",
        service="intelligym-api",
        version="0.1.0",
        firebase_admin_ready=is_firebase_admin_ready(),
    )
