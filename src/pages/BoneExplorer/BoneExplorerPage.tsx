import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Bone, Box, ChevronLeft, ChevronRight, Crosshair, ExternalLink, Layers, ListTree, RotateCw, Scan, Search, X } from 'lucide-react';
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

const normKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
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
  const telemetry = useRef<{ azimuth: HTMLElement | null; elevation: HTMLElement | null }>({ azimuth: null, elevation: null });

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

  const selected: ExplorerBone | undefined = bones.find((bone) => bone.organ_id === selectedId)
    ?? bones.find((bone) => normKey(bone.node) === normKey(selectedId))
    ?? bones.find((bone) => bone.organ_id === DEFAULT_BONE) ?? bones[0];

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
          <div className={styles.scanner}>
            <span className={styles.cornerTL} /><span className={styles.cornerTR} /><span className={styles.cornerBL} /><span className={styles.cornerBR} />

            <div className={styles.canvas}>
              {selected && (
                <Suspense fallback={<div className={styles.loading}>Initialising 3D scanner…</div>}>
                  <BoneViewer node={selected.node} knownNodes={knownNodes} mode={mode} wireframe={wireframe} autoRotate={autoRotate} resetKey={resetKey} telemetry={telemetry}
                    onPick={(node) => { const hit = bones.find((bone) => bone.node === node); if (hit) select(hit.organ_id); }} />
                </Suspense>
              )}
            </div>

            <svg className={styles.reticle} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <g className={styles.ring}>
                <circle cx="250" cy="250" r="215" fill="none" stroke="rgba(212,175,55,.22)" strokeWidth="1" strokeDasharray="8 6 2 6" />
                <circle cx="250" cy="250" r="198" fill="none" stroke="rgba(212,175,55,.12)" strokeWidth="1" strokeDasharray="3 9" />
              </g>
              <g className={styles.ringReverse}>
                <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(212,175,55,.2)" strokeWidth="1" strokeDasharray="14 18" />
              </g>
              <circle cx="250" cy="250" r="118" fill="none" stroke="rgba(212,175,55,.3)" strokeWidth="1" />
              <circle cx="250" cy="250" r="34" fill="none" stroke="rgba(212,175,55,.4)" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M250 18v60M250 422v60M18 250h60M422 250h60" stroke="#d4af37" strokeOpacity=".55" strokeWidth="1.2" />
              <path d="M238 238h6M238 238v6M262 238h-6M262 238v6M238 262h6M238 262v-6M262 262h-6M262 262v-6" stroke="#d4af37" strokeWidth="1.4" />
              <g fill="#d4af37" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
                <text x="250" y="12">000°</text><text x="490" y="254">090°</text><text x="250" y="498">180°</text><text x="12" y="254">270°</text>
              </g>
            </svg>
            <div className={styles.scanline} aria-hidden="true" />

            <div className={styles.hudTop}>
              <span className={styles.status}><i /> Scanner active · target locked</span>
              {selected && <span className={styles.target}>Anatomy: <b>{selected.label}{selected.side !== 'midline' ? ` (${selected.side})` : ''}</b> <em>[{selected.region.title}]</em></span>}
            </div>

            {selected && (
              <div className={styles.title}>
                <h2>{selected.label}</h2>
                <p>{selected.ta2_latin}</p>
              </div>
            )}

            <div className={styles.hudBottom}>
              <div className={styles.telemetry}>
                <span>Ref: <b>{selected?.ta2_latin ?? '—'}</b></span>
                <span>Azimuth: <b ref={(el) => { telemetry.current.azimuth = el; }}>000°</b> &nbsp; Elevation: <b ref={(el) => { telemetry.current.elevation = el; }}>0°</b></span>
                <span className={styles.tip}>{mode === 'context' ? 'Click a bone to select · drag to orbit · scroll to zoom' : 'Drag to orbit · scroll to zoom · ↑ ↓ next bone'}</span>
              </div>
              <div className={styles.controls} role="toolbar" aria-label="Scanner controls">
                <button type="button" className={styles.iconButton} onClick={() => step(-1)} aria-label="Previous bone"><ChevronLeft size={16} /></button>
                <div className={styles.segment} role="group" aria-label="View mode">
                  <button type="button" aria-pressed={mode === 'isolated'} onClick={() => setMode('isolated')}><Box size={14} /> Isolated</button>
                  <button type="button" aria-pressed={mode === 'context'} onClick={() => setMode('context')}><Layers size={14} /> In skeleton</button>
                </div>
                <button type="button" aria-pressed={wireframe} onClick={() => setWireframe((value) => !value)}><Scan size={14} /> {wireframe ? 'Wireframe' : 'Solid scan'}</button>
                <button type="button" aria-pressed={autoRotate} onClick={() => setAutoRotate((value) => !value)}><RotateCw size={14} /> {autoRotate ? 'Rotating' : 'Paused'}</button>
                <button type="button" onClick={() => setResetKey((value) => value + 1)}><Crosshair size={14} /> Re-centre</button>
                <button type="button" className={styles.iconButton} onClick={() => step(1)} aria-label="Next bone"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>

          {selected && (
            <aside className={styles.info} aria-label="Bone details">
              <span className={styles.infoKicker}>Target data</span>
              <dl>
                <div><dt>Name</dt><dd>{selected.name_en}</dd></div>
                <div><dt>Latin (TA2)</dt><dd><em>{selected.ta2_latin}</em></dd></div>
                <div><dt>Region</dt><dd>{selected.region.title}</dd></div>
                <div><dt>Side</dt><dd>{selected.side === 'midline' ? 'Midline (unpaired)' : selected.side === 'left' ? 'Left' : 'Right'}</dd></div>
                <div><dt>Atlas ID</dt><dd><code>{selected.organ_id}</code></dd></div>
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
