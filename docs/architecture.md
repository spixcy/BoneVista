# Architecture and model integration

The browser app is built with React, Vite, Three.js, and React Three Fiber. It loads the 335-mesh skeletal atlas from `public/anatomy/skeletal_male.glb`, decodes its Draco geometry with the bundled decoder, and matches mesh node names to `manifest.json` labels. The shared store loads atlas labels once so the viewer, anatomy list, and spine explorer use the same mesh IDs.

The viewer supports orbit, zoom, pan, named mesh selection, visibility toggles, isolation, camera orientations, and GLB/OBJ/PDF reference exports. Exports describe the generalized reference atlas and selected labels; they do not contain patient-specific results.

## Neuro and brain scenes

Neuro models use separate local assets and namespaced IDs under `public/neuro/`; they do not extend the bone or muscle registries. `useNeuroExplorerModel` adapts the shared neuro state to the parallel UI contract in `src/data/neuroAtlas.ts`. The nervous-system scene combines the separately licensed brain and nerve assets in their audited shared source frame, then applies one fit transform. The brain-only scene centers and fits the brain independently. The source nerve asset has no spinal-cord mesh, so the controller marks that layer unavailable.

Neuron Lab is reserved for integration of the user's separately developed Neuron branch. This core change does not create neuron geometry, a signal animation, or simulation logic. The view-model exposes the mode as unavailable with an explicit integration notice until that branch is connected. The current three-mode contract and scene names live in `src/data/neuroAtlas.ts` and `src/hooks/useNeuroExplorerModel.ts`; asset provenance, licenses and coordinate findings are in `public/neuro/NOTICE.md`.

The AP/lateral workspace accepts JPEG, PNG, and WebP images up to 25 MB each. It previews files locally using browser object URLs. DICOM decoding, server uploads, persistent studies, and inference are not configured. The reconstruction action is explicitly disabled and shows the image-input readiness separately from model readiness. No verified model checkpoint or inference service is supplied. The Xrayto3D research repository is GPL-3.0, and its directly usable checkpoints and checkpoint licenses are unverified; the separately reviewed Saurabh-66 candidate also has no checkpoint or license in its public checkout. See [the BoneVision comparison](bonevision-comparison.md).

Before adding inference, pin source code and weights, verify checkpoint terms and provenance, reproduce the published evaluation, and validate orientation, scale, and output conventions. A future service should validate inputs and output meshes, use real job states, identify model and preprocessing versions, and delete temporary medical images according to an explicit retention policy.
