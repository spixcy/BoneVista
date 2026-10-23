# BoneVista Neuro & Brain Explorer — repository and asset review

Research snapshot prepared 24 October 2026. This is a shortlist for agent verification, not a guarantee that every asset is safe to bundle. The agents must inspect the exact current files and licence text before using anything.

## Recommended source strategy

Use different sources for different scales rather than trying to force one repository to cover the entire feature:

1. **Detailed brain scene:** start by auditing the existing model and manifest in Brain Project.
2. **Full-body nerve layer:** audit the separate nerves GLB in 3D Human Body Anatomy and compare it with BoneVista's exact existing skeleton source/version. If alignment is not reliable, keep this as a separate full-body scene or export the matching layer from the canonical source.
3. **Neuron Lab:** use a small procedural neuron under an MIT-compatible implementation, or carefully adapt the minimum needed from Neuro-Forge while preserving its MIT notice. Present procedural morphology as illustrative. Add real reconstructed neuron data only after checking the exact dataset's terms and provenance.

## Candidate comparison

| Source | Potential use | Licence / risk to verify | Recommendation |
|---|---|---|---|
| [Brain Project](https://github.com/itayinbarr/brainproject) | Detailed, labelled brain GLB and per-structure manifest; selectable regions and brain structures | Viewer code Apache-2.0; brain geometry/metadata CC BY-SA 4.0. Some content derives from additional atlases, so inspect included notices and any file-specific licence | First brain-model candidate; reuse assets selectively, not the whole app |
| [3D Human Body Anatomy](https://github.com/SeemaBansal1/3d-human-body-anatomy) | Separate whole-body nerves GLB; README reports 255 nerve meshes | README cites Z-Anatomy CC BY-SA 4.0 and BodyParts3D CC BY-SA 2.1 JP; currently tiny public history, so inspect asset provenance, files and coordinate frame | Candidate only; do not assume compatibility |
| [Z-Anatomy Models of Human Anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy) | Canonical source for model coverage and potentially a matching anatomy export | Z-Anatomy CC BY-SA 4.0 and separate third-party notices; check sources such as Dundee cranial nerves, Brainder/white matter, and any NC/SA terms | Strong provenance reference, possibly the best alignment path if exact version matches |
| [Neuro-Forge](https://github.com/kai9987kai/Neuro-Forge) | Procedural synthetic neuron demo, morphology parameters and Three.js ideas | Repository marks code MIT. Preserve licence if adapting code; generated morphology is synthetic, not an empirical reconstruction | Use as a code/reference candidate for Neuron Lab |
| [MorphoScope-3D](https://github.com/cvillanue/MorphoScope-3D) | SWC morphology to GLB pipeline and neuron visualization ideas | No clear code licence found during this review; its sample is a turtle cortical neuron from NeuroMorpho.Org and its axon is documented as incomplete | Reference-only until the code licence and data terms are verified |
| [NeuroMorpho.Org](https://neuromorpho.org/) | Empirical neuronal reconstructions in SWC/other formats | Check exact neuron record, source publication, attribution and terms before redistribution; don't assume every downloaded morphology has identical terms | Optional future data source |

## Important technical distinction

- A **peripheral nerve** is a macroscopic structure that belongs in a full-body anatomy scene.
- The **brain** belongs in a detailed head/brain-scale scene.
- An **individual neuron** is microscopic morphology. It must use a separate camera/scale and should not be placed as a giant neuron beside the whole-body nerve meshes without a clear mode/scale change.
- A static neuron morphology file does not contain membrane-channel properties or enough information to validate an action-potential simulation. Keep signal animations illustrative unless a proper physiological model is implemented and documented.

## License notes

- Z-Anatomy states CC BY-SA 4.0, with attribution and share-alike requirements for derivatives of its content. Its attribution list identifies additional external models and potentially different licence terms; exact items must be audited before redistribution.
- Brain Project explicitly distinguishes Apache-2.0 source code from CC BY-SA 4.0 geometry/metadata. Keeping its app code and its GLB licence separate is mandatory.
- Neuro-Forge lists MIT, which permits adaptation under the MIT conditions; include the appropriate notice if code is copied.
- Do not use model extraction from BioDigital/MSD or another hosted interactive site as a substitute for a downloadable asset licence.

## Links for agent inspection

- Brain Project README: https://github.com/itayinbarr/brainproject
- Brain Project asset licence: https://github.com/itayinbarr/brainproject/blob/main/LICENSE
- Full-body anatomy layers: https://github.com/SeemaBansal1/3d-human-body-anatomy
- Z-Anatomy model and licence: https://github.com/Z-Anatomy/Models-of-human-anatomy
- Neuro-Forge code / MIT licence: https://github.com/kai9987kai/Neuro-Forge
- MorphoScope-3D SWC/GLB reference: https://github.com/cvillanue/MorphoScope-3D
- Example NeuroMorpho record referenced by MorphoScope: https://neuromorpho.org/neuron_info.jsp?neuron_name=L20N4
- NeuroMorpho.Org portal: https://neuromorpho.org/

## Required audit output from Codex

Before marking an asset accepted, write a short provenance record containing the exact repo commit/release, filenames, file sizes/checksums, source/licence/attribution, asset-specific caveats, metadata mapping, axis/scale/transform findings, and a screenshot or test proving that it loads. If any required fact is unknown, mark that asset **not approved for redistribution** until resolved.
