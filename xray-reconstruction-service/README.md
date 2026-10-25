# BoneVista X-Ray Reconstruction Service

Isolated FastAPI backend service for the BoneVista X-Ray-to-3D reconstruction workflow, compliant with `prompt 3/API_CONTRACT.md` version 1.1.

## Scope & Compliance

- **Prototype Status:** Educational and research demonstration only. Not a medical device, diagnostic system, or treatment-planning tool.
- **Truthful Capability Reporting:** `GET /api/v1/reconstruction/capabilities` returns `available: false` until a legally verified, compatible checkpoint is explicitly configured.
- **Strict Privacy & Isolation:** Processes all requests locally (default `http://127.0.0.1:8000`). Does not forward images to external cloud APIs or third parties.

## Architecture

```
xray-reconstruction-service/
├── .venv/                      # Isolated Python 3.10 virtual environment
├── app/
│   ├── __init__.py
│   ├── config.py               # Environment variables, directory paths, and CORS limits
│   ├── main.py                 # FastAPI app initialization, middleware, error handling
│   ├── schemas.py              # Pydantic schemas strictly matching API_CONTRACT.md
│   ├── validation.py           # Magic bytes and 25 MiB size validation (JPEG, PNG, WebP)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py           # GET /api/v1/health
│   │   ├── reconstruction.py   # GET capabilities & POST /jobs
│   │   └── jobs.py             # GET /jobs/{job_id} & GET /jobs/{job_id}/model.glb
│   └── services/
│       ├── __init__.py
│       └── adapter.py          # Abstract InferenceAdapter interface & default UnavailableAdapter
├── checkpoints/                # Dedicated folder for model weights (.gitignore protected)
├── temp_uploads/               # Sandboxed scratch directory for uploads (auto-cleaned)
├── outputs/                    # Generated binary GLB models
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_api.py             # Pytest suite verifying contract endpoints and error handling
├── requirements.txt            # Minimal runtime dependencies
├── requirements-dev.txt        # Development and testing dependencies
├── pytest.ini                  # Pytest configuration
└── run.py                      # Local server entry point
```

## Setup & Running (Windows)

### 1. Prerequisites
- Python 3.10 (`py -3.10`)
- Virtual environment in `xray-reconstruction-service/.venv`

### 2. Activate Virtual Environment & Install Dependencies
```powershell
cd xray-reconstruction-service
.\.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
```

### 3. Run Test Suite
```powershell
pytest tests/ -v
```

### 4. Start Local Development Server
```powershell
python run.py
```
Or directly with Uvicorn:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## API Endpoints Implemented

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status (`{"status": "ok", "service": "bonevista-xray-reconstruction"}`) |
| `GET` | `/api/v1/reconstruction/capabilities` | Current model capability and supported anatomies (truthfully reports `available: false` when unconfigured) |
| `POST` | `/api/v1/reconstruction/jobs` | Submit AP and lateral projections with target anatomy (returns 503 `MODEL_UNAVAILABLE` when unconfigured) |
| `GET` | `/api/v1/reconstruction/jobs/{job_id}` | Poll reconstruction status (`queued`, `processing`, `succeeded`, `failed`) |
| `GET` | `/api/v1/reconstruction/jobs/{job_id}/model.glb` | Download actual reconstructed GLB binary |
