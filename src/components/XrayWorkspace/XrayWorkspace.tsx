import React, { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { CheckCircle, Info, Upload, X, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './XrayWorkspace.module.css';

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] };
const MAX_SIZE = 15 * 1024 * 1024;

function DropZone({ label, preview, onFile }: { label: 'AP' | 'Lateral'; preview: string | null; onFile: (file: File | null) => void }) {
  const [error, setError] = React.useState<string | null>(null);
  const onDrop = useCallback((files: File[], rejected: FileRejection[]) => {
    setError(null);
    if (rejected.length) {
      const code = rejected[0].errors[0]?.code;
      setError(code === 'file-too-large' ? 'File exceeds the 15 MB limit.' : code === 'file-invalid-type' ? 'Choose a JPEG or PNG image.' : 'This file could not be accepted.');
      return;
    }
    if (files[0]) onFile(files[0]);
  }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, maxFiles: 1, maxSize: MAX_SIZE });
  return <div className={styles.dropCol}>
    <span className={`${styles.dropLabel} mono-label`}>{label} View</span>
    <div {...getRootProps()} className={`${styles.dropZone} ${isDragActive ? styles.dragActive : ''} ${preview ? styles.hasFile : ''}`}>
      <input {...getInputProps()} aria-label={`${label} radiograph file input`} />
      {preview ? <div className={styles.preview}><img src={preview} alt={`${label} radiograph preview`} /><button className={styles.removeBtn} onClick={(event) => { event.stopPropagation(); onFile(null); setError(null); }} aria-label={`Remove ${label} radiograph`}><X size={14} /></button><div className={styles.fileReady}><CheckCircle size={14} />Preview ready</div></div> : <div className={styles.dropContent}><Upload size={24} /><p>Drop {label} radiograph here</p><span>JPEG or PNG · max 15 MB</span></div>}
    </div>
    {error && <div className={styles.fieldError}><AlertCircle size={12} />{error}</div>}
  </div>;
}

export default function XrayWorkspace() {
  const { xrayUpload, setXrayAP, setXrayLateral } = useAppStore();
  return <div className={styles.workspace}>
    <div className={styles.header}><h2 className={styles.title}>X-Ray Workspace</h2><p className={styles.subtitle}>Preview AP and lateral images locally in this browser.</p></div>
    <div className={styles.uploadRow}><DropZone label="AP" preview={xrayUpload.apPreview} onFile={setXrayAP} /><DropZone label="Lateral" preview={xrayUpload.lateralPreview} onFile={setXrayLateral} /></div>
    <button className={styles.submitBtn} disabled aria-disabled="true">Inference unavailable</button>
    <div className={styles.errorMsg}><Info size={14} />No validated inference service or compatible licensed checkpoint is configured. Images are not uploaded.</div>
    <div className={styles.info}><Info size={13} /><span>The Xrayto3D benchmark explores biplanar reconstruction for individual target bones. Its code is GPL-3.0; checkpoint availability and licensing remain unverified. <a href="https://github.com/naamiinepal/xrayto3D-benchmark" target="_blank" rel="noopener noreferrer">Read benchmark notes →</a></span></div>
  </div>;
}
