from __future__ import annotations

import httpx

from app.core.config import get_settings
from app.schemas import WorkoutGenerationRequest


def is_ai_configured() -> bool:
    settings = get_settings()
    return bool(settings.ai_api_key and (settings.ai_provider or "").lower() == "gemini")


def build_workout_prompt(payload: WorkoutGenerationRequest) -> str:
    equipment = (
        ", ".join(payload.available_equipment) if payload.available_equipment else "peso corporal"
    )
    limitations = (
        ", ".join(payload.limitations) if payload.limitations else "nenhuma limitacao informada"
    )

    return (
        "Voce e um assistente de treino do IntelliGym. Gere uma resposta curta, segura e pratica em portugues. "
        "Nao use tom medico, nao prometa resultado e recomende procurar profissional se houver dor forte. "
        f"Objetivo: {payload.objective}. Nivel: {payload.level}. Local: {payload.location}. "
        f"Equipamentos: {equipment}. Limitacoes: {limitations}. "
        "Responda em ate 900 caracteres com foco, estrutura do treino e cautelas."
    )


async def generate_gemini_workout_summary(payload: WorkoutGenerationRequest) -> str | None:
    settings = get_settings()

    if not is_ai_configured() or not settings.ai_api_key:
        return None

    model = settings.ai_model or "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    try:
        async with httpx.AsyncClient(timeout=18.0) as client:
            response = await client.post(
                url,
                params={"key": settings.ai_api_key},
                json={
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": build_workout_prompt(payload)}],
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.45,
                        "maxOutputTokens": 320,
                    },
                },
            )
            response.raise_for_status()
    except httpx.HTTPError:
        return None

    data = response.json()
    candidates = data.get("candidates", [])

    if not candidates:
        return None

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if isinstance(part, dict)]
    summary = "\n".join(text.strip() for text in text_parts if text.strip())

    return summary or None
