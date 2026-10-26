import type { AnatomyStructure } from '../../store/appStore';

export interface Region {
  id: string;
  title: string;
  blurb: string;
  match: RegExp;
}

// Order matters: the first matching region wins (cartilage before ribs, teeth before skull…).
export const REGIONS: Region[] = [
  { id: 'cartilage', title: 'Cartilage & discs', blurb: 'Costal cartilages, intervertebral discs (annulus fibrosus around a gel-like nucleus pulposus) and the cartilages of the nose and larynx. Not bone, but modelled with the skeleton because they shape it.', match: /cartilage|disc|nucleus pulposus|meniscus|symphysis/i },
  { id: 'ligaments', title: 'Spinal & rib ligaments', blurb: 'The longitudinal ligaments, ligamenta flava, interspinous, intertransverse and nuchal ligaments stabilise the vertebral column; radiate and intra-articular ligaments bind the heads of the ribs to the vertebrae.', match: /ligament/i },
  { id: 'teeth', title: 'Teeth', blurb: '32 permanent teeth: in each quadrant 2 incisors, 1 canine, 2 premolars and 3 molars. Third molars (wisdom teeth) may be absent.', match: /incisor|canine|premolar|molar/i },
  { id: 'ossicles', title: 'Ear ossicles', blurb: 'Malleus, incus and stapes transmit sound from the tympanic membrane to the oval window. The stapes is the smallest bone in the body.', match: /malleus|incus|stapes/i },
  { id: 'skull', title: 'Skull & face', blurb: '22 bones: 8 cranial bones protecting the brain and 14 facial bones, plus the hyoid in the neck. Most are joined by immovable sutures; only the mandible moves.', match: /frontal|parietal|occipital|temporal|sphenoid|ethmoid|zygomatic|maxilla|nasal|lacrimal|palatine|vomer|concha|mandible|hyoid|sinus/i },
  { id: 'spine', title: 'Vertebral column', blurb: '26 bones in adults: 7 cervical, 12 thoracic and 5 lumbar vertebrae, the sacrum (5 fused) and the coccyx.', match: /vertebra|atlas|axis|sacrum|coccyx/i },
  { id: 'thorax', title: 'Thoracic cage', blurb: '12 pairs of ribs and the sternum (manubrium, body and xiphoid process) protect the heart and lungs and move with breathing.', match: /rib|sternum|manubrium|xiphoid/i },
  { id: 'arm', title: 'Shoulder & arm', blurb: 'The pectoral girdle (clavicle and scapula) attaches the humerus, radius and ulna to the trunk. Only the clavicle connects it to the axial skeleton.', match: /clavicle|scapula|humerus|radius|ulna/i },
  { id: 'hand', title: 'Wrist & hand', blurb: '27 bones per hand: 8 carpals in two rows, 5 metacarpals and 14 phalanges (the thumb has two).', match: /scaphoid|lunate|triquetrum|pisiform|trapezi|trapezoid|capitate|hamate|metacarpal|of hand/i },
  { id: 'pelvis', title: 'Pelvis', blurb: 'Each hip bone forms from the ilium, ischium and pubis, fused at the acetabulum. Together with the sacrum they form the pelvic ring.', match: /hip bone|pelvi/i },
  { id: 'leg', title: 'Thigh & leg', blurb: 'The femur is the longest and strongest bone. The patella sits in the quadriceps tendon; the tibia bears weight and the fibula mainly anchors muscles.', match: /femur|patella|tibia|fibula/i },
  { id: 'foot', title: 'Ankle & foot', blurb: '26 bones per foot: 7 tarsals, 5 metatarsals and 14 phalanges, plus sesamoid bones under the big toe. The talus carries the body weight onto the foot.', match: /talus|calcaneus|navicular|cuboid|cuneiform|metatarsal|of foot/i },
  { id: 'other', title: 'Other structures', blurb: 'Other skeletal structures in the atlas.', match: /.*/ },
];

// Sidebar order: bones by body region, then the non-bone structures.
const SOFT_TISSUE = new Set(['cartilage', 'ligaments', 'other']);
export const DISPLAY_REGIONS: Region[] = [
  ...REGIONS.filter((region) => region.id !== 'teeth' && region.id !== 'ossicles' && !SOFT_TISSUE.has(region.id)).flatMap((region) => (region.id === 'skull' ? [region, ...REGIONS.filter((r) => r.id === 'teeth' || r.id === 'ossicles')] : [region])),
  ...REGIONS.filter((region) => SOFT_TISSUE.has(region.id)),
];

export type Side = 'left' | 'right' | 'midline';

export interface ExplorerBone extends AnatomyStructure {
  region: Region;
  side: Side;
  label: string;
}

export const sideOf = (item: AnatomyStructure): Side => (/\.l$/.test(item.node) ? 'left' : /\.r$/.test(item.node) ? 'right' : 'midline');

export function toExplorerBones(structures: AnatomyStructure[]): ExplorerBone[] {
  return structures
    .map((item) => ({
      ...item,
      region: REGIONS.find((region) => region.match.test(item.node))!,
      side: sideOf(item),
      label: item.name_en.replace(/\s*\((left|right)\)$/i, ''),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }) || a.side.localeCompare(b.side));
}
