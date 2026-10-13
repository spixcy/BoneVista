# Architecture and model integration

The browser app is built with React, Vite, Three.js, and React Three Fiber. It loads the 335-mesh skeletal atlas from `public/anatomy/skeletal_male.glb`, decodes its Draco geometry with the bundled decoder, and matches mesh node names to `manifest.json` labels. The shared store loads atlas labels once so the viewer, anatomy list, and spine explorer use the same mesh IDs.

The viewer supports orbit, zoom, pan, named mesh selection, visibility toggles, isolation, camera orientations, and GLB/OBJ/PDF reference exports. Exports describe the generalized reference atlas and selected labels; they do not contain patient-specific results.

The AP/lateral workspace accepts readable PNG and JPEG images only, each up to 15 MB. It previews files locally using browser object URLs. DICOM decoding, server uploads, persistent studies, and inference are not configured. The inference action is intentionally disabled; the Xrayto3D research repository is GPL-3.0, its directly usable checkpoints and checkpoint licenses are unverified, and no validated model service is supplied.

Before adding inference, pin source code and weights, verify checkpoint terms and provenance, reproduce the published evaluation, and validate orientation, scale, and output conventions. A future service should validate inputs and output meshes, use real job states, identify model and preprocessing versions, and delete temporary medical images according to an explicit retention policy.
