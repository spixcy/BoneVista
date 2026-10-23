/**
 * BoneVista Neuro & Brain Explorer — Structure List
 *
 * Grouped, searchable list of neuro structures.  Groups by `category`.
 * Entries that are not selectable are shown as metadata-only rows.
 *
 * Owner: Antigravity Flash High (UI/presentation)
 */

import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import type { NeuroStructureView } from './types';
import styles from './NeuroStructureList.module.css';

interface NeuroStructureListProps {
  query: string;
  structures: NeuroStructureView[];
  selectedIds: string[];
  onSearchChange: (query: string) => void;
  onToggleStructure: (id: string) => void;
  /** Optional per-structure visibility coming from the 3D core (hidden-set from Codex) */
  hiddenIds?: Set<string>;
  onToggleVisibility?: (id: string) => void;
}

interface GroupEntry {
  category: string;
  items: NeuroStructureView[];
}

function groupByCategory(items: NeuroStructureView[]): GroupEntry[] {
  const map = new Map<string, NeuroStructureView[]>();
  for (const item of items) {
    const group = map.get(item.category) ?? [];
    group.push(item);
    map.set(item.category, group);
  }
  return Array.from(map.entries()).map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }));
}

export const NeuroStructureList: React.FC<NeuroStructureListProps> = ({
  query,
  structures,
  selectedIds,
  onSearchChange,
  onToggleStructure,
  hiddenIds,
  onToggleVisibility,
}) => {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filtered = useMemo(() => {
    if (!query.trim()) return structures;
    const lq = query.toLowerCase();
    return structures.filter(
      (s) =>
        s.name.toLowerCase().includes(lq) ||
        (s.latinName ?? '').toLowerCase().includes(lq) ||
        s.category.toLowerCase().includes(lq) ||
        (s.region ?? '').toLowerCase().includes(lq),
    );
  }, [structures, query]);

  const groups = useMemo(() => groupByCategory(filtered), [filtered]);

  // Collapsed group state: default open when query is active, otherwise closed except first
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const isGroupCollapsed = (category: string): boolean => {
    // When searching, expand all
    if (query.trim()) return false;
    return collapsedGroups.has(category);
  };

  return (
    <div className={styles.container}>
      {/* Search input */}
      <div className={styles.searchRow}>
        <svg
          className={styles.searchIcon}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          className={styles.searchInput}
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search structures…"
          aria-label="Search neuro structures"
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Structure count */}
      <div className={styles.countRow}>
        <span className={styles.countText}>
          {filtered.length} structure{filtered.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
        </span>
      </div>

      {/* Groups */}
      <ul className={styles.groupList} role="list" aria-label="Neuro structures">
        {groups.length === 0 && (
          <li className={styles.emptyRow} role="listitem">
            {query
              ? `No structures matching "${query}".`
              : 'No structures available in this mode yet.'}
          </li>
        )}
        {groups.map(({ category, items }) => {
          const collapsed = isGroupCollapsed(category);
          return (
            <li key={category} role="listitem">
              {/* Group header */}
              <button
                type="button"
                className={styles.groupHeader}
                onClick={() => toggleGroup(category)}
                aria-expanded={!collapsed}
              >
                {collapsed
                  ? <ChevronRight size={11} aria-hidden="true" />
                  : <ChevronDown size={11} aria-hidden="true" />
                }
                <span className={styles.groupLabel}>{category}</span>
                <span className={styles.groupCount}>{items.length}</span>
              </button>

              {/* Group items */}
              {!collapsed && (
                <ul className={styles.itemList} role="list">
                  {items.map((s) => {
                    const isSelected = selectedSet.has(s.id);
                    const isHidden = hiddenIds?.has(s.id) ?? false;

                    return (
                      <li
                        key={s.id}
                        className={`${styles.item} ${isSelected ? styles.itemSelected : ''} ${!s.selectable ? styles.itemMetaOnly : ''}`}
                        role="listitem"
                      >
                        <button
                          type="button"
                          className={styles.itemBtn}
                          onClick={() => s.selectable && onToggleStructure(s.id)}
                          disabled={!s.selectable}
                          aria-pressed={isSelected}
                          title={s.selectable ? undefined : 'Metadata only — no selectable mesh'}
                        >
                          <span className={styles.itemName}>{s.name}</span>
                          {s.side && s.side !== 'unknown' && (
                            <span className={styles.itemSide}>
                              {s.side === 'left' ? 'L' : s.side === 'right' ? 'R' : ''}
                            </span>
                          )}
                          {!s.selectable && (
                            <span className={styles.itemMetaBadge} aria-label="Metadata only">
                              •
                            </span>
                          )}
                        </button>

                        {/* Per-structure visibility button — only if wired */}
                        {s.selectable && onToggleVisibility && (
                          <button
                            type="button"
                            className={`${styles.visBtn} ${isHidden ? styles.visBtnHidden : ''}`}
                            onClick={() => onToggleVisibility(s.id)}
                            aria-label={isHidden ? `Show ${s.name}` : `Hide ${s.name}`}
                            tabIndex={-1}
                          >
                            {isHidden
                              ? <EyeOff size={10} aria-hidden="true" />
                              : <Eye size={10} aria-hidden="true" />
                            }
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NeuroStructureList;
