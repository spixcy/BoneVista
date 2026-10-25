# BoneVista Prompt 3 — Shared Agent Instructions

This folder coordinates Codex and Antigravity while adding an honest X-ray-to-3D reconstruction workflow to the existing BoneVista application. Read this folder before editing source.

## Read in this order

1. `README.md` — shared rules and kickoff messages.
2. `CURRENT_APP_AUDIT.md` — source-grounded baseline from the root README supplied by the owner.
3. `API_CONTRACT.md` — fixed frontend/backend interface.
4. `PHASE_PLAN.md` — parallel work plan, gates, test requirements.
5. `CODEX_README.md` — frontend assignment.
6. `ANTIGRAVITY_README.md` — inference/backend research assignment.

The agents must also inspect the real repository source and current uncommitted changes. `CURRENT_APP_AUDIT.md` is a documented baseline, not a substitute for code inspection.

## Repository

https://github.com/spixcy/BoneVista

BoneVista is a React/TypeScript/Vite browser app with a shared workspace state, generalized skeleton atlas, Muscle Explorer, Neuro & Brain Explorer, Spine Explorer, X-Ray Workspace, and a separate educational 1D axial Stress Analysis example. The X-Ray Workspace currently supports local AP/lateral JPEG/PNG/WebP viewing with brightness, contrast, zoom, pan, rotation, reset, and a bundled hip-replacement teaching pair. The reconstruction panel is unavailable because no verified model checkpoint and inference service are configured. Studies is currently a placeholder.

## Target outcome

Implement the smallest reliable vertical slice:

1. Keep the existing anatomy app and image viewer intact.
2. Verify that a suitable paired-view research model/checkpoint can actually run and is usable under its license.
3. Integrate a separate local FastAPI service using `API_CONTRACT.md`.
4. Accept only model-supported anatomy labels from live backend capabilities.
5. Run genuine inference after explicit user action.
6. Convert the model's real output to a valid GLB, if supported by that model's output.
7. Load that exact returned GLB in a separate BoneVista result viewer without replacing the reference skeleton/atlas.
8. Clearly report unavailable model, input mismatch, errors, and limitations instead of faking success.

This is an educational/research prototype, not a clinical imaging or diagnostic system.

## Fixed responsibility split

### Codex owns

Existing frontend React/TypeScript/CSS, X-Ray Workspace, frontend API client, reconstruction states and UI, result GLB display, frontend tests, and frontend documentation. Codex must not implement the model inference engine or edit `xray-reconstruction-service/`.

### Antigravity owns

All files under `xray-reconstruction-service/`, model/checkpoint/license/hardware verification, preprocessing/inference adapter, true segmentation/occupancy-to-mesh conversion, FastAPI API, backend tests, and backend setup documentation. Antigravity must not modify existing React/TypeScript/CSS, frontend package configuration, shared app store, atlas viewer, Stress Analysis, or X-Ray Workspace.

### Shared files

- `API_CONTRACT.md` is the agreed contract. No unilateral endpoint/field/status changes.
- `PHASE_PLAN.md` is the shared schedule and completion gate.
- Each agent writes only its own status file: `CODEX_STATUS.md` or `ANTIGRAVITY_STATUS.md` in this folder.
- The owner reviews the files and authorizes the next phase. Both agents may work in parallel on their assigned tasks within the same approved phase.

## Non-negotiable rules

- Work in small, approved phases. Phase 0 is audit-only. Do not edit application/backend source in Phase 0.
- After each phase, update your status file with files changed, tests/commands, actual results, blockers, and next proposed phase; then stop for the owner's approval.
- Do not automatically proceed to later phases merely because there is no answer immediately.
- If Codex and Antigravity share one local worktree, make changes only within assigned ownership areas. If they use separate environments, do not pretend a shared status file or filesystem exists; exchange reports and patches explicitly.
- No simultaneous commits/merges/pushes without the owner's approval. Do not run destructive Git commands or overwrite uncommitted changes.
- Do not download large datasets, launch long training, install large CUDA stacks, or incur paid GPU usage without explicit approval.
- Do not embed keys in frontend code or use `VITE_` values as secrets.
- Do not send images to remote providers by default. Local backend only unless the owner explicitly approves a different design.
- Do not claim that a model works until a verified checkpoint processes a supported input pair and produces the output described by its implementation.
- Do not use the generalized atlas GLB, a test fixture, random geometry, or a generic text/image-to-3D generator as fake medical reconstruction.
- Do not rename the existing stress visualization as 3D patient-specific stress analysis.
- Preserve original model/asset licenses, notices, attributions, and existing tests.

## Kickoff: Codex

> Read `prompt 3/README.md`, `prompt 3/CURRENT_APP_AUDIT.md`, `prompt 3/API_CONTRACT.md`, `prompt 3/PHASE_PLAN.md`, and `prompt 3/CODEX_README.md`. Inspect the current checkout, tests, current diffs, and relevant source. Start Phase 0 only: audit the frontend without editing source files. Write findings to `prompt 3/CODEX_STATUS.md` and stop for approval.

## Kickoff: Antigravity

> Read `prompt 3/README.md`, `prompt 3/CURRENT_APP_AUDIT.md`, `prompt 3/API_CONTRACT.md`, `prompt 3/PHASE_PLAN.md`, and `prompt 3/ANTIGRAVITY_README.md`. Inspect BoneVista's research note and candidate repositories. Start Phase 0 only: verify model/checkpoint access, license, expected inputs/outputs, supported anatomy, preprocessing, and hardware feasibility. Do not modify source, install heavy dependencies, download large datasets, or train. Write findings to `prompt 3/ANTIGRAVITY_STATUS.md` and stop for approval.

## How the two agents coordinate

If their workspaces are truly shared, they may run Phase 0 concurrently and then work concurrently within each approved phase, only in their own assigned files. At the end of a phase, both report; the owner reviews and approves the next phase. The backend may be unavailable while a checkpoint is investigated, and the frontend may still build truthful unavailable/error states against the fixed contract.

If the tools run in separate isolated workspaces, they cannot coordinate simply by reading this folder. Copy/exchange `CODEX_STATUS.md`, `ANTIGRAVITY_STATUS.md`, and any necessary patch between them, and integrate in the owner's working tree.

## Definition of done

The app builds and its existing functionality still works. The reconstruction UI reflects actual backend capabilities. A supported image pair submitted by the user is run by a verified compatible checkpoint. The backend returns a valid GLB derived from that inference, and the frontend successfully loads that exact GLB. If any checkpoint, license, hardware, or model-domain requirement remains unresolved, report the exact blocker and do not claim end-to-end reconstruction is finished.
