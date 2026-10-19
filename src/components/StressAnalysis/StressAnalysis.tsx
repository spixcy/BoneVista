import { useState } from 'react';
import { Activity, Info, Play, RotateCcw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { solveAxialBar, type AxialFemResult } from './axialFemSolver';
import styles from './StressAnalysis.module.css';

const defaults = { forceN: 500, areaMm2: 300, lengthMm: 400, modulusGPa: 17, elements: 12 };

export default function StressAnalysis() {
  const { anatomyStructures, stressTargetId, setStressTargetId, setStressResultMPa, setViewMode, xrayUpload } = useAppStore();
  const [values, setValues] = useState(defaults);
  const [result, setResult] = useState<AxialFemResult | null>(null);
  const [error, setError] = useState('');
  const update = (key: keyof typeof defaults, value: number) => setValues((current) => ({ ...current, [key]: value }));
  const run = () => {
    if (!stressTargetId) { setError('Choose an atlas structure to show the simplified result on.'); return; }
    try {
      const solved = solveAxialBar(values);
      setResult(solved); setStressResultMPa(solved.maxStressMPa); setError('');
    } catch (reason) { setResult(null); setStressResultMPa(null); setError(reason instanceof Error ? reason.message : 'Simulation could not be solved.'); }
  };
  const reset = () => { setValues(defaults); setResult(null); setError(''); setStressResultMPa(null); };
  const targetName = anatomyStructures.find((item) => item.organ_id === stressTargetId)?.name_en ?? '';

  return <main className={styles.page}>
    <header className={styles.header}><span className="mono-label">EDUCATIONAL SIMULATION</span><h2>Axial Bone Stress</h2><p>Explore how a simplified uniform bone shaft responds to an axial load.</p></header>
    <div className={styles.notice}><Info size={17}/><span><strong>Educational model only.</strong> This is a one-dimensional linear elastic finite-element model of a uniform bar, not the 3D skeleton. Its assumptions and default material values are illustrative and not patient-specific or clinically validated.</span></div>
    {(xrayUpload.apPreview || xrayUpload.lateralPreview) && <section className={styles.xrayReference} aria-label="Associated X-ray reference">
      <div><strong>Associated X-ray reference</strong><span>The uploaded image is shown for reference; the solver does not read or measure X-ray pixels.</span></div>
      <div className={styles.xrayThumbs}>{xrayUpload.apPreview && <figure><img src={xrayUpload.apPreview} alt="AP X-ray reference"/><figcaption>AP</figcaption></figure>}{xrayUpload.lateralPreview && <figure><img src={xrayUpload.lateralPreview} alt="Lateral X-ray reference"/><figcaption>Lateral</figcaption></figure>}</div>
      <button onClick={() => setViewMode('xray')}>View uploaded X-rays</button>
    </section>}
    <div className={styles.layout}>
      <section className={styles.card}>
        <h3>Simulation inputs</h3>
        <p className={styles.description}>One end fixed; an axial tensile force is applied at the other end.</p>
        <label className={styles.field}>Atlas structure to highlight<select aria-label="Bone to color" value={stressTargetId ?? ''} onChange={(event) => { setStressTargetId(event.target.value || null); setResult(null); }}><option value="">Choose a structure…</option>{anatomyStructures.map((item) => <option key={item.organ_id} value={item.organ_id}>{item.name_en}</option>)}</select></label>
        <label className={styles.field}>Calculation geometry<select value="uniform-shaft" disabled><option value="uniform-shaft">Uniform long-bone shaft (1D bar)</option></select></label>
        <div className={styles.fields}>
          <NumberField label="Axial force" unit="N" value={values.forceN} min={0} onChange={(v) => update('forceN', v)}/>
          <NumberField label="Cross-sectional area" unit="mm²" value={values.areaMm2} min={0.01} onChange={(v) => update('areaMm2', v)}/>
          <NumberField label="Length" unit="mm" value={values.lengthMm} min={0.01} onChange={(v) => update('lengthMm', v)}/>
          <NumberField label="Young's modulus" unit="GPa" value={values.modulusGPa} min={0.01} onChange={(v) => update('modulusGPa', v)}/>
          <NumberField label="Finite elements" unit="elements" value={values.elements} min={1} max={100} step={1} onChange={(v) => update('elements', v)}/>
        </div>
        <div className={styles.summary}><strong>Configuration</strong><span>Linear elastic · uniform axial bar · node 0 fixed · {values.elements} two-node elements · force at free end</span></div>
        <div className={styles.actions}><button className={styles.run} onClick={run}><Play size={15}/>Run simulation</button><button className={styles.reset} onClick={reset}><RotateCcw size={14}/>Reset</button></div>
        {error && <p role="alert" className={styles.error}>{error}</p>}
      </section>
      <section className={styles.card} aria-live="polite">
        <h3>Results</h3>
        {!result ? <div className={styles.empty}><Activity size={29}/><strong>No simulation yet</strong><span>Set the inputs and run the educational model.</span></div> : <Results result={result} targetName={targetName}/>}
      </section>
    </div>
    <p className={styles.method}>Method: direct stiffness assembly for linear 2-node axial bar elements, with Gaussian elimination of the constrained global stiffness system. Stress is calculated as E·Δu/Δx; displacement is shown in millimetres. This simplified 1D method does not model 3D geometry, bending, anisotropy, failure, or fracture.</p>
  </main>;
}

function NumberField({ label, unit, value, min, max, step = 1, onChange }: { label: string; unit: string; value: number; min: number; max?: number; step?: number; onChange: (value: number) => void }) {
  return <label className={styles.field}>{label}<div className={styles.inputWrap}><input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.currentTarget.value === '' ? 0 : Number(event.currentTarget.value))}/><span>{unit}</span></div></label>;
}

function Results({ result, targetName }: { result: AxialFemResult; targetName: string }) {
  return <div className={styles.results}>
    <div className={styles.metrics}><Metric label="Max axial stress" value={`${result.maxStressMPa.toFixed(4)} MPa`}/><Metric label="End displacement" value={`${result.endDisplacementMm.toFixed(6)} mm`}/></div>
    <div className={styles.barVisual} aria-label="Uniform axial stress across the simplified bar">
      <span>Fixed</span><div className={styles.bar}><i/></div><span>Load →</span>
    </div>
    <div className={styles.resultDetail}><span>Elements solved</span><strong>{result.elementStressMPa.length}</strong><span>Element stress variation</span><strong>{(Math.max(...result.elementStressMPa) - Math.min(...result.elementStressMPa)).toExponential(2)} MPa</strong></div>
    <div className={styles.stressLegend}><span>0 MPa</span><i/><span>10 MPa</span></div>
    <p className={styles.resultNote} data-testid="stress-mapped-target">The calculated uniform 1D stress is mapped onto the selected atlas mesh: <strong>{targetName}</strong>.</p>
    <p className={styles.resultNote}>Calculated by the stated 1D finite-element model using the inputs shown. The uniform bar has constant axial stress under these assumptions.</p>
  </div>;
}
function Metric({ label, value }: { label: string; value: string }) { return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>; }
