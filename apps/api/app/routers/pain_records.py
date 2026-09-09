from typing import Any
from uuid import uuid4

from fastapi import APIRouter

from app.dependencies.auth import CurrentUser
from app.schemas import PainRecordCreateRequest, PainRecordCreateResponse

router = APIRouter(prefix="/api/pain-records", tags=["pain-records"])


@router.post("", response_model=PainRecordCreateResponse)
async def create_pain_record(
    payload: PainRecordCreateRequest, current_user: dict[str, Any] = CurrentUser
) -> PainRecordCreateResponse:
    _ = (payload, current_user)
    return PainRecordCreateResponse(id=f"pain-{uuid4().hex[:10]}", saved=True)
