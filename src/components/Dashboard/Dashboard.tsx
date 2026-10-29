import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  AlignCenter,
  Bone,
  Dumbbell,
  Brain,
  Network,
  ImageUp,
  Activity,
  Layers3,
  Sparkles,
  BookOpen,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Dashboard.module.css';

interface QuickAction {
  page: 'viewer' | 'muscles' | 'neuro' | 'brain' | 'spine' | 'xray' | 'stress' | 'studies';
  title: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
  art: string;
  tone: 'blue' | 'indigo' | 'purple' | 'teal' | 'violet' | 'amber';
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
    title: 'Neuro Explorer',
    detail: 'Follow neural pathways and explore the peripheral nervous system',
    icon: Network,
    art: '/branding/card-neuro.jpg',
    tone: 'purple',
  },
  {
    page: 'brain',
    title: 'Brain Anatomy',
    detail: 'Open the 3D brain atlas directly and explore cerebral structures',
    icon: Brain,
    art: '/branding/brain-anatomy-card.svg',
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
    detail: 'Simulate biomechanical axial loading and stress color gradients',
    icon: Activity,
    art: '/branding/card-stress.jpg',
    tone: 'amber',
  },
  {
    page: 'studies',
    title: 'Anatomy Study Guide',
    detail: 'Review key concepts and follow guided paths into the atlas',
    icon: BookOpen,
    art: '/branding/card-studies.jpg',
    tone: 'blue',
  },
];

const Dashboard: React.FC = () => {
  const {
    anatomyStructures,
    setActivePage,
    setViewMode,
    setNeuroMode,
    muscleStatus,
    setMusclePreset,
  } = useAppStore();
  const exploreRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleActionClick = (action: QuickAction) => {
    const { page } = action;
    if (page === 'viewer') {
      setViewMode('bone');
    } else if (page === 'muscles') {
      if (muscleStatus === 'idle') setMusclePreset('superficial');
    } else if (page === 'brain') {
      setNeuroMode('brain-atlas');
    } else if (page === 'neuro') {
      setNeuroMode('nervous-system');
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
          <img className={styles.introBanner} decoding="async" src="/branding/anatomy-hero-banner.png" alt="" aria-hidden="true" />
          <div className={styles.introVignette} />
        </div>
        <div className={styles.introCopy}>
          <span className={styles.eyebrow}>YOUR ANATOMY WORKSPACE</span>
          <h1>Explore Human Anatomy in 3D</h1>
          <p>Segmented 3D skeletal atlas, muscle layers, neural pathways, and local radiograph suite in one unified environment.</p>
          <div className={styles.introMeta}>
            <span><Layers3 size={13} /> {anatomyStructures.length || '335'} Atlas Structures</span>
            <span><Sparkles size={13} /> {spineCount || '26'} Isolated Vertebrae</span>
            <span><ShieldCheck size={13} /> 100% Client-Side Private</span>
          </div>
        </div>
        <div className={styles.introCtaWrap}>
          <button
            className={styles.primaryButton}
            onClick={() => { setViewMode('bone'); setActivePage('viewer'); }}
          >
            Open 3D Anatomy <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Quick Access Grid: Balanced & Comfortable */}
      <section className={styles.section} ref={exploreRef}>
        <div className={styles.sectionHeading}>
          <div>
            <span className={styles.eyebrow}>QUICK ACCESS</span>
            <h2>Pick up where you want to explore</h2>
          </div>
          <span className={styles.sectionBadge}>{actions.length} Tools Available</span>
        </div>
        <div className={styles.actionGrid}>
          {actions.map((action) => {
            const { page, title, detail, icon: Icon, art, tone } = action;
            return (
              <button
                key={title}
                className={`${styles.actionCard} ${styles[tone]}`}
                onClick={() => handleActionClick(action)}
              >
                <div className={styles.actionText}>
                  <span className={styles.actionIcon}><Icon size={18} /></span>
                  <strong>{title}</strong>
                  <span>{detail}</span>
                  <span className={styles.actionArrow}><ArrowRight size={14} /></span>
                </div>
                {art && <img loading="lazy" decoding="async" src={art} alt="" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Chotu Skeleton Guide & Companion Card */}
      <section className={styles.chotuGuideSection}>
        <div className={styles.chotuCard}>
          <div className={styles.chotuArtWrap}>
            <img
              src="/branding/learning-guide.webp"
              alt="Chotu - BoneVista anatomy companion"
              className={styles.chotuImg}
            />
            <div className={styles.chotuBadge}>
              <Sparkles size={12} />
              <span>Chotu &middot; Companion</span>
            </div>
          </div>
          <div className={styles.chotuContent}>
            <div className={styles.chotuText}>
              <span className={styles.chotuEyebrow}>FIELD GUIDE &middot; COMPANION</span>
              <h3>Meet Chotu, Your Anatomy Companion</h3>
              <p>
                Use short study paths to connect anatomy concepts with the 3D atlas, spine, muscle, brain, and biomechanics tools.
              </p>
            </div>
            <div className={styles.chotuActions}>
              <button className={styles.chotuPrimaryBtn} onClick={() => { setViewMode('bone'); setActivePage('viewer'); }}>
                <Compass size={14} /> Jump into 3D Atlas
              </button>
              <button className={styles.chotuSecondaryBtn} onClick={() => setActivePage('studies')}>
                <BookOpen size={14} /> Open Study Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Overview: Reference Atlas & Study Guide */}
      <section className={styles.overviewRow}>
        <div className={styles.atlasCard}>
          <div className={styles.overviewHeader}>
            <div className={styles.overviewIcon}><Layers3 size={16} /></div>
            <div>
              <span className={styles.eyebrow}>REFERENCE ATLAS</span>
              <h4>High-Fidelity Segmented Anatomy</h4>
            </div>
          </div>
          <p>Segmented standard reference skeleton with indexed, selectable bone and muscle hierarchies.</p>
          <div className={styles.atlasStatsCompact}>
            <span className={styles.statPill}><strong>{anatomyStructures.length || '335'}</strong> Structures</span>
            <span className={styles.statPill}><strong>{spineCount || '26'}</strong> Vertebrae</span>
            <span className={styles.statPill}><strong>100%</strong> Local</span>
          </div>
        </div>

        <div className={styles.studiesCard}>
          <div className={styles.overviewHeader}>
            <div className={styles.overviewIconStudies}><BookOpen size={16} /></div>
            <div>
              <span className={styles.eyebrow}>STUDY PATHS</span>
              <h4>Guided Anatomy Learning</h4>
            </div>
          </div>
          <p>Build a learning route from core skeletal landmarks to muscles, nerves, imaging, and biomechanics.</p>
          <div className={styles.studiesActionRowCompact}>
            <button className={styles.secondaryButton} onClick={() => setActivePage('studies')}>
              Open Study Guide <ArrowRight size={13} />
            </button>
            <button className={styles.subtleButton} onClick={() => setActivePage('spine')}>
              Explore the Spine <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
