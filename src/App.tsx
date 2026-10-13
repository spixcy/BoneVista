import React, { Suspense, lazy, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar/Sidebar';
import ViewerToolbar from './components/ViewerToolbar/ViewerToolbar';
import AnatomyPanel from './components/AnatomyPanel/AnatomyPanel';
import { useAppStore } from './store/appStore';
import styles from './App.module.css';

// Lazy-load heavy pages
const Viewport3D     = lazy(() => import('./components/Viewport3D/Viewport3D'));
const SpineExplorer  = lazy(() => import('./components/SpineExplorer/SpineExplorer'));
const XrayWorkspace  = lazy(() => import('./components/XrayWorkspace/XrayWorkspace'));
const Dashboard      = lazy(() => import('./components/Dashboard/Dashboard'));

const PageSkeleton: React.FC = () => (
  <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {[240, 180, 120, 160].map((w, i) => (
      <div key={i} className="skeleton" style={{ width: w, height: 18, borderRadius: 6 }} />
    ))}
  </div>
);

const App: React.FC = () => {
  const { activePage, rightPanelOpen, setAnatomyStructures } = useAppStore();
  const isViewer = activePage === 'viewer';

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
    <div className={styles.app}>
      <Sidebar />

      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span className={styles.pageName}>{pageName(activePage)}</span>
          </div>
          {isViewer && <ViewerToolbar />}
        </header>

        {/* Content */}
        <div className={styles.content}>
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
                {activePage === 'viewer' && (
                  <div className={styles.viewerLayout}>
                    <div className={styles.viewportWrap}>
                      <Viewport3D />
                    </div>
                    {rightPanelOpen && (
                      <div className={styles.rightPanel}>
                        <AnatomyPanel />
                      </div>
                    )}
                  </div>
                )}
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
  );
};

// Simple placeholder pages
const StudiesPlaceholder: React.FC = () => (
  <div style={{ padding: 32 }}>
    <h2 style={{ font: '700 24px/1.2 var(--font-sans)', marginBottom: 8 }}>Studies</h2>
    <p style={{ color: 'var(--color-text-secondary)' }}>Study management coming in next iteration.</p>
  </div>
);

const SettingsPlaceholder: React.FC = () => (
  <div style={{ padding: 32 }}>
    <h2 style={{ font: '700 24px/1.2 var(--font-sans)', marginBottom: 8 }}>Settings</h2>
    <p style={{ color: 'var(--color-text-secondary)' }}>Configuration panel coming in next iteration.</p>
  </div>
);

function pageName(page: string): string {
  const map: Record<string, string> = {
    dashboard: 'Dashboard', viewer: '3D Viewer', spine: 'Spine Explorer',
    xray: 'X-Ray Workspace', studies: 'Studies', settings: 'Settings',
  };
  return map[page] ?? page;
}

export default App;
