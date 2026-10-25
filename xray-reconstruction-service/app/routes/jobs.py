import asyncio
import uuid
import shutil
from pathlib import Path
from typing import Literal
from dataclasses import dataclass, field

from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import FileResponse

from ..config import settings
from ..schemas import JobPollResponse
from ..services.adapter import model_registry
from ..validation import ModelUnavailableError

router = APIRouter(prefix="/api/v1/reconstruction", tags=["Reconstruction"])

# ---------------------------------------------------------------------------
# In-memory job registry (session-only, as per Phase 1 scope)
# ---------------------------------------------------------------------------

JobStatus = Literal["queued", "processing", "succeeded", "failed"]


@dataclass
class Job:
    job_id: str
    anatomy: str
    status: JobStatus = "queued"
    progress: int | None = None
    message: str = "Job queued"
    model_url: str | None = None
    model_type: str | None = None
    output_path: Path | None = None
    temp_ap_path: Path | None = None
    temp_lat_path: Path | None = None


_jobs: dict[str, Job] = {}


def _get_job(job_id: str) -> Job:
    if job_id not in _jobs:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail={"code": "JOB_NOT_FOUND", "message": f"Job '{job_id}' not found."})
    return _jobs[job_id]


async def _run_inference(job_id: str, ap_bytes: bytes, lat_bytes: bytes) -> None:
    """Background task executing inference and writing GLB output."""
    job = _jobs.get(job_id)
    if not job:
        return

    job.status = "processing"
    job.message = "Running reconstruction"

    try:
        # Write temp files with non-guessable job-scoped paths
        temp_dir = settings.temp_dir / job_id
        temp_dir.mkdir(parents=True, exist_ok=True)
        job.temp_ap_path = temp_dir / "ap.upload"
        job.temp_lat_path = temp_dir / "lat.upload"
        job.temp_ap_path.write_bytes(ap_bytes)
        job.temp_lat_path.write_bytes(lat_bytes)

        # Run inference via adapter
        adapter = model_registry.adapter
        glb_bytes = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: adapter.run_inference(ap_bytes, lat_bytes, job.anatomy),
        )

        # Validate minimal GLB magic bytes: b"glTF" == 0x67 0x6C 0x54 0x46
        if not glb_bytes or not glb_bytes.startswith(b"glTF"):
            raise ValueError("Inference produced an invalid GLB output.")

        # Persist output
        out_dir = settings.outputs_dir / job_id
        out_dir.mkdir(parents=True, exist_ok=True)
        output_path = out_dir / "model.glb"
        output_path.write_bytes(glb_bytes)

        job.output_path = output_path
        job.status = "succeeded"
        job.progress = 100
        job.message = "Reconstruction completed"
        job.model_url = f"/api/v1/reconstruction/jobs/{job_id}/model.glb"
        job.model_type = "estimated_3d_bone_segmentation"

    except Exception as exc:
        job.status = "failed"
        job.progress = None
        # Do not expose raw tracebacks or file paths
        job.message = f"Inference failed: {type(exc).__name__}"
    finally:
        # Clean up temp upload files
        temp_dir = settings.temp_dir / job_id
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


def register_job(anatomy: str, ap_bytes: bytes, lat_bytes: bytes, background_tasks: BackgroundTasks) -> Job:
    """Create and register a job, scheduling inference in background."""
    job_id = str(uuid.uuid4())
    job = Job(job_id=job_id, anatomy=anatomy)
    _jobs[job_id] = job
    background_tasks.add_task(_run_inference, job_id, ap_bytes, lat_bytes)
    return job


@router.get("/jobs/{job_id}", response_model=JobPollResponse)
async def poll_job(job_id: str) -> JobPollResponse:
    """Poll status of a queued or running reconstruction job."""
    # Reject obviously invalid (path traversal) job IDs
    _validate_job_id(job_id)
    job = _get_job(job_id)
    return JobPollResponse(
        job_id=job.job_id,
        status=job.status,
        progress=job.progress,
        message=job.message,
        model_url=job.model_url,
        model_type=job.model_type,
    )


@router.get("/jobs/{job_id}/model.glb", response_class=FileResponse)
async def get_model_glb(job_id: str) -> FileResponse:
    """Return the GLB file for a successfully completed job."""
    _validate_job_id(job_id)
    job = _get_job(job_id)

    if job.status != "succeeded" or not job.output_path:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=409,
            detail={"code": "OUTPUT_INVALID", "message": "Model output is not ready or job has not succeeded."},
        )

    if not job.output_path.exists():
        from fastapi import HTTPException
        raise HTTPException(
            status_code=404,
            detail={"code": "OUTPUT_INVALID", "message": "Output file not found."},
        )

    return FileResponse(
        path=str(job.output_path),
        media_type="model/gltf-binary",
        filename="model.glb",
    )


def _validate_job_id(job_id: str) -> None:
    """Reject traversal or obviously malformed job IDs (must be UUID4 format)."""
    import re
    if not re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}", job_id, re.IGNORECASE):
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail={"code": "JOB_NOT_FOUND", "message": "Invalid job ID."})
