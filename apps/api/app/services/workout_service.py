from app.schemas import WorkoutGenerationRequest, WorkoutGenerationResponse, WorkoutSummary
from app.services.ai_service import generate_gemini_workout_summary


def list_mock_workouts() -> list[WorkoutSummary]:
    return [
        WorkoutSummary(
            id="wk-home-knee-01",
            title="Base segura para joelho",
            focus="Reforco funcional",
            durationMinutes=32,
            equipment=["Mini band", "Halteres leves"],
        ),
        WorkoutSummary(
            id="wk-gym-upper-02",
            title="Forca de membros superiores",
            focus="Hipertrofia controlada",
            durationMinutes=48,
            equipment=["Polia", "Banco reto", "Halteres"],
        ),
    ]


def build_local_workout_summary(payload: WorkoutGenerationRequest) -> str:
    equipment_label = ", ".join(payload.available_equipment) if payload.available_equipment else "peso corporal"

    return (
        f"Plano inicial para objetivo {payload.objective}, nivel {payload.level}, "
        f"local {payload.location}, usando {equipment_label}. Comece com aquecimento leve, "
        "priorize tecnica e reduza carga se surgir dor acima de 4/10."
    )


async def generate_workout(payload: WorkoutGenerationRequest) -> WorkoutGenerationResponse:
    ai_summary = await generate_gemini_workout_summary(payload)

    return WorkoutGenerationResponse(
        summary=ai_summary or build_local_workout_summary(payload),
        workouts=list_mock_workouts(),
        generatedBy="gemini" if ai_summary else "local-fallback",
    )
