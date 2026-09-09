from .health import router as health_router
from .pain_records import router as pain_records_router
from .users import router as users_router
from .workouts import router as workouts_router

__all__ = [
    "health_router",
    "pain_records_router",
    "users_router",
    "workouts_router",
]
