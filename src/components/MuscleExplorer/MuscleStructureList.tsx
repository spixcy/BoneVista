import React, { useMemo } from 'react';
import { Search, X, Eye, EyeOff, Activity, Bone } from 'lucide-react';
import type { MuscleExplorerStructureVM, AnatomySide } from './types';
import styles from './MuscleStructureList.module.css';

export interface MuscleStructureListProps {
  /** Current text query filtering structures */
  query: string;
  /** Complete or filtered list of structures */
  structures: readonly MuscleExplorerStructureVM[];
  /** Callback when search query changes */
  onQueryChange(query: string): void;
  /** Callback when user selects a structure */
  onSelectStructure(id: string): void;
  /** Callback when user toggles visibility for a structure */
  onSetStructureVisibility(id: string, visible: boolean): void;
}

function getSideAbbreviation(side: AnatomySide): string {
  switch (side) {
    case 'left': return 'L';
    case 'right': return 'R';
    case 'midline': return 'M';
    case 'bilateral': return 'B';
    default: return '·';
  }
}

export const MuscleStructureList: React.FC<MuscleStructureListProps> = ({
  query,
  structures,
  onQueryChange,
  onSelectStructure,
  onSetStructureVisibility,
}) => {
  // Filter structures matching search query (name, latin name, region, FMA ID)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return structures;
    return structures.filter((s) => {
      const matchName = s.name.toLowerCase().includes(q);
      const matchLatin = s.latinName ? s.latinName.toLowerCase().includes(q) : false;
      const matchRegion = s.region ? s.region.toLowerCase().includes(q) : false;
      const matchFma = s.fmaId ? s.fmaId.toLowerCase().includes(q) : false;
      const matchKind = s.kind.toLowerCase().includes(q);
      return matchName || matchLatin || matchRegion || matchFma || matchKind;
    });
  }, [structures, query]);

  // Group structures by region
  const grouped = useMemo(() => {
    const map = new Map<string, MuscleExplorerStructureVM[]>();
    for (const item of filtered) {
      const key = item.region || (item.kind === 'muscle' ? 'Muscular System' : 'Skeletal System');
      const list = map.get(key);
      if (list) {
        list.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className={styles.container} role="region" aria-label="Muscle and Bone Structure List">
      <div className={styles.searchBar}>
        <Search size={13} className={styles.searchIcon} aria-hidden="true" />
        <input
          type="search"
          className={styles.searchInput}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter structures by name, region, FMA…"
          aria-label="Filter anatomical structures"
        />
        {query && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={() => onQueryChange('')}
            title="Clear filter"
            aria-label="Clear filter"
          >
            <X size={11} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className={styles.listScroll}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {query ? (
              <>
                <p>No anatomical structures match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  className={styles.resetFilterBtn}
                  onClick={() => onQueryChange('')}
                >
                  Clear search
                </button>
              </>
            ) : (
              <p>No structures available in the current layer preset.</p>
            )}
          </div>
        ) : (
          grouped.map(([region, items]) => (
            <details
              key={region}
              className={styles.regionGroup}
              open={Boolean(query) || grouped.length <= 3}
            >
              <summary className={styles.regionHeader}>
                <span className={styles.regionTitle}>{region}</span>
                <span className={styles.regionCount}>{items.length}</span>
              </summary>

              {items.map((item) => {
                const sideAbbr = getSideAbbreviation(item.side);
                return (
                  <div
                    key={item.id}
                    className={`${styles.structureRow} ${item.selected ? styles.selected : ''} ${!item.visible ? styles.hidden : ''}`}
                  >
                    <button
                      type="button"
                      className={styles.selectButton}
                      onClick={() => onSelectStructure(item.id)}
                      aria-pressed={item.selected}
                      title={`${item.name} (${item.side}) — click to select in 3D viewer`}
                    >
                      {item.kind === 'muscle' ? (
                        <Activity size={12} style={{ color: '#d4af37', flexShrink: 0 }} aria-hidden="true" />
                      ) : (
                        <Bone size={12} style={{ color: '#c4a882', flexShrink: 0 }} aria-hidden="true" />
                      )}

                      <div className={styles.nameCol}>
                        <span className={styles.structureName}>{item.name}</span>
                        {item.latinName && (
                          <span className={styles.structureLatin}>{item.latinName}</span>
                        )}
                      </div>

                      {sideAbbr !== '·' && (
                        <span className={styles.sidePill} title={`Side: ${item.side}`}>
                          {sideAbbr}
                        </span>
                      )}

                      {item.layer && (
                        <span
                          className={`${styles.layerPill} ${item.layer === 'superficial' ? styles.layerPillSup : styles.layerPillDeep}`}
                          title={`Layer: ${item.layer}`}
                        >
                          {item.layer === 'superficial' ? 'Sup' : 'Deep'}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      className={`${styles.visibilityButton} ${!item.visible ? styles.hidden : ''}`}
                      onClick={() => onSetStructureVisibility(item.id, !item.visible)}
                      title={item.visible ? `Hide ${item.name}` : `Show ${item.name}`}
                      aria-label={item.visible ? `Hide ${item.name}` : `Show ${item.name}`}
                    >
                      {item.visible ? (
                        <Eye size={12} aria-hidden="true" />
                      ) : (
                        <EyeOff size={12} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                );
              })}
            </details>
          ))
        )}
      </div>
    </div>
  );
};

export default MuscleStructureList;
