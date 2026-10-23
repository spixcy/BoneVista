# BoneVista — Neuro & Brain Explorer
## Shared parallel-agent contract for Codex Luna High and Antigravity Flash High

**Status:** Implementation plan / contract. It is not proof that any planned feature has shipped.

## 1. Goal

Add a first-class **Neuro & Brain Explorer** inside the existing BoneVista workspace, visually consistent with the current dark navy / near-black workspace, compact controls and cyan-blue accents. This is an addition to BoneVista, not a replacement for it and not a separately copied web app.

The section has three modes with distinct anatomical scales:

1. **Whole Nervous System** — full-body brain, spinal cord, and available cranial/peripheral nerves.
2. **Brain Atlas** — a close-up brain scene with selectable, labelled structures supported by the model and metadata.
3. **Neuron Lab** — a microscopic-scale single-neuron or small-neuron-group view. It can include soma, dendrites, axon and a clearly illustrative signal animation. This is not the same scale as a peripheral nerve or whole brain.

Do not force separately sourced models into one scene unless their coordinate systems, scale, orientation and anatomical coverage have been verified. Separate modes/scenes are preferable to a falsely aligned combined view.

## 2. Shared files both agents must read

Both agents must read these before editing:

- Root `README.md`.
- This file: `docs/NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md`.
- `docs/NEURO_BRAIN_EXPLORER_AGENT_PROMPTS.md`.
- `docs/NEURO_BRAIN_REPOSITORY_REVIEW.md`.
- The actual BoneVista source files for the current 3D scene, Muscle Explorer, navigation, global search, anatomy manifest, selection state, design tokens/styles and tests.

Treat the checked-out code as truth when the README differs. Do not invent filenames or assume a framework before inspecting the project.

## 3. Planned UX

### A. Whole Nervous System

- Fit-to-view full-body model showing whatever is actually present and properly licensed: brain, spinal cord, cranial nerves and peripheral nerves.
- Layer controls for available layers only; examples may include nerves, brain/spinal cord, bones reference, or other supported groups.
- Search/catalogue, selection/highlight, isolate/restore, visibility and camera focus for real selectable structures.
- If the nerves model cannot be aligned to BoneVista's skeleton, present it as its own scene rather than showing misaligned anatomy.

### B. Brain Atlas

- A brain-focused scene with centred default camera and reliable reset/fit-to-view.
- Use actual licensed, individually selectable meshes from the chosen asset. Potential categories include lobes/gyri, cerebellum, brainstem, ventricles, white-matter tracts, deep nuclei, cranial nerves, arteries or venous sinuses only when those are in the source and their specific licences have been checked.
- Search, select/highlight, isolate, visibility/layer controls, region/path metadata and a readable detail panel.
- Never fabricate structure rows that do not map to the loaded scene and manifest.

### C. Neuron Lab

- Separate microscopic scale and camera from the brain/full-body views.
- A local procedural illustrative neuron is an acceptable initial version if no safe, correctly attributed empirical neuron dataset is ready. Identify it clearly as an illustrative/generated morphology.
- Provide labelled features only if present: soma/cell body, dendrites, axon, myelin segments, synapse markers and/or branches. Use checkable layer visibility and a reset/fit control.
- A moving pulse, if added, must be labelled **illustrative signal-path animation**. Do not claim a physically accurate action-potential simulation, conduction velocity or electrophysiology without a validated, documented model.
- Do not call a turtle or another non-human sample a human neuron. If using a real reconstructed neuron, show species, brain region, cell type, dataset/source ID and its attribution/terms.

### Shared interactions

- Rotate, pan and zoom; reliably reset/fit the current mode.
- Select using either the 3D viewport or catalogue; both must stay synchronized.
- Search by labels, aliases and available metadata; results must resolve to stable IDs and selectable objects.
- Hide/show and isolate/restore only the layers/meshes that actually exist.
- Detail panel should show available validated metadata, source and side/region when supplied; never invent anatomy or physiological facts.
- Loading, no-results and failure states must be visible and recoverable. A failed asset must not blank/crash the whole workspace.
- Ensure the viewer is centred and framed correctly. The supplied Muscle Explorer screenshot shows a heavily tilted/cropped muscle model; inspect the shared camera/normalization logic and avoid reproducing that failure. Fix shared code only where safe and regression-tested.

## 4. Candidate repositories and how to use them

### Brain Project — preferred detailed brain candidate

Repository: https://github.com/itayinbarr/brainproject

