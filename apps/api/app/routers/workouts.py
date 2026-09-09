from typing import Any

from fastapi import APIRouter

from app.dependencies.auth import CurrentUser
from app.schemas import WorkoutGenerationRequest, WorkoutGenerationResponse, WorkoutListResponse
from app.services.workout_service import generate_workout as generate_workout_plan
from app.services.workout_service import list_mock_workouts

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


@router.get("", response_model=WorkoutListResponse)
async def get_workouts(current_user: dict[str, Any] = CurrentUser) -> WorkoutListResponse:
    _ = current_user
    return WorkoutListResponse(workouts=list_mock_workouts())


@router.post("/generate", response_model=WorkoutGenerationResponse)
async def generate_workout(
    payload: WorkoutGenerationRequest, current_user: dict[str, Any] = CurrentUser
) -> WorkoutGenerationResponse:
    _ = current_user
    return await generate_workout_plan(payload)
