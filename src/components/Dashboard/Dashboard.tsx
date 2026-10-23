import React, { useRef, useState } from 'react';
import { ArrowDown, ArrowRight, Bone, Layers3, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Dashboard.module.css';

const actions = [
  { page: 'viewer', title: '3D Anatomy', detail: 'Explore the segmented reference atlas', icon: Bone, art: '/branding/bonevista-mascot.webp', tone: 'blue' },
] as const;

const Dashboard: React.FC = () => {
  const { anatomyStructures, setActivePage } = useAppStore();
  const exploreRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const spineCount = anatomyStructures.filter((item) => /^(Atlas \(C1\)|Axis \(C2\)|Vertebra [CTL]\d+|Sacrum|Coccyx)$/.test(item.name_en)).length;
  return <div className={styles.dashboard} data-testid="bonevista-dashboard" onScroll={(event) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setScrollProgress(scrollHeight > clientHeight ? Math.round(scrollTop / (scrollHeight - clientHeight) * 100) : 100);
  }}>
    <div className={styles.scrollProgress} role="progressbar" aria-label="Home page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scrollProgress}><span style={{ height: `${scrollProgress}%` }} /></div>
    <section className={styles.intro}>
      <img className={styles.introBanner} src="/branding/anatomy-hero-banner.png" alt="" aria-hidden="true" />
      <div className={styles.introCopy}>
        <span className={styles.eyebrow}>YOUR ANATOMY WORKSPACE</span>
        <h1>Explore human anatomy</h1>
        <p>Learn from a segmented skeletal atlas, inspect the spine, and preview radiographs in one workspace.</p>
        <div className={styles.introMeta}><span><Layers3 size={15}/>{ anatomyStructures.length || '…'} named atlas structures</span><span><ShieldCheck size={15}/>Images stay in this browser</span></div>
        <button className={styles.primaryButton} onClick={() => setActivePage('viewer')}>Open 3D Anatomy <ArrowRight size={16}/></button>
        <button className={styles.scrollCue} onClick={() => exploreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>SCROLL TO EXPLORE <ArrowDown size={13}/></button>
      </div>
    </section>

    <div className={styles.dashboardGrid}>
      <main className={styles.mainColumn}>
        <section className={styles.section} ref={exploreRef}>
          <div className={styles.sectionHeading}><div><span className={styles.eyebrow}>QUICK ACCESS</span><h2>Pick up where you want to explore</h2></div></div>
          <div className={styles.actionGrid}>{actions.map(({ page, title, detail, icon: Icon, art, tone }) => <button key={page} className={`${styles.actionCard} ${styles[tone]}`} onClick={() => setActivePage(page)}>
            <div className={styles.actionText}><span className={styles.actionIcon}><Icon size={17}/></span><strong>{title}</strong><span>{detail}</span><span className={styles.actionArrow}><ArrowRight size={15}/></span></div>
            <img src={art} alt="" aria-hidden="true"/>
          </button>)}</div>
        </section>

        <section className={styles.atlasPanel}>
          <div className={styles.atlasPanelIcon}><Layers3 size={19}/></div>
          <div className={styles.atlasPanelCopy}><span className={styles.eyebrow}>REFERENCE ATLAS</span><h2>Built for careful exploration</h2><p>BoneVista uses a generalized, segmented reference skeleton. It does not represent a patient or create a diagnosis.</p></div>
          <div className={styles.atlasStats}><div><strong>{anatomyStructures.length || '…'}</strong><span>structures</span></div><div><strong>{spineCount || '…'}</strong><span>spine meshes</span></div></div>
        </section>

        <section className={styles.emptyStudies}>
          <div><span className={styles.eyebrow}>STUDIES</span><h2>No saved studies yet</h2><p>This prototype does not store patient studies. Uploaded images remain local and are only previewed.</p></div>
          <button className={styles.secondaryButton} onClick={() => setActivePage('xray')}>Open X-Ray Workspace <ArrowRight size={15}/></button>
        </section>
      </main>

      <aside className={styles.sideColumn}>
        <section className={styles.guideCard}>
          <img src="/branding/learning-guide.webp" alt="BoneVista mascot learning anatomy"/>
          <div><span className={styles.eyebrow}>A NOTE FROM YOUR GUIDE</span><p>Small steps. Big discoveries.</p></div>
        </section>
        <section className={styles.statusCard}><div className={styles.statusMark}><ShieldCheck size={16}/></div><div><strong>Private by default</strong><p>Radiograph previews are created locally. No image upload or AI inference is configured.</p></div></section>
      </aside>
    </div>
  </div>;
};

export default Dashboard;

