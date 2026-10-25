import type React from 'react';
import { ActionPotential, CardiacConduction, NeuronConduction, ReflexArc, SlidingFilament, Synapse } from './Animations';

export interface Mcq { question: string; options: string[]; answer: number; explanation: string }

export interface NeetTopic {
  id: string;
  tab: string;
  system: string;
  title: string;
  /** Seconds for one loop of the animation. */
  period: number;
  Animation: React.FC<{ u: number }>;
  intro: string;
  /** Captions shown under the animation; `at` is the loop fraction where each step begins. */
  steps: { at: number; text: string }[];
  highYield: string[];
  mcq: Mcq;
}

export const NEET_TOPICS: NeetTopic[] = [
  {
    id: 'neuron',
    tab: 'Neuron & conduction',
    system: 'Nerve physiology',
    title: 'How a neuron fires and conducts',
    period: 4.2,
    Animation: NeuronConduction,
    intro: 'Inputs arrive on the dendrites and sum at the soma. If the axon hillock reaches threshold it fires, and the impulse races down the axon — jumping from node to node when the axon is myelinated.',
    steps: [
      { at: 0, text: 'Excitatory inputs travel along dendrites and summate at the soma (spatial and temporal summation).' },
      { at: 0.15, text: 'The axon hillock — the trigger zone with the highest density of voltage-gated Na⁺ channels — reaches threshold and fires.' },
      { at: 0.24, text: 'Saltatory conduction: the action potential is regenerated only at nodes of Ranvier, jumping across myelinated internodes.' },
      { at: 0.84, text: 'The impulse reaches the axon terminals. Below, an unmyelinated fibre has covered far less distance in the same time.' },
    ],
    highYield: [
      'Nissl bodies (rough ER) are present in the soma and dendrites but absent from the axon hillock and axon.',
      'Myelin: Schwann cells in the PNS (one cell, one internode); oligodendrocytes in the CNS (one cell myelinates many axons).',
      'Fastest fibres: Aα (≈70–120 m/s). Slowest: unmyelinated C fibres (≈0.5–2 m/s), which carry slow pain and postganglionic autonomic signals.',
      'Conduction velocity rises with axon diameter and myelination; demyelination (e.g. multiple sclerosis, Guillain–Barré) slows or blocks conduction.',
    ],
    mcq: {
      question: 'Nissl granules are absent in which part of a neuron?',
      options: ['Cell body', 'Dendrites', 'Axon hillock', 'Perinuclear cytoplasm'],
      answer: 2,
      explanation: 'Nissl substance is rough endoplasmic reticulum. It fills the soma and extends into dendrites, but the axon hillock and axon lack it — which is how the hillock is identified histologically.',
    },
  },
  {
    id: 'action-potential',
    tab: 'Action potential',
    system: 'Nerve physiology',
    title: 'The action potential, phase by phase',
    period: 5,
    Animation: ActionPotential,
    intro: 'An action potential is an all-or-none reversal of membrane potential driven by voltage-gated Na⁺ and K⁺ channels. Watch the voltage trace and the channels together.',
    steps: [
      { at: 0, text: 'Resting membrane potential ≈ −70 mV in a neuron, set mainly by K⁺ leak and maintained by the Na⁺/K⁺ ATPase.' },
      { at: 0.16, text: 'A stimulus depolarises the membrane to threshold (≈ −55 mV).' },
      { at: 0.235, text: 'Voltage-gated Na⁺ channels open: rapid Na⁺ influx drives depolarisation to about +30 mV.' },
      { at: 0.31, text: 'Na⁺ channels inactivate (inactivation gate closes) and voltage-gated K⁺ channels open: K⁺ efflux repolarises the membrane.' },
      { at: 0.44, text: 'K⁺ channels close slowly, so the membrane overshoots below rest — after-hyperpolarisation.' },
      { at: 0.58, text: 'The Na⁺/K⁺ ATPase (3 Na⁺ out, 2 K⁺ in) restores ion gradients; the membrane returns to rest.' },
    ],
    highYield: [
      'Absolute refractory period = Na⁺ channel inactivation; no stimulus can fire another action potential. Relative refractory period needs a stronger stimulus.',
      'Resting potential lies closest to the K⁺ equilibrium potential (≈ −90 mV); the peak approaches but never reaches E_Na (≈ +60 mV).',
      'Skeletal muscle rests at about −90 mV; neurons at about −70 mV.',
      'Hyperkalaemia depolarises the resting membrane; hypocalcaemia increases excitability (tetany) by lowering the threshold.',
    ],
    mcq: {
      question: 'The absolute refractory period of a nerve fibre is due to:',
      options: ['Opening of voltage-gated K⁺ channels', 'Inactivation of voltage-gated Na⁺ channels', 'Activity of the Na⁺/K⁺ ATPase', 'Closure of leak K⁺ channels'],
      answer: 1,
      explanation: 'After opening, voltage-gated Na⁺ channels enter an inactivated state and cannot reopen until the membrane repolarises. During that time no stimulus, however strong, can generate a new action potential.',
    },
  },
  {
    id: 'synapse',
    tab: 'Synapse',
    system: 'Nerve physiology',
    title: 'Chemical synaptic transmission',
    period: 8,
    Animation: Synapse,
    intro: 'At a chemical synapse an electrical signal becomes a chemical one and back again. The steps are a favourite for drug and toxin questions.',
    steps: [
      { at: 0, text: 'The action potential invades the presynaptic terminal.' },
      { at: 0.12, text: 'Voltage-gated Ca²⁺ channels open and Ca²⁺ flows into the terminal.' },
      { at: 0.24, text: 'Ca²⁺ triggers synaptic vesicles to dock and fuse with the membrane via SNARE proteins.' },
      { at: 0.46, text: 'Neurotransmitter is released by exocytosis and diffuses across the synaptic cleft (synaptic delay ≈ 0.5 ms).' },
      { at: 0.58, text: 'It binds ligand-gated receptors; cation influx produces an excitatory postsynaptic potential (EPSP).' },
      { at: 0.78, text: 'Signal termination by enzymatic breakdown (e.g. acetylcholinesterase) or reuptake into the terminal.' },
    ],
    highYield: [
      'Botulinum toxin cleaves SNARE proteins → no ACh release → flaccid paralysis. Tetanus toxin blocks GABA/glycine release from inhibitory interneurons (Renshaw cells) → spastic paralysis.',
      'Lambert–Eaton syndrome: antibodies against presynaptic voltage-gated Ca²⁺ channels; myasthenia gravis: antibodies against postsynaptic nicotinic ACh receptors.',
      'Synaptic transmission is one-way and shows synaptic delay, fatigue and summation.',
      'EPSP = depolarisation (Na⁺ influx); IPSP = hyperpolarisation (Cl⁻ influx or K⁺ efflux).',
    ],
    mcq: {
      question: 'Botulinum toxin causes paralysis by:',
      options: ['Blocking nicotinic ACh receptors', 'Inhibiting acetylcholinesterase', 'Cleaving SNARE proteins and preventing ACh release', 'Blocking voltage-gated Na⁺ channels'],
      answer: 2,
      explanation: 'Botulinum toxin is a protease that cleaves SNARE proteins (such as SNAP-25 and synaptobrevin), so vesicles cannot fuse and acetylcholine is not released — producing flaccid paralysis.',
    },
  },
  {
    id: 'reflex',
    tab: 'Reflex arc',
    system: 'Neurophysiology',
    title: 'The stretch reflex (knee jerk)',
    period: 4.5,
    Animation: ReflexArc,
    intro: 'Tapping the patellar tendon stretches the quadriceps. The stretch reflex is the only monosynaptic reflex: one synapse between the sensory and motor neuron.',
    steps: [
      { at: 0, text: 'A tap on the patellar tendon suddenly stretches the quadriceps and its muscle spindles.' },
      { at: 0.08, text: 'Group Ia afferents carry the signal through the dorsal root ganglion into the spinal cord (L3–L4).' },
      { at: 0.36, text: 'A single synapse onto the α-motor neuron in the ventral horn — the monosynaptic arc.' },
      { at: 0.44, text: 'Motor impulses travel to the quadriceps while an inhibitory interneuron relaxes the hamstrings (reciprocal inhibition).' },
      { at: 0.7, text: 'The quadriceps contracts and the leg kicks forward.' },
    ],
    highYield: [
      'Stretch reflex receptor: muscle spindle (Ia afferent). Inverse stretch reflex: Golgi tendon organ (Ib afferent), which relaxes the muscle.',
      'Reflex root values: ankle S1–S2, knee L3–L4, biceps C5–C6, triceps C7–C8.',
      'Withdrawal (flexor) reflexes are polysynaptic and include the crossed extensor response.',
      'Upper motor neuron lesion: brisk reflexes, spasticity, extensor plantar. Lower motor neuron lesion: reduced reflexes, flaccidity, wasting.',
    ],
    mcq: {
      question: 'Which of the following is a monosynaptic reflex?',
      options: ['Withdrawal reflex', 'Stretch (knee jerk) reflex', 'Crossed extensor reflex', 'Superficial abdominal reflex'],
      answer: 1,
      explanation: 'In the stretch reflex the Ia afferent from the muscle spindle synapses directly on the α-motor neuron. The others involve one or more interneurons and are polysynaptic.',
    },
  },
  {
    id: 'muscle',
    tab: 'Muscle contraction',
    system: 'Muscle physiology',
    title: 'Sliding filaments & excitation–contraction',
    period: 4.5,
    Animation: SlidingFilament,
    intro: 'Muscle shortens because thin actin filaments slide over thick myosin filaments — the filaments themselves do not change length.',
    steps: [
      { at: 0, text: 'At rest, tropomyosin covers the myosin-binding sites on actin.' },
      { at: 0.06, text: 'An action potential travels down T-tubules; DHP receptors trigger ryanodine receptors (RyR1) to release Ca²⁺ from the sarcoplasmic reticulum.' },
      { at: 0.12, text: 'Ca²⁺ binds troponin C, tropomyosin shifts, and myosin heads attach to actin — the cross-bridge cycle and power stroke begin.' },
      { at: 0.45, text: 'Z lines are pulled together: the I band and H zone shorten while the A band stays the same.' },
      { at: 0.62, text: 'Ca²⁺ is pumped back into the SR (SERCA); tropomyosin re-covers actin and the muscle relaxes.' },
    ],
    highYield: [
      'During contraction the A band is constant; the I band and H zone shorten.',
      'ATP binding detaches myosin from actin. Without ATP the cross-bridges stay locked — rigor mortis.',
      'Malignant hyperthermia: RyR1 mutation triggered by volatile anaesthetics or succinylcholine; treat with dantrolene.',
      'Skeletal muscle relies on the DHP–RyR1 mechanical coupling; cardiac muscle uses Ca²⁺-induced Ca²⁺ release.',
    ],
    mcq: {
      question: 'During skeletal muscle contraction, which band does not change in length?',
      options: ['I band', 'H zone', 'A band', 'Sarcomere'],
      answer: 2,
      explanation: 'The A band equals the length of the thick myosin filaments, which do not shorten. Sliding of the thin filaments narrows the I band and H zone and shortens the sarcomere.',
    },
  },
  {
    id: 'heart',
    tab: 'Cardiac conduction',
    system: 'Cardiovascular physiology',
    title: 'Cardiac conduction & the ECG',
    period: 3.4,
    Animation: CardiacConduction,
    intro: 'Each heartbeat starts in the SA node and spreads in a fixed sequence. Every wave on the ECG maps to one step of that journey.',
    steps: [
      { at: 0, text: 'The SA node fires — it is the natural pacemaker because it depolarises fastest (60–100 /min).' },
      { at: 0.03, text: 'Atrial depolarisation spreads across both atria → P wave.' },
      { at: 0.12, text: 'The AV node delays conduction (≈0.1 s) so the atria finish emptying → PR segment.' },
      { at: 0.26, text: 'The impulse races down the bundle of His, bundle branches and Purkinje fibres → QRS complex (ventricular depolarisation).' },
      { at: 0.4, text: 'Ventricles contract; then ventricular repolarisation produces the T wave.' },
    ],
    highYield: [
      'Conduction velocity: slowest in the AV node (≈0.05 m/s), fastest in Purkinje fibres (≈4 m/s).',
      'Normal PR interval 0.12–0.20 s; QRS duration under 0.12 s. Atrial repolarisation is hidden within the QRS.',
      'Intrinsic rates: SA node 60–100 /min, AV junction 40–60 /min, ventricular (Purkinje) 20–40 /min.',
      'Prolonged PR (> 0.20 s) = first-degree AV block.',
    ],
    mcq: {
      question: 'Conduction velocity in the heart is slowest in the:',
      options: ['SA node', 'AV node', 'Bundle of His', 'Purkinje fibres'],
      answer: 1,
      explanation: 'The AV node conducts slowly (about 0.05 m/s), creating the AV delay that lets the atria empty into the ventricles before ventricular contraction. Purkinje fibres are the fastest.',
    },
  },
];
