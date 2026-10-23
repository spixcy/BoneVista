# BoneVista Muscle Explorer — parallel agent prompts

Use the updated README and the shared parallel contract. The contract defines file ownership and the interface both agents must follow. Copy the same contract into the repository at `docs/MUSCLE_EXPLORER_PARALLEL_AGENT_CONTRACT.md`.

# BoneVista Muscle Explorer — Parallel Agent Contract

**Purpose:** Add a real, maintainable Muscle Explorer to the existing BoneVista application with Codex Luna High and Antigravity Flash High working in parallel, without both agents implementing the same feature or editing the same files.

**This is an integration contract, not evidence that the feature is implemented.** Inspect the current checkout first and verify all existing behavior before making changes.

## 1. Shared context both agents must read

Read the root `README.md`, this contract, and the current code before editing. The README describes the current app as a Vite/browser-based educational anatomy workspace with:

- Existing atlas labels at `public/anatomy/manifest.json` and skeleton geometry at `public/anatomy/skeletal_male.glb`.
- A shared atlas/state model connecting the 3D Anatomy viewer, global anatomy search, Atlas Structures panel, Spine Explorer, and educational stress mapping.
- Selection/highlighting, per-structure visibility, isolate, anatomical camera presets, reset/auto-rotate, and GLB/OBJ/PDF exports.
- Local AP/lateral radiograph viewing and an educational 1D axial bar stress example. Those are not patient-specific tools.
- Existing attribution to Z-Anatomy / BodyParts3D under CC BY-SA 4.0 with related notices in `public/anatomy/`, `LICENSES.md`, and `THIRD-PARTY-NOTICES.md`.

**Shared goal:** Muscle Explorer belongs in the existing BoneVista workspace. Do not create a separate application or replace working BoneVista features.

## 2. Parallel roles and file ownership

### Codex Luna High — core, assets, and host integration

Codex owns:

1. Inspecting the real implementation and deciding the smallest safe integration path.
2. The new model-loading path, asset handling, anatomy registry/manifest for muscle data, stable namespaced IDs, mesh/group mapping, and metadata normalization.
3. Scene integration, layer visibility, mapping model clicks to selected anatomy entries, highlighting, isolation, and camera targeting.
4. Adapting the core data/state to the UI component contract in Section 3.
5. Existing app-shell integration: routes, sidebar/navigation entry, workspace mounting, shared global search wiring, host toolbar integration, and shared viewer state.
6. Licence/attribution/notice files and documentation updates for the actual assets shipped.
7. Cross-feature regression tests and final integration/release gate.

Codex must **not** rewrite or restyle the UI components owned by Antigravity. If a UI problem needs a change, report the precise issue and request a targeted fix or agree a clear handoff.

### Antigravity Flash High — standalone UI components and styling

Antigravity owns:

1. New, isolated Muscle Explorer UI components using BoneVista's existing framework and design conventions.
2. Layer preset controls, search/list presentation, per-entry visibility controls, selection details, loading/error/empty states, and responsive/accessibility behavior.
3. Scoped styles for those new components only.
4. Component-local tests or a reproducible manual test checklist for its owned components.

Antigravity must **not** edit the existing app shell, navigation/route files, viewer scene/GLTF loader, existing atlas manifest, global search implementation, shared selection store, existing global CSS, package manifest/lockfile, or third-party licence files. It must not create a second Three.js scene, load the GLB itself, fabricate sample anatomy data, or implement a second source of truth for selected structures.

Antigravity should create new UI-owned files in a dedicated directory that matches the repository's source conventions. It must state the exact file paths, exported component names, and props/callback shape in its final handoff so Codex can wire them up. If the application is not React, do not add React; follow the actual framework and existing component pattern.

### Rules that apply to both agents

- Begin by acknowledging the other agent's role and listing files owned versus files you will not touch.
- Inspect the actual checkout instead of assuming that README paths or stack details are complete.
- Do not edit the other agent's owned files. If a conflict is unavoidable, stop and describe the conflict rather than silently overwriting work.
- Do not install a dependency or change `package.json`/lockfiles unless the core implementation demonstrates it is necessary and the agents agree.
- Do not overwrite the root README or this contract during parallel implementation. Codex may update user-facing docs after the feature is integrated and verified.
- Report what was changed and which commands actually ran. Never claim unrun tests passed.

## 3. Stable UI/data boundary

Antigravity's UI is presentation-only. Codex owns the real state and must adapt its registry/scene to provide equivalent values and callbacks. Use these semantics even if the exact syntax differs to fit the repository's framework.

### Layer presets

