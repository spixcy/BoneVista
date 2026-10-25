import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  AlignCenter,
  Bone,
  Dumbbell,
  Brain,
  ImageUp,
  Activity,
  ClipboardList,
  Layers3,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Dashboard.module.css';

interface QuickAction {
  page: 'viewer' | 'muscles' | 'neuro' | 'spine' | 'xray' | 'stress' | 'studies';
  title: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
  art: string;
  tone: 'blue' | 'indigo' | 'purple' | 'teal' | 'violet' | 'amber' | 'emerald';
}

const actions: QuickAction[] = [
  {
    page: 'viewer',
    title: '3D Anatomy',
    detail: 'Explore the segmented reference skeleton and named atlas structures',
    icon: Bone,
    art: '/branding/3d-anatomy-card.jpg',
    tone: 'blue',
  },
  {
    page: 'muscles',
    title: 'Muscle Explorer',
    detail: 'Explore superficial and deep muscle layers with segmented anatomy',
    icon: Dumbbell,
    art: '/branding/card-muscles.jpg',
    tone: 'indigo',
  },
  {
    page: 'neuro',
    title: 'Neuro & Brain Explorer',
    detail: 'Inspect cerebral cortex lobes, neural pathways, and spinal nerves',
    icon: Brain,
    art: '/branding/card-neuro.jpg',
    tone: 'purple',
  },
  {
    page: 'spine',
    title: 'Spine Explorer',
    detail: 'Browse 26 individually isolated vertebrae and curvature segments',
    icon: AlignCenter,
    art: '/branding/card-spine.jpg',
    tone: 'teal',
  },
  {
    page: 'xray',
    title: 'X-Ray Workspace',
    detail: 'Upload and preview AP and lateral radiographs with private local tools',
    icon: ImageUp,
    art: '/branding/card-xray.jpg',
    tone: 'violet',
  },
  {
    page: 'stress',
    title: 'Stress Analysis',
    detail: 'Simulate biomechanical axial loading and Von Mises stress gradients',
    icon: Activity,
    art: '/branding/card-stress.jpg',
    tone: 'amber',
  },
  {
    page: 'studies',
    title: 'Studies & Cases',
    detail: 'Organize local inspection dossiers, radiograph series, and notes',
    icon: ClipboardList,
    art: '/branding/card-studies.jpg',
    tone: 'emerald',
  },
];

const guideHighlights = [
  { title: 'Interactive 3D Atlas', desc: 'Inspect 335 individual bones with 360° rotation & isolation.' },
  { title: 'Muscle Layering', desc: 'Toggle superficial and deep muscular fascicles with precision.' },
  { title: 'Spine Biomechanics', desc: 'Isolate cervical, thoracic, and lumbar vertebrae.' },
  { title: 'Local X-Ray Tools', desc: 'Evaluate radiographs right in your browser with zero data leaks.' },
];

