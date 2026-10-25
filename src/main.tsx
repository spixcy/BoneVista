import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const BoneExplorerPage = lazy(() => import('./pages/BoneExplorer/BoneExplorerPage'));

// Hash routes start with "#/"; plain anchors such as "#about" stay on the landing page.
const isExplorer = (hash: string) => hash.startsWith('#/bone-explorer');

const Root: React.FC = () => {
  const [explorer, setExplorer] = useState(() => isExplorer(window.location.hash));
  useEffect(() => {
    const onHash = () => setExplorer(isExplorer(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return explorer
    ? <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}><BoneExplorerPage /></Suspense>
    : <App />;
};

createRoot(document.getElementById('root')!).render(<Root />);
