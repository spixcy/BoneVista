import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Contrast, FileImage, Info, Maximize, Minus, Plus, RotateCcw, RotateCw, Sun, Upload, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './XrayWorkspace.module.css';

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };
const MAX_SIZE = 25 * 1024 * 1024;
type View = 'ap' | 'lateral';

function DropZone({ label, preview, onFile }: { label: View; preview: string | null; onFile: (file: File | null) => void }) {
  const [error, setError] = useState<string | null>(null);
  const onDrop = useCallback((files: File[], rejected: FileRejection[]) => {
    setError(null);
    if (rejected.length) {
      const code = rejected[0].errors[0]?.code;
      setError(code === 'file-too-large' ? 'File exceeds the 25 MB limit.' : 'Choose a JPEG, PNG, or WebP image. DICOM is not supported yet.');
      return;
    }
    if (files[0]) onFile(files[0]);
  }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, maxFiles: 1, maxSize: MAX_SIZE });
  return <div className={styles.dropCol}>
    <span className={`${styles.dropLabel} mono-label`}>{label === 'ap' ? 'AP View' : 'Lateral View'}</span>
    <div {...getRootProps()} className={`${styles.dropZone} ${isDragActive ? styles.dragActive : ''} ${preview ? styles.hasFile : ''}`}>
      <input {...getInputProps()} aria-label={`${label === 'ap' ? 'AP' : 'Lateral'} radiograph file input`} />
      {preview ? <div className={styles.dropContent}><FileImage size={21}/><p>Image loaded</p><span>Choose another image</span><button className={styles.removeBtn} onClick={(event) => { event.stopPropagation(); onFile(null); setError(null); }} aria-label={`Remove ${label === 'ap' ? 'AP' : 'Lateral'} radiograph`}><X size={14}/></button></div> : <div className={styles.dropContent}><Upload size={22}/><p>Drop {label === 'ap' ? 'AP' : 'lateral'} image here</p><span>JPEG, PNG, or WebP · max 25 MB</span></div>}
    </div>
    {error && <div className={styles.fieldError} role="alert">{error}</div>}
  </div>;
}

