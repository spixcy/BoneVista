import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, animate, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Activity, ArrowRight, Bone, BookOpen, Brain, ChevronDown, Cpu, Download, Gauge, Layers, Lock, Maximize2, Minimize2, Moon, MousePointerClick, Rows3, ScanLine, Search, ShieldCheck, Sparkles, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import ViewerToolbar from './components/ViewerToolbar/ViewerToolbar';
import AnatomyPanel from './components/AnatomyPanel/AnatomyPanel';
import { filterNeuroStructures } from './data/neuroAtlas';
import { WorkspaceVisibleContext } from './hooks/useWorkspaceVisible';
import BoneBiology from './components/BoneBiology/BoneBiology';
import { useAppStore } from './store/appStore';
import styles from './App.module.css';
import landing from './LandingPage.module.css';

// Lazy-load heavy pages
const Viewport3D     = lazy(() => import('./components/Viewport3D/Viewport3D'));
const SpineExplorer  = lazy(() => import('./components/SpineExplorer/SpineExplorer'));
const XrayWorkspace  = lazy(() => import('./components/XrayWorkspace/XrayWorkspace'));
const StressAnalysis = lazy(() => import('./components/StressAnalysis/StressAnalysis'));
const Dashboard      = lazy(() => import('./components/Dashboard/Dashboard'));
const MuscleExplorerHost = lazy(() => import('./components/MuscleExplorer/MuscleExplorerHost'));
const NeuroExplorerDataHost = lazy(() => import('./components/NeuroExplorer/NeuroExplorerDataHost'));
const NeuroExplorerPage = lazy(() => import('./components/NeuroExplorer/NeuroExplorerPage'));
const SkullModel3D = lazy(() => import('./components/SkullModel3D/SkullModel3D'));
const ScannerTarget3D = lazy(() => import('./components/ScannerTarget3D/ScannerTarget3D'));

type Page = ReturnType<typeof useAppStore.getState>['activePage'];

const EASE = [0.22, 0.8, 0.24, 1] as const;

const STATS = [
  { value: 335, suffix: '+', label: 'Segmented bones' },
  { value: 437, suffix: '', label: 'Brain structures' },
  { value: 255, suffix: '', label: 'Peripheral nerves' },
  { value: 100, suffix: '%', label: 'Runs in your browser' },
];

const MODULES: { page: Page; icon: LucideIcon; title: string; tag: string; text: string }[] = [
  { page: 'viewer', icon: Bone, title: 'Skeletal Atlas', tag: '335+ bones', text: 'Rotate a fully segmented reference skeleton, isolate any bone with one click and view it from six camera presets.' },
  { page: 'muscles', icon: Layers, title: 'Muscle Explorer', tag: 'Écorché model', text: 'Peel back superficial and deep muscle layers, or combine them with the skeleton to see how they attach.' },
  { page: 'neuro', icon: Brain, title: 'Neuro & Brain', tag: '44 pathways', text: 'Browse 437 cerebral structures and 255 peripheral nerves grouped into functional pathways.' },
  { page: 'spine', icon: Rows3, title: 'Spine Explorer', tag: 'C1 – Coccyx', text: 'Filter the vertebral column by region — cervical, thoracic, lumbar, sacrum — synced live with the 3D view.' },
  { page: 'stress', icon: Gauge, title: 'Stress Analysis', tag: '1D axial FEA', text: 'Apply loads and watch a direct-stiffness solver colour the bone with a live 0–10 MPa stress heatmap.' },
  { page: 'xray', icon: ScanLine, title: 'X-Ray Studio', tag: 'AP + Lateral', text: 'Open radiographs side by side with zoom, rotation and contrast controls — processed locally, never uploaded.' },
];

const STEPS = [
  { icon: MousePointerClick, title: 'Pick a module', text: 'Choose the skeleton, muscles, nervous system, spine, stress lab or X-ray studio from the sidebar.' },
  { icon: Activity, title: 'Explore & isolate', text: 'Orbit, zoom and search by English or Latin name. Click a structure to isolate it and read its details.' },
  { icon: Download, title: 'Capture & export', text: 'Save the current model as GLB or OBJ, or export a PDF snapshot for notes and study sessions.' },
];

