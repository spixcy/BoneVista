import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type SpineRegion } from '../../store/appStore';
import styles from './SpineExplorer.module.css';

const regions: { id: SpineRegion; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: 'var(--color-text-secondary)' },
  { id: 'cervical', label: 'Cervical', color: '#a0c4ff' },
  { id: 'thoracic', label: 'Thoracic', color: '#ffd6a5' },
  { id: 'lumbar', label: 'Lumbar', color: '#caffbf' },
  { id: 'sacral', label: 'Sacral', color: '#c9b1ff' },
];
const colors: Record<string, string> = { cervical: '#a0c4ff', thoracic: '#ffd6a5', lumbar: '#caffbf', sacral: '#c9b1ff' };
const sequence = (count: number, prefix: string, region: string) => Array.from({ length: count }, (_, i) => ({ id: `${prefix}${i + 1}`, region }));
const definitions = [
  ...sequence(7, 'C', 'cervical'), ...sequence(12, 'T', 'thoracic'), ...sequence(5, 'L', 'lumbar'),
  { id: 'Sacrum', region: 'sacral' }, { id: 'Coccyx', region: 'sacral' },
];

const SpineExplorer: React.FC = () => {
  const { anatomyStructures, spineRegion, setSpineRegion, selectedVertebra, setSelectedVertebra, selectedBones, toggleBoneSelection } = useAppStore();
  const available = definitions.map((definition) => {
    const record = anatomyStructures.find((item) => item.name_en === (definition.id === 'C1' ? 'Atlas (C1)' : definition.id === 'C2' ? 'Axis (C2)' : definition.id === 'Coccyx' ? 'Coccyx' : definition.id.startsWith('C') || definition.id.startsWith('T') || definition.id.startsWith('L') ? `Vertebra ${definition.id}` : definition.id));
    return record ? { ...definition, meshId: record.organ_id, label: record.name_en } : null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const filtered = spineRegion === 'all' ? available : available.filter((item) => item.region === spineRegion);
  const selected = available.find((item) => item.meshId === selectedVertebra);

  return <div className={styles.explorer}>
    <div className={styles.header}><h2 className={styles.title}>Spine Explorer</h2><p className={styles.subtitle}>Select a region, then choose an individually named atlas mesh.</p></div>
    <div className={styles.regionTabs} role="tablist" aria-label="Spine region filter">
      {regions.map(({ id, label, color }) => <button key={id} role="tab" aria-selected={spineRegion === id} className={`${styles.regionTab} ${spineRegion === id ? styles.regionTabActive : ''}`} style={spineRegion === id ? { borderColor: color, color } : {}} onClick={() => setSpineRegion(id)}>{label}</button>)}
    </div>
    <div className={styles.grid} data-testid="spine-vertebra-grid">
      {filtered.map((item) => {
        const isSelected = selectedVertebra === item.meshId;
        const selectedInScene = selectedBones.has(item.meshId);
        const color = colors[item.region];
        return <button key={item.meshId} className={`${styles.vertebraBtn} ${isSelected ? styles.vertebraBtnSelected : ''}`} style={isSelected ? { borderColor: color, background: `${color}18`, color } : {}} onClick={() => { setSelectedVertebra(isSelected ? null : item.meshId); if (isSelected ? selectedInScene : !selectedInScene) toggleBoneSelection(item.meshId); }} aria-pressed={isSelected} title={item.label}><span className={styles.vertebraId}>{item.id}</span></button>;
      })}
      {anatomyStructures.length > 0 && filtered.length === 0 && <p>No individually named vertebrae were found for this region.</p>}
      {!anatomyStructures.length && <p>Loading spine labels from the reference atlas…</p>}
    </div>
    <AnimatePresence>{selected && <motion.div className={styles.detailCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
      <div className={styles.detailHeader}><span className={styles.detailId} style={{ color: colors[selected.region] }}>{selected.id}</span><span className={styles.detailLabel}>{selected.label}</span></div>
      <p className={styles.detailRegion}>Region: {selected.region}</p><p className={styles.detailDesc}>Reference atlas mesh: {selected.meshId}</p>
    </motion.div>}</AnimatePresence>
    <div className={styles.coverageNote}><span className="mono-label">Reference atlas coverage</span><div className={styles.coverageRow}>{[['Cervical', 'C1–C7'], ['Thoracic', 'T1–T12'], ['Lumbar', 'L1–L5'], ['Sacrum', 'Sacrum'], ['Coccyx', 'Coccyx']].map(([label, count]) => <div key={label} className={styles.coverageChip}><span>{label}</span><span>{count}</span></div>)}</div></div>
  </div>;
};

export default SpineExplorer;



