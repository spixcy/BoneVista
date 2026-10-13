# OsteoVision 3D

An anatomy research workspace prototype with a real segmented reference skeleton, spine navigation, local radiograph previews, and model exports. This is educational software, not a diagnostic device.

## Run locally

Requirements: Node.js 20.19+ or 22.12+.

```powershell
npm install
npm run dev -- --open
```

Use the local URL opened by Vite. On Windows, double-click `start.bat`. Opening `index.html` as a `file://` URL is unsupported; the page now shows launch instructions in that case. Create a production build with `npm run build`; preview it with `npm run preview`.

## Browser checks

Install the Playwright Chromium runtime once with `npx playwright install chromium`, then run the browser suite with `npm run test:e2e`. It checks atlas loading and selection, spine-region coverage, local image previews and invalid-file handling, and GLB export structure.

## Current capability

- **Implemented:** interactive 3D reference skeleton, orbit/zoom/pan, camera reset and fit, standard views, named mesh selection, mesh visibility and isolation, spine-region navigation, C1–C7/T1–T12/L1–L5/sacrum/coccyx labels when supplied by the atlas, AP/lateral PNG/JPEG previews and input validation, GLB/OBJ reference-model export, PDF reference summary.
- **Unavailable:** patient-specific X-ray-to-3D inference. There are no inference weights or backend in this project. The UI will not claim an image-derived result.
- **Session-only:** no login, database, study persistence, or server upload. Images use browser object URLs and are revoked when removed.
- **Not clinical:** no diagnosis, pathology detection, patient measurements, or clinical validation.

## Anatomical asset

`public/anatomy/skeletal_male.glb` is a 335-structure skeletal subset adapted from the Anatria3D distribution of Z-Anatomy meshes. The original source chain is BodyParts3D (DBCLS, CC BY-SA 2.1 Japan) → Z-Anatomy (CC BY-SA 4.0) → Anatria3D export. The model and its manifest are distributed under CC BY-SA 4.0. Attribution and license copies are in `public/anatomy/NOTICE` and `public/anatomy/LICENSE`. Changes or redistribution of this asset must preserve attribution and the same share-alike license. The application code is separate from the atlas asset license.

Asset source: [Anatria3D anatomy assets](https://github.com/Nurkan1/Anatria-3D/tree/main/public/anatomy). The original Z-Anatomy project explains the source license and attribution chain in [its model repository](https://github.com/Z-Anatomy/Models-of-human-anatomy).

## Research and architecture

- [X-ray-to-3D research note](docs/xray-to-3d-research.md)
- [Architecture and integration notes](docs/architecture.md)
- [Project design system](DESIGN.md)
- [Third-party notices](THIRD-PARTY-NOTICES.md)

The reference anatomy is loaded independently of any inference service. The reconstruction workspace remains disabled until a validated model, weights, preprocessing contract, and output validator are supplied.

"# BoneVista" 
