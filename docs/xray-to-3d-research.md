# X-ray-to-3D research note

**Recommendation: ADAPT the benchmark as a research/evaluation starting point; do not use it as a ready inference service.**

## Xrayto3D benchmark

The [NeurIPS 2023 benchmark paper](https://proceedings.neurips.cc/paper_files/paper/2023/file/412732f172bdd5ad0efde2fafa110700-Paper-Datasets_and_Benchmarks.pdf) and [official code repository](https://github.com/naamiinepal/xrayto3D-benchmark) describe biplanar AP and lateral X-rays mapped to a binary 3D segmentation for a target bone. Its four evaluated anatomies are vertebra, hip, rib, and femur. This is individual target anatomy, not a whole-body skeleton reconstruction.

The paper says the input radiographs are digitally reconstructed radiographs (DRRs) generated from CT because the authors found no public paired real X-ray and CT dataset for the task. It combines six CT segmentation datasets, provides preprocessing and evaluation tooling, and evaluates eight encoder-decoder architectures. Thus AP/LAT is the correct *view pairing*, but ordinary clinical radiographs differ from the synthetic training/evaluation domain and require external validation.

The GitHub README announced trained models in February 2024 through a SharePoint link, while its Model Zoo section still says `TODO: Add pre-trained models`. The code repository is GPL-3.0. Weight download availability, checkpoint-specific license, provenance, supported anatomy per checkpoint, and compatibility with this app were not verified. Do not redistribute or deploy those weights until their terms and checkpoints are independently checked.

The prompt's ConvNeXt plus occupancy decoder describes a different, newer research direction. The [X2BR paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC13133211/) uses ConvNeXt and an implicit occupancy field but reports single-view DRR input in its comparison table, and describes a custom CT/DRR dataset. It is not evidence that the NeurIPS benchmark's released models use ConvNeXt, nor that it accepts arbitrary patient AP/LAT radiographs.

## Fit for OsteoVision

| Question | Finding |
|---|---|
| Appropriate project target? | Useful research framework for bone-level experiments; not a whole-skeleton solution. |
| Intended anatomy? | Four individually targeted bones/anatomies: vertebra, hip, rib, femur. Vertebra support is relevant to a future spine experiment. |
| AP and lateral support? | Yes, as paired orthogonal views. Published benchmark training uses DRRs generated from CT segmentation, not ordinary paired clinical radiographs. |
| Pretrained weights? | Repository announces release via SharePoint, but README's model-zoo entry remains TODO. A directly usable checkpoint and checkpoint license are unverified. |
| Runtime fit? | The documented setup is Python/PyTorch with CUDA environment files and GPU training commands; paper reports selecting settings to fit a Titan RTX 3090. A smaller inference setup may be possible, but this was not reproduced here. |
| Output? | Binary voxel segmentation; an adapter would need orientation/scale handling and validated mesh extraction/conversion before display/export. |
| Validation? | Requires checkpoint-specific evaluation on real clinical radiographs, subgroup/failure analysis, mesh/landmark metrics, and clinical validation before any clinical claims. |

## Decision and next work

Keep the independent reference atlas usable. For an inference phase, first obtain a legally usable vertebra checkpoint and reproduce the benchmark example on its supported data. Then build a local adapter for one declared target (for example, one vertebra), verify input orientation and output coordinates, and compare against held-out CT ground truth. Until then, the app explicitly marks reconstruction unavailable and does not substitute the atlas for an output.

## Design workflow references

The pasted design-tool list is treated as guidance, not as a request to install every external agent tool. This repository establishes its own `DESIGN.md`, uses accessible native controls and responsive CSS, and includes a Playwright browser suite. The referenced design-tools guide was not accessible during research; no claims are made about its current contents. The suggested external review skills were not installed.
