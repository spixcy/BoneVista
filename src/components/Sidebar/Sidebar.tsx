import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Bone, AlignCenter, Upload, ClipboardList, Settings,
  ChevronLeft, ChevronRight, Microscope
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Sidebar.module.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'viewer',    label: '3D Viewer',  icon: Bone },
  { id: 'spine',     label: 'Spine',      icon: AlignCenter },
  { id: 'xray',      label: 'X-Ray',      icon: Upload },
  { id: 'studies',   label: 'Studies',    icon: ClipboardList },
] as const;

const Sidebar: React.FC = () => {
  const { activePage, setActivePage, sidebarCollapsed, setSidebarCollapsed } = useAppStore();

  return (
    <motion.aside
      className={styles.sidebar}
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Microscope size={20} color="var(--color-accent)" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className={styles.logoText}>OsteoVision</span>
            <span className={styles.logoSub}>3D</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`${styles.navItem} ${activePage === id ? styles.active : ''}`}
            onClick={() => setActivePage(id as typeof activePage)}
            aria-current={activePage === id ? 'page' : undefined}
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={18} />
            {!sidebarCollapsed && <span>{label}</span>}
            {activePage === id && <motion.div layoutId="nav-indicator" className={styles.indicator} />}
          </button>
        ))}
      </nav>

      <div className={styles.spacer} />

      {/* Settings */}
      <button
        className={styles.navItem}
        onClick={() => setActivePage('settings')}
        title={sidebarCollapsed ? 'Settings' : undefined}
      >
        <Settings size={18} />
        {!sidebarCollapsed && <span>Settings</span>}
      </button>

      {/* Collapse toggle */}
      <button
        className={styles.collapseBtn}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
