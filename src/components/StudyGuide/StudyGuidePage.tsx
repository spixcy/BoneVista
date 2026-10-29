import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bone,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Eye,
  Layers3,
  Network,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './StudyGuidePage.module.css';

type StudyPath = {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  icon: LucideIcon;
  page: 'viewer' | 'muscles' | 'neuro' | 'brain' | 'spine' | 'stress' | 'xray';
};

const studyPaths: StudyPath[] = [
  {
    title: 'Skeletal Atlas', eyebrow: 'FOUNDATION · 335+ STRUCTURES',
    description: 'Orient yourself with the axial and appendicular skeleton, then isolate individual bones in 3D.',
    image: '/branding/3d-anatomy-card.jpg', icon: Bone, page: 'viewer',
  },
  {
    title: 'Muscle Layers', eyebrow: 'FORM · ATTACHMENT · ACTION',
    description: 'Compare superficial and deep muscle layers and see how they relate to the skeleton.',
    image: '/branding/card-muscles.jpg', icon: Dumbbell, page: 'muscles',
  },
  {
    title: 'Brain Anatomy', eyebrow: '437 ATLAS STRUCTURES',
    description: 'Rotate the 3D brain atlas, isolate structures, and study the cortex, brainstem, and cerebellum.',
    image: '/branding/brain-anatomy-card.svg', icon: Brain, page: 'brain',
  },
  {
    title: 'Nervous System', eyebrow: '255 PERIPHERAL NERVES',
    description: 'Follow peripheral nerve pathways and inspect how the nervous system is organized.',
    image: '/branding/card-neuro.jpg', icon: Network, page: 'neuro',
  },
  {
    title: 'The Spine', eyebrow: 'CERVICAL · THORACIC · LUMBAR',
    description: 'Move from C1 to the coccyx and compare the regions of the vertebral column.',
    image: '/branding/card-spine.jpg', icon: Layers3, page: 'spine',
  },
  {
    title: 'Bone Biomechanics', eyebrow: 'LOAD · STRESS · RESPONSE',
    description: 'Use the educational stress model to connect applied load with a changing stress map.',
    image: '/branding/card-stress.jpg', icon: Activity, page: 'stress',
  },
  {
    title: 'Radiograph Orientation', eyebrow: 'AP · LATERAL · IMAGE TOOLS',
    description: 'Open the local X-ray workspace and learn how views and image controls are organized.',
    image: '/branding/card-xray.jpg', icon: ScanLine, page: 'xray',
  },
];

const recallCards = [
  {
    question: 'How many bones are in the typical adult skeleton, and how are they grouped?',
    answer: '206 bones: 80 in the axial skeleton and 126 in the appendicular skeleton.',
    hint: 'Think central axis, then limbs and their girdles.',
  },
  {
    question: 'What makes the axis (C2) important for head movement?',
    answer: 'The dens of C2 acts as a pivot, allowing the atlas (C1) and head to rotate.',
    hint: 'C1 rests on C2; one landmark gives the joint its pivot.',
  },
  {
    question: 'Which ribs attach directly to the sternum, and which are floating?',
    answer: 'Ribs 1–7 attach directly; 8–10 attach indirectly through cartilage; 11–12 have no anterior attachment.',
    hint: 'The groups are often called true, false, and floating ribs.',
  },
];