export default function XrayWorkspace() {
  const { xrayUpload, setXrayAP, setXrayLateral } = useAppStore();
  const [view, setView] = useState<View>('ap');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const file = view === 'ap' ? xrayUpload.ap : xrayUpload.lateral;
  const preview = view === 'ap' ? xrayUpload.apPreview : xrayUpload.lateralPreview;
  const updateFile = view === 'ap' ? setXrayAP : setXrayLateral;

  useEffect(() => {
    setDimensions(null);
    setZoom(1); setRotation(0); setPan({ x: 0, y: 0 });
    if (!preview) return;
    const image = new Image();
    image.onload = () => setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
    image.src = preview;
    return () => { image.onload = null; };
  }, [preview]);

  const reset = () => { setZoom(1); setRotation(0); setBrightness(100); setContrast(100); setPan({ x: 0, y: 0 }); };
  const fit = () => {
    const stage = stageRef.current;
    if (!stage || !dimensions) return;
    const padding = 36;
    const availableWidth = stage.clientWidth - padding;
    const availableHeight = stage.clientHeight - padding;
    const baseScale = Math.min(1, availableWidth / dimensions.width, availableHeight / dimensions.height);
    const baseWidth = dimensions.width * baseScale;
    const baseHeight = dimensions.height * baseScale;
    const rotated = Math.abs(rotation % 180) === 90;
    setZoom(rotated ? Math.min(availableWidth / baseHeight, availableHeight / baseWidth) : 1);
    setPan({ x: 0, y: 0 });
  };
  const wheel = (event: React.WheelEvent) => { event.preventDefault(); setZoom((value) => Math.max(0.1, Math.min(8, value * (event.deltaY < 0 ? 1.12 : 0.89)))); };
  const startPan = (event: React.PointerEvent) => {
    if (!preview || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y };
    setDragging(true);
  };
  const movePan = (event: React.PointerEvent) => {
    if (!dragStart.current) return;
    setPan({ x: dragStart.current.panX + event.clientX - dragStart.current.x, y: dragStart.current.panY + event.clientY - dragStart.current.y });
  };
  const endPan = () => { dragStart.current = null; setDragging(false); };

  return <div className={styles.workspace}>
    <div className={styles.header}><h2 className={styles.title}>X-Ray Workspace</h2><p className={styles.subtitle}>View and adjust AP and lateral radiographs locally in this browser.</p></div>
    <div className={styles.uploadRow}>
      <DropZone label="ap" preview={xrayUpload.apPreview} onFile={setXrayAP}/>
      <DropZone label="lateral" preview={xrayUpload.lateralPreview} onFile={setXrayLateral}/>
    </div>
    <section className={styles.viewer} aria-label="Radiograph viewer">
      <div className={styles.viewerHeader}>
        <div className={styles.switcher} role="tablist" aria-label="Radiograph view">
          <button role="tab" aria-selected={view === 'ap'} onClick={() => setView('ap')}>AP {xrayUpload.ap ? '●' : ''}</button>
          <button role="tab" aria-selected={view === 'lateral'} onClick={() => setView('lateral')}>Lateral {xrayUpload.lateral ? '●' : ''}</button>
        </div>
        <div className={styles.controls}>
          <button aria-label="Zoom out" title="Zoom out" disabled={!preview} onClick={() => setZoom((value) => Math.max(0.1, value / 1.2))}><Minus size={15}/></button>
          <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
          <button aria-label="Zoom in" title="Zoom in" disabled={!preview} onClick={() => setZoom((value) => Math.min(8, value * 1.2))}><Plus size={15}/></button>
          <button aria-label="Fit image" title="Fit image" disabled={!preview} onClick={fit}><Maximize size={15}/></button>
          <button aria-label="Rotate left" title="Rotate left" disabled={!preview} onClick={() => setRotation((value) => (value + 270) % 360)}><RotateCcw size={15}/></button>
          <button aria-label="Rotate right" title="Rotate right" disabled={!preview} onClick={() => setRotation((value) => (value + 90) % 360)}><RotateCw size={15}/></button>
          <button aria-label="Reset adjustments" title="Reset adjustments" disabled={!preview} onClick={reset}><X size={15}/></button>
        </div>
      </div>
      <div ref={stageRef} className={`${styles.stage} ${preview ? styles.stageReady : ''} ${dragging ? styles.dragging : ''}`} onWheel={wheel} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={endPan} onPointerCancel={endPan}>
        {preview ? <img className={styles.radiograph} src={preview} alt={`${view === 'ap' ? 'AP' : 'Lateral'} radiograph`} draggable={false} style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`, filter: `brightness(${brightness}%) contrast(${contrast}%)` }} /> : <div className={styles.empty}><FileImage size={30}/><strong>No {view === 'ap' ? 'AP' : 'lateral'} image loaded</strong><span>Upload a JPEG, PNG, or WebP image above to begin.</span></div>}
      </div>
      <div className={styles.adjustments}>
        <label><Sun size={14}/>Brightness<input aria-label="Brightness" type="range" min="25" max="200" value={brightness} disabled={!preview} onChange={(event) => setBrightness(Number(event.target.value))}/><span>{brightness}%</span></label>
        <label><Contrast size={14}/>Contrast<input aria-label="Contrast" type="range" min="25" max="250" value={contrast} disabled={!preview} onChange={(event) => setContrast(Number(event.target.value))}/><span>{contrast}%</span></label>
        <div className={styles.metadata}>{file ? <><strong>{file.name}</strong><span>{dimensions ? `${dimensions.width} × ${dimensions.height}px` : 'Reading dimensions…'} · {(file.size / 1024 / 1024).toFixed(2)} MB</span></> : <span>No image metadata</span>}</div>
      </div>
    </section>
    <div className={styles.info}><Info size={14}/><span>Images stay in this browser. Brightness, contrast, pan, zoom, and rotation are viewing adjustments only; there is no AI analysis, diagnosis, or 3D reconstruction configured. DICOM files are not supported in this version.</span></div>
  </div>;
}
