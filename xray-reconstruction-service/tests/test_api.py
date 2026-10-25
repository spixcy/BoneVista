"""
BoneVista Reconstruction Service — Phase 1 Test Suite.

Tests only the scaffold contract (health, capabilities, unavailable model responses).
No real checkpoint or inference is exercised in this phase.
"""
import io
import pytest
from httpx import AsyncClient, ASGITransport

from app.main import create_app
from app.services.adapter import model_registry, UnavailableInferenceAdapter


@pytest.fixture
def app():
    """Create a fresh app instance with the default unavailable adapter."""
    model_registry.reset()
    return create_app()


@pytest.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as c:
        yield c


# ---------------------------------------------------------------------------
# A. Health endpoint
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_health_ok(client):
    resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "bonevista-xray-reconstruction"


# ---------------------------------------------------------------------------
# B. Capabilities endpoint — unavailable state
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_capabilities_unavailable(client):
    resp = await client.get("/api/v1/reconstruction/capabilities")
    assert resp.status_code == 200
    data = resp.json()
    assert data["available"] is False
    assert data["mode"] == "unavailable"
    assert data["model"] is None
    assert data["supported_anatomies"] == []
    assert data["requires_ap"] is True
    assert data["requires_lateral"] is True
    assert data["max_upload_bytes"] > 0
    assert isinstance(data["input_constraints"], list)
    assert len(data["input_constraints"]) > 0
    assert data["reason"] is not None


# ---------------------------------------------------------------------------
# C. Job submission — model unavailable → 503 MODEL_UNAVAILABLE
# ---------------------------------------------------------------------------

def _make_minimal_jpeg() -> bytes:
    """Generate a minimal valid single-pixel JPEG in memory."""
    buf = io.BytesIO()
    from PIL import Image
    img = Image.new("L", (4, 4), color=128)
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _make_minimal_png() -> bytes:
    buf = io.BytesIO()
    from PIL import Image
    img = Image.new("L", (4, 4), color=200)
    img.save(buf, format="PNG")
    return buf.getvalue()


@pytest.mark.asyncio
async def test_submit_job_model_unavailable(client):
    jpeg = _make_minimal_jpeg()
    resp = await client.post(
        "/api/v1/reconstruction/jobs",
        files={
            "ap": ("ap.jpg", jpeg, "image/jpeg"),
            "lateral": ("lat.jpg", jpeg, "image/jpeg"),
        },
        data={"anatomy": "femur"},
    )
    assert resp.status_code == 503
    err = resp.json()
    assert err["error"]["code"] == "MODEL_UNAVAILABLE"


# ---------------------------------------------------------------------------
# D. Upload validation — missing views
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_submit_missing_lateral(client):
    jpeg = _make_minimal_jpeg()
    resp = await client.post(
        "/api/v1/reconstruction/jobs",
        files={"ap": ("ap.jpg", jpeg, "image/jpeg")},
        data={"anatomy": "femur"},
    )
    # Missing lateral field → FastAPI 422 Unprocessable Entity
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# E. Upload validation — oversized image → 400 UPLOAD_TOO_LARGE
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_submit_oversized_ap(client, app):
    """Send an AP file exceeding max_upload_bytes — expect UPLOAD_TOO_LARGE."""
    from app.config import settings

    # Build fake JPEG header followed by zeros exceeding limit
    fake_jpeg = b"\xff\xd8\xff\xe0" + b"\x00" * (settings.max_upload_bytes + 1)
    jpeg = _make_minimal_jpeg()
    resp = await client.post(
        "/api/v1/reconstruction/jobs",
        files={
            "ap": ("big_ap.jpg", io.BytesIO(fake_jpeg), "image/jpeg"),
            "lateral": ("lat.jpg", jpeg, "image/jpeg"),
        },
        data={"anatomy": "femur"},
    )
    assert resp.status_code == 400
    err = resp.json()
    assert err["error"]["code"] == "UPLOAD_TOO_LARGE"


# ---------------------------------------------------------------------------
# F. Upload validation — invalid file content → 400 INVALID_IMAGE
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_submit_non_image_ap(client):
    jpeg = _make_minimal_jpeg()
    fake_bytes = b"This is not an image at all."
    resp = await client.post(
        "/api/v1/reconstruction/jobs",
        files={
            "ap": ("ap.txt", io.BytesIO(fake_bytes), "image/jpeg"),
            "lateral": ("lat.jpg", jpeg, "image/jpeg"),
        },
        data={"anatomy": "femur"},
    )
    assert resp.status_code == 400
    err = resp.json()
    assert err["error"]["code"] == "INVALID_IMAGE"


# ---------------------------------------------------------------------------
# G. Job polling — unknown / malformed job IDs
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_poll_unknown_job(client):
    # Valid UUID4 format but no such job registered
    fake_id = "00000000-0000-4000-8000-000000000000"
    resp = await client.get(f"/api/v1/reconstruction/jobs/{fake_id}")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_poll_traversal_job_id(client):
    resp = await client.get("/api/v1/reconstruction/jobs/../../../etc/passwd")
    assert resp.status_code in (404, 422)


@pytest.mark.asyncio
async def test_poll_invalid_job_id_format(client):
    resp = await client.get("/api/v1/reconstruction/jobs/not-a-valid-uuid")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# H. GLB endpoint — unknown job
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_glb_unknown_job(client):
    fake_id = "00000000-0000-4000-8000-000000000001"
    resp = await client.get(f"/api/v1/reconstruction/jobs/{fake_id}/model.glb")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# I. Capabilities when adapter is available (future plug-in point)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_capabilities_adapter_interface(client):
    """Verify the adapter interface returns correct contract fields."""
    adapter = model_registry.adapter
    assert isinstance(adapter, UnavailableInferenceAdapter)
    assert adapter.is_available() is False
    assert adapter.get_mode() == "unavailable"
    assert adapter.get_model_identifier() is None
    assert adapter.get_supported_anatomies() == []
    assert len(adapter.get_input_constraints()) > 0
    assert adapter.get_unavailable_reason() is not None
