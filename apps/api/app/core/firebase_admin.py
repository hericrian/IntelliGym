from functools import lru_cache
from typing import Any

import cachecontrol
import requests
from google.auth.transport.requests import Request
from google.oauth2 import id_token

from .config import get_settings


@lru_cache
def _google_request() -> Request:
    session = cachecontrol.CacheControl(requests.Session())
    return Request(session=session)


def is_firebase_admin_ready() -> bool:
    return bool(get_settings().firebase_project_id)


def verify_firebase_token(token: str) -> dict[str, Any]:
    project_id = get_settings().firebase_project_id

    if not project_id:
        raise RuntimeError("Projeto Firebase ainda nao configurado.")

    claims = dict(id_token.verify_firebase_token(token, _google_request(), audience=project_id))

    if claims.get("iss") != f"https://securetoken.google.com/{project_id}":
        raise ValueError("Emissor do token Firebase invalido.")

    subject = claims.get("sub")
    if not isinstance(subject, str) or not subject or len(subject) > 128:
        raise ValueError("Identificador do token Firebase invalido.")

    claims["uid"] = subject
    return claims
