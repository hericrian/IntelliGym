from typing import Any

from fastapi import APIRouter

from app.dependencies.auth import CurrentUser
from app.schemas import CurrentUserResponse

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/me", response_model=CurrentUserResponse)
async def get_me(current_user: dict[str, Any] = CurrentUser) -> CurrentUserResponse:
    return CurrentUserResponse(
        uid=current_user["uid"],
        email=current_user.get("email"),
        claims=current_user.get("claims", {}),
    )
