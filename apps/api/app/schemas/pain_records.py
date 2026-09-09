from pydantic import BaseModel, Field


class PainRecordCreateRequest(BaseModel):
    intensity: int = Field(ge=0, le=10)
    location: str = Field(min_length=2, max_length=80)
    notes: str | None = Field(default=None, max_length=500)


class PainRecordCreateResponse(BaseModel):
    id: str
    saved: bool
