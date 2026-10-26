import React, { Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const BoneExplorerPage = lazy(() => import('./pages/BoneExplorer/BoneExplorerPage'));
const NeetPgPage = lazy(() => import('./pages/NeetPg/NeetPgPage'));

// Hash routes start with "#/"; plain anchors such as "#about" stay on the landing page.
type Route = 'landing' | 'explorer' | 'neet';
const routeOf = (hash: string): Route => (hash.startsWith('#/bone-explorer') ? 'explorer' : hash.startsWith('#/neet-pg') ? 'neet' : 'landing');

const Root: React.FC = () => {
  const [route, setRoute] = useState(() => routeOf(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(routeOf(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  if (route === 'landing') return <App />;
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#050505' }} />}>
      {route === 'explorer' ? <BoneExplorerPage /> : <NeetPgPage />}
    </Suspense>
  );
};

createRoot(document.getElementById('root')!).render(<Root />);
