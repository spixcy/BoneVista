# BoneVista Citations & Resource Audit

This document records the provenance, upstream commits, licenses, and verification statuses of all 3D anatomical models, software dependencies, and research references in BoneVista.

## 1. Skeletal Anatomy Atlas
- **Asset**: `public/anatomy/skeletal_male.glb` and `public/anatomy/manifest.json`
- **Primary Source**: Z-Anatomy (Gauthier Kervyn et al.) — https://www.z-anatomy.com/
- **Upstream Dataset**: BodyParts3D, Database Center for Life Science (DBCLS), Japan — https://dbcls.rois.ac.jp/
- **License**: CC BY-SA 4.0 International (adaptation)
- **Upstream License**: CC BY-SA 2.1 Japan (BodyParts3D)
- **Adaptation Details**: Headless Blender export to binary glTF with lossy Draco compression (14-bit position, 10-bit normal), stable organ IDs, and corrected Terminologia Anatomica 2 (TA2) labels.
- **Verification Status**: Verified (bundled in `public/anatomy/`, notices in `public/anatomy/NOTICE` and `public/anatomy/LICENSE`).

## 2. Muscle Atlas (Écorché)
- **Asset**: `public/muscle-atlas/ecorche.glb`
- **Primary Source**: Charleeh/ecorche — https://github.com/Charleeh/ecorche
- **Upstream Revision**: Commit `320805e06aee51e2e6f6b22533eb2a59d43f2d4d` (2026-10-07)
- **Upstream Provenance**: BodyParts3D / DBCLS (CC BY 4.0) & Z-Anatomy (CC BY-SA 4.0)
- **License**: CC BY-SA 4.0 International
- **Asset Hash**: SHA-256 `9744d3dffced835961104447d23a781ad469588289ce322d84d000e0d498326c`
- **Verification Status**: Verified (documented in `public/muscle-atlas/README.md`, `ATTRIBUTION.md`, and `LICENSE.md`).

## 3. Brain Anatomy Atlas
- **Asset**: `public/neuro/brain.glb` and `public/neuro/brain-manifest.json`
- **Primary Source**: Itay Inbar / brainproject — https://github.com/itayinbarr/brainproject
- **Upstream Revision**: Commit `2929e94f521a8ddceab26bc100a98dc06b0da060` (2026-06-19)
- **Upstream Provenance**: Z-Anatomy contributors, BodyParts3D (DBCLS), CIT168, Najdenovska et al. 2018, Neudorfer et al. 2020, HCP1065 / Yeh 2022
- **License**: CC BY-SA 4.0 International (anatomy geometry and metadata; upstream viewer is Apache-2.0 and not bundled)
- **Asset Hash**: SHA-256 `76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453`
- **Verification Status**: Verified (documented in `public/neuro/NOTICE.md`).

## 4. Full-Body Peripheral & Cranial Nerves
- **Asset**: `public/neuro/nerves.glb` and `public/neuro/nerves-manifest.json`
- **Primary Source**: Seema Bansal / 3d-human-body-anatomy — https://github.com/SeemaBansal1/3d-human-body-anatomy
- **Upstream Revision**: Commit `28912432581accd7a1c62129d55f0e9758221d48` (2026-10-10)
- **Upstream Provenance**: BodyParts3D / DBCLS (CC BY-SA 2.1 Japan), Z-Anatomy (CC BY-SA 4.0), University of Dundee CAHID cranial nerve models (CC BY 4.0)
- **License**: CC BY-SA 4.0 International
- **Asset Hash**: SHA-256 `4c84983f06202c8f0c0f1f362dd9e01bc13d8f6b3394c7f58ba1983890afd483`
- **Verification Status**: Verified (documented in `public/neuro/NOTICE.md` and `Z-ANATOMY-LICENSE.txt`).

## 5. Software Libraries & Runtime Dependencies
- **Three.js**: MIT License (mrdoob/three.js) — https://github.com/mrdoob/three.js
- **React & React-DOM**: MIT License (facebook/react) — https://github.com/facebook/react
- **@react-three/fiber**: MIT License (pmndrs/react-three-fiber) — https://github.com/pmndrs/react-three-fiber
- **@react-three/drei**: MIT License (pmndrs/drei) — https://github.com/pmndrs/drei
- **Lucide Icons**: ISC License (lucide-icons/lucide) — https://github.com/lucide-icons/lucide
- **Google Draco Decoder**: Apache License 2.0 (google/draco) — https://github.com/google/draco (bundled in `public/draco/`)
- **jsPDF**: MIT License (parallax/jsPDF) — https://github.com/parallax/jsPDF
- **Zustand**: MIT License (pmndrs/zustand) — https://github.com/pmndrs/zustand
- **Framer Motion**: MIT License (motiondivision/motion) — https://github.com/motiondivision/motion
- **Verification Status**: Verified from `package.json`, `public/draco/README.md`, and license texts.

## 6. Research References
- **Xrayto3D Benchmark**: https://github.com/naamiinepal/xrayto3D-benchmark
  - License: GPL-3.0
  - Role: Research reference only (no model weights or inference code bundled in BoneVista).
  - Status: Needs verification for external checkpoint licenses; accurately marked as research reference.
