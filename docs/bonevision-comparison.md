# BoneVision comparison and reconstruction integration review

Reviewed: 19 October 2026

This note compares BoneVista with the public BoneVision website and evaluates the X-ray-to-3D candidate repository named in the supplied implementation brief. It is a product and source review, not a clinical validation.

## Summary

BoneVista already has a working segmented reference skeleton, local AP/lateral image display, and an educational 1D axial bar finite-element example. Its current X-ray images are not analyzed, and its stress solver does not consume image pixels or solve the atlas mesh.

The public [BoneVision website](https://bonevision.com/) presents an X-ray-to-3D workflow, a viewer with Bone / X-Ray / Stress Map modes, reconstruction metrics, and actions such as OBJ export and implant fitting. It also advertises patient-specific stress analysis. The page alone does not provide source code, weights, reproducible API documentation, or evidence that the showcased values come from an operational user-facing inference service. The same page labels pre-op planning and implant intelligence as in development/next, while its roadmap places biomechanical simulation in 2027. Treat the site as a product/design reference, not as an implementation specification or a source of algorithms.

The supplied candidate, [Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction](https://github.com/Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction), is a separate hackathon/research project, not BoneVision's repository. Its source describes a 43.8-million-parameter ConvNeXt-style encoder and occupancy decoder trained on synthetic DRRs. It is the closest candidate reviewed, but it is not currently runnable as an inference integration from the public checkout: there is no model checkpoint, no license file, and no documented checkpoint download URL in the repository. The training log checked into the repository ends at epoch 88/200 with best validation Dice 0.636525. That is a repository-reported validation metric, not a verified result on real patient radiographs.

**Decision:** do not install the candidate's ML stack or connect its API as if it can reconstruct images. Keep BoneVista's working viewer and educational solver. Continue the reconstruction integration only after obtaining a checkpoint with provenance and license, confirming model/data terms, and reproducing inference on the candidate's supported validation data. Until then, the correct result is “unavailable,” never a placeholder skeleton presented as an inference result.

## Feature comparison

| Capability | BoneVista current implementation | BoneVision public page | Work needed in BoneVista |
|---|---|---|---|
| 3D anatomy | Interactive 335-label generalized reference atlas; mesh selection, hide/isolate, orbit, zoom, pan, six camera presets | Viewer preview claims a reconstructed patient model | Add a separate reconstructed-mesh mode only after genuine model output exists; do not substitute the atlas |
| X-ray display | Local AP and lateral JPEG/PNG/WebP viewer; pan, zoom, fit, rotation, brightness, contrast | AP/LAT input views shown in its viewer preview | Current viewer covers display; model preprocessing and inference are missing |
| X-ray-to-3D | Not implemented | Advertised as live; page claims single-X-ray reconstruction | Needs a licensed, available checkpoint, compatible preprocessing, tested backend, output-coordinate metadata, and validation |
| Reconstruction metrics | No patient-specific metrics | UI preview shows mean error, Hausdorff-95, folds, and inference time | Compute only supported mesh metadata and measured runtime; never copy hard-coded preview values |
| Stress view | Educational 1D axial uniform-bar FEM; scalar color is applied to one selected atlas mesh | Site advertises real-time patient-specific FEA; roadmap separately lists biomechanical simulation as planned | A real 3D solver needs a valid volumetric mesh, boundary conditions, material data, units, solver verification, and validation |
| Export | Reference atlas GLB/OBJ and selected-structure PDF summary | UI preview includes OBJ export and report actions | Keep reference and reconstructed exports distinct; only add reconstructed export after real output is available |
| Patients / studies | Studies page is a placeholder; no study storage | Public demo UI includes Patients and a sample patient panel | Add local research sessions only when persistence and delete/retention behavior are designed |
| Implant fitting / planning | Not implemented | Advertised actions/roadmap | Do not expose as working controls until there are real algorithms and validated inputs |

## Candidate repository review

The checkout was cloned separately to `C:\Users\KIIT\Desktop\BoneVista-research-candidate`, outside the BoneVista repository. It has `model/architecture.py`, `model/inference.py`, `backend/main.py`, a `pyproject.toml`/`uv.lock`, sample AP/LAT PNG and NPY files, and two training-log JSON files. No files were copied into BoneVista.

### Evidence and limitations

- The candidate README describes an X2BR-inspired model that maps AP/lateral images to a 64³ occupancy grid and then a mesh. The implementation is custom source code; the repository does not show a pretrained ConvNeXt backbone being loaded.
- The README describes approximately 106,000 generated samples and validation Dice near 0.64. The checked-in training log records `best_val_dice: 0.636525` at epoch 88 of 200, with the run marked `device: cuda`.
- `model/inference.py` expects `model/checkpoints/best.pt` by default. That file and the checkpoint directory are absent from the checkout. No checkpoint download/setup procedure is provided in its README.
- A top-level software license is absent from the checkout. Do not copy, redistribute, or deploy its code or weights into BoneVista until the owner confirms applicable terms. Model weights and source may have different rights.
- The checked-in FastAPI example exposes a synchronous prediction endpoint, enables wildcard CORS, writes files before validating them, has no upload size/type/dimension checks, and does not clean job files on success or error. It is not safe to expose unchanged.
- The CLI permits AP-only inference by duplicating the AP view as lateral. This is a code path, not evidence that the model was validated for single-view clinical radiographs.
- The candidate README's dataset and performance statements are author-reported. They were not independently reproduced here.

### Local development machine check

- Node.js: `v24.19.0`; npm: `11.17.0`.
- Python executable: Python `3.14.0`; the candidate checkout pins Python `3.13` in `.python-version`.
- Installed memory: approximately 31.3 GiB; free C: drive space at review time: approximately 66.9 GiB.
- Graphics device reported by Windows: AMD Radeon(TM) Graphics, integrated; Windows reports 512 MiB dedicated adapter memory. This is not an NVIDIA CUDA device.
- PyTorch and candidate dependencies were not installed. No weight file was available to test, and no dataset or checkpoint was downloaded.

This machine can run the existing browser app. Whether a particular PyTorch build can use AMD acceleration on this Windows setup was not established. Do not assume CUDA; any future inference evaluation must first establish a supported CPU or AMD runtime and benchmark actual inference duration and memory on this model.

## Baseline BoneVista verification

Before this review's documentation changes:

- `npm run build`: passed. Vite reports one large 3D model chunk (>500 kB) and the existing Three.js `Clock` deprecation warnings appear in browser tests.
- `npm run test:e2e`: passed, 7/7 tests. Coverage includes navigation/theme, anatomy search, spine filters, local X-ray upload and controls, the educational FEM result/validation, X-ray-to-stress reference flow, and GLB export.
- Candidate model inference: not run because its checkpoint is absent. Candidate API: not started; required ML dependencies are not installed.

## Integration path

1. **Keep the current working features.** The local image viewer and 1D FEM are useful educational tools, but keep their descriptions and colors explicit about their scope.
2. **Select one supported anatomy and task.** The candidate's claimed full-body scope should not be assumed from file names. Start with one anatomy and paired AP/LAT data that matches training.
3. **Resolve legal and artifact provenance.** Obtain explicit source-code terms, model-weight terms, checkpoint hash, training/evaluation provenance, and supported input/coordinate conventions.
4. **Reproduce the released example outside BoneVista.** Pin Python and dependencies in an isolated virtual environment. Confirm checkpoint loading, output mesh validity, orientation, scale, and repeatable validation results before connecting an endpoint.
5. **Build a local-only adapter.** Add strict image validation, bounded uploads, temporary directories, non-wildcard local CORS, job state, cleanup, error reporting, model version, and readiness status. Do not expose the development server to the network by default.
6. **Load reconstructed output separately.** Maintain separate reference-atlas and patient-mesh state. Show model/checkpoint name, units/scale/orientation when known, and only geometric measurements actually computed from that mesh.
7. **Keep stress analysis separate.** Continue to label the current solver educational. A patient-specific solver is a separate project requiring tetrahedral volume elements, boundary/material definitions, numerical verification, mesh convergence, and validation; a surface GLB alone is not sufficient.
8. **Test failure and success states.** Add backend health/readiness, missing-checkpoint, invalid-file, job lifecycle, real-checkpoint inference, mesh parsing, and export tests only when those layers exist. A mock response must never be counted as inference success.

## What should not be copied from the BoneVision preview

Do not hard-code its preview values (`0.83 mm`, `0.61 mm`, `12/12`, `4.2 s`), patient metadata, or a colored stress display into BoneVista as if they came from the current uploaded images. Do not add nonfunctional patient, implant-fitting, report, or share controls. The BoneVision webpage's marketing and roadmap are claims about that product, not proof of measured functionality available to this project.

## Sources

- [BoneVision public website](https://bonevision.com/)
- [Candidate repository](https://github.com/Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction)
- [Candidate model inference source](https://github.com/Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction/blob/main/model/inference.py)
- [Candidate FastAPI source](https://github.com/Saurabh-66/2D-X-ray-to-3D-Bone-Reconstruction/blob/main/backend/main.py)
- [X2BR paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC13133211/)
- [Xrayto3D benchmark research note in this repository](xray-to-3d-research.md)
