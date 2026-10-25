import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bone, Box, ChevronLeft, ChevronRight, ExternalLink, Layers, ListTree, RotateCw, Scan, Search, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { DISPLAY_REGIONS, toExplorerBones, type ExplorerBone, type Side } from './regions';
import type { ViewMode } from './BoneViewer';
import styles from './BoneExplorerPage.module.css';

const BoneViewer = lazy(() => import('./BoneViewer'));

export const EXPLORER_HASH = '#/bone-explorer';
const DEFAULT_BONE = 'femur_r';

const SIDES: { id: Side | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'midline', label: 'Midline' },
];

const idFromHash = () => decodeURIComponent(window.location.hash.slice(EXPLORER_HASH.length + 1)) || null;

/** Loads the skeletal manifest if the landing page has not already done so. */
function useSkeletalStructures() {
  const structures = useAppStore((state) => state.anatomyStructures);
  const setStructures = useAppStore((state) => state.setAnatomyStructures);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (structures.length) return;
    let active = true;
    fetch('/anatomy/manifest.json')
      .then((response) => { if (!response.ok) throw new Error('The anatomy atlas could not be loaded.'); return response.json(); })
      .then((manifest) => { if (active) setStructures(manifest.organs.filter((item: { system: string }) => item.system === 'skeletal')); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'The anatomy atlas could not be loaded.'); });
    return () => { active = false; };
  }, [structures.length, setStructures]);
  return { structures, error };
}

