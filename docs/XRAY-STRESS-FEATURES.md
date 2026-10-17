# X-Ray viewer and educational stress model

## X-Ray viewer

The X-Ray Workspace accepts local JPEG, PNG, and WebP files up to 25 MB. AP and lateral views are held in browser memory and are not uploaded. The viewer supports zoom, pointer-drag panning, fit, rotation, brightness, contrast, and reset. Image filename, dimensions, and file size are displayed when available.

DICOM is not currently supported. No image segmentation model, inference API, fracture analysis, or radiograph-to-3D reconstruction pipeline is configured. The app must not interpret the viewing controls as image analysis. DICOM support would require a maintained DICOM decoder and validation across transfer syntaxes and photometric interpretations. Image analysis/reconstruction requires a separately selected model/service, documented input requirements, and validation; no endpoint or model weights are assumed here.

## Educational stress simulation

The Stress Analysis page runs a linear, one-dimensional, two-node axial bar finite-element calculation. Each element contributes the standard stiffness matrix `EA/L × [[1, -1], [-1, 1]]`; the app assembles the global system, fixes the first node, applies an axial end load, and solves the free degrees of freedom by Gaussian elimination. Units are N, mm, and MPa (Young's modulus is entered in GPa and converted to MPa). Results are calculated from the visible input values.

The geometry is an idealized uniform bar. After calculation, its uniform axial stress value is mapped to the selected atlas structure with the viewer's 0–10 MPa blue-to-red display scale; the 3D mesh itself is not solved and does not have a local 3D stress contour. This is not a patient-specific bone analysis, bending, anisotropy, failure, or fracture result. Default material values are illustrative and are not clinical recommendations. A clinically meaningful 3D analysis would need a validated mesh workflow, appropriate constitutive model/material data, boundary conditions, solver verification, and validation against reference experiments. No external solver, API key, or service is configured.

## Local development

No additional runtime dependencies or model downloads are required for these implemented features. Run `npm run build` and `npm run test:e2e` to compile the app and exercise the image-viewer and educational simulation flows.