const PILLARS = [
  { icon: BookOpen, title: 'Built for learning', text: 'Designed for students, educators and researchers who want to understand form and function in three dimensions.' },
  { icon: Lock, title: 'Private by design', text: 'Everything runs on your machine. Your images and selections never leave the browser.' },
  { icon: ShieldCheck, title: 'Open anatomical data', text: 'Reference meshes come from Z-Anatomy and BodyParts3D, published under CC BY-SA 4.0.' },
];

const FAQ = [
  { q: 'What is BoneVista?', a: 'BoneVista is a browser-based 3D anatomy workspace. It combines a segmented skeleton, muscle layers, brain and nerve atlases, a spine explorer, an educational stress solver and an X-ray viewer in one place.' },
  { q: 'Is it a medical or diagnostic tool?', a: 'No. BoneVista is an educational and research prototype. It is not a medical device and must not be used for diagnosis or treatment planning.' },
  { q: 'Do my X-ray images get uploaded anywhere?', a: 'No. Radiographs are opened and processed locally in your browser session. An optional reconstruction service can be run on your own machine, but nothing is sent to a remote server.' },
  { q: 'Where does the anatomy data come from?', a: 'The 3D meshes are based on the open Z-Anatomy and BodyParts3D datasets, licensed under CC BY-SA 4.0.' },
  { q: 'What do I need to run it?', a: 'A modern desktop browser with WebGL 2 — recent Chrome, Edge, Firefox or Safari. A dedicated GPU helps with the larger muscle and brain models.' },
];

const MARQUEE = ['Skeletal Atlas', 'Écorché Muscles', 'Brain Atlas', 'Peripheral Nerves', 'Spine Explorer', 'Axial FEA', 'Bi-Planar X-Ray', 'GLB · OBJ · PDF Export'];

const PageSkeleton: React.FC = () => (
  <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[240, 180, 120, 160].map((w, i) => (
      <div key={i} className="skeleton" style={{ width: w, height: 18, borderRadius: 6 }} />
    ))}
  </div>
);

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => (
  <motion.div className={className} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9, delay, ease: EASE }}>
    {children}
  </motion.div>
);

/** Counts up to `value` once visible, writing straight to the DOM to avoid re-renders. */
const CountUp: React.FC<{ value: number; suffix: string }> = ({ value, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const node = ref.current;
    const controls = animate(0, value, { duration: 1.8, ease: EASE, onUpdate: (v) => { node.textContent = `${Math.round(v)}${suffix}`; } });
    return () => controls.stop();
  }, [inView, value, suffix]);
  return <span ref={ref}>0{suffix}</span>;
};

/** Mounts children only once the placeholder approaches the viewport. */
const LazyMount: React.FC<{ children: React.ReactNode; className?: string; minHeight: number }> = ({ children, className, minHeight }) => {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(ref, { once: true, margin: '400px 0px' });
  return <div ref={ref} className={className} style={{ minHeight }}>{near ? children : null}</div>;
};

