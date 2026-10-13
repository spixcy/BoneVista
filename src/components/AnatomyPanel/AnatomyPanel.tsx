import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { AnatomyStructure } from '../../store/appStore';
import styles from './AnatomyPanel.module.css';

const AnatomyPanel: React.FC = () => {
  const { anatomyStructures, selectedBones, toggleBoneSelection, hiddenBones, toggleBoneVisibility } = useAppStore();
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);
  const structures = anatomyStructures.filter((item) => `${item.name_en} ${item.ta2_latin} ${item.path.join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  const groups = structures.reduce<Record<string, AnatomyStructure[]>>((result, item) => {
    const region = item.path[0] || 'Skeletal system';
    (result[region] ||= []).push(item);
    return result;
  }, {});

  return (
    <div className={styles.panel}>
      <div className={styles.header}><span className="mono-label">Atlas structures</span><span className={styles.count}>{selectedBones.size} selected</span></div>
      <label className={styles.search}><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a structure" aria-label="Find an anatomical structure" /></label>
      <div className={styles.list}>
        {!anatomyStructures.length && <div className={styles.empty}>Loading atlas labels…</div>}
        {Object.entries(groups).map(([region, bones]) => (
          <details key={region} className={styles.region} open={region === 'Vertebral column' || Boolean(search)}>
            <summary className={styles.regionHeader}>{region}<span className={styles.regionCount}>{bones.length}</span></summary>
            {bones.map((bone) => {
              const isSelected = selectedBones.has(bone.organ_id);
              const isHidden = hiddenBones.has(bone.organ_id);
              return <div key={bone.organ_id} className={`${styles.boneRow} ${isSelected ? styles.boneSelected : ''} ${isHidden ? styles.boneHidden : ''}`}>
                <button className={styles.boneName} onClick={() => { toggleBoneSelection(bone.organ_id); setSelected(isSelected ? null : bone.organ_id); }} aria-pressed={isSelected}>{bone.name_en}</button>
                <button className={styles.miniBtn} onClick={() => toggleBoneVisibility(bone.organ_id)} aria-label={isHidden ? `Show ${bone.name_en}` : `Hide ${bone.name_en}`} title={isHidden ? 'Show structure' : 'Hide structure'}>{isHidden ? <EyeOff size={12} /> : <Eye size={12} />}</button>
              </div>;
            })}
          </details>
        ))}
      </div>
      <div className={styles.footer}>Generalized reference atlas. No patient-specific interpretation.</div>
      {selected && anatomyStructures.find((item) => item.organ_id === selected) && <div className={styles.selectedInfo}>
        <b>{anatomyStructures.find((item) => item.organ_id === selected)?.name_en}</b>
        <span>{anatomyStructures.find((item) => item.organ_id === selected)?.ta2_latin}</span>
        <small>{anatomyStructures.find((item) => item.organ_id === selected)?.path.join(' / ')}</small>
      </div>}
    </div>
  );
};

export default AnatomyPanel;
