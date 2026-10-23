# Neuro atlas asset notices

The files in this directory are anatomy data, not BoneVista application code. The brain and nerve geometry and their adapted metadata are distributed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0). The full licence text is in `CC-BY-SA-4.0.txt`.

## Detailed brain atlas

- Source: [itayinbarr/brainproject](https://github.com/itayinbarr/brainproject), commit `2929e94f521a8ddceab26bc100a98dc06b0da060` (2026-06-19).
- Source files: `brain-atlas/models/brain.glb` (4,650,816 bytes; source Git blob `c80dd62202b5cf8a2a43c7a019311781bd95457c`) and `brain-atlas/models/manifest.json` (232,455 bytes; source Git blob `ad25ab2d45b2d46a94f324143506f0fa3bc6906a`).
- Bundled files: `brain.glb` (4,650,816 bytes; SHA-256 `76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453`) and `brain-manifest.json` (437 named structures; SHA-256 `3b15269650bce1f1daf3183e934d255a3951f7681867cd3283ba139555af5ffe`).
- Source licence: brain geometry and derived metadata CC BY-SA 4.0; the upstream viewer code is Apache-2.0 and is not included here.
- Attribution: Z-Anatomy contributors; BodyParts3D, © The Database Center for Life Science (DBCLS). The registered deep structures and white-matter pathways also credit CIT168 (CC BY 4.0), CIT168 amygdala (CC BY-SA 4.0), Najdenovska et al. 2018 (CC BY-SA 4.0), Neudorfer et al. 2020 (CC BY 4.0), and HCP1065 / Yeh 2022 (CC BY-SA 4.0). The upstream Brain Project `LICENSE` and `docs/registration.md` identify the exact source and caveats.
- Metadata mapping: all 437 manifest nodes correspond to 437 GLB meshes and carry matching `bx_id` extras. BoneVista prefixes the numeric source ID as `neuro:brain:<id>`; display names are not identities.
- Coordinates: source vertices have no per-node transforms; the source scene uses Y as its vertical axis and spans roughly 0.60 source units in Y for the brain. Brain Atlas mode centers and scales its bounds at runtime. In Whole Nervous System mode, the brain is left in the nerve asset's coordinates before one shared scene normalization.
- Caveat: selected deep structures and tracts are approximate registrations at about 7 mm and intended for education, not clinical or surgical use.

## Full-body cranial and peripheral nerves

- Source: [SeemaBansal1/3d-human-body-anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy), commit `28912432581accd7a1c62129d55f0e9758221d48` (2026-10-10).
- Source files: `web/public/models/nerves.glb` (1,020,216 bytes; source Git blob `965ac854bd18d12f959f4e7bc34444a1a6032c03`), `content/nerves.json` (source Git blob `6c5224cfbeff86a6862027cdf00a54e85a01d3ff`), and `content/names/nerves.txt` (source Git blob `41da27c3b048257028231d780b84f8266b74d3a6`).
- Bundled files: `nerves.glb` (1,020,216 bytes; SHA-256 `4c84983f06202c8f0c0f1f362dd9e01bc13d8f6b3394c7f58ba1983890afd483`) and `nerves-manifest.json` (44 grouped entries mapped to all 255 named meshes; SHA-256 `73aba19ef54d78f47f8d6f7ab7fe91c0e4e7db9136f2826aae53c626fe09a9a5`). The manifest keeps exact source mesh names and source group IDs where provided; two remaining source meshes retain deterministic namespaced IDs.
- Attribution chain: BodyParts3D / DBCLS (CC BY-SA 2.1 Japan); Z-Anatomy (CC BY-SA 4.0); and the University of Dundee, CAHID cranial nerve and foramina models (CC BY 4.0), as identified in the source `source/License.txt`. The source Z-Anatomy licence text is included in `Z-ANATOMY-LICENSE.txt`.
- Metadata mapping: 253 source meshes map into 42 source-ID groups; two remaining mesh names are kept as individual rows with deterministic namespaced IDs. Each of the 255 GLB nodes maps by its exact `zname` extra to one manifest `meshNames` entry. BoneVista IDs use the `neuro:system:` namespace.
- Coordinates: the nerve model has no per-node transforms; Y is vertical and its body height is about 1.66 source units. The nerve asset has no spinal-cord mesh, so BoneVista marks that layer unavailable. Brain and nerve models share a frame: 46 same-named structures were compared, with a maximum axis-bound difference of about 0.00043 source units. Runtime normalization applies one transform to the combined full-body scene.

Both bundled GLBs use Draco compression and the existing local Three.js Draco decoder. No source viewer application code, remote runtime asset links, or neuron data are bundled. Neuron Lab remains reserved for the separately developed Neuron branch; no substitute neuron morphology or neural simulation is included here.
