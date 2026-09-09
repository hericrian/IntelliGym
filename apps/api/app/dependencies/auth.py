from typing import Any

from fastapi import Depends, Header, HTTPException, status

from app.core.firebase_admin import verify_firebase_token


def _extract_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token ausente.")

    scheme, _, token = authorization.partition(" ")

    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido.")

    return token


async def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    token = _extract_bearer_token(authorization)

    try:
        decoded = verify_firebase_token(token)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(error)
        ) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token Firebase invalido."
        ) from error

    return {
        "uid": decoded.get("uid"),
        "email": decoded.get("email"),
        "claims": decoded,
    }


CurrentUser = Depends(get_current_user)
