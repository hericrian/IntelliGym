from pydantic import BaseModel, ConfigDict, Field


class WorkoutSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    focus: str
    duration_minutes: int = Field(alias="durationMinutes")
    equipment: list[str]


class WorkoutListResponse(BaseModel):
    workouts: list[WorkoutSummary]


class WorkoutGenerationRequest(BaseModel):
    objective: str = Field(min_length=2, max_length=80)
    level: str = Field(min_length=2, max_length=40)
    location: str = Field(min_length=2, max_length=40)
    available_equipment: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


class WorkoutGenerationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    summary: str
    workouts: list[WorkoutSummary]
    generated_by: str = Field(alias="generatedBy")