const Dashboard: React.FC = () => {
  const {
    anatomyStructures,
    setActivePage,
    setViewMode,
    muscleStatus,
    setMusclePreset,
  } = useAppStore();
  const exploreRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleActionClick = (page: QuickAction['page']) => {
    if (page === 'viewer') {
      setViewMode('bone');
    } else if (page === 'muscles') {
      if (muscleStatus === 'idle') setMusclePreset('superficial');
    } else if (page === 'xray') {
      setViewMode('xray');
    } else if (page === 'stress') {
      setViewMode('stress');
    }
    setActivePage(page);
  };

  const spineCount = anatomyStructures.filter((item) =>
    /^(Atlas \(C1\)|Axis \(C2\)|Vertebra [CTL]\d+|Sacrum|Coccyx)$/.test(item.name_en)
  ).length;

  return (
    <div
      className={styles.dashboard}
      data-testid="bonevista-dashboard"
      onScroll={(event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        setScrollProgress(scrollHeight > clientHeight ? Math.round((scrollTop / (scrollHeight - clientHeight)) * 100) : 100);
      }}
    >
      <div
        className={styles.scrollProgress}
        role="progressbar"
        aria-label="Home page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={scrollProgress}
      >
        <span style={{ height: `${scrollProgress}%` }} />
      </div>

      {/* Hero Welcome Banner */}
      <section className={styles.intro}>
        <div className={styles.introBackdrop}>
          <img className={styles.introBanner} src="/branding/anatomy-hero-banner.png" alt="" aria-hidden="true" />
          <div className={styles.introVignette} />
        </div>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>YOUR ANATOMY WORKSPACE</span>
          <h1>Explore human anatomy</h1>
          <p>Interactive 3D skeletal reference atlas, deep muscular layers, neural pathways, and local radiograph inspection in one cohesive workspace.</p>
          <div className={styles.introMeta}>
            <span><Layers3 size={15}/>{anatomyStructures.length || '335'} named atlas structures</span>
            <span><Sparkles size={15}/>26 isolated spine vertebrae</span>
          </div>
          <div className={styles.introButtons}>
            <button className={styles.primaryButton} onClick={() => { setViewMode('bone'); setActivePage('viewer'); }}>
              Open 3D Anatomy <ArrowRight size={16}/>
            </button>
            <button
              className={styles.scrollCue}
              onClick={() => exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            >
              EXPLORE ALL FEATURES <ArrowDown size={13}/>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Access Grid: Full Width & Balanced */}
      <section className={styles.section} ref={exploreRef}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>QUICK ACCESS</span>
            <h2>Pick up where you want to explore</h2>
          </div>
          <span className={styles.sectionBadge}>{actions.length} Tools Available</span>
        </div>
        <div className={styles.actionGrid}>
          {actions.map(({ page, title, detail, icon: Icon, art, tone }) => (
            <button
              key={page}
              className={`${styles.actionCard} ${styles[tone]}`}
              onClick={() => handleActionClick(page)}
            >
              <div className={styles.actionText}>
                <span className={styles.actionIcon}><Icon size={18}/></span>
                <strong>{title}</strong>
                <span>{detail}</span>
                <span className={styles.actionArrow}><ArrowRight size={15}/></span>
              </div>
              {art && <img src={art} alt="" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </section>

      {/* Chotu Skeleton Guide & Project Field Companion Card */}
      <section className={styles.chotuGuideSection}>
        <div className={styles.chotuCard}>
          <div className={styles.chotuArtWrap}>
            <img
              src="/branding/learning-guide.webp"
              alt="Chotu - BoneVista skeleton guide"
              className={styles.chotuImg}
            />
            <div className={styles.chotuBadge}>
              <Sparkles size={13} />
              <span>Chotu &middot; Anatomy Companion</span>
            </div>
          </div>
          <div className={styles.chotuContent}>
            <div className={styles.chotuHeader}>
              <span className={styles.chotuEyebrow}>WHAT BONEVISTA DOES &middot; QUICK GUIDE</span>
              <h3>Explore with Chotu &middot; Learn, Explore, Grow</h3>
              <p>
                BoneVista is your personal anatomical laboratory. Built for medical students, researchers, and clinicians to dissect, analyze, and inspect the human body across multiple clinical dimensions:
              </p>
            </div>
            <div className={styles.chotuPillsGrid}>
              {guideHighlights.map((item, idx) => (
                <div key={idx} className={styles.chotuPill}>
                  <CheckCircle2 size={16} className={styles.chotuCheck} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.chotuActions}>
              <button className={styles.chotuPrimaryBtn} onClick={() => { setViewMode('bone'); setActivePage('viewer'); }}>
                <Compass size={15} /> Jump into 3D Atlas
              </button>
              <button className={styles.chotuSecondaryBtn} onClick={() => setActivePage('studies')}>
                <BookOpen size={15} /> Review Case Studies
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Overview: Reference Atlas & Studies Combined */}
      <section className={styles.overviewRow}>
        <div className={styles.atlasCard}>
          <div className={styles.overviewHeader}>
            <div className={styles.overviewIcon}><Layers3 size={20}/></div>
            <div>
              <span className={styles.eyebrow}>REFERENCE ATLAS</span>
              <h3>High-Fidelity Segmented Anatomy</h3>
            </div>
          </div>
          <p>BoneVista uses an anatomically segmented, standard reference skeleton. Each bone, muscle layer, and cranial nerve is indexable and selectable for clinical education and research.</p>
          <div className={styles.atlasStats}>
            <div className={styles.statBox}>
              <strong>{anatomyStructures.length || '335'}</strong>
              <span>Segmented Structures</span>
            </div>
            <div className={styles.statBox}>
              <strong>{spineCount || '26'}</strong>
              <span>Named Vertebrae</span>
            </div>
            <div className={styles.statBox}>
              <strong>100%</strong>
              <span>Client-Side Local</span>
            </div>
          </div>
        </div>

        <div className={styles.studiesCard}>
          <div className={styles.overviewHeader}>
            <div className={styles.overviewIconStudies}><ClipboardList size={20}/></div>
            <div>
              <span className={styles.eyebrow}>STUDIES & CASE MANAGEMENT</span>
              <h3>Clinical Inspection Dossiers</h3>
            </div>
          </div>
          <p>Organize radiographs, compare AP and lateral projections, and review biomechanical stress simulations across multiple viewing sessions.</p>
          <div className={styles.studiesActionRow}>
            <button className={styles.secondaryButton} onClick={() => setActivePage('studies')}>
              Open Studies Dossier <ArrowRight size={15}/>
            </button>
            <button className={styles.subtleButton} onClick={() => setActivePage('xray')}>
              Upload New Radiograph <ArrowRight size={14}/>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