const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const App: React.FC = () => {
  const { setActivePage, setAnatomyStructures, theme } = useAppStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.title = 'BoneVista — 3D Anatomy Workspace';
  }, [theme]);

  // Returning from the Bone Explorer remounts this page, so jump to the requested section.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || id.startsWith('/')) return;
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; setScrolled(window.scrollY > 24); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/anatomy/manifest.json').then((response) => {
      if (!response.ok) throw new Error('Atlas labels could not be loaded.');
      return response.json();
    }).then((manifest) => {
      if (active) setAnatomyStructures(manifest.organs.filter((item: { system: string }) => item.system === 'skeletal'));
    }).catch((error: unknown) => console.error('Failed to load anatomy labels', error));
    return () => { active = false; };
  }, [setAnatomyStructures]);

  const openModule = (page: Page) => { setActivePage(page); scrollToId('workspace'); };

  return (
    <div className={landing.site}>
      <div className={landing.grain} aria-hidden="true" />
      <header className={`${landing.nav} ${scrolled ? landing.navScrolled : ''}`}>
        <a className={landing.brand} href="#top"><span className={landing.brandMark}><Bone size={18}/></span><span>Bone<em>Vista</em></span></a>
        <nav className={landing.navLinks} aria-label="Main site navigation">
          <a href="#about">About</a><a href="#bones">Bones</a><a href="#/bone-explorer">Explorer</a><a href="#modules">Modules</a><a href="#how">How it works</a><a href="#faq">FAQ</a>
        </nav>
        <a className={landing.launch} href="#platform">Launch App <ArrowRight size={14}/></a>
      </header>

      <main>
        <section className={landing.hero} id="top">
          <div className={landing.heroGlow} aria-hidden="true" />
          <div className={landing.heroCopy}>
            <motion.span className={landing.eyebrow} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
              <Sparkles size={13}/> 3D Anatomy &amp; Biomechanics Workspace
            </motion.span>
            <h1 className={landing.heroTitle}>
              {['The human body,', 'rendered in', 'gold detail.'].map((line, i) => (
                <span key={line} className={landing.lineMask}>
                  <motion.span initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: EASE }} className={i === 2 ? landing.goldText : undefined}>{line}</motion.span>
                </span>
              ))}
            </h1>
            <motion.p className={landing.heroDescription} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.6, ease: EASE }}>
              BoneVista is an interactive anatomy studio in your browser. Explore a segmented skeleton, muscle layers, the brain and nerves, simulate bone stress and study radiographs — privately, on your own device.
            </motion.p>
            <motion.div className={landing.heroActions} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.75, ease: EASE }}>
              <a className={landing.primaryCta} href="#platform">Enter the Workspace <ArrowRight size={16}/></a>
              <a className={landing.secondaryCta} href="#about">What is BoneVista?</a>
            </motion.div>
          </div>
          <motion.div className={landing.heroArt} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
            <Suspense fallback={<div className={landing.skullLoading}>Assembling skull…</div>}><SkullModel3D /></Suspense>
            <div className={landing.callouts} aria-hidden="true">
              <div className={`${landing.callout} ${landing.calloutA}`}><span>Os frontale</span><small>Frontal bone</small></div>
              <div className={`${landing.callout} ${landing.calloutB}`}><span>Orbita</span><small>Eye socket</small></div>
              <div className={`${landing.callout} ${landing.calloutC}`}><span>Mandibula</span><small>Lower jaw</small></div>
            </div>
          </motion.div>
          <a className={landing.scrollCue} href="#about" aria-label="Scroll to learn more"><ChevronDown size={18}/></a>
        </section>

        <div className={landing.marquee} aria-hidden="true">
          <div className={landing.marqueeTrack}>
            {[...MARQUEE, ...MARQUEE].map((item, i) => <span key={i}>{item}<i>✦</i></span>)}
          </div>
        </div>

        <section className={landing.stats} aria-label="BoneVista in numbers">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} className={landing.stat} delay={i * 0.08}>
              <strong><CountUp value={stat.value} suffix={stat.suffix} /></strong>
              <span>{stat.label}</span>
            </Reveal>
          ))}
        </section>

        <section className={landing.about} id="about">
          <Reveal className={landing.aboutIntro}>
            <span className={landing.eyebrow}>01 · About</span>
            <h2 className={landing.displayTitle}>What is <em>BoneVista?</em></h2>
            <p className={landing.lead}>BoneVista brings a full anatomy lab to the browser. Instead of flipping through flat diagrams, you can turn the body around, peel back its layers and focus on a single structure in seconds.</p>
            <p className={landing.bodyCopy}>It brings six tools together in one workspace — from a 335-bone skeletal atlas to a simple finite-element stress solver — so you can move from <em>what it looks like</em> to <em>how it behaves</em> without switching apps.</p>
          </Reveal>
          <div className={landing.pillars}>
            {PILLARS.map((pillar, i) => (
              <Reveal key={pillar.title} className={landing.pillar} delay={i * 0.1}>
                <span className={landing.iconBadge}><pillar.icon size={18}/></span>
                <div><h3>{pillar.title}</h3><p>{pillar.text}</p></div>
              </Reveal>
            ))}
          </div>
        </section>

        <BoneBiology eyebrowClassName={landing.eyebrow} titleClassName={landing.displayTitle} />

        <section className={landing.scanner} id="scanner">
          <Reveal className={landing.scannerCopy}>
            <span className={landing.eyebrow}>03 · Try it</span>
            <h2 className={landing.displayTitle}>One atlas. <em>Every angle.</em></h2>
            <p className={landing.bodyCopy}>Pick a body region, choose a bone, then drag to orbit it or toggle a wireframe view. This is a small preview of what the full workspace can do.</p>
            <ul className={landing.checkList}>
              <li>19 bones across the limbs, spine, trunk and head</li>
              <li>Smooth orbit, zoom and auto-rotate controls</li>
              <li>Solid and wireframe display modes</li>
            </ul>
            <a className={landing.explorerLink} href="#/bone-explorer">Open the full Bone Explorer · all 335 structures <ArrowRight size={15}/></a>
          </Reveal>
          <LazyMount className={landing.scannerFigure} minHeight={480}>
            <Suspense fallback={<div className={landing.loadingFigure}>Preparing 3D preview…</div>}>
              <ScannerTarget3D />
            </Suspense>
          </LazyMount>
        </section>

        <section className={landing.modules} id="modules">
          <Reveal className={landing.sectionIntro}>
            <span className={landing.eyebrow}>04 · Modules</span>
            <h2 className={landing.displayTitle}>Six instruments. <em>One studio.</em></h2>
            <p className={landing.bodyCopy}>Each module opens directly in the workspace below. Click a card to jump straight in.</p>
          </Reveal>
          <div className={landing.moduleGrid}>
            {MODULES.map((module, i) => (
              <Reveal key={module.page} delay={(i % 3) * 0.08}>
                <button type="button" className={landing.moduleCard} onClick={() => openModule(module.page)}>
                  <span className={landing.moduleTop}><span className={landing.iconBadge}><module.icon size={20}/></span><small>{module.tag}</small></span>
                  <h3>{module.title}</h3>
                  <p>{module.text}</p>
                  <span className={landing.moduleLink}>Open module <ArrowRight size={14}/></span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={landing.how} id="how">
          <Reveal className={landing.sectionIntro}>
            <span className={landing.eyebrow}>05 · How it works</span>
            <h2 className={landing.displayTitle}>From curiosity <em>to clarity.</em></h2>
          </Reveal>
          <ol className={landing.steps}>
            {STEPS.map((step, i) => (
              <Reveal key={step.title} className={landing.step} delay={i * 0.12}>
                <span className={landing.stepNumber}>0{i + 1}</span>
                <span className={landing.iconBadge}><step.icon size={18}/></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        <section className={landing.platform} id="platform">
          <Reveal className={landing.platformHeading}>
            <div><span className={landing.eyebrow}>06 · Workspace</span><h2 className={landing.displayTitle}>The <em>workspace.</em></h2></div>
            <p>The full BoneVista app runs right here. Use the sidebar to switch modules, search any structure, or maximise the window for focused study.</p>
          </Reveal>
          <Workspace />
        </section>

        <section className={landing.tech}>
          <Reveal className={landing.techInner}>
            <span className={landing.iconBadge}><Cpu size={18}/></span>
            <p><strong>Under the hood.</strong> React 19, Three.js and React Three Fiber render Draco-compressed anatomy meshes on the GPU. Heavy modules load only when you open them, and 3D scenes pause when they scroll out of view, so the page stays smooth.</p>
          </Reveal>
        </section>

        <section className={landing.faq} id="faq">
          <Reveal className={landing.sectionIntro}>
            <span className={landing.eyebrow}>07 · FAQ</span>
            <h2 className={landing.displayTitle}>Good <em>questions.</em></h2>
          </Reveal>
          <div className={landing.faqList}>
            {FAQ.map((item, i) => (
              <Reveal key={item.q} delay={i * 0.05}>
                <details className={landing.faqItem}>
                  <summary>{item.q}<ChevronDown size={18}/></summary>
                  <p>{item.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={landing.cta}>
          <Reveal className={landing.ctaInner}>
            <h2 className={landing.displayTitle}>Ready to look <em>inside?</em></h2>
            <p className={landing.bodyCopy}>No sign-up, no upload. Open the workspace and start exploring.</p>
            <a className={landing.primaryCta} href="#platform">Launch BoneVista <ArrowRight size={16}/></a>
          </Reveal>
        </section>

        <footer className={landing.footer}>
          <div className={landing.footerBrand}><span className={landing.brandMark}><Bone size={16}/></span><span>Bone<em>Vista</em></span></div>
          <p className={landing.disclaimer}>Educational and research prototype. Not a medical device and not intended for diagnosis or treatment. Anatomy data © Z-Anatomy / BodyParts3D, CC BY-SA 4.0.</p>
          <a href="#top">Back to top ↑</a>
        </footer>
      </main>
    </div>
  );
};

/** The embedded BoneVista application. */
const Workspace: React.FC = () => {
  const { activePage, rightPanelOpen, theme, setTheme, viewMode } = useAppStore();
  const isViewer = activePage === 'viewer';
  const isMuscleExplorer = activePage === 'muscles';
  const isNeuroExplorer = activePage === 'neuro';
  const isAnatomyWorkspace = isViewer || isMuscleExplorer || isNeuroExplorer;
  const [hasVisitedViewer, setHasVisitedViewer] = useState(false);
  const [workspaceMaximized, setWorkspaceMaximized] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const frameInView = useInView(frameRef, { margin: '120px 0px' });
  const visible = frameInView || workspaceMaximized;

  useEffect(() => { if (isAnatomyWorkspace) setHasVisitedViewer(true); }, [isAnatomyWorkspace]);

  useEffect(() => {
    if (!workspaceMaximized) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setWorkspaceMaximized(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [workspaceMaximized]);

  return (
          <WorkspaceVisibleContext.Provider value={visible}>
          <div ref={frameRef} id="workspace" className={`${landing.workspaceFrame} ${workspaceMaximized ? landing.workspaceMaximized : ''}`}>
            <div className={styles.app}>
      <Sidebar />

      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.pageName}>{pageName(activePage)}</span>
          </div>
          <HeaderSearch />
          {isViewer && <ViewerToolbar />}
          <div className={styles.topbarActions}>
            <button className={styles.themeToggle} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button className={styles.themeToggle} onClick={() => setWorkspaceMaximized((maximized) => !maximized)} aria-label={workspaceMaximized ? 'Restore workspace size' : 'Maximize workspace'} title={workspaceMaximized ? 'Restore workspace size (Esc)' : 'Maximize workspace'}>
              {workspaceMaximized ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {(hasVisitedViewer || isMuscleExplorer || isNeuroExplorer) && <div className={`${styles.viewerPage} ${isAnatomyWorkspace ? styles.viewerPageActive : ''}`} aria-hidden={!isAnatomyWorkspace}>
            <div className={styles.viewerLayout}>
              <div className={styles.viewportWrap}>
                <Suspense fallback={<PageSkeleton />}>
                  {isNeuroExplorer
                    ? <NeuroExplorerDataHost><NeuroExplorerPage /></NeuroExplorerDataHost>
                    : <Viewport3D active={isAnatomyWorkspace && visible} />}
                </Suspense>
              </div>
              {rightPanelOpen && isViewer && <div className={styles.rightPanel}><AnatomyPanel /></div>}
              {rightPanelOpen && isMuscleExplorer && <div className={styles.rightPanel}><Suspense fallback={<PageSkeleton />}><MuscleExplorerHost /></Suspense></div>}
            </div>
            {isViewer && <div className={styles.modeOverlay} hidden={viewMode !== 'xray'} aria-hidden={viewMode !== 'xray'}><Suspense fallback={<PageSkeleton />}><XrayWorkspace /></Suspense></div>}
            {isViewer && <div className={`${styles.modeOverlay} ${styles.stressModeOverlay}`} hidden={viewMode !== 'stress'} aria-hidden={viewMode !== 'stress'}><Suspense fallback={<PageSkeleton />}><StressAnalysis /></Suspense></div>}
          </div>}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              className={styles.pageWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Suspense fallback={<PageSkeleton />}>
                {activePage === 'dashboard' && <Dashboard />}
                {activePage === 'spine'     && <div className={styles.scrollPage}><SpineExplorer /></div>}
                {activePage === 'xray'      && <div className={styles.scrollPage}><XrayWorkspace /></div>}
                {activePage === 'stress'    && <div className={styles.scrollPage}><StressAnalysis /></div>}
                {activePage === 'studies'   && <StudiesPlaceholder />}
                {activePage === 'settings'  && <SettingsPlaceholder />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
            </div>
          </div>
          </WorkspaceVisibleContext.Provider>
  );
};

// Simple placeholder pages
const StudiesPlaceholder: React.FC = () => {
  const setActivePage = useAppStore((state) => state.setActivePage);
  return <section className={styles.utilityPage}>
    <span className="mono-label">WORKSPACE</span><h2>Studies</h2>
    <div className={styles.utilityCard}><div><p>No studies are saved in this prototype. You can preview radiographs locally, but there is no patient record store.</p></div><button className={styles.utilityAction} onClick={() => setActivePage('xray')}>Open X-Ray Workspace <ArrowRight size={15}/></button></div>
  </section>;
};

const SettingsPlaceholder: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  return <section className={styles.utilityPage}>
    <span className="mono-label">PREFERENCES</span><h2>Settings</h2>
    <p>Choose the appearance for your BoneVista workspace. Your preference is saved in this browser.</p>
    <div className={styles.utilityCard}><div><strong>Appearance</strong><p>Switch between the night and day workspace themes.</p></div><div className={styles.themeChoices}>
      <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}><Sun size={15}/>Day</button>
      <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}><Moon size={15}/>Night</button>
    </div></div>
  </section>;
};

function pageName(page: string): string {
  const map: Record<string, string> = {
    dashboard: 'Home', viewer: '3D Anatomy', muscles: 'Muscle Explorer', neuro: 'Neuro & Brain Explorer', spine: 'Spine Explorer',
    xray: 'X-Ray Workspace', stress: 'Stress Analysis', studies: 'Studies', settings: 'Settings',
  };
  return map[page] ?? page;
}

const HeaderSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const { anatomyStructures, muscleStructures, neuroBrainManifest, neuroNervesManifest, selectedBones, selectedNeuroStructures, toggleBoneSelection, toggleNeuroStructure, clearMuscleSelection, setActivePage, setMusclePreset, setMuscleQuery, setNeuroMode, setViewMode, activePage } = useAppStore();
  const matches = query.trim() ? anatomyStructures.filter((item) => `${item.name_en} ${item.ta2_latin}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  const muscleMatches = query.trim() ? muscleStructures.filter((item) => `${item.name} ${item.fmaId ?? ''} ${item.side}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  const neuroStructures = [...(neuroBrainManifest?.structures ?? []), ...(neuroNervesManifest?.structures ?? [])];
  const neuroMatches = query.trim() ? filterNeuroStructures(neuroStructures, query).slice(0, 6) : [];
  return <div className={styles.searchWrap}>
    <Search size={16} aria-hidden="true" />
    <input value={query} onChange={(event) => { setQuery(event.target.value); if (activePage === 'muscles') setMuscleQuery(event.target.value); }} placeholder="Search anatomy structures…" aria-label="Search anatomy structures" />
    {query && <div className={styles.searchResults} role="listbox" aria-label="Anatomy search results">
      {matches.map((item) => <button key={item.organ_id} role="option" aria-selected="false" onClick={() => { if (activePage === 'muscles') clearMuscleSelection(); if (!selectedBones.has(item.organ_id)) toggleBoneSelection(item.organ_id); setActivePage('viewer'); setViewMode('bone'); setQuery(''); }}><span>{item.name_en}</span><small>{item.ta2_latin}</small></button>)}
      {muscleMatches.map((item) => <button key={item.id} role="option" aria-selected="false" onClick={() => { if (!selectedBones.has(item.id)) toggleBoneSelection(item.id); setMusclePreset(item.kind === 'bone' ? 'combined' : item.layer ?? 'superficial'); setMuscleQuery(''); setViewMode('bone'); setActivePage('muscles'); setQuery(''); }}><span>{item.name}</span><small>{item.fmaId ?? item.side} · {item.layer ?? 'Écorché skeleton'}</small></button>)}
      {neuroMatches.map((item) => <button key={item.id} role="option" aria-selected={selectedNeuroStructures.has(item.id)} onClick={() => { setNeuroMode(item.id.startsWith('neuro:brain:') ? 'brain-atlas' : 'nervous-system'); if (!selectedNeuroStructures.has(item.id)) toggleNeuroStructure(item.id); setActivePage('neuro'); setQuery(''); }}><span>{item.name}</span><small>{item.category} · {item.region ?? item.side}</small></button>)}
      {!matches.length && !muscleMatches.length && !neuroMatches.length && <p>{anatomyStructures.length ? 'No matching anatomy structures.' : 'Loading atlas labels…'}</p>}
    </div>}
  </div>;
};

export default App;