```ts
type MuscleLayerPreset =
  | "bones"
  | "superficial"
  | "deep"
  | "combined";

type MuscleExplorerStatus = "idle" | "loading" | "ready" | "error";
type AnatomySide = "left" | "right" | "midline" | "bilateral" | "unknown";

type MuscleLayer = "superficial" | "deep";

type MuscleExplorerStructureVM = {
  id: string;                 // stable, namespaced; never array index
  name: string;
  latinName?: string;
  kind: "bone" | "muscle";
  layer?: MuscleLayer;         // meaningful for muscle entries
  side: AnatomySide;
  region?: string;
  source: string;
  fmaId?: string;
  meshCount: number;
  visible: boolean;
  selected: boolean;
};
```

Equivalent UI inputs/callbacks must be available:

```ts
type MuscleExplorerUIModel = {
  status: MuscleExplorerStatus;
  errorMessage?: string;
  activePreset: MuscleLayerPreset;
  query: string;
  structures: readonly MuscleExplorerStructureVM[];
  selectedIds: readonly string[];

  onQueryChange(query: string): void;
  onPresetChange(preset: MuscleLayerPreset): void;
  onSelectStructure(id: string): void;
  onSetStructureVisibility(id: string, visible: boolean): void;
  onIsolateSelected(): void;
  onClearSelection(): void;
  onRetryLoad(): void;
  onReturnToBones(): void;
};
```

The actual UI may split this model among a toolbar and a structure panel, but do not change the meanings or duplicate the state store. Antigravity exports UI components that accept this data/callback model (directly or via equivalent props). Codex provides the adapter from the real atlas/controller into those props.

### Preset behavior and alignment

- **Bones:** preserve the current BoneVista skeleton view and current interactions.
- **Superficial Muscles:** show superficial muscle meshes without deep muscle meshes; do not leave the existing/paired skeleton accidentally visible unless the UI explicitly labels that state.
- **Deep Muscles:** show deep muscle meshes without superficial muscle meshes.
- **Bones + Muscles:** show exactly one aligned bone set with the requested muscle layers. If the new asset contains its own bone meshes and those are the only bones proven to align to its muscles, use that paired bone set in this preset. Do not render the original skeleton and the new asset's full skeleton simultaneously.

Codex must verify model coordinate orientation, transforms, units, bounds, mesh hierarchy, and metadata before claiming the models align. If they do not align, do not apply an arbitrary transform without evidence. Keep the original Bone mode as a safe fallback and make alignment limitations explicit.

### IDs and metadata

- Use stable namespaced IDs, for example `bone:<existing-atlas-id>` and `muscle:<source-or-FMA-id>:<side>` where the actual source provides suitable identifiers.
- If there is no source ID/FMA ID, derive a deterministic key from verified source metadata and side. Never use mesh array positions or unstable Three.js traversal indices.
- Multiple mesh pieces may map to one anatomical structure. Support grouped selection/visibility when the metadata demonstrates that mapping.
- Keep original bone IDs and the existing 335-entry manifest intact unless the implementation audit shows a compatible, tested reason to extend a shared abstraction without breaking consumers.
- Only present metadata the asset/source actually provides. Do not invent origins, insertions, function, innervation, diagnosis, or patient-specific conclusions.

## 4. Suggested repositories and licensing rules

### First candidate: Écorché

https://github.com/Charleeh/ecorche

Investigate its GLB, metadata and source licence in the **actual pinned revision** before shipping. The project has documented a segmented skeleton/muscle model; verify present-day filenames, sizes, mesh inventory, metadata and licence terms rather than relying on counts in a prior conversation. Prefer a locally bundled version; do not hotlink the model at runtime. Check whether Meshopt decoding is required if using the compressed GLB.

### Code/interaction reference: Human Atlas

https://github.com/ashemag/human-atlas

Use as an implementation/UX reference for selectable anatomy, search and layers. Do not replace the BoneVista application or copy the anatomy data without independently checking the data's terms.

### Other references

- Open Anatomy Atlas: https://github.com/CognitionLabSNUC/open-anatomy-atlas — feature inspiration; verify each dataset's licence, including possible non-commercial terms.
- MSD Manuals: https://www.msdmanuals.com/home/multimedia/3dmodel/muscular-system — UX/medical-education reference only. Do not extract or repackage its model without an explicit reuse/developer licence permitting that use.

### Required licence process

1. Inspect the current source repository's licence, attribution and asset notices before downloading or adapting.
2. Record the exact source URL, revision/release/date, licence and any modifications.
3. Add required attribution/share-alike notices to the appropriate project licence files.
4. Check compatibility with BoneVista's existing third-party assets and distribution. Do not claim the new model is covered by the root project code licence.
5. If terms are ambiguous or incompatible, do not bundle the asset; report the blocker and present the next compliant option.

## 5. Antigravity's deliverables

- UI-only components for layer presets and muscle structure list/detail presentation.
- Real accessible control states: active preset, selected row, visibility state, loading, error, empty search, and retry/return-to-bones actions.
- Responsive/scoped styling consistent with BoneVista's dark/light themes and existing typography/spacing.
- No fake buttons or mock model data presented as live data.
- A concise handoff listing exact new files, exports, expected props, tests/checks performed, and any assumptions.

