from fastapi.testclient import TestClient

from app.main import app


def test_health_check() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "intelligym-api",
        "version": "0.1.0",
        "firebase_admin_ready": False,
    }


def test_me_requires_authentication() -> None:
    client = TestClient(app)

    response = client.get("/api/me")

    assert response.status_code == 401
    assert response.json()["detail"] == "Token ausente."


def test_private_workout_generation_requires_authentication() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/workouts/generate",
        json={
            "objective": "hipertrofia",
            "level": "iniciante",
            "location": "casa",
            "available_equipment": ["halteres"],
            "limitations": [],
        },
    )

    assert response.status_code == 401


def test_private_pain_records_requires_authentication() -> None:
    client = TestClient(app)

    response = client.post(
        "/api/pain-records",
        json={
            "intensity": 3,
            "location": "joelho",
            "notes": "Desconforto leve apos treino.",
        },
    )

    assert response.status_code == 401
