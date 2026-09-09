from typing import Any

from pydantic import BaseModel


class CurrentUserResponse(BaseModel):
    uid: str
    email: str | None
    claims: dict[str, Any]