const StudyGuidePage: React.FC = () => {
  const [recallIndex, setRecallIndex] = useState(0);
  const [answerVisible, setAnswerVisible] = useState(false);
  const { anatomyStructures, muscleStatus, setActivePage, setMusclePreset, setNeuroMode, setViewMode } = useAppStore();
  const recall = recallCards[recallIndex];

  const openPath = (path: StudyPath) => {
    if (path.page === 'viewer') setViewMode('bone');
    if (path.page === 'muscles' && muscleStatus === 'idle') setMusclePreset('superficial');
    if (path.page === 'brain') setNeuroMode('brain-atlas');
    if (path.page === 'neuro') setNeuroMode('nervous-system');
    if (path.page === 'stress') setViewMode('stress');
    if (path.page === 'xray') setViewMode('xray');
    setActivePage(path.page);
  };

  const moveRecall = (direction: -1 | 1) => {
    setRecallIndex((index) => (index + direction + recallCards.length) % recallCards.length);
    setAnswerVisible(false);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroImage} src="/branding/anatomy-hero-banner.png" alt="" aria-hidden="true" />
        <div className={styles.heroShade} />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Sparkles size={13} /> FIELD GUIDE · BONEVISTA</span>
          <h1>Learn anatomy<br /><em>by moving through it.</em></h1>
          <p>Short study paths connect core concepts to the 3D anatomy tools. Pick a topic, explore the model, and use quick recall to check what stuck.</p>
          <div className={styles.heroMeta}>
            <span><BookOpen size={14} /> 7 guided paths</span>
            <span><Bone size={14} /> {anatomyStructures.length || 335} atlas structures</span>
            <span><Eye size={14} /> Learn in 3D</span>
          </div>
        </div>
        <img className={styles.heroBrain} src="/branding/brain-anatomy-card.svg" alt="" aria-hidden="true" />
        <span className={styles.heroBrainNote}>BRAIN ATLAS <i>·</i> 437 STRUCTURES</span>
      </section>

      <section className={styles.recall} aria-labelledby="quick-recall-title">
        <div className={styles.recallHeader}>
          <div>
            <span className={styles.eyebrow}><Sparkles size={13} /> QUICK RECALL</span>
            <h2 id="quick-recall-title">One question at a time.</h2>
          </div>
          <span className={styles.recallCount}>{String(recallIndex + 1).padStart(2, '0')} <i>/</i> {String(recallCards.length).padStart(2, '0')}</span>
        </div>
        <div className={styles.recallCard}>
          <div className={styles.recallPrompt}>
            <span className={styles.recallNumber}>0{recallIndex + 1}</span>
            <div>
              <h3>{recall.question}</h3>
              {!answerVisible && <p className={styles.recallHint}>{recall.hint}</p>}
              {answerVisible && <p className={styles.recallAnswer}><Check size={16} /> {recall.answer}</p>}
            </div>
          </div>
          <div className={styles.recallActions}>
            <button className={styles.revealButton} type="button" onClick={() => setAnswerVisible((visible) => !visible)}>
              {answerVisible ? 'Hide answer' : 'Reveal answer'} <Eye size={14} />
            </button>
            <div className={styles.recallNav}>
              <button type="button" aria-label="Previous question" onClick={() => moveRecall(-1)}><ChevronLeft size={17} /></button>
              <button type="button" aria-label="Next question" onClick={() => moveRecall(1)}><ChevronRight size={17} /></button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.paths} aria-labelledby="study-paths-title">
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>PICK A PATH</span>
            <h2 id="study-paths-title">Explore a concept in the workspace.</h2>
          </div>
          <span className={styles.pathCount}>01 — 07</span>
        </div>
        <div className={styles.pathGrid}>
          {studyPaths.map((path, index) => {
            const Icon = path.icon;
            return (
              <button className={styles.pathCard} type="button" key={path.title} onClick={() => openPath(path)}>
                <img className={styles.pathImage} src={path.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                <span className={styles.pathScrim} />
                <span className={styles.pathIndex}>0{index + 1}</span>
                <span className={styles.pathIcon}><Icon size={17} /></span>
                <span className={styles.pathCopy}>
                  <span className={styles.pathEyebrow}>{path.eyebrow}</span>
                  <strong>{path.title}</strong>
                  <span className={styles.pathDescription}>{path.description}</span>
                  <span className={styles.pathLink}>Explore module <ArrowRight size={14} /></span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className={styles.note}>
        <span className={styles.noteIcon}><Activity size={17} /></span>
        <p><strong>For learning and exploration.</strong> BoneVista’s models and stress tools are educational visualizations, not diagnostic or treatment tools.</p>
      </aside>
    </main>
  );
};

export default StudyGuidePage;
