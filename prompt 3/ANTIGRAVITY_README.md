# Antigravity Assignment — BoneVista Reconstruction Backend

Read `README.md`, `CURRENT_APP_AUDIT.md`, `API_CONTRACT.md`, and `PHASE_PLAN.md`. Inspect `docs/xray-to-3d-research.md` and `docs/bonevision-comparison.md` if present, then independently verify claims from candidate primary sources. Do not start implementation until Phase 0 is reviewed and the owner approves Phase 1.

## Mission

Build a minimal separate Python inference service for a genuine research-grade biplanar X-ray-to-3D bone reconstruction workflow, if a suitable compatible and legally usable checkpoint can be verified. Return a real GLB derived from inference for the existing BoneVista frontend.

All backend implementation belongs under `xray-reconstruction-service/`. Do not edit the existing React frontend, app store, viewer, Stress Analysis, X-Ray Workspace, or root frontend package configuration.

## Existing-app facts to respect

- The frontend currently accepts AP and lateral JPEG/JPG/PNG/WebP files up to 25 MiB each and keeps previews/files in browser memory; no inference endpoint exists.
- The included sample pair shows a hip replacement. It is a local UI teaching sample, not a validated model test set and may be out of domain for a model trained on synthetic CT-derived projections.
- The shared anatomy atlas is generalized reference anatomy. A reconstruction output is a separate mesh and must not replace the reference skeleton asset.
- The existing stress calculation is a separate 1D axial bar finite-element example. It does not read X-ray pixels and is out of scope for changes.
- Studies is a placeholder. Do not build patient-record persistence as part of this backend.

## Candidate repositories to verify, not assume ready

Primary research candidate:

https://github.com/naamiinepal/xrayto3D-benchmark

It studies paired AP/lateral projections to 3D segmentation for target anatomies including vertebra, hip, rib and femur. The benchmark was evaluated using digitally reconstructed radiographs generated from CT data. The upstream README announced pretrained downloads, but checkpoint accessibility, compatibility and applicable terms must be independently confirmed; do not assume there is a ready inference service.

Alternatives if the primary route is blocked:

- https://github.com/pzhhhhh2263/X2Bone — pelvic bone reconstruction research; verify pretrained weights, license and runnable inference.
- https://github.com/xmed-lab/SSR-KD — research code and listed checkpoints for knee bones; check dependency age, checkpoint access and GPU requirements.
- https://github.com/Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction — integrated prototype; audit checkpoint inclusion, checkpoint source, license, inference reproducibility and any claims. Do not copy its frontend or assume its advertised service runs without model weights.

Choose based on verifiable checkpoint availability, model task compatibility, use/license terms, actual expected input domain, output correctness and hardware. A repository name or web UI demo is not proof of usable inference. Hunyuan3D/general image-to-3D tools must not be treated as medical X-ray reconstruction.

## Phase 0 — Research and hardware audit, no source changes

Do not edit source, download large datasets, install heavyweight ML stacks, launch training, or incur paid GPU service in this phase.

Verify and report:

- Exact candidate repository and revision/commit.
- License of code and separate license/terms of downloaded checkpoint weights.
- Whether checkpoints can actually be downloaded and where they originate.
- Whether inference weights are published versus only training code.
- Supported target anatomies and class/label semantics.
- Whether the expected input is a real radiograph, simulated DRR, CT volume, or another representation.
- How AP/lateral views are ordered, resized, normalized, aligned and validated.
- Output type (segmentation/occupancy/volume/mesh), axes, spacing, units and orientation.
- Required OS, Python, PyTorch, CUDA and other native dependencies.
- Whether a small inference example can run on the developer's available system: Windows, Ryzen 7 8840HS, Radeon 780M integrated graphics and 32 GB RAM. Do not assume NVIDIA CUDA.
- Whether a service adapter is feasible without substantial new training.

Write `prompt 3/ANTIGRAVITY_STATUS.md` with concrete primary-source URLs, findings, exact verification performed, risks and a recommended route. Stop for approval.

## Implementation after approval

### Phase 1 — Minimal service scaffold

