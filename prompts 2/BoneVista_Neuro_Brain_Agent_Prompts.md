# BoneVista Neuro & Brain Explorer — copy/paste agent prompts

Use these prompts with the shared contract. Both agents work in parallel, but they own different files and responsibilities.

## Common instruction for both agents

Read these files first:

- `README.md`
- `docs/NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md`
- `docs/NEURO_BRAIN_REPOSITORY_REVIEW.md`
- This prompt file

Inspect the actual BoneVista code. The live code is authoritative if documentation differs. Do not invent file paths, framework choices, APIs, asset availability or test results. This is an addition to BoneVista, not a separate app. Work in parallel with the other named agent, respect the ownership contract and do not overwrite the other agent's changes. Keep existing BoneVista features working.

---

## Prompt A — Codex Luna High (core, models, integration)

You are the **core/data/integration owner** for the BoneVista Neuro & Brain Explorer. Antigravity Flash High is working in parallel and owns the UI components/styles. Read the shared Neuro & Brain contract and repository review before changing files.

Your responsibility is the three-mode feature core:

1. **Whole Nervous System** — integrate a verified and appropriately licensed full-body nerves/brain/spinal-cord asset if available.
2. **Brain Atlas** — integrate the detailed named brain GLB/manifest candidate only after auditing exact asset files, model source, license and notices.
3. **Neuron Lab** — provide a separately framed microscopic view. Prefer an appropriately licensed procedural neuron approach for the initial version; if using Neuro-Forge code, preserve MIT licensing. Do not bundle a MorphoScope or NeuroMorpho sample unless the relevant code/data licence and dataset terms are verified. Clearly label procedural/generated neuron geometry and any signal animation as illustrative.

### Work you own

- Inspect the actual scene loader, current Muscle Explorer, workspace navigation, global search, anatomy registries, selection/visibility state, camera helpers, exports and test commands.
- Verify the actual asset files, metadata IDs, coordinates, transforms, scale, performance/file size and file-level licensing for each selected source. Document any third-party sub-asset licences.
- Implement local asset loading (when licences permit), stable namespaced IDs, manifests/mappings, selection/highlighting, layer visibility/opacity, isolate/restore, camera fit/focus/reset, mode switching and disposal/error handling.
- Own changes to existing app-shell navigation, global search, route/scene/state integration, licence notices and regression tests.
- Provide the real data/callback interface from Section 6 of the shared contract so Antigravity's UI can connect to it. Adapt the contract to existing project conventions instead of adding an unnecessary framework or abstraction.
- Investigate why the current Muscle Explorer screenshot shows a tilted/cropped model. Fix shared camera/model-fit behavior only if you can do so without regressions; the new neuro scenes must at least be centered, correctly framed and resettable.

### Parallel rules

- Antigravity owns new UI components/styles. Do not recreate or overwrite them.
- State which existing files you own before editing. Keep your edits limited to core/data/host integration files.
- Work in a separate branch/worktree if possible. Do not let a shared working tree result in simultaneous conflicting writes.
- It is okay to build against the expected component contract while Antigravity builds UI. Coordinate through the files, not through assumptions.

### Acceptance and reporting

Run `npm run build` and relevant tests after integration. Regression-test 3D Anatomy, Muscle Explorer, Spine Explorer, X-Ray Workspace, Stress Analysis and current export paths. Report exact files changed, actual assets added, source revision/licence notices, tests and outcomes, and remaining issues. Never claim tests passed if you did not run them. If no compatible/licensed asset is verified, do not quietly ship it—report the blocker and implement only a clearly labelled safe alternative where reasonable.

Start now with a short code/asset audit and then carry out the core work in parallel with Antigravity, following the agreed contract. Avoid over-engineering.

---

## Prompt B — Antigravity Flash High (UI, layout, presentation)

You are the **UI/presentation owner** for the BoneVista Neuro & Brain Explorer. Codex Luna High is working in parallel and owns models, loaders, manifests, 3D scene/state logic, global search, navigation and final integration. Read the shared contract and repository review before coding.

Build a polished new section inside the existing BoneVista workspace that fits the current dark navy/near-black UI with restrained cyan/blue accents. Do not create a separate site, replace the current skeleton or duplicate the 3D engine.

### UI modes to support

- **Whole Nervous System** — full-body brain/spinal cord/nerve layer view where available.
- **Brain Atlas** — detailed brain-focused scene and structure list.
- **Neuron Lab** — microscopic scale view of a neuron; make the change of scale obvious and keep its own mode/context.

### UI you own

- Page shell and mode tabs.
- Layer toggle / opacity controls for layers exposed as available by the shared API.
- Search box, grouped structure catalogue, selection count, structure detail panel.
- Select/isolate/reset/focus actions as callback-driven controls.
- Loading, empty search, unavailable layer and error/retry states.
- Responsive layout, keyboard and focus accessibility, button labels, scrolling and compact styling.
- UI-level tests or a manual verification checklist as appropriate to the project's framework.

### Integration and parallel rules

- Use the shared view-props/callback contract in Section 6 of `NEURO_BRAIN_EXPLORER_PARALLEL_AGENT_CONTRACT.md`. Adapt its TypeScript-like shape to the project's real framework/style; do not invent a duplicate state store or GLTFLoader.
- You may use mock data temporarily for isolated component development, but label it as test-only and do not present the feature as complete with fake anatomy. The final UI must consume real structure/layer data.
- Do not edit Codex-owned app-shell/navigation, scene loader, manifest, model asset, global-search or selection-state files. Keep new UI and style changes in UI-owned files. If an existing file must change, explain why and ask for a clear ownership handoff instead of overwriting it.
- Start with a quick audit of current workspace components/styles and list the exact files you will own; then build in parallel without waiting for final model downloads.

Deliver the exact component export names and paths, the props/callbacks used, tests/checks run, and any remaining assumptions. Don't claim the buttons are connected until you have verified the real callbacks.

---

## Prompt C — Codex final integration/review (use after both agents finish)

Integrate the Codex core branch and Antigravity UI branch carefully. First review the exact changed-file lists and diffs. Resolve conflicts intentionally; never replace a whole file just to silence a conflict. Verify every shipped asset's licence/attribution and its provenance. Confirm all three modes use real supported scene/data behavior, not persistent mocks. Test camera framing and reset/fit, search-to-mesh mapping, scene/catalogue selection sync, layer visibility, isolate/restore, loading failures and route navigation.

Run `npm run build` and the existing test suite, add/fix tests where needed, and regression-test BoneVista's current 3D Anatomy, Muscle Explorer, Spine Explorer, X-Ray Workspace, Stress Analysis and exports. Update README/third-party notices to match verified behavior only. If model licensing or compatibility remains unresolved, remove/block that asset from the release and report the issue. Provide a concise integration report with files, checks, results and unresolved risks.

---

## Suggested parallel launch order

1. Start both agents with their own prompt at roughly the same time.
2. They each do a short read-only audit and announce their file ownership. Resolve any ownership overlap before edits.
3. Codex implements the shared data/callback interface, model core and host wiring; Antigravity builds the UI in new files against the contract at the same time.
4. Codex wires the finished UI into the host, integrates branches and runs the final test/review prompt.

For the safest setup, use separate Git branches or worktrees. Sharing a folder does not make simultaneous edits conflict-free.