Antigravity may make a standalone UI preview only if it uses clearly marked fixture data confined to a component test/demo. That fixture must never leak into the production viewer.

## 6. Codex's deliverables

- Model and licence audit with actual model metadata and verified alignment decision.
- Locally bundled licensed asset (unless the audit rejects it for clear licensing, alignment or size reasons).
- Registry and scene adapter with stable structure IDs, grouping and metadata.
- Real selection/highlighting, visibility, isolation, layer-preset and camera behavior wired to the existing workspace.
- Sidebar/view integration and connection to existing global search/shared selection state, while preserving the original Bone mode.
- Integration of Antigravity-owned UI components without editing their internals.
- Updated notices/README only after implementation facts are confirmed.
- Cross-feature regression tests and final report.

## 7. Concurrent work rules

**Preferred:** separate branches/worktrees with names such as `agent/codex-muscle-core` and `agent/antigravity-muscle-ui`. Both branches must follow the interface above. Merge the UI branch and core branch only after inspecting both diffs; resolve integration issues in a dedicated integration pass. A branch does not make identical file edits safe, so file ownership still applies.

**If both agents use the same working tree:** only proceed if the tooling supports safe concurrent edits and both agents agree on ownership first. Antigravity creates/edits only new UI-owned files; Codex edits core/scene/host wiring and licensing files. Neither edits files owned by the other. Do not make commits while the other agent has unreviewed modifications unless the tooling safely isolates them.

If an owned area turns out to overlap an existing shared file, Codex owns that file. Antigravity must express the UI change through its new components and tell Codex what host insertion is required.

## 8. Acceptance criteria

- [ ] Muscle Explorer is integrated into the current BoneVista workspace, not a separate app.
- [ ] The model is served locally and has complete, accurate attribution/licensing.
- [ ] Bones, Superficial, Deep and Bones + Muscles presets behave correctly.
- [ ] The combined view never shows two overlaid skeletons; model alignment is verified, not guessed.
- [ ] Search, structure-list selection, viewport selection where practical, highlight, visibility, isolate, clear selection and return-to-bones work.
- [ ] Stable IDs and grouped mesh mappings handle left/right structures correctly where the source supports them.
- [ ] Loading, empty and failure states are honest and recoverable.
- [ ] Existing 335-structure bone mode, global search, Spine Explorer, X-ray handling, stress mapping and GLB/OBJ/PDF exports still work.
- [ ] No new runtime hotlinks, fake controls, fabricated anatomy facts, duplicate scene/state stores or unnecessary dependencies.
- [ ] `npm run build` passes.
- [ ] `npm run test:e2e` has been run; if unavailable, the exact blocker is stated and not represented as a pass.

## 9. Copy/paste kickoff prompts

### Codex Luna High — copy this

> You are the **core/integration agent** for BoneVista Muscle Explorer, working in parallel with Antigravity Flash High. Read `README.md` and `docs/MUSCLE_EXPLORER_PARALLEL_AGENT_CONTRACT.md` first. Antigravity owns standalone UI components and scoped styles only; you own model/assets, metadata/registry, scene behavior, stable IDs, adapter/state, existing app-shell/navigation wiring, licences and final regression tests. Do not edit Antigravity-owned UI files or duplicate its components. Inspect the real repository, identify your exact files, then implement your work against Section 3's stable UI/data boundary without waiting for Antigravity. Verify the asset's real licence and model alignment before bundling/rendering it. Preserve current BoneVista functionality. Run the relevant checks you can run in your branch and report changed files, actual commands/results and remaining integration points. Do not claim the final app is complete until both branches are integrated and all acceptance criteria are checked.

### Antigravity Flash High — copy this

> You are the **UI agent** for BoneVista Muscle Explorer, working in parallel with Codex Luna High. Read `README.md` and `docs/MUSCLE_EXPLORER_PARALLEL_AGENT_CONTRACT.md` first. Codex owns the anatomy asset, data/registry, GLTF loader, scene, shared selection state, app shell/navigation, global search wiring, licensing and final integration. You own only new, isolated UI components and their scoped styles/tests. Do not edit existing app-shell/route/sidebar, scene/loader, manifest, global CSS, package files or licence files. Do not create a second viewer or state store. Implement accessible working controls and panel states using Section 3's data/callback contract, following the actual framework in the repository. Do not wait for Codex's internals; use the agreed UI boundary. Report exact new file paths, exported component names, required props/callbacks, tests actually run, and any host insertion Codex needs. Do not claim the full app is integrated until Codex wires it up and verifies it.

## 10. Final integration handoff

After both parallel slices are ready, Codex integrates the UI components, adapts the real controller/state to the agreed interface, runs the full build/e2e/regression suite, fixes problems, and updates README/licensing documents to describe only features actually implemented and verified. It must review both diffs for accidental overlap and retain a clean fallback to the original Bone mode.
