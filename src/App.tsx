import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, ArrowRight, Bone, Moon, Search, Sun } from 'lucide-react';
import Sidebar from './components/Sidebar/Sidebar';
import ViewerToolbar from './components/ViewerToolbar/ViewerToolbar';
import AnatomyPanel from './components/AnatomyPanel/AnatomyPanel';
import { useAppStore } from './store/appStore';
import styles from './App.module.css';
import landing from './LandingPage.module.css';

// Lazy-load heavy pages
const Viewport3D     = lazy(() => import('./components/Viewport3D/Viewport3D'));
const SpineExplorer  = lazy(() => import('./components/SpineExplorer/SpineExplorer'));
const XrayWorkspace  = lazy(() => import('./components/XrayWorkspace/XrayWorkspace'));
const Dashboard      = lazy(() => import('./components/Dashboard/Dashboard'));
const LandingBone    = lazy(() => import('./components/LandingBone'));

const boneField = {
  hero: [
    { name: 'Femur.l', x: 0.34, y: -0.16, scale: 2.2, rotation: [0.2, 0.45, -0.4] as [number, number, number], speed: 0.36 },
    { name: 'Humerus.r', x: -0.36, y: 0.2, scale: 1.95, rotation: [-0.4, 1, -0.2] as [number, number, number], speed: -0.32 },
  ],
  scanner: [
    { name: 'Tibia.r', x: -0.36, y: 0.2, scale: 2.15, rotation: [0.55, 0.8, -0.35] as [number, number, number], speed: -0.38 },
    { name: 'Clavicle.l', x: 0.34, y: -0.18, scale: 1.8, rotation: [-0.3, -0.7, 0.45] as [number, number, number], speed: 0.42 },
  ],
  intelligence: [
    { name: 'Humerus.l', x: -0.35, y: -0.18, scale: 2.05, rotation: [-0.5, -0.3, 0.55] as [number, number, number], speed: 0.36 },
    { name: 'Patella.r', x: 0.35, y: 0.17, scale: 1.7, rotation: [0.3, 1.4, -0.6] as [number, number, number], speed: -0.44 },
  ],
  platform: [
    { name: 'Scapula.r', x: -0.35, y: -0.18, scale: 2.1, rotation: [0.45, 1.2, -0.5] as [number, number, number], speed: -0.34 },
    { name: 'Vertebra T8', x: 0.35, y: 0.2, scale: 1.75, rotation: [-0.5, -1, 0.35] as [number, number, number], speed: 0.4 },
  ],
  roadmap: [
    { name: 'Hip bone.l', x: -0.34, y: 0.19, scale: 2.1, rotation: [-0.45, -1, 0.35] as [number, number, number], speed: 0.36 },
    { name: 'Fibula.r', x: 0.36, y: -0.18, scale: 2.05, rotation: [0.3, 0.8, -0.5] as [number, number, number], speed: -0.42 },
  ],
};

const PageSkeleton: React.FC = () => (
  <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[240, 180, 120, 160].map((w, i) => (
      <div key={i} className="skeleton" style={{ width: w, height: 18, borderRadius: 6 }} />
    ))}
  </div>
);

