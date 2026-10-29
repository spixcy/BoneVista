import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Bone, Dumbbell, Brain, Network, AlignCenter, Upload, Activity, BookOpen, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Sidebar.module.css';

const navItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'viewer', label: '3D Anatomy', icon: Bone },
  { id: 'muscles', label: 'Muscle Explorer', icon: Dumbbell },
  { id: 'brain', label: 'Brain Anatomy', icon: Brain },
  { id: 'neuro', label: 'Neuro Explorer', icon: Network },
  { id: 'spine', label: 'Spine Explorer', icon: AlignCenter },
  { id: 'xray', label: 'X-Ray Workspace', icon: Upload },
  { id: 'stress', label: 'Stress Analysis', icon: Activity },
  { id: 'studies', label: 'Study Guide', icon: BookOpen },
] as const;

const Sidebar: React.FC = () => {
  const { activePage, setActivePage, setViewMode, setNeuroMode, muscleStatus, setMusclePreset, clearMuscleSelection, sidebarCollapsed, setSidebarCollapsed } = useAppStore();
  React.useEffect(() => {
    const compactViewport = window.matchMedia('(max-width: 560px)');
    const syncSidebar = () => setSidebarCollapsed(compactViewport.matches);
    syncSidebar();
    compactViewport.addEventListener('change', syncSidebar);
    return () => compactViewport.removeEventListener('change', syncSidebar);
  }, [setSidebarCollapsed]);

  return <motion.aside data-collapsed={sidebarCollapsed} className={styles.sidebar} animate={{ width: sidebarCollapsed ? 68 : 248 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
    <div className={styles.logo}>
      <div className={styles.logoIcon}><Bone size={21} strokeWidth={2.2} /></div>
      {!sidebarCollapsed && <div className={styles.brandCopy}><span className={styles.logoText}>BoneVista</span><span className={styles.logoSub}>ANATOMY WORKSPACE</span></div>}
    </div>
    <nav className={styles.nav} aria-label="Main navigation">
      {!sidebarCollapsed && <span className={styles.navLabel}>WORKSPACE</span>}
      {navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`${styles.navItem} ${activePage === id ? styles.active : ''}`} onClick={() => { if (activePage === 'muscles' && id !== 'muscles') clearMuscleSelection(); if (id === 'viewer') setViewMode('bone'); if (id === 'muscles' && muscleStatus === 'idle') setMusclePreset('superficial'); if (id === 'xray') setViewMode('xray'); if (id === 'stress') setViewMode('stress'); if (id === 'brain') setNeuroMode('brain-atlas'); if (id === 'neuro') setNeuroMode('nervous-system'); setActivePage(id); }} aria-current={activePage === id ? 'page' : undefined} title={sidebarCollapsed ? label : undefined}>
        <Icon size={18} /><span className={styles.navText}>{!sidebarCollapsed && label}</span>{activePage === id && <motion.div layoutId="nav-indicator" className={styles.indicator} />}
      </button>)}
      <div className={styles.navDivider} />
      {!sidebarCollapsed && <span className={styles.navLabel}>PREFERENCES</span>}
      <button className={`${styles.navItem} ${activePage === 'settings' ? styles.active : ''}`} onClick={() => setActivePage('settings')} aria-current={activePage === 'settings' ? 'page' : undefined} title={sidebarCollapsed ? 'Settings' : undefined}><Settings size={18} /><span className={styles.navText}>{!sidebarCollapsed && 'Settings'}</span></button>
    </nav>
    <div className={styles.spacer} />
    <div className={styles.brandFooter}>
      <img src="/branding/bonevista-mascot.webp" alt="BoneVista mascot" />
      {!sidebarCollapsed && <div><strong>BoneVista</strong><span>Explore. Learn. Understand.</span></div>}
    </div>
    <button className={styles.collapseBtn} onClick={() => setSidebarCollapsed(!sidebarCollapsed)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}</button>
  </motion.aside>;
};

export default Sidebar;
