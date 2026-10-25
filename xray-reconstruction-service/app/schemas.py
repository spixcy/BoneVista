from typing import Literal
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# API Contract v1.1 Schemas
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "bonevista-xray-reconstruction"


class CapabilitiesResponse(BaseModel):
    available: bool
    mode: Literal["unavailable", "research"]
    model: str | None = None
    supported_anatomies: list[str] = Field(default_factory=list)
    requires_ap: bool = True
    requires_lateral: bool = True
    max_upload_bytes: int = 26214400
    input_constraints: list[str] = Field(default_factory=list)
    reason: str | None = None


class JobSubmitResponse(BaseModel):
    job_id: str
    status: Literal["queued"] = "queued"


class JobPollResponse(BaseModel):
    job_id: str
    status: Literal["queued", "processing", "succeeded", "failed"]
    progress: int | None = None
    message: str
    model_url: str | None = None
    model_type: str | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
