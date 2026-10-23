# Écorché muscle atlas asset

`ecorche.glb` is bundled locally from [Charleeh/ecorche](https://github.com/Charleeh/ecorche/tree/320805e06aee51e2e6f6b22533eb2a59d43f2d4d/model) at commit `320805e06aee51e2e6f6b22533eb2a59d43f2d4d` (2026-10-07). The source model is licensed CC BY-SA 4.0. Its full upstream license and attribution are included beside the model in `LICENSE.md`, `LICENSES/`, and `ATTRIBUTION.md`.

The Écorché model derives from BodyParts3D / DBCLS (CC BY 4.0) and Z-Anatomy by Gauthier Kervyn (CC BY-SA 4.0). Preserve those credits and the share-alike terms when redistributing the model or a mesh derivative. BoneVista serves this file as a separate atlas; it does not merge or replace `public/anatomy/`.

The GLB's source metadata identifies each mesh's name, skeleton/deep/superficial layer, side, source, and FMA identifier where present. Its skeleton layer also contains cartilage, teeth, and eye meshes; BoneVista labels and lists only entries whose source tissue is `bone`, alongside the muscle layers. BoneVista groups mesh pieces by kind, FMA identifier (or deterministic source name fallback), and side. It does not edit or save modified geometry. The viewer only recenters and scales a cloned scene at runtime for display.

The upstream model documents coordinates in metres, Y-up, facing +Z. Its GLB root carries a uniform `0.0001` scale, which the glTF loader applies. Bone and muscle meshes share the model's hierarchy and scene transform. BoneVista measures the loaded clone's bounds and applies one uniform display scale to the whole model, so the layers retain their relative transforms; it does not independently move the layers or claim cross-alignment with BoneVista's other atlas.

SHA-256: `9744d3dffced835961104447d23a781ad469588289ce322d84d000e0d498326c`
