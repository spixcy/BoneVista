export type TopicId = 'cells' | 'structure' | 'osteon' | 'growth' | 'remodel' | 'fracture' | 'clinical';

export interface Topic {
  id: TopicId;
  tab: string;
  title: string;
  intro: string;
  hint: string;
  facts: { title: string; text: string }[];
  highYield: string[];
}

export const KEY_NUMBERS = [
  { value: '206', label: 'Bones in the adult skeleton (80 axial, 126 appendicular)' },
  { value: '≈99%', label: 'Of total body calcium is stored in bone' },
  { value: '≈60–70%', label: 'Of bone weight is mineral (hydroxyapatite)' },
  { value: '≈10%', label: 'Of the adult skeleton is remodelled each year' },
];

export const TOPICS: Topic[] = [
  {
    id: 'cells',
    tab: 'Cells & matrix',
    title: 'Bone is living tissue',
    intro: 'Bone is a composite: an organic scaffold of type I collagen stiffened by hydroxyapatite crystals, built and broken down by four cell types that talk to each other constantly.',
    hint: 'A slice of bone surface: osteoblasts lay down osteoid on the left, osteocytes sit in lacunae below, and an osteoclast resorbs a pit on the right.',
    facts: [
      { title: 'Organic matrix (osteoid)', text: '≈90% type I collagen plus non-collagenous proteins such as osteocalcin, osteonectin and osteopontin. Collagen gives tensile strength and a little flexibility.' },
      { title: 'Inorganic matrix', text: 'Hydroxyapatite, Ca₁₀(PO₄)₆(OH)₂, deposited along collagen fibrils. Mineral provides stiffness and compressive strength.' },
      { title: 'Osteoblasts', text: 'Derive from mesenchymal stem cells (RUNX2-dependent). Secrete osteoid and alkaline phosphatase, drive mineralisation, and express RANKL to switch on osteoclasts.' },
      { title: 'Osteocytes', text: 'Osteoblasts that became trapped in their own matrix. They make up ≈90–95% of bone cells, sit in lacunae, link through canaliculi and act as mechanosensors. They secrete sclerostin (inhibits formation) and FGF23.' },
      { title: 'Osteoclasts', text: 'Large multinucleated cells from the monocyte–macrophage lineage (need M-CSF and RANKL). A sealed ruffled border secretes H⁺ (carbonic anhydrase II, proton pumps) and cathepsin K into a Howship lacuna.' },
      { title: 'Bone-lining cells', text: 'Flattened, quiescent osteoblast-lineage cells covering inactive surfaces. They can be reactivated to start a new remodelling cycle.' },
    ],
    highYield: [
      'Formation markers: bone-specific ALP, osteocalcin, P1NP. Resorption markers: CTX, NTX, TRAP.',
      'Osteoclasts stain TRAP-positive; carbonic anhydrase II deficiency → osteopetrosis.',
      'Sclerostin inhibits Wnt signalling; romosozumab (anti-sclerostin) increases bone formation.',
    ],
  },
  {
    id: 'structure',
    tab: 'Long bone',
    title: 'Anatomy of a long bone',
    intro: 'A long bone is a hollow tube of dense compact bone, flared at each end into spongy bone covered by articular cartilage. The cut-away shows how the tissue changes along its length.',
    hint: 'A quarter has been cut away. Drag to orbit. The top end shows a growing (child) physis; the bottom end shows the fused adult epiphyseal line.',
    facts: [
      { title: 'Regions', text: 'Diaphysis (shaft), metaphysis (flared region next to the physis), epiphysis (end, forms the joint), and the physis or growth plate between epiphysis and metaphysis.' },
      { title: 'Compact (cortical) bone', text: '≈80% of skeletal mass. Thick in the diaphysis to resist bending and torsion; organised into osteons.' },
      { title: 'Spongy (cancellous) bone', text: '≈20% of mass but a much larger surface area and higher turnover. Trabeculae align along lines of stress and hold red marrow.' },
      { title: 'Periosteum & endosteum', text: 'Periosteum has an outer fibrous layer and an inner osteogenic (cambium) layer, anchored by Sharpey fibres; it is richly innervated and absent over articular cartilage. Endosteum lines the medullary cavity.' },
      { title: 'Marrow', text: 'Red marrow is haematopoietic; in adults it persists mainly in the axial skeleton and proximal femur and humerus. Yellow (fatty) marrow fills the adult diaphysis.' },
      { title: 'Blood supply', text: 'The nutrient artery enters through the nutrient foramen and supplies the marrow and inner ≈2/3 of the cortex; periosteal vessels supply the outer third. Metaphyseal and epiphyseal arteries supply the ends.' },
    ],
    highYield: [
      'Shapes: long (femur), short (carpals), flat (skull vault, sternum), irregular (vertebrae), sesamoid (patella).',
      'Metaphysis is a common site for haematogenous osteomyelitis in children and for many primary bone tumours.',
      'Periosteal stripping or loss of the nutrient artery compromises fracture healing.',
    ],
  },
  {
    id: 'osteon',
    tab: 'Osteon',
    title: 'The osteon (Haversian system)',
    intro: 'Compact bone is built from cylindrical osteons running along the long axis of the bone. Each is a column of concentric lamellae wrapped around a central neurovascular canal.',
    hint: 'One osteon with a wedge removed. Concentric lamellae surround the central canal; osteocytes sit between lamellae and connect through canaliculi.',
    facts: [
      { title: 'Central (Haversian) canal', text: 'Carries an arteriole, a venule and nerve fibres along the length of the osteon.' },
      { title: 'Concentric lamellae', text: 'Collagen fibres in successive lamellae run in alternating helical directions — like plywood — which resists torsion.' },
      { title: 'Lacunae & canaliculi', text: 'Osteocytes occupy lacunae between lamellae. Their processes run through canaliculi, connecting cells to each other and to the central canal for nutrients and signalling.' },
      { title: 'Perforating (Volkmann) canals', text: 'Run perpendicular to osteons, linking central canals with each other, the periosteum and the marrow cavity.' },
      { title: 'Cement line', text: 'The boundary of each osteon. Interstitial lamellae between osteons are remnants of older, partly remodelled osteons.' },
      { title: 'Woven vs lamellar bone', text: 'Woven bone has disorganised collagen and is laid down quickly (fetus, fracture callus, Paget disease, tumours). It is later replaced by stronger lamellar bone.' },
    ],
    highYield: [
      'Osteons are formed by remodelling: osteoclasts drill a cutting cone, osteoblasts refill it as concentric lamellae.',
      'Circumferential lamellae line the outer (periosteal) and inner (endosteal) surfaces of the cortex.',
      'Spongy bone has no true osteons; trabecular cells are nourished by diffusion from the marrow.',
    ],
  },
  {
    id: 'growth',
    tab: 'Growth plate',
    title: 'Ossification & the growth plate',
    intro: 'Bones form either directly from mesenchyme (intramembranous) or by replacing a hyaline cartilage model (endochondral). Long bones lengthen at the physis, where cartilage is continuously made and turned into bone.',
    hint: 'A block of growth plate. Read it from the epiphysis (top) down to the metaphysis (bottom): cells rest, stack into columns, swell, calcify, then are replaced by bone.',
    facts: [
      { title: 'Intramembranous ossification', text: 'Mesenchymal cells differentiate directly into osteoblasts. Forms the flat bones of the skull vault, most facial bones, much of the mandible and most of the clavicle.' },
      { title: 'Endochondral ossification', text: 'A hyaline cartilage model is replaced by bone. The primary ossification centre appears in the diaphysis in fetal life; secondary centres appear in the epiphyses, mostly after birth.' },
      { title: 'Zones of the physis', text: 'Reserve (resting) → proliferative (chondrocytes divide and stack in columns) → hypertrophic (cells enlarge, matrix prepares to calcify) → calcification → ossification (vessels invade, osteoblasts lay bone on calcified cartilage).' },
      { title: 'Growth in length & width', text: 'Length comes from interstitial growth at the physis. Width comes from appositional growth: periosteal osteoblasts add bone while endosteal osteoclasts enlarge the marrow cavity.' },
      { title: 'Closure', text: 'At the end of puberty oestrogen (in both sexes) drives physeal closure, leaving an epiphyseal line.' },
    ],
    highYield: [
      'Achondroplasia: activating FGFR3 mutation impairs endochondral growth — short limbs, normal head size (intramembranous bone is spared).',
      'Rickets affects the hypertrophic/calcification zones → widened, frayed physes.',
      'Salter–Harris fractures involve the physis and can arrest growth.',
    ],
  },
  {
    id: 'remodel',
    tab: 'Remodelling',
    title: 'Remodelling & calcium balance',
    intro: 'Throughout life, basic multicellular units (BMUs) of osteoclasts and osteoblasts replace old bone. Remodelling repairs microdamage, adapts bone to load and releases calcium on demand.',
    hint: 'A basic multicellular unit at work: osteoclasts dig a trench as they move, and osteoblasts follow behind to refill it with osteoid that then mineralises.',
    facts: [
      { title: 'The cycle', text: 'Activation → resorption (≈2–4 weeks) → reversal → formation (≈3–4 months) → mineralisation → quiescence. Formation is coupled to resorption so bone mass stays balanced in health.' },
      { title: 'RANKL / RANK / OPG', text: 'Osteoblasts and osteocytes express RANKL, which binds RANK on osteoclast precursors and drives their formation (with M-CSF). Osteoprotegerin (OPG) is a decoy receptor that blocks RANKL.' },
      { title: 'Parathyroid hormone', text: 'Raises serum calcium: increases RANKL (indirect osteoclast activation), renal calcium reabsorption and renal 1α-hydroxylase. Continuous PTH is catabolic; intermittent PTH (teriparatide) is anabolic.' },
      { title: 'Vitamin D (calcitriol)', text: 'Increases intestinal absorption of calcium and phosphate, which is needed to mineralise osteoid.' },
      { title: 'Calcitonin', text: 'From thyroid parafollicular C cells; inhibits osteoclasts. Its physiological role in adult humans is minor.' },
      { title: "Mechanical loading (Wolff's law)", text: 'Bone adapts to the loads placed on it: osteocytes sense strain and reduce sclerostin, allowing formation. Immobilisation and microgravity cause rapid bone loss.' },
    ],
    highYield: [
      'Oestrogen lowers RANKL and raises OPG — its loss after menopause tips the balance toward resorption.',
      'Denosumab = anti-RANKL antibody; bisphosphonates bind hydroxyapatite and inhibit osteoclasts.',
      'Primary hyperparathyroidism can cause osteitis fibrosa cystica ("brown tumours").',
    ],
  },
  {
    id: 'fracture',
    tab: 'Fracture healing',
    title: 'How a fracture heals',
    intro: 'Most fractures heal by secondary (indirect) healing through a callus that recapitulates endochondral ossification. With rigid fixation and absolute stability, bone can heal directly without a callus.',
    hint: 'Step through the four stages of secondary healing with the buttons at the top of the viewer.',
    facts: [
      { title: '1 · Haematoma & inflammation', text: 'Hours to days. Torn vessels form a haematoma; inflammatory cells release cytokines that recruit mesenchymal stem cells.' },
      { title: '2 · Soft (fibrocartilaginous) callus', text: 'About 2–3 weeks. Granulation tissue is replaced by fibrocartilage that bridges the gap and gives early stability.' },
      { title: '3 · Hard (bony) callus', text: 'Weeks to months. Endochondral ossification converts the soft callus into woven bone; the fracture becomes clinically united.' },
      { title: '4 · Remodelling', text: 'Months to years. Woven bone is replaced by lamellar bone and the callus is reshaped toward the original contour along lines of stress.' },
      { title: 'Primary (direct) healing', text: 'With anatomical reduction and rigid fixation, cutting cones cross the fracture line and lay down new osteons directly — no visible callus.' },
    ],
    highYield: [
      'Impaired healing: smoking, diabetes, malnutrition, infection, excessive motion and poor blood supply.',
      'Scaphoid (retrograde supply) and femoral neck fractures risk avascular necrosis.',
      'Union is clinical (no pain or motion) plus radiological (bridging callus on several cortices).',
    ],
  },
  {
    id: 'clinical',
    tab: 'Clinical',
    title: 'Clinical correlations',
    intro: 'Most metabolic bone diseases are easier to remember once you place them on the cycle: too little bone made, too much removed, poor mineralisation, or defective matrix.',
    hint: 'Two cubes of trabecular bone. Left: normal, with thick, connected trabeculae. Right: osteoporotic, with thin, perforated and disconnected trabeculae.',
    facts: [
      { title: 'Osteoporosis', text: 'Reduced bone mass with normal mineralisation. Serum Ca, PO₄, ALP and PTH are normal. DEXA T-score ≤ −2.5. Fragility fractures of vertebral bodies, hip and distal radius.' },
      { title: 'Osteomalacia / rickets', text: 'Defective mineralisation of osteoid, usually from vitamin D deficiency. Low or normal Ca, low PO₄, high ALP and high PTH. Rickets in children: bowed legs, rachitic rosary, widened physes.' },
      { title: 'Osteogenesis imperfecta', text: 'Defective type I collagen (usually COL1A1/COL1A2, autosomal dominant). Multiple fractures with minimal trauma, blue sclerae, hearing loss, dentinogenesis imperfecta.' },
      { title: 'Paget disease of bone', text: 'Disordered remodelling: lytic → mixed → sclerotic phases produce thick but weak woven bone with a mosaic pattern. Isolated raised ALP with normal Ca and PO₄.' },
      { title: 'Osteopetrosis', text: 'Failure of osteoclast resorption (e.g. carbonic anhydrase II deficiency). Dense but brittle bones, marrow failure and cranial nerve compression.' },
      { title: 'Achondroplasia', text: 'Activating FGFR3 mutation (autosomal dominant, often de novo with advanced paternal age). Impaired endochondral ossification with normal intramembranous growth.' },
    ],
    highYield: [
      'Osteoporosis = less bone; osteomalacia = soft bone (poorly mineralised).',
      'Paget disease: risk of high-output heart failure and osteosarcoma; treat with bisphosphonates.',
      'Vertebral compression fractures cause loss of height and kyphosis.',
    ],
  },
];