const App: React.FC = () => {
  const { activePage, rightPanelOpen, setAnatomyStructures, theme, setTheme } = useAppStore();
  const isViewer = activePage === 'viewer';
  const [hasVisitedViewer, setHasVisitedViewer] = useState(false);
  const siteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.title = 'BoneVista';
  }, [theme]);

  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;
    const moveBackground = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      const dx = (x - 0.5) * 36;
      const dy = (y - 0.5) * 28;
      site.style.setProperty('--pointer-x', `${x * 100}%`);
      site.style.setProperty('--pointer-y', `${y * 100}%`);
      site.style.setProperty('--mouse-near-x', `${dx}px`);
      site.style.setProperty('--mouse-near-y', `${dy}px`);
      site.style.setProperty('--mouse-far-x', `${-dx * 0.45}px`);
      site.style.setProperty('--mouse-far-y', `${-dy * 0.45}px`);
    };
    site.addEventListener('pointermove', moveBackground, { passive: true });
    return () => site.removeEventListener('pointermove', moveBackground);
  }, []);

  useEffect(() => { if (isViewer) setHasVisitedViewer(true); }, [isViewer]);

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

  return (
    <div ref={siteRef} className={landing.site}>
      <header className={landing.nav}>
        <a className={landing.brand} href="#top"><span className={landing.brandMark}><Bone size={20}/></span><span>BoneVista</span></a>
        <nav className={landing.navLinks} aria-label="Main site navigation">
          <a href="#scanner">Scanner</a><a href="#intelligence">Intelligence</a><a href="#platform">Platform</a><a href="#roadmap">Roadmap</a>
        </nav>
        <a className={landing.launch} href="#platform">Launch App</a>
      </header>

      <main>
        <section className={landing.hero} id="top">
          <Suspense fallback={null}><LandingBone className={`${landing.boneLayer} ${landing.heroBone}`} bones={boneField.hero}/></Suspense>
          <div className={landing.heroCopy}>
            <span className={landing.eyebrow}>BONEVISTA · ANATOMY WORKSPACE</span>
            <h1 className={landing.heroTitle}><span>THE ANATOMY</span><span>WORKSPACE</span><span>FOR BONE.</span></h1>
            <p className={landing.heroDescription}>Explore a segmented skeletal atlas, inspect the spine, and bring your own radiographs into a private local workspace.</p>
            <div className={landing.heroActions}>
              <a className={landing.primaryCta} href="#scanner">INITIALIZE SEQUENCE <ArrowRight size={16}/></a>
              <a className={landing.scrollHint} href="#scanner">SCROLL TO EXPLORE <span><ArrowDown size={14}/></span></a>
            </div>
          </div>
        </section>

        <section className={landing.scanner} id="scanner">
          <Suspense fallback={null}><LandingBone className={`${landing.boneLayer} ${landing.decorBone}`} bones={boneField.scanner}/></Suspense>
          <div className={landing.scannerCopy}>
            <span className={landing.eyebrow}>01 · SCANNER</span>
            <h2 className={landing.displayTitle}>ONE ATLAS.<span> EVERY ANGLE.</span></h2>
            <p className={landing.bodyCopy}>Start with the full skeletal reference, select named structures, and focus the view to study individual anatomy. BoneVista is an educational reference workspace, not a patient-specific diagnostic system.</p>
            <div className={landing.scanLabel}>335 named reference structures · interactive 3D</div>
          </div>
          <div className={landing.scannerFigure}><img src="/branding/bonevista-mascot.webp" alt="BoneVista mascot beside the anatomy workspace"/></div>
        </section>

        <section className={landing.intelligence} id="intelligence">
          <Suspense fallback={null}><LandingBone className={`${landing.boneLayer} ${landing.decorBone}`} bones={boneField.intelligence}/></Suspense>
          <div className={landing.sectionIntro}>
            <span className={landing.eyebrow}>02 · INTELLIGENCE</span>
            <h2 className={landing.displayTitle}>MADE TO <span>EXPLORE.</span></h2>
            <p className={landing.bodyCopy}>A focused set of anatomy tools, with clear limits around what the prototype can do today.</p>
          </div>
          <div className={landing.featureGrid}>
            <article className={landing.featureCard}><span className={landing.featureNumber}>01</span><h3>3D Anatomy</h3><p>Rotate the segmented skeleton, search the atlas, and focus available named meshes.</p></article>
            <article className={landing.featureCard}><span className={landing.featureNumber}>02</span><h3>Spine Explorer</h3><p>Browse cervical, thoracic, and lumbar vertebral meshes from the reference atlas.</p></article>
            <article className={landing.featureCard}><span className={landing.featureNumber}>03</span><h3>X-Ray Workspace</h3><p>Preview your own AP and lateral images locally. No upload or AI inference is configured.</p></article>
          </div>
        </section>

        <section className={landing.platform} id="platform">
          <Suspense fallback={null}><LandingBone className={`${landing.boneLayer} ${landing.decorBone}`} bones={boneField.platform}/></Suspense>
          <div className={landing.platformHeading}>
            <div><span className={landing.eyebrow}>03 · PLATFORM</span><h2>THE WORKSPACE</h2></div>
            <p>Scroll into the working BoneVista app. Use its sidebar, search, atlas, and viewing tools here.</p>
          </div>
          <div className={landing.workspaceFrame}>
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
            <span className={styles.topbarBrand}>BV</span>
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {hasVisitedViewer && <div className={`${styles.viewerPage} ${isViewer ? styles.viewerPageActive : ''}`} aria-hidden={!isViewer}>
            <div className={styles.viewerLayout}>
              <div className={styles.viewportWrap}><Viewport3D active={isViewer} /></div>
              {rightPanelOpen && <div className={styles.rightPanel}><AnatomyPanel /></div>}
            </div>
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
                {activePage === 'studies'   && <StudiesPlaceholder />}
                {activePage === 'settings'  && <SettingsPlaceholder />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
            </div>
          </div>
        </section>

        <section className={landing.roadmap} id="roadmap">
          <Suspense fallback={null}><LandingBone className={`${landing.boneLayer} ${landing.decorBone}`} bones={boneField.roadmap}/></Suspense>
          <div className={landing.roadmapHeader}><span className={landing.eyebrow}>04 · ROADMAP</span><h2>BUILT FOR DEEPER EXPLORATION.</h2><p>These are the working foundations available in this prototype. Advanced reconstruction, biomechanical analysis, and clinical planning are not implemented.</p></div>
          <div className={landing.roadmapGrid}>
            <article className={landing.roadmapItem}><span>Available now</span><h3>Segmented anatomy</h3><p>Search and inspect named atlas structures in the interactive viewer.</p></article>
            <article className={landing.roadmapItem}><span>Available now</span><h3>Spine and views</h3><p>Browse vertebrae and orient the reference skeleton from multiple sides.</p></article>
            <article className={landing.roadmapItem}><span>Available now</span><h3>Local image preview</h3><p>Open radiographs in your browser session without sending them to a service.</p></article>
          </div>
        </section>
        <footer className={landing.footer}><span>BoneVista · Explore. Learn. Understand.</span><a href="#platform">Return to the workspace ↑</a></footer>
      </main>
    </div>
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
    dashboard: 'Home', viewer: '3D Anatomy', spine: 'Spine Explorer',
    xray: 'X-Ray Workspace', studies: 'Studies', settings: 'Settings',
  };
  return map[page] ?? page;
}

const HeaderSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const { anatomyStructures, selectedBones, toggleBoneSelection, setActivePage } = useAppStore();
  const matches = query.trim() ? anatomyStructures.filter((item) => `${item.name_en} ${item.ta2_latin}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6) : [];
  return <div className={styles.searchWrap}>
    <Search size={16} aria-hidden="true" />
    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search anatomy structures…" aria-label="Search anatomy structures" />
    {query && <div className={styles.searchResults} role="listbox" aria-label="Anatomy search results">
      {matches.map((item) => <button key={item.organ_id} role="option" aria-selected="false" onClick={() => { if (!selectedBones.has(item.organ_id)) toggleBoneSelection(item.organ_id); setActivePage('viewer'); setQuery(''); }}><span>{item.name_en}</span><small>{item.ta2_latin}</small></button>)}
      {!matches.length && <p>{anatomyStructures.length ? 'No matching anatomy structures.' : 'Loading atlas labels…'}</p>}
    </div>}
  </div>;
};

export default App;
