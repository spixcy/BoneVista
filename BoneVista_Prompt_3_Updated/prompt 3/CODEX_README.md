# Codex Assignment — BoneVista Frontend

Read `README.md`, `CURRENT_APP_AUDIT.md`, `API_CONTRACT.md`, and `PHASE_PLAN.md` before editing. Inspect actual source and current Git changes. Do not start implementation before Phase 0 is reviewed and the owner approves Phase 1.

## Mission

Upgrade the existing BoneVista X-Ray Workspace to support a truthful API-backed reconstruction flow and display an actual returned GLB, while preserving the current anatomy application.

Repository: https://github.com/spixcy/BoneVista

## Existing features that must remain intact

The owner-provided root README documents these as existing features:

- React/TypeScript/Vite app, landing page and embedded workspace, navigation, shared state, day/night theme.
- Reference skeleton `public/anatomy/skeletal_male.glb` and labels in `public/anatomy/manifest.json`; structure search/selection/visibility/isolation, camera controls, GLB/OBJ/PDF export.
- Muscle Explorer with `public/muscle-atlas/ecorche.glb` and its metadata.
- Neuro & Brain Explorer with local brain/nerve GLBs, manifests, structure search/selection/layer controls; Neuron Lab remains an illustrative educational visualization.
- Spine Explorer with named vertebrae.
- X-Ray Workspace AP/lateral images, JPEG/JPG/PNG/WebP, 25 MiB per file, local preview and controls (brightness, contrast, zoom, pan, fit, 90-degree rotation, reset), dimensions, sample loading, validation, object URL cleanup.
- Separate educational axial-bar Stress Analysis and scalar color mapping on an atlas mesh.
- Existing Playwright end-to-end suite (`npm run test:e2e`) and build check (`npm run build`).

Verify paths and implementation before editing; the repository source takes precedence over any outdated documentation. Preserve asset notices, source-specific licenses, and attribution.

## Scope boundaries

- Own only the frontend React/TypeScript/CSS, frontend API integration, frontend tests, and relevant frontend documentation.
- Do not create or edit `xray-reconstruction-service/`; Antigravity owns it.
- Do not rebuild the app shell or create a second viewer if the existing patterns are reusable.
- Do not replace `public/anatomy/skeletal_male.glb`, `public/anatomy/manifest.json`, or the reference atlas with an inferred result.
- Do not alter the 1D solver or imply that stress is computed from X-ray pixels, inferred patient geometry, or the returned mesh.
- Studies is currently a placeholder. Do not add patient-record storage, a database, or persistent X-ray library without separate explicit approval.

## Phase 0 — Audit only; no source edits

Inspect current Git status/diff, instructions, store, X-Ray Workspace, current image object URL lifecycle, viewer GLB loaders, navigation, API/test setup, and relevant files:

- `src/components/XrayWorkspace/XrayWorkspace.tsx`
- `src/components/XrayWorkspace/XrayWorkspace.module.css`
- `src/components/StressAnalysis/StressAnalysis.tsx`
- `src/components/StressAnalysis/axialFemSolver.ts`
- `src/components/AnatomyPanel/AnatomyPanel.tsx`
- `src/data/anatomy.ts`
- `public/anatomy/manifest.json`
- `public/anatomy/skeletal_male.glb`
- `docs/xray-to-3d-research.md`
- `docs/bonevision-comparison.md` if present
- `package.json`, store, viewer/GLB utilities and Playwright config.

Create `prompt 3/CODEX_STATUS.md` documenting architecture, verified paths, how file/preview state works, existing test commands, likely modified files by phase, risks and API contract agreement. Do not change source in Phase 0. Stop for approval.

## Required UI and behavior after approval

### 1. Preserve local viewing

Keep image viewing usable if no service is running. Preserve AP/lateral upload, preview, replacement/removal, file validation, dimensions, sample loading and all existing display controls. Keep object URL cleanup correct.

Make sure the front end does not upload images just because they were selected or loaded. The images are sent only when the user explicitly clicks Reconstruct.

### 2. Model status and target selection

Add a small typed API client that reads `VITE_XRAY_RECON_API_URL`, defaults to `http://127.0.0.1:8000`, and implements the shared `API_CONTRACT.md`.

The UI must distinguish:

- API offline/unreachable.
- API healthy but model/checkpoint unavailable.
- Model available, but the selected target/input is unsupported.
- Ready for submission.
- Queued/processing.
- Successful result.
- Failed/timeout/cancelled by the user or component unmount.

Use the actual capabilities response to populate reconstruction anatomy choices. Do not hardcode a list as if those models are installed.

**Important separation:** the existing “Associate these images with an atlas bone” selector uses an atlas ID / `stressTargetId` to connect X-ray thumbnails to the separate educational stress view. It must remain separate from the new reconstruction target identifier. Do not pass a 335-structure atlas ID to the model as the reconstruction anatomy label. Do not auto-select one based on the other unless an explicit, verified mapping is added and documented.

### 3. Bundled teaching sample caution

The included sample pair shows a hip replacement and is documented for testing the image viewer, not validating reconstruction accuracy. If the sample is loaded, display a concise caution that it may be outside the model's validated input domain. Do not use successful processing of this pair as proof of accuracy. Do not make claims of automatic implant detection unless actually implemented.

### 4. Job flow

Follow `API_CONTRACT.md` exactly. Submit AP, lateral and the backend-supported anatomy label using multipart FormData only on explicit user action. Do not manually set the multipart Content-Type header. Poll the returned job ID at a reasonable interval; stop on completion/failure/timeout/unmount and clean up timers/requests. Never invent progress percentages. Display useful safe error messages, not raw stack traces.

Keep reconstruction unavailable when backend capabilities say unavailable. It is okay for the panel to work while inference remains unavailable; it is not okay to fake a model.

### 5. GLB result viewer

Inspect current Three.js/GLB loader patterns and reuse them where feasible. If a separate preview is necessary, make it a small isolated result view compatible with existing dependencies. Load only the `model_url` from a succeeded backend job. Do not replace or mutate the main atlas viewer state/model. Provide sensible loading/error state, orbit/zoom/reset, and a GLB download action only when output is available. Label output as an AI-estimated educational/research reconstruction, not clinically validated.

A loaded GLB is not proof of geometry or medical correctness; do not invent measurements/confidence/diagnostic conclusions.

### 6. Persistence

No Studies or patient-record persistence in this change. A transient session-only result is sufficient. Do not create a database, user account, cloud upload, history list, or persistent image library unless the owner explicitly scopes that work separately.

## Testing

Use existing framework/patterns. Add mocked API tests for service offline, capabilities unavailable, target selection from capabilities, missing views, model-unavailable response, error response, queued/processing/succeeded/failed, timeout/cleanup, safe model URL resolution, GLB load error, and success. Keep the project's existing end-to-end suite; do not replace tests of existing features with mock-only tests.

Run where possible:

- `npm run build`
- `npm run test:e2e`
- existing lint/typecheck/test commands discovered in `package.json`.

Document unavailable browser/test dependencies honestly. Verify X-ray controls, anatomy viewer, Muscle, Neuro, Spine, Stress Analysis, navigation/theme, and exports have not regressed.

## End-of-phase duties

Update only `prompt 3/CODEX_STATUS.md` after each phase with phase, files changed, commands/tests and exact results, what is verified vs mocked, blockers, next phase proposed, and confirmation that backend-owned files were not edited. Review `git diff`. Stop and wait for owner approval before the next phase.