const BoneExplorerPage: React.FC = () => {
  const { structures, error } = useSkeletalStructures();
  const theme = useAppStore((state) => state.theme);
  const bones = useMemo(() => toExplorerBones(structures), [structures]);
  const knownNodes = useMemo(() => bones.map((bone) => bone.node), [bones]);

  const [selectedId, setSelectedId] = useState<string>(() => idFromHash() ?? DEFAULT_BONE);
  const [query, setQuery] = useState('');
  const [side, setSide] = useState<Side | 'all'>('all');
  const [mode, setMode] = useState<ViewMode>('isolated');
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.title = 'Bone Explorer — BoneVista';
    window.scrollTo(0, 0);
  }, [theme]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bones.filter((bone) => (side === 'all' || bone.side === side)
      && (!q || `${bone.name_en} ${bone.ta2_latin} ${bone.region.title}`.toLowerCase().includes(q)));
  }, [bones, query, side]);

  const groups = useMemo(() => DISPLAY_REGIONS
    .map((region) => ({ region, items: visible.filter((bone) => bone.region.id === region.id) }))
    .filter((group) => group.items.length), [visible]);
  const ordered = useMemo(() => groups.flatMap((group) => group.items), [groups]);

  const selected: ExplorerBone | undefined = bones.find((bone) => bone.organ_id === selectedId) ?? bones.find((bone) => bone.organ_id === DEFAULT_BONE) ?? bones[0];

  const select = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(false);
    window.history.replaceState(null, '', `${EXPLORER_HASH}/${encodeURIComponent(id)}`);
  };
  const step = (direction: 1 | -1) => {
    if (!ordered.length || !selected) return;
    const index = ordered.findIndex((bone) => bone.organ_id === selected.organ_id);
    const next = ordered[(index + direction + ordered.length) % ordered.length];
    select(next.organ_id);
  };

  // Keep the active row visible while stepping through the list.
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [selected?.organ_id]);

  // Up/down step through bones (also from the search box); left/right only outside text fields.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const inField = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement;
      const vertical = event.key === 'ArrowDown' || event.key === 'ArrowUp';
      const horizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
      if (!vertical && !(horizontal && !inField)) return;
      if (inField && (event.target as HTMLInputElement).type !== 'search') return;
      event.preventDefault();
      step(event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const openInWorkspace = () => {
    if (!selected) return;
    const store = useAppStore.getState();
    store.clearBoneSelection();
    store.toggleBoneSelection(selected.organ_id);
    store.setViewMode('bone');
    store.setActivePage('viewer');
    window.location.hash = '#workspace';
  };

  const counts = useMemo(() => ({
    bones: bones.filter((bone) => bone.region.id !== 'cartilage' && bone.region.id !== 'ligaments').length,
    total: bones.length,
  }), [bones]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.back} href="#top"><ArrowLeft size={16} /> BoneVista</a>
        <div className={styles.brand}><span className={styles.brandMark}><Bone size={16} /></span><h1>Bone <em>Explorer</em></h1></div>
        <span className={styles.count}>{counts.total ? `${counts.total} structures · ${counts.bones} bones & teeth` : 'Loading atlas…'}</span>
        <button type="button" className={styles.drawerToggle} onClick={() => setDrawerOpen(true)}><ListTree size={16} /> Bones</button>
      </header>

      <div className={styles.body}>
        <aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarOpen : ''}`} aria-label="Bone list">
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarTitle}>
              <span>All bones</span>
              <button type="button" className={styles.drawerClose} onClick={() => setDrawerOpen(false)} aria-label="Close bone list"><X size={16} /></button>
            </div>
            <label className={styles.search}>
              <Search size={15} aria-hidden="true" />
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, Latin or region…" aria-label="Search bones" />
            </label>
            <div className={styles.sides} role="group" aria-label="Filter by side">
              {SIDES.map((option) => (
                <button key={option.id} type="button" aria-pressed={side === option.id} onClick={() => setSide(option.id)}>{option.label}</button>
              ))}
            </div>
          </div>
          <div ref={listRef} className={styles.list}>
            {error && <p className={styles.empty}>{error}</p>}
            {!error && !bones.length && <p className={styles.empty}>Loading the atlas…</p>}
            {!!bones.length && !groups.length && <p className={styles.empty}>No bones match “{query}”.</p>}
            {groups.map(({ region, items }) => (
              <section key={region.id} className={styles.group}>
                <h2><span>{region.title}</span><small>{items.length}</small></h2>
                {items.map((bone) => (
                  <button
                    key={bone.organ_id}
                    type="button"
                    className={styles.item}
                    aria-current={bone.organ_id === selected?.organ_id}
                    onClick={() => select(bone.organ_id)}
                  >
                    <span>{bone.label}</span>
                    {bone.side !== 'midline' && <small>{bone.side === 'left' ? 'L' : 'R'}</small>}
                  </button>
                ))}
              </section>
            ))}
          </div>
        </aside>
        {drawerOpen && <button type="button" className={styles.scrim} aria-label="Close bone list" onClick={() => setDrawerOpen(false)} />}

        <main className={styles.stage}>
          <div className={styles.viewer}>
            {selected && (
              <Suspense fallback={<div className={styles.loading}>Loading 3D atlas…</div>}>
                <BoneViewer node={selected.node} knownNodes={knownNodes} mode={mode} wireframe={wireframe} autoRotate={autoRotate} resetKey={resetKey}
                  onPick={(node) => { const hit = bones.find((bone) => bone.node === node); if (hit) select(hit.organ_id); }} />
              </Suspense>
            )}
            {selected && (
              <div className={styles.hud}>
                <span className={styles.region}>{selected.region.title}{selected.side !== 'midline' ? ` · ${selected.side}` : ''}</span>
                <h2>{selected.label}</h2>
                <p>{selected.ta2_latin}</p>
              </div>
            )}
            <div className={styles.toolbar} role="toolbar" aria-label="Viewer controls">
              <button type="button" onClick={() => step(-1)} aria-label="Previous bone"><ChevronLeft size={16} /></button>
              <div className={styles.segment} role="group" aria-label="View mode">
                <button type="button" aria-pressed={mode === 'isolated'} onClick={() => setMode('isolated')}><Box size={14} /> Isolated</button>
                <button type="button" aria-pressed={mode === 'context'} onClick={() => setMode('context')}><Layers size={14} /> In skeleton</button>
              </div>
              <button type="button" aria-pressed={wireframe} onClick={() => setWireframe((value) => !value)}><Scan size={14} /> Wireframe</button>
              <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}><RotateCw size={14} /> Rotate</button>
              <button type="button" onClick={() => setResetKey((value) => value + 1)}>Reset view</button>
              <button type="button" onClick={() => step(1)} aria-label="Next bone"><ChevronRight size={16} /></button>
            </div>
            <span className={styles.tip}>{mode === 'context' ? 'Click any bone to select it · drag to orbit · scroll to zoom' : 'Drag to orbit · scroll to zoom · ↑ ↓ to step through bones'}</span>
          </div>

          {selected && (
            <aside className={styles.info} aria-label="Bone details">
              <dl>
                <div><dt>Name</dt><dd>{selected.name_en}</dd></div>
                <div><dt>Latin (TA2)</dt><dd><em>{selected.ta2_latin}</em></dd></div>
                <div><dt>Region</dt><dd>{selected.region.title}</dd></div>
                <div><dt>Side</dt><dd>{selected.side === 'midline' ? 'Midline (unpaired)' : selected.side === 'left' ? 'Left' : 'Right'}</dd></div>
              </dl>
              <p className={styles.blurb}>{selected.region.blurb}</p>
              <button type="button" className={styles.primary} onClick={openInWorkspace}>Open in 3D Anatomy workspace <ExternalLink size={14} /></button>
              <p className={styles.credit}>Reference meshes: Z-Anatomy / BodyParts3D, CC BY-SA 4.0.</p>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
};

export default BoneExplorerPage;
