# BoneVista Current-State Audit — Based on the Supplied Root README

This document captures the existing behavior described in the README supplied for this task. It is the baseline for both agents. Before modifying code, verify these statements against the current checkout because documentation can drift from implementation. If code and this document disagree, inspect the code, preserve working behavior, and record the discrepancy in the relevant status report rather than guessing.

## 1. Existing application and stack

- Browser-based anatomy learning and exploration workspace built with React/TypeScript and Vite; development commands are `npm install`, `npm run dev`, `npm run build`, `npm run preview`, and `npm run test:e2e`.
- The app has a landing page with a workspace embedded lower on the page, plus workspace navigation and day/night theme.
- A shared workspace state connects atlas selection/search, the anatomy viewer, Muscle Explorer, Neuro & Brain Explorer, Spine Explorer, X-Ray Workspace, and Stress Analysis.
- Do not rebuild the shell, replace the shared state model, or create a second app.

## 2. Existing 3D anatomy and assets — KEEP

- The main generalized skeleton is `public/anatomy/skeletal_male.glb`; structure names and IDs come from `public/anatomy/manifest.json`.
- The root README describes a 335-structure reference atlas, searchable by English/Latin names and atlas paths.
- The existing viewer supports model orbit, zoom, pan, selection, focus, isolate, visibility, six anatomical direction presets, theme integration, and GLB/OBJ/PDF exports.
- Muscle Explorer uses `public/muscle-atlas/ecorche.glb` and source metadata; it has Bones, Superficial, Deep, and Combined modes.
- Neuro & Brain Explorer loads local brain and nerve GLBs with manifests/metadata, and has searchable structures, visibility/layer controls, isolation, focus, and reset behavior.
- Neuron Lab is illustrative educational animation, not a verified neuron dataset or validated physiological simulation.
- Spine Explorer browses individually named vertebra meshes by region.
- Preserve all associated source-specific licenses, notices, attribution, mesh/manifest data, and asset paths.

## 3. Existing X-Ray Workspace — KEEP AND EXTEND

Documented behavior:

- Separate AP and lateral drop zones.
- Accepts JPEG/JPG, PNG, and WebP; each upload has a 25 MiB limit (`25 * 1024 * 1024` bytes in current UI code).
- Replacing/removing individual images, preview, image dimensions/file size, brightness, contrast, zoom, fit, pan, 90-degree rotation, and reset controls.
- A bundled AP/lateral hip-replacement teaching pair can be loaded for UI testing from local static assets; source/licensing details are in `public/test-images/README.md`.
- Images are represented by browser object URLs and held in shared in-memory app state during the browser session. Existing code revokes replaced/removed object URLs.
- Images currently remain in the browser. No inference endpoint is configured and the reconstruction control is unavailable/disabled.
- The image-to-atlas association is manual. It is not automatic anatomy recognition or registration.
- The current bundled sample is a hip-replacement case, not a normal-bone reference or a validated model evaluation dataset. Do not treat it as evidence of model accuracy. A model may not support implants or this image domain.
- DICOM/PACS are not implemented.

Required extension:

- Add model-supported reconstruction target selection from the backend capabilities response. Keep this separate from the existing atlas association selector and `stressTargetId`; atlas structure IDs are not model target labels.
- Start image upload to the backend only after the user clicks the explicit reconstruction action.
- Keep local preview and image adjustment controls usable if the backend is offline or model weights are missing.
- Display model status/capabilities honestly; only enable inference when the real backend reports availability and supports the chosen target.
- A result GLB must appear in a separate result viewer/panel and must not replace or mutate the reference atlas GLB.

## 4. Stress Analysis — KEEP SEPARATE

- Existing code is an educational, working one-dimensional axial bar finite-element example.
- Geometry is currently a uniform long-bone shaft represented as a 1D bar; the selector is disabled because no other geometry is implemented.
- Inputs include force, cross-sectional area, length, Young's modulus, and element count. The solver assembles/solves a 1D linear system and calculates axial stress/strain/displacement.
- A single scalar stress result may color a manually selected generalized atlas mesh. It is not a spatial stress field on the mesh.
- The X-ray images are reference thumbnails only. Image pixels do not enter the solver and the inputs are not inferred from images.

Do not remove, rewrite, or relabel this as patient-specific finite-element analysis. Do not automatically feed the reconstructed mesh into the solver as if that creates a validated 3D simulation. Any future 3D mechanics integration is outside the initial reconstruction scope and needs a separate, explicitly validated project.

## 5. Studies and persistence — CURRENTLY A PLACEHOLDER

- The Studies page is documented as a placeholder. It does not save cases, patient records, studies, or a persistent image library.
- Do not quietly turn it into a patient-record system or add a database as part of X-ray reconstruction.
- The initial feature may keep a transient session/job result in memory and allow the user to download the generated GLB. Persistent studies are a separately scoped follow-up requiring explicit approval and privacy decisions.

## 6. Current data/privacy boundaries

- No backend is currently configured for image upload, inference, accounts, or patient storage.
- User images stay local as browser object URLs until the explicit reconstruction action is implemented.
- The new reconstruction service should run locally by default and should not send files to a third-party API.
- Explain to users that pressing Reconstruct sends the selected images to the configured local backend. Do not upload before user action.
- Do not log image bytes, patient identifiers, or unnecessary metadata. Implement temporary-file cleanup.

## 7. Current scope and explicit non-goals

The app currently does not read DICOM/PACS, automatically identify bones/orientation, segment X-rays, reconstruct patient-specific anatomy, detect fractures, diagnose, suggest treatment, or save studies. The reconstruction project must not claim any of these work unless separately implemented and verified.

The first target is one model-supported anatomy, not the complete skeleton. A paired-view model may return a binary voxel segmentation or another declared representation; if it does, the backend must convert that actual output into a mesh with the correct axis/spacing handling. A mesh that loads is not by itself evidence of anatomical accuracy.

## 8. Existing project tests

The root README documents `npm run test:e2e` as the Playwright end-to-end suite, covering navigation/theme, atlas and neuro interactions, spine filters, local X-ray controls/validation, Stress Analysis and mapping, and GLB export. Keep and run these checks where possible, plus `npm run build`. Do not replace these tests with only mocked reconstruction tests.