Its README documents a Three.js brain atlas with a `brain.glb` and `manifest.json`, stable per-mesh identifiers, selectable anatomy, a region hierarchy and separate named structures including white-matter pathways, ventricles, brainstem, cerebellum and cranial nerves. Its viewer code is Apache-2.0, but its anatomy assets are CC BY-SA 4.0 and may include further source-specific atlas assets. Do not treat the code licence as the model licence. Inspect the actual asset files and all notices before redistribution.

### 3D Human Body Anatomy — candidate nerves layer

Repository: https://github.com/SeemaBansal1/3d-human-body-anatomy

Its README describes separate GLB anatomy layers, including a nerves layer, derived from Z-Anatomy / BodyParts3D, with Z-Anatomy CC BY-SA 4.0 and BodyParts3D CC BY-SA 2.1 JP attribution. The repository has a small public history, so treat it as a **candidate to audit**, not a trusted dependency. Confirm file existence, provenance, metadata, transform, quality and applicable notices.

### Canonical anatomy source

Repository: https://github.com/Z-Anatomy/Models-of-human-anatomy

The repository's stated licence is CC BY-SA 4.0 and its source notices list additional third-party content. It may be useful to source/export a compatible nerve layer if BoneVista can identify the same compatible version as its current skeleton. Check every sub-source; some included content can have different conditions.

### Neuro-Forge — procedural neuron reference

Repository: https://github.com/kai9987kai/Neuro-Forge

The repository is marked MIT-licensed and describes procedural generation of synthetic neuron morphologies and Three.js visualisation. Use it as a reference or adapt only the smallest useful pieces under the MIT terms, preserving the licence if code is copied. Do not import the whole standalone app or its UI into BoneVista. Generated morphology should be described as synthetic/illustrative, not a measured neuron.

### MorphoScope-3D — concept reference only unless licence is verified

Repository: https://github.com/cvillanue/MorphoScope-3D

Its README describes an SWC-to-GLB neuronal morphology workflow and browser viewer, and references a NeuroMorpho.Org sample. A clear repository code licence was not found during preparation. Do not copy its code or bundled neuron asset until an applicable licence and the sample dataset terms have been verified. Use as a technical reference only for now.

### NeuroMorpho.Org — possible empirical data source

Dataset portal: https://neuromorpho.org/

This may provide actual reconstructed neuronal morphologies. Check the specific dataset page, species, authors/publication, data terms, attribution and redistribution policy for every downloaded morphology. Do not bundle a dataset merely because it can be downloaded.

## 5. Licence and source acceptance rules

Before any asset is added to the repo, Codex must record:

- exact repository URL, source revision/commit or release, and exact model/data filename;
- original source/author and licence for the exact geometry and metadata, not just the wrapper application's source code;
- whether a bundled asset contains components derived from other datasets and their additional restrictions;
- attribution text and licence file/URL to include in BoneVista;
- any share-alike obligations that apply to modified/redistributed geometry or metadata;
- whether use in a public hackathon demo and later commercial use are allowed.

If a clear licence cannot be established, do not redistribute that code/model/data. Use it only as inspiration or ask for permission. Never scrape or extract BioDigital/MSD/other hosted assets without explicit reuse permission. A public demo URL is not a licence to repackage its geometry.

## 6. Stable IDs and shared adapter boundary

Do not blindly add all brain/neuron rows to the existing skeletal `public/anatomy/manifest.json`. Prefer a separate, namespaced neuro manifest if that matches the current architecture, so other features are not accidentally changed. Namespaced IDs should be stable and collision-safe, for example:

- `neuro:system:<source-id>`
- `neuro:brain:<source-id>`
- `neuro:neuron:<source-id>`

Use the actual source IDs and exact mesh references wherever available; do not use display names as the sole identity. Keep the existing bone, muscle and spine registries intact.

The UI and 3D core must agree on an interface equivalent to the following. Adapt syntax to BoneVista's existing framework/type conventions; this is a capability contract, not a mandate to add a new framework or abstraction layer.

