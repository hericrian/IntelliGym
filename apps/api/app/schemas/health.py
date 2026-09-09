from pydantic import BaseModel


class HealthCheckResponse(BaseModel):
    status: str
    service: str
    version: str
    firebase_admin_ready: bool