Create a small isolated Python/FastAPI service under `xray-reconstruction-service/`. Implement health/capabilities, configuration, strict upload validation and baseline tests according to `API_CONTRACT.md`. It is valid for health to be OK while model capability is unavailable. Do not claim `available: true` without a verified compatible inference adapter/checkpoint.

Keep dependencies minimal. No database, Redis, Celery, account system, cloud upload, or large dataset pipeline unless a demonstrated requirement is approved.

### Phase 2 — Reproduce a real inference example

Only after approval, obtain the verified checkpoint and follow upstream model loading/preprocessing. Use appropriately licensed sample data from a supported task. Reproduce one inference and verify shapes, AP/lateral ordering, labels, axis orientation, spacing and output semantics. Record commands and outputs. Do not start training unless separately approved.

If there is no compatible licensed checkpoint, hardware is insufficient, or inference cannot reproduce, stop this phase and report the precise blocker. The owner may choose to proceed with unavailable API plumbing or evaluate another candidate. Do not substitute fake output.

### Phase 3 — Convert real model output to mesh/GLB

Only after the model runs successfully. Correctly identify the target bone class/occupancy threshold, handle empty predictions, respect voxel spacing and axis transforms, extract a surface using an appropriate method, validate vertices/faces and export a genuine GLB. Do not invent scale, laterality, patient dimensions or confidence. Test the GLB in a standard glTF loader and record provenance.

### Phase 4 — Reconstruction jobs and result endpoints

Implement the exact endpoints/fields/statuses in `API_CONTRACT.md`. Load the model once per process where practical. Use random job IDs and safe path handling. Support queued/processing/succeeded/failed, useful safe errors, file-size/content validation, reasonable resource limits and temporary-file cleanup. Do not fabricate job progress. Serve the actual model output only after successful inference and validation.

For this initial prototype, an in-memory job registry is acceptable if documented. Don't add a queue/database just for speculative scaling.

### Phase 5 — Backend verification and handoff

Run API/unit tests and a genuine checkpoint-dependent test when possible. Document exact Windows-oriented environment setup/start commands, checkpoint installation, API usage, hardware limits, upstream licenses, output semantics, cleanup/retention and known limitations. Give the frontend team the same API URLs/response behavior defined in the contract.

## Runtime/hardware safety

The developer's machine is Windows with an integrated Radeon 780M GPU and 32 GB RAM. Do not assume CUDA availability or that the model can run acceptably on CPU. Report the actual requirements. Do not download large medical datasets, run lengthy training, install a large CUDA stack, or use paid cloud GPU without approval.

## Security and privacy

- Local processing by default. Do not forward images to Hugging Face Spaces, commercial inference APIs, or other services.
- Validate file content and size, not just extension/MIME.
- Avoid patient identifiers and raw image data in logs.
- Use unpredictable job IDs, prevent traversal, and clean temporary files.
- No database, patient list, account system, long-term study storage or upload history in this scope.
- CORS should allow the local development frontend, not arbitrary origins as a production default.
- Preserve attribution/license obligations; do not redistribute restricted weights.
- Make no diagnosis, fracture detection, treatment planning or clinical-accuracy claims.

## Ownership and phase reports

Antigravity owns `xray-reconstruction-service/` and its backend docs/tests only. Do not edit frontend files or the shared contract. If a contract change is necessary, record a proposal in `ANTIGRAVITY_STATUS.md` and stop for approval.

After every phase, update `prompt 3/ANTIGRAVITY_STATUS.md` with the phase, files changed, commands/tests and exact outcomes, checkpoint proof, what is verified vs mocked, blockers, next proposed phase, and confirmation that frontend-owned files were not modified. Inspect `git diff`, then stop for owner approval.

## Definition of actual inference success

A running API server is not success. Success requires a legally usable compatible checkpoint that processes a supported AP/lateral pair, creates a valid 3D output from inference, exports a valid GLB, and returns that exact GLB through the API. The frontend must then load the actual file. If a prerequisite is missing, report the exact blocker and leave capabilities unavailable.
