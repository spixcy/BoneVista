# BoneVista X-ray Reconstruction API Contract

**Contract version:** 1.1 (initial shared implementation)  
**Frontend:** existing BoneVista React/TypeScript/Vite application  
**Backend:** separate FastAPI service in `xray-reconstruction-service/`  
**Local default base URL:** `http://127.0.0.1:8000`

This contract is shared by Codex and Antigravity. No agent may silently change routes, request field names, statuses, or response meanings. Record a proposed contract change in the agent status file and stop for owner approval.

## Current-app constraints

- The existing X-Ray Workspace keeps AP/lateral `File` objects and preview object URLs in browser memory. Preserve local viewing when the backend is offline.
- Do not send images to the backend until the user explicitly clicks **Reconstruct 3D model**.
- Current atlas association / `stressTargetId` is a manual visual link for the separate educational stress example. It is not a reconstruction model target and must not be sent as `anatomy`.
- Reconstruction anatomy selection must be populated from `supported_anatomies` returned by the backend, not hardcoded as though every anatomy is supported.
- The bundled sample shows a hip replacement and is intended for testing image display controls. It is not a validated inference/evaluation set and may be outside a model's input domain. Show a clear caution if the bundled sample is used for reconstruction; never treat its output as proof of anatomical accuracy.
- No persistence of patient studies is included in this initial contract. The Studies page remains a placeholder unless the owner separately approves persistence work.

## Principles

- Server health is different from model availability.
- The service may be healthy while inference is unavailable.
- The backend must never claim success unless a compatible verified model actually ran and generated a valid output.
- Only declare anatomy targets proven supported by the selected checkpoint and its tested configuration.
- Initial workflow requires both AP and lateral views. Never duplicate a missing view silently.
- Validate file content and size on the backend, regardless of browser extension/MIME.
- Local processing is the default; no external AI/provider API.
- Model-generated geometry is an educational/research estimate, not a clinical finding.

## A. Health

`GET /api/v1/health`

```json
{
  "status": "ok",
  "service": "bonevista-xray-reconstruction"
}
```

This reports that the API server is responding. It does not claim the model is ready.

## B. Capabilities

`GET /api/v1/reconstruction/capabilities`

Example response when inference is not configured:

```json
{
  "available": false,
  "mode": "unavailable",
  "model": null,
  "supported_anatomies": [],
  "requires_ap": true,
  "requires_lateral": true,
  "max_upload_bytes": 26214400,
  "input_constraints": ["A verified compatible checkpoint is not configured."],
  "reason": "No verified inference checkpoint is configured."
}
```

Fields:

- `available`: true only when a verified compatible checkpoint and inference adapter are actually usable by this process.
- `mode`: `unavailable` or `research`; never `clinical`.
- `model`: verified model/checkpoint identifier or null.
- `supported_anatomies`: exact machine-readable target identifiers supported by the configured model, e.g. `femur`, `hip`, `vertebra`, or `rib` only when genuinely supported. Empty if unavailable.
- `requires_ap` and `requires_lateral`: booleans; initial UI expects both true.
- `max_upload_bytes`: per-image upload limit; default 26,214,400 bytes (25 MiB).
- `input_constraints`: optional array of short, real constraints or warnings from the backend, such as required view protocol or known excluded inputs.
- `reason`: concise explanation when unavailable.

The frontend may map machine labels to friendly names for display, but must not invent extra supported targets.

## C. Submit reconstruction job

`POST /api/v1/reconstruction/jobs` with `multipart/form-data`:

- `ap`: AP image file.
- `lateral`: lateral image file.
- `anatomy`: exact string value selected from `supported_anatomies`.

Return `202 Accepted` if a job is queued:

```json
{
  "job_id": "random-unpredictable-id",
  "status": "queued"
}
```

If unavailable, return an appropriate non-success code (prefer `503 Service Unavailable`) and this error shape:

```json
{
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "message": "No verified inference checkpoint is configured."
  }
}
```

Possible error codes include `INVALID_IMAGE`, `UPLOAD_TOO_LARGE`, `UNSUPPORTED_ANATOMY`, `MISSING_VIEW`, `MODEL_UNAVAILABLE`, `JOB_NOT_FOUND`, `INFERENCE_FAILED`, and `OUTPUT_INVALID`. Do not expose stack traces or sensitive file paths.

The client sends files only after explicit user action. Browser multipart requests must let the browser set the multipart boundary; do not manually hardcode the Content-Type boundary.

## D. Poll status

`GET /api/v1/reconstruction/jobs/{job_id}`

Queued/processing example:

```json
{
  "job_id": "random-unpredictable-id",
  "status": "processing",
  "progress": null,
  "message": "Running reconstruction",
  "model_url": null,
  "model_type": null
}
```

Success example:

```json
{
  "job_id": "random-unpredictable-id",
  "status": "succeeded",
  "progress": 100,
  "message": "Reconstruction completed",
  "model_url": "/api/v1/reconstruction/jobs/random-unpredictable-id/model.glb",
  "model_type": "estimated_3d_bone_segmentation"
}
```

Failure example:

```json
{
  "job_id": "random-unpredictable-id",
  "status": "failed",
  "progress": null,
  "message": "Inference failed.",
  "model_url": null,
  "model_type": null
}
```

Allowed statuses: `queued`, `processing`, `succeeded`, `failed`. `progress` may be a real 0–100 value only where meaningful; otherwise null. Never fabricate progress. `model_url` stays null until successful completion.

## E. Retrieve model

`GET /api/v1/reconstruction/jobs/{job_id}/model.glb`

- Return only the actual GLB generated for that successful job.
- Use `model/gltf-binary` as the content type where supported.
- Unknown job: 404. Output not ready or job unsuccessful: non-success status.
- Check IDs and job ownership/existence; never concatenate untrusted IDs into arbitrary filesystem paths.
- The frontend resolves a relative `model_url` against the configured API base URL.

## F. Frontend config

`VITE_XRAY_RECON_API_URL=http://127.0.0.1:8000`

This URL is public frontend configuration. Never put a provider API key or other secret in a `VITE_` variable.

## G. Files, safety and cleanup

- Current frontend accepts JPEG/JPG, PNG, WebP up to 25 MiB per image. Backend independently validates real image content and file size.
- Initial contract needs AP + lateral. Support only the image format and size that the verified model adapter can safely preprocess.
- Do not advertise DICOM, PACS, automatic orientation detection, diagnosis, fracture detection or arbitrary body parts unless separately implemented and verified.
- Use random, unguessable job IDs; validate all paths.
- Apply basic temp upload/output cleanup and document retention.
- Keep images local to the service by default; no third-party APIs.

## H. Honest output labels

Use a model type that matches actual output. In UI, label it as an **AI-estimated educational/research reconstruction — not clinically validated**. Do not call it medical-grade, diagnostic, patient-accurate, fracture-detected, or treatment-planning-ready.

A generated GLB that loads successfully proves file/viewer integration, not medical accuracy.