```ts
type NeuroMode = 'nervous-system' | 'brain-atlas' | 'neuron-lab';

type NeuroStructureView = {
  id: string;
  name: string;
  latinName?: string;
  category: string;
  side?: 'left' | 'right' | 'midline' | 'unknown';
  region?: string;
  description?: string;
  source?: string;
  selectable: boolean;
};

type NeuroLayerView = {
  id: string;
  label: string;
  available: boolean;
  visible: boolean;
  opacity: number; // 0..1 when opacity is supported
};

type NeuroExplorerViewProps = {
  activeMode: NeuroMode;
  onModeChange: (mode: NeuroMode) => void;
  loading: boolean;
  error?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  structures: NeuroStructureView[];
  selectedIds: string[];
  onToggleStructure: (id: string) => void;
  layers: NeuroLayerView[];
  onToggleLayer: (id: string) => void;
  onLayerOpacityChange?: (id: string, opacity: number) => void;
  onIsolateSelection: () => void;
  onClearSelection: () => void;
  onFocusSelection: () => void;
  onResetView: () => void;
};
```

If the UI framework cannot directly use these TypeScript shapes, implement equivalent typed/validated data and callbacks in the framework the project already uses. Avoid unnecessary adapter layers if the codebase already exposes the same capability.

## 7. File ownership — parallel responsibilities

### Codex Luna High owns core/data/integration

- Candidate repo and file-level licence audit; asset download/conversion if allowed.
- Local model placement, loader setup, model normalization/orientation, camera framing/fit, mode switching, and disposal of GPU resources.
- Neuro/neuron manifest and stable IDs; mapping to true mesh objects and metadata.
- Scene selection, layer visibility/opacity/isolation, camera focus/reset, shared state and global search integration.
- Navigation/sidebar registration and existing app-shell/scene files.
- Licence notices, asset provenance, README truthfulness, build/e2e/integration and regression tests.
- Review final combined diff and perform the final integration.

Codex must not rebuild the visual layout or recreate Antigravity's page components. It should give Antigravity the real prop/data interface and wire the new components into the existing app.

### Antigravity Flash High owns UI/presentation

- New Neuro & Brain page/components in new UI-owned files following the actual project's framework and style patterns.
- Three mode tabs, layer/list controls, search area, structure details, empty/loading/error states, keyboard/focus states, responsive design and visual polish.
- Use the shared view props/callback contract above. Temporary mock data is allowed only inside UI development and must be clearly marked; never represent it as the final working atlas.
- Return exact component exports/paths and a concise props/callback description to Codex.

Antigravity must not modify the 3D scene loader, model assets, manifests, shared selection store, global search implementation, app-shell navigation, or existing workspace route wiring. Codex owns those existing files. If a conflict is unavoidable, stop and report it rather than rewriting the other agent's files.

## 8. True parallel execution protocol

1. Both agents read the same README, contract, prompt pack and repository-review file, and acknowledge the other's responsibility in their kickoff.
2. Both start with a short read-only audit and list the files they plan to touch. This must be quick; do not let audits turn into a long redesign phase.
3. Codex owns an interface/adapter implementation consistent with Section 6. Antigravity starts building the page against that stable props/callback contract in its own files; no need to wait for the final 3D assets to design the panel.
4. Prefer separate branches or worktrees. If both tools share a working directory, maintain strict file ownership and do not edit shared files at the same time.
5. Codex should not overwrite Antigravity's new UI files during integration. Antigravity should not edit Codex-owned integration files. Merge only after comparing exact diffs.
6. Each agent reports exact changed files, checks run, assumptions, blockers and any temporary mocks.
7. Codex performs final integration and regression testing after both workstreams are ready.

## 9. Acceptance criteria

- Sidebar navigation opens a real Neuro & Brain section inside BoneVista.
- Three separate modes exist: Whole Nervous System, Brain Atlas and Neuron Lab; each has the correct scale and initial camera framing.
- Actual licensed model assets load locally or from an explicitly approved source; no hosted model is extracted without permission.
- Search and catalogue rows map to stable IDs and selectable scene objects (or clearly indicate metadata-only entries as unavailable).
- Scene selection and catalogue selection stay synchronized.
- Layer visibility, isolate/restore, focus and reset work for all implemented layers.
- Asset failures show retryable, understandable error states and do not blank the full application.
- Neuron Lab is labelled illustrative unless it uses a sourced empirical model; signal animations are not misrepresented as validated physiology.
- Required notices, attribution and share-alike licence terms are included.
- Existing 3D Anatomy, Muscle Explorer, Spine Explorer, X-Ray Workspace, Stress Analysis and exports continue to work.
- New models fit the viewport: centred, appropriately oriented and not cropped; reset/fit is reliable.
- `npm run build` passes, existing tests pass, and new tests cover mode switching, selection, visibility and asset failures.
- README describes exactly what exists and clearly labels anything not implemented.
