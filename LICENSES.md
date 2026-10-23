# BoneVista — Licenses

## Application code

MIT License.

## Skeletal atlas and labels

The selected male skeletal meshes and manifest in `public/anatomy/` are adapted from Z-Anatomy and BodyParts3D / DBCLS. They are licensed CC BY-SA 4.0, with the upstream DBCLS attribution chain under CC BY-SA 2.1 Japan. Preserve the full attribution and share-alike terms when redistributing the atlas or adaptations. See `public/anatomy/NOTICE` and `public/anatomy/LICENSE` for complete terms.

## Muscle atlas

`public/muscle-atlas/ecorche.glb` is a separate model from Écorché, Charleeh/ecorche commit `320805e06aee51e2e6f6b22533eb2a59d43f2d4d`. It is licensed CC BY-SA 4.0 and derives from BodyParts3D / DBCLS (CC BY 4.0) and Z-Anatomy by Gauthier Kervyn (CC BY-SA 4.0). Preserve these attributions and share-alike terms for the model or mesh derivatives. The complete upstream license and attribution are included in `public/muscle-atlas/`; the bundled asset and metadata are documented in `public/muscle-atlas/README.md`.

## Neuro atlases

`public/neuro/brain.glb` and its manifest are from Brain Project commit `2929e94f521a8ddceab26bc100a98dc06b0da060`. `public/neuro/nerves.glb` is from 3D Human Body Anatomy commit `28912432581accd7a1c62129d55f0e9758221d48`; its grouped manifest is derived from that repository's source nerve metadata. Both anatomy assets and derived metadata are distributed under CC BY-SA 4.0. Their sources include Z-Anatomy, BodyParts3D / DBCLS, open MRI atlas derivatives and University of Dundee cranial-nerve models. Exact filenames, revisions, checksums, attributions and caveats are in `public/neuro/NOTICE.md`; the CC BY-SA 4.0 text and source Z-Anatomy licence are included beside the assets. These licences apply to the anatomy data, not BoneVista's application code.

## Xrayto3D benchmark reference

The research repository [naamiinepal/xrayto3D-benchmark](https://github.com/naamiinepal/xrayto3D-benchmark) is GPL-3.0. This project does not bundle its code or model weights. Checkpoint availability, provenance, and license have not been verified; no inference integration is configured.

## Fonts and icons

- Inter and JetBrains Mono: SIL Open Font License (OFL).
- Lucide: ISC License.
- Three.js: MIT License.
- Bundled Draco decoder: Apache License 2.0; see `public/draco/README.md`.
- jsPDF: MIT License.

