import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bone, Upload, AlignCenter } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './Dashboard.module.css';

const quickLinks = [
  { page: 'viewer', label: '3D Viewer', desc: 'Explore 335 segmented reference structures', icon: Bone, color: 'var(--color-accent)' },
  { page: 'spine', label: 'Spine Explorer', desc: 'Select named vertebrae in the atlas', icon: AlignCenter, color: '#a0c4ff' },
  { page: 'xray', label: 'X-Ray Workspace', desc: 'Preview local AP and lateral images', icon: Upload, color: '#ffd6a5' },
] as const;

const Dashboard: React.FC = () => {
  const { anatomyStructures, setActivePage } = useAppStore();
  return <div className={styles.dashboard}>
    <div className={styles.heroRow}><div><h1 className={styles.heroTitle}>OsteoVision 3D</h1><p className={styles.heroSub}>Reference anatomy visualization and biplanar imaging workspace.</p></div><div className={styles.statusChip}><span className={styles.dot} />Inference unavailable</div></div>
    <div className={styles.statsRow}><motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}><div className={styles.statIcon}><Bone size={18} /></div><div><div className={styles.statValue}>{anatomyStructures.length || '…'}</div><div className={styles.statLabel}>Atlas structures</div></div></motion.div><motion.div className={styles.statCard} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}><div className={styles.statIcon}><Activity size={18} /></div><div><div className={styles.statValue}>Not configured</div><div className={styles.statLabel}>X-ray inference</div></div></motion.div></div>
    <div><span className="mono-label" style={{ display: 'block', marginBottom: 10 }}>Quick access</span><div className={styles.quickGrid}>{quickLinks.map(({ page, label, desc, icon: Icon, color }) => <button key={page} className={styles.quickCard} onClick={() => setActivePage(page)}><div className={styles.quickIcon} style={{ background: `${color}18` }}><Icon size={22} color={color} /></div><div className={styles.quickText}><span className={styles.quickLabel}>{label}</span><span className={styles.quickDesc}>{desc}</span></div></button>)}</div></div>
    <div className={styles.studiesTable}><span className="mono-label">No patient studies loaded</span><p>Images are previewed locally in this browser. A clinical inference service and study store are not configured.</p></div>
  </div>;
};
export default Dashboard;
