from fastapi import APIRouter, File, Form, UploadFile, status
from ..config import settings
from ..schemas import CapabilitiesResponse, JobSubmitResponse
from ..services.adapter import model_registry
from ..validation import (
    InvalidImageError,
    MissingViewError,
    ModelUnavailableError,
    UnsupportedAnatomyError,
    UploadTooLargeError,
    validate_image_bytes,
)

router = APIRouter(prefix="/api/v1/reconstruction", tags=["Reconstruction"])


@router.get("/capabilities", response_model=CapabilitiesResponse)
async def get_capabilities() -> CapabilitiesResponse:
    """Return model availability, supported anatomies, and upload constraints."""
    adapter = model_registry.adapter
    return CapabilitiesResponse(
        available=adapter.is_available(),
        mode="research" if adapter.is_available() else "unavailable",
        model=adapter.get_model_identifier(),
        supported_anatomies=adapter.get_supported_anatomies(),
        requires_ap=True,
        requires_lateral=True,
        max_upload_bytes=settings.max_upload_bytes,
        input_constraints=adapter.get_input_constraints(),
        reason=adapter.get_unavailable_reason(),
    )


@router.post(
    "/jobs",
    response_model=JobSubmitResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def submit_reconstruction_job(
    ap: UploadFile = File(..., description="AP projection image"),
    lateral: UploadFile = File(..., description="Lateral projection image"),
    anatomy: str = Form(..., description="Exact anatomy target identifier"),
) -> JobSubmitResponse:
    """Validate submitted AP/lateral images and queue reconstruction job."""
    # 1. Check for missing views
    if not ap or not ap.filename:
        raise MissingViewError("AP view image is required.")
    if not lateral or not lateral.filename:
        raise MissingViewError("Lateral view image is required.")

    # 2. Stream and validate AP/lateral bytes first (always validate input
    #    regardless of model readiness — contract requires rejecting bad files)
    ap_bytes = await ap.read()
    validate_image_bytes(ap_bytes, "AP")

    lat_bytes = await lateral.read()
    validate_image_bytes(lat_bytes, "Lateral")

    # 3. Check model readiness (after file validation)
    adapter = model_registry.adapter
    if not adapter.is_available():
        raise ModelUnavailableError(
            adapter.get_unavailable_reason() or "No verified inference checkpoint is configured."
        )

    # 4. Validate anatomy identifier against live adapter capabilities
    supported = adapter.get_supported_anatomies()
    if anatomy not in supported:
        raise UnsupportedAnatomyError(
            f"Anatomy '{anatomy}' is not supported. Supported targets: {supported}"
        )

    # In Phase 1 scaffold, if available, we would register a job.
    # Currently adapter is unavailable so 503 is returned per contract.
    import uuid
    job_id = str(uuid.uuid4())
    return JobSubmitResponse(job_id=job_id, status="queued")
