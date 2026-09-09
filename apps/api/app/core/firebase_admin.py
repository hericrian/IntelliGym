from __future__ import annotations

from functools import lru_cache
from typing import Any

import firebase_admin  # type: ignore[import-untyped]
from firebase_admin import auth, credentials  # type: ignore[import-untyped]

from .config import get_settings


def _build_credentials_payload() -> dict[str, Any] | None:
    settings = get_settings()

    if not settings.firebase_project_id or not settings.firebase_client_email or not settings.firebase_private_key:
        return None

    return {
        "type": "service_account",
        "project_id": settings.firebase_project_id,
        "client_email": settings.firebase_client_email,
        "private_key": settings.firebase_private_key.replace("\\n", "\n"),
        "token_uri": "https://oauth2.googleapis.com/token",
    }


@lru_cache
def get_firebase_app() -> firebase_admin.App | None:
    if firebase_admin._apps:
        return firebase_admin.get_app()

    payload = _build_credentials_payload()

    if not payload:
        return None

    return firebase_admin.initialize_app(credentials.Certificate(payload))


def is_firebase_admin_ready() -> bool:
    return get_firebase_app() is not None


def verify_firebase_token(token: str) -> dict[str, Any]:
    app = get_firebase_app()

    if app is None:
        raise RuntimeError("Firebase Admin ainda nao configurado.")

    return auth.verify_id_token(token, app=app)
