import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { ArrowRight, Contrast, FileImage, Info, Maximize, Minus, Plus, RotateCcw, RotateCw, Sun, Upload, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import {
  getReconstructionCapabilities,
  getReconstructionHealth,
  getReconstructionJobStatus,
  fetchReconstructionModel,
  reconstructionApiBaseUrl,
  resolveModelGlbUrl,
  submitReconstructionJob,
  type ReconstructionCapabilities,
  type ReconstructionHealth,
  type ReconstructionJobStatusResponse,
} from '../../services/xrayReconstructionApi';
import ReconstructionModelViewer from './ReconstructionModelViewer';
import styles from './XrayWorkspace.module.css';

const ACCEPTED = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };
const MAX_SIZE = 25 * 1024 * 1024;
const JOB_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 1500;
type View = 'ap' | 'lateral';
type BackendStatus =
  | { kind: 'checking' }
  | { kind: 'offline'; message: string }
  | { kind: 'capabilities-error'; health: ReconstructionHealth; message: string }
  | { kind: 'loaded'; health: ReconstructionHealth; capabilities: ReconstructionCapabilities };

function DropZone({ label, preview, onFile }: { label: View; preview: string | null; onFile: (file: File | null) => void }) {
  const [error, setError] = useState<string | null>(null);
  const validationId = useRef(0);
  useEffect(() => () => { validationId.current += 1; }, []);
  const onDrop = useCallback((files: File[], rejected: FileRejection[]) => {
    const requestId = ++validationId.current;
    setError(null);
    if (rejected.length) {
      const code = rejected[0].errors[0]?.code;
      setError(code === 'file-too-large' ? 'File exceeds the 25 MB limit.' : 'Choose a JPEG, PNG, or WebP image. DICOM is not supported yet.');
      return;
    }
    if (!files[0]) return;
    void createImageBitmap(files[0]).then((image) => {
      image.close();
      if (requestId === validationId.current) onFile(files[0]);
    }).catch(() => {
      if (requestId === validationId.current) setError('This file could not be decoded as a JPEG, PNG, or WebP image.');
    });
  }, [onFile]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: ACCEPTED, maxFiles: 1, maxSize: MAX_SIZE });
  return <div className={styles.dropCol}>
    <span className={`${styles.dropLabel} mono-label`}>{label === 'ap' ? 'AP View' : 'Lateral View'}</span>
    <div {...getRootProps()} className={`${styles.dropZone} ${isDragActive ? styles.dragActive : ''} ${preview ? styles.hasFile : ''}`}>
      <input {...getInputProps()} aria-label={`${label === 'ap' ? 'AP' : 'Lateral'} radiograph file input`} />
      {preview ? <div className={styles.dropContent}><FileImage size={21}/><p>Image loaded</p><span>Choose another image</span><button className={styles.removeBtn} onClick={(event) => { event.stopPropagation(); validationId.current += 1; onFile(null); setError(null); }} aria-label={`Remove ${label === 'ap' ? 'AP' : 'Lateral'} radiograph`}><X size={14}/></button></div> : <div className={styles.dropContent}><Upload size={22}/><p>Drop {label === 'ap' ? 'AP' : 'lateral'} image here</p><span>JPEG, PNG, or WebP · max 25 MB</span></div>}
    </div>
    {error && <div className={styles.fieldError} role="alert">{error}</div>}
  </div>;
}

export default function XrayWorkspace() {
  const { anatomyStructures, stressTargetId, setStressTargetId, setActivePage, setViewMode, xrayUpload, setXrayAP, setXrayLateral, reconstructionAnatomyTarget, setReconstructionAnatomyTarget } = useAppStore();
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({ kind: 'checking' });
  const [statusRefresh, setStatusRefresh] = useState(0);
  const [view, setView] = useState<View>('ap');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [sampleError, setSampleError] = useState('');
  const [submittingJob, setSubmittingJob] = useState(false);
  const [jobState, setJobState] = useState<{
    id: string | null;
    status: 'idle' | 'queued' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'timed_out';
    progress: number | null;
    message: string;
    modelUrl: string | null;
    modelType: string | null;
  }>({
    id: null,
    status: 'idle',
    progress: null,
    message: '',
    modelUrl: null,
    modelType: null,
  });
  const [jobError, setJobError] = useState<string | null>(null);
  const [modelObjectUrl, setModelObjectUrl] = useState<string | null>(null);
  const [modelDownloadState, setModelDownloadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const pollTimerRef = useRef<number | null>(null);
  const timeoutTimerRef = useRef<number | null>(null);
  const jobAbortControllerRef = useRef<AbortController | null>(null);
  const jobStartedAtRef = useRef<number | null>(null);
  const submittedInputsRef = useRef<{ ap: File; lateral: File } | null>(null);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const file = view === 'ap' ? xrayUpload.ap : xrayUpload.lateral;
  const preview = view === 'ap' ? xrayUpload.apPreview : xrayUpload.lateralPreview;
  const target = anatomyStructures.find((item) => item.organ_id === stressTargetId);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setBackendStatus({ kind: 'checking' });
    void Promise.allSettled([
      getReconstructionHealth(controller.signal),
      getReconstructionCapabilities(controller.signal),
    ]).then(([healthResult, capabilitiesResult]) => {
      if (!active) return;
      if (healthResult.status === 'rejected') {
        setBackendStatus({ kind: 'offline', message: healthResult.reason instanceof Error ? healthResult.reason.message : 'Could not connect to the local reconstruction service.' });
      } else if (capabilitiesResult.status === 'rejected') {
        setBackendStatus({ kind: 'capabilities-error', health: healthResult.value, message: capabilitiesResult.reason instanceof Error ? capabilitiesResult.reason.message : 'Could not read model capabilities.' });
      } else {
        setBackendStatus({ kind: 'loaded', health: healthResult.value, capabilities: capabilitiesResult.value });
      }
    });
    return () => { active = false; controller.abort(); };
  }, [statusRefresh]);

  const capabilities = backendStatus.kind === 'loaded' ? backendStatus.capabilities : null;
  const modelAvailable = capabilities?.available === true && capabilities.mode === 'research';
  const supportedAnatomies = capabilities?.supported_anatomies ?? [];
  const selectedTargetSupported = !!reconstructionAnatomyTarget && supportedAnatomies.includes(reconstructionAnatomyTarget);
  const uploadLimit = capabilities?.max_upload_bytes;
  const inputTooLarge = !!uploadLimit && [xrayUpload.ap, xrayUpload.lateral].some((input) => !!input && input.size > uploadLimit);
  const bothViewsReady = !!xrayUpload.ap && !!xrayUpload.lateral;
  const readyForSubmission = modelAvailable && supportedAnatomies.length > 0 && bothViewsReady && !inputTooLarge && selectedTargetSupported;
  const sampleLoaded = [xrayUpload.ap?.name, xrayUpload.lateral?.name].some((name) => name?.startsWith('bonevista-hip-'));
  const backendStatusLabel = backendStatus.kind === 'checking' ? 'Checking service'
    : backendStatus.kind === 'offline' ? 'API offline'
      : backendStatus.kind === 'capabilities-error' ? 'Model status unavailable'
        : !backendStatus.capabilities.available ? 'Model unavailable'
          : supportedAnatomies.length === 0 ? 'No supported targets'
            : inputTooLarge ? 'Input exceeds service limit'
              : readyForSubmission ? 'Ready for submission'
                : 'Model available';
  const modelLabel = backendStatus.kind === 'loaded'
    ? backendStatus.capabilities.available ? backendStatus.capabilities.model ?? 'Available' : 'Not configured'
    : backendStatus.kind === 'checking' ? 'Checking'
      : backendStatus.kind === 'offline' ? 'Unavailable'
        : 'Unknown';

  useEffect(() => {
    if (backendStatus.kind === 'loaded' && reconstructionAnatomyTarget && !backendStatus.capabilities.supported_anatomies.includes(reconstructionAnatomyTarget)) {
      setReconstructionAnatomyTarget(null);
    }
  }, [backendStatus, reconstructionAnatomyTarget, setReconstructionAnatomyTarget]);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current !== null) {
        window.clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      if (timeoutTimerRef.current !== null) {
        window.clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
      if (jobAbortControllerRef.current) {
        jobAbortControllerRef.current.abort();
        jobAbortControllerRef.current = null;
      }
    };
  }, []);

  const cancelActiveJob = useCallback((status: 'cancelled' | 'timed_out' = 'cancelled') => {
    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutTimerRef.current !== null) {
      window.clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    jobAbortControllerRef.current?.abort();
    jobAbortControllerRef.current = null;
    setSubmittingJob(false);
    setJobState((previous) => previous.status === 'queued' || previous.status === 'processing'
      ? { ...previous, status, message: status === 'timed_out' ? 'The client stopped waiting after 5 minutes; the server may still be processing the job.' : 'Stopped waiting in this browser. The server may continue processing the job.' }
      : previous);
    if (status === 'timed_out') setJobError('The service did not finish within 5 minutes. Check the service before submitting again.');
  }, []);

  useEffect(() => {
    const submitted = submittedInputsRef.current;
    if (submitted && (submitted.ap !== xrayUpload.ap || submitted.lateral !== xrayUpload.lateral)) {
      cancelActiveJob();
      submittedInputsRef.current = null;
    }
  }, [xrayUpload.ap, xrayUpload.lateral, cancelActiveJob]);

  const handleStartReconstruction = useCallback(async () => {
    if (!xrayUpload.ap || !xrayUpload.lateral || !reconstructionAnatomyTarget) return;

    if (pollTimerRef.current !== null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (jobAbortControllerRef.current) {
      jobAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    jobAbortControllerRef.current = controller;
    jobStartedAtRef.current = Date.now();
    submittedInputsRef.current = { ap: xrayUpload.ap, lateral: xrayUpload.lateral };
    timeoutTimerRef.current = window.setTimeout(() => cancelActiveJob('timed_out'), JOB_TIMEOUT_MS);
    setSubmittingJob(true);
    setJobError(null);
    setJobState({
      id: null,
      status: 'queued',
      progress: null,
      message: 'Submitting reconstruction job…',
      modelUrl: null,
      modelType: null,
    });

    try {
      const submitRes = await submitReconstructionJob(
        xrayUpload.ap,
        xrayUpload.lateral,
        reconstructionAnatomyTarget,
        controller.signal
      );

      if (controller.signal.aborted) return;

      setSubmittingJob(false);
      setJobState({
        id: submitRes.job_id,
        status: 'queued',
        progress: null,
        message: 'Job queued on server…',
        modelUrl: null,
        modelType: null,
      });

      // Begin polling job status
      const poll = async (jobId: string) => {
        if (controller.signal.aborted) return;
        if (jobStartedAtRef.current !== null && Date.now() - jobStartedAtRef.current >= JOB_TIMEOUT_MS) {
          cancelActiveJob('timed_out');
          return;
        }
        try {
          const statusRes: ReconstructionJobStatusResponse = await getReconstructionJobStatus(
            jobId,
            controller.signal
          );

          if (controller.signal.aborted) return;
          if (statusRes.job_id !== jobId) throw new Error('The service returned a status for a different job.');

          setJobState({
            id: statusRes.job_id,
            status: statusRes.status,
            progress: statusRes.progress,
            message: statusRes.message,
            modelUrl: statusRes.model_url ? resolveModelGlbUrl(statusRes.model_url) : null,
            modelType: statusRes.model_type,
          });

          if (statusRes.status === 'queued' || statusRes.status === 'processing') {
            pollTimerRef.current = window.setTimeout(() => void poll(jobId), POLL_INTERVAL_MS);
          } else {
            if (timeoutTimerRef.current !== null) window.clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
            jobAbortControllerRef.current = null;
            submittedInputsRef.current = null;
            if (statusRes.status === 'failed') setJobError(statusRes.message || 'The reconstruction failed.');
          }
        } catch (err) {
          if (!controller.signal.aborted) {
            setJobState((prev) => ({ ...prev, status: 'failed', message: 'Polling error' }));
            setJobError(err instanceof Error ? err.message : 'Error polling reconstruction job.');
            jobAbortControllerRef.current = null;
            if (timeoutTimerRef.current !== null) window.clearTimeout(timeoutTimerRef.current);
            timeoutTimerRef.current = null;
            submittedInputsRef.current = null;
          }
        }
      };

      pollTimerRef.current = window.setTimeout(() => void poll(submitRes.job_id), 1000);
    } catch (err) {
      setSubmittingJob(false);
      if (!controller.signal.aborted) {
        setJobState((prev) => ({ ...prev, status: 'failed', message: 'Submission rejected' }));
        setJobError(err instanceof Error ? err.message : 'Failed to submit reconstruction job.');
        jobAbortControllerRef.current = null;
        if (timeoutTimerRef.current !== null) window.clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
        submittedInputsRef.current = null;
      }
    }
  }, [xrayUpload.ap, xrayUpload.lateral, reconstructionAnatomyTarget, cancelActiveJob]);

  useEffect(() => {
    if (jobState.status !== 'succeeded' || !jobState.modelUrl) {
      setModelObjectUrl(null);
      setModelDownloadState('idle');
      return;
    }
    const controller = new AbortController();
    let active = true;
    let createdUrl: string | null = null;
    setModelObjectUrl(null);
    setModelDownloadState('loading');
    void fetchReconstructionModel(jobState.modelUrl, controller.signal).then((blob) => {
      if (!active) return;
      createdUrl = URL.createObjectURL(blob);
      setModelObjectUrl(createdUrl);
    }).catch((error) => {
      if (!active || controller.signal.aborted) return;
      setModelDownloadState('error');
      setJobError(error instanceof Error ? error.message : 'The returned model could not be downloaded.');
    });
    return () => {
      active = false;
      controller.abort();
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [jobState.status, jobState.modelUrl]);

  const handleModelLoaded = useCallback(() => setModelDownloadState('ready'), []);
  const handleModelLoadError = useCallback(() => {
    setModelDownloadState('error');
    setJobError('The returned GLB could not be parsed by the viewer.');
  }, []);

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
  const loadSamplePair = async () => {
    setLoadingSamples(true); setSampleError('');
    try {
      const [apResponse, lateralResponse] = await Promise.all([
        fetch('/test-images/bonevista-hip-ap-sample.jpg'),
        fetch('/test-images/bonevista-hip-lateral-sample.jpg'),
      ]);
      if (!apResponse.ok || !lateralResponse.ok) throw new Error('The sample images could not be loaded.');
      const [apBlob, lateralBlob] = await Promise.all([apResponse.blob(), lateralResponse.blob()]);
      setXrayAP(new File([apBlob], 'bonevista-hip-ap-sample.jpg', { type: 'image/jpeg' }));
      setXrayLateral(new File([lateralBlob], 'bonevista-hip-lateral-sample.jpg', { type: 'image/jpeg' }));
    } catch (reason) {
      setSampleError(reason instanceof Error ? reason.message : 'The sample images could not be loaded.');
    } finally { setLoadingSamples(false); }
  };
  const openStressMapping = () => { setViewMode('stress'); setActivePage('viewer'); };

  return <div className={styles.workspace}>
    <div className={styles.header}><h2 className={styles.title}>X-Ray Workspace</h2><p className={styles.subtitle}>View and adjust AP and lateral radiographs locally in this browser.</p></div>
    <div className={styles.sampleActions}>
      <button onClick={loadSamplePair} disabled={loadingSamples}>{loadingSamples ? 'Loading sample pair…' : 'Load real AP + lateral sample X-rays'}</button>
      <span>CC0 teaching example of a hip replacement. <a href="https://commons.wikimedia.org/wiki/File:X-ray_of_hip_with_total_arthroplasty_-_Anteroposterior.jpg" target="_blank" rel="noreferrer">Image source and license</a>.</span>
    </div>
    {sampleError && <div className={styles.fieldError} role="alert">{sampleError}</div>}
    <div className={styles.uploadRow}>
      <DropZone label="ap" preview={xrayUpload.apPreview} onFile={setXrayAP}/>
      <DropZone label="lateral" preview={xrayUpload.lateralPreview} onFile={setXrayLateral}/>
    </div>
    <section className={styles.reconstructionStatus} aria-label="3D reconstruction status">
      <div className={styles.reconstructionHeading}>
        <div><span className="mono-label">RECONSTRUCTION</span><h3>AI-estimated 3D model</h3></div>
        <span className={modelAvailable && supportedAnatomies.length > 0 ? styles.availableBadge : styles.unavailableBadge}>{backendStatusLabel}</span>
      </div>
      <p>{backendStatus.kind === 'checking' ? 'Checking the local API and its model capabilities.'
        : backendStatus.kind === 'offline' ? `${backendStatus.message} Local image viewing remains available.`
          : backendStatus.kind === 'capabilities-error' ? `The API is responding, but model capabilities could not be read: ${backendStatus.message}`
            : !backendStatus.capabilities.available ? backendStatus.capabilities.reason ?? 'The API is healthy, but no verified inference model is configured.'
              : supportedAnatomies.length === 0 ? 'The API reports an available model but no supported anatomy targets. Reconstruction cannot be submitted.'
                : `The API is healthy${backendStatus.capabilities.model ? ` · model ${backendStatus.capabilities.model}` : ''}. Only anatomy targets reported by this model are available.`}</p>
      <div className={styles.inputStatus}>
        <span>AP input <strong>{xrayUpload.ap ? 'Ready' : 'Waiting for image'}</strong></span>
        <span>Lateral input <strong>{xrayUpload.lateral ? 'Ready' : 'Waiting for image'}</strong></span>
        <span>Inference model <strong>{modelLabel}</strong></span>
      </div>
      {modelAvailable && supportedAnatomies.length > 0 && <label className={styles.reconstructionTarget} htmlFor="xray-reconstruction-target">
        Reconstruction anatomy
        <select id="xray-reconstruction-target" aria-label="Reconstruction anatomy target" value={reconstructionAnatomyTarget ?? ''} onChange={(event) => setReconstructionAnatomyTarget(event.target.value || null)}>
          <option value="">Choose a supported anatomy…</option>
          {supportedAnatomies.map((anatomy) => <option key={anatomy} value={anatomy}>{anatomy.replace(/[-_]+/g, ' ')}</option>)}
        </select>
      </label>}
      {capabilities?.input_constraints?.length ? <ul className={styles.inputConstraints}>{capabilities.input_constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}</ul> : null}
      {inputTooLarge && <p className={styles.statusWarning} role="alert">An image exceeds the backend limit of {(uploadLimit! / 1024 / 1024).toFixed(1)} MiB. Replace it with a smaller file.</p>}
      {sampleLoaded && modelAvailable && <p className={styles.statusWarning}>The bundled teaching pair shows a hip replacement and may be outside the model’s validated input domain. It is for viewer testing, not reconstruction accuracy evaluation.</p>}
      {modelAvailable && <div className={styles.capabilityActions}>
        <span>{backendStatusLabel}{bothViewsReady ? '' : ' · AP and lateral views are both required'}</span>
        <button type="button" onClick={() => setStatusRefresh((value) => value + 1)} disabled={backendStatus.kind === 'checking'}>Refresh capabilities</button>
      </div>}
      {backendStatus.kind !== 'loaded' && <button type="button" className={styles.capabilityRetry} onClick={() => setStatusRefresh((value) => value + 1)} disabled={backendStatus.kind === 'checking'}>Check local service</button>}
      
      {jobError && <div className={styles.fieldError} role="alert">{jobError}</div>}
      
      {jobState.status !== 'idle' && (
        <div className={styles.jobProgressBox}>
          <div className={styles.jobStatusRow}>
            <span>Status: <strong>{jobState.status}</strong></span>
            {jobState.progress !== null && <span>{jobState.progress}%</span>}
          </div>
          <p className={styles.jobMessage}>{jobState.message}</p>
          {jobState.status === 'succeeded' && jobState.modelUrl && (
            <div className={styles.jobSuccessAction}>
              <span>AI-estimated educational/research reconstruction — not clinically validated. Output: {jobState.modelType ?? 'model type not specified'}.</span>
              {modelDownloadState === 'loading' && <span>Downloading and validating the returned GLB…</span>}
              {modelDownloadState === 'ready' && modelObjectUrl && <a href={modelObjectUrl} download="reconstructed_bone.glb" className={styles.downloadGlbBtn}>
                Download GLB mesh
              </a>}
            </div>
          )}
        </div>
      )}

      {(submittingJob || jobState.status === 'queued' || jobState.status === 'processing') && <button type="button" className={styles.cancelJobBtn} onClick={() => cancelActiveJob()}>Stop waiting</button>}
      {jobState.status === 'succeeded' && modelObjectUrl && <ReconstructionModelViewer url={modelObjectUrl} onLoad={handleModelLoaded} onError={handleModelLoadError} />}
      <button
        className={readyForSubmission && !submittingJob && !['queued', 'processing'].includes(jobState.status) ? styles.reconstructBtn : styles.reconstructDisabled}
        disabled={!readyForSubmission || submittingJob || jobState.status === 'queued' || jobState.status === 'processing'}
        onClick={handleStartReconstruction}
        title={readyForSubmission ? 'Submit AP + lateral pair to local reconstruction service' : 'The backend must be available with a supported target and both valid views'}
      >
        {submittingJob ? 'Submitting job…' : jobState.status === 'queued' || jobState.status === 'processing' ? 'Reconstructing…' : 'Reconstruct 3D bone'}
      </button>
      <small>{readyForSubmission ? 'Explicit user action sends images to the configured local service. The reference atlas remains separate.' : 'Images remain in this browser during capability checks. The reference atlas remains separate.'} API: <code>{reconstructionApiBaseUrl}</code></small>
    </section>
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
    <div className={styles.association}>
      <label htmlFor="xray-bone-target">Associate these images with an atlas bone</label>
      <select id="xray-bone-target" aria-label="Bone associated with radiographs" value={stressTargetId ?? ''} onChange={(event) => setStressTargetId(event.target.value || null)}>
        <option value="">Choose the matching bone…</option>
        {anatomyStructures.map((item) => <option key={item.organ_id} value={item.organ_id}>{item.name_en}</option>)}
      </select>
      <button onClick={openStressMapping} disabled={!stressTargetId || (!xrayUpload.ap && !xrayUpload.lateral)} title={!stressTargetId ? 'Choose the corresponding atlas bone first' : !xrayUpload.ap && !xrayUpload.lateral ? 'Upload an AP or lateral image first' : 'Open the educational stress mapping for the selected bone'}>
        Open stress mapping{target ? ` for ${target.name_en}` : ''}<ArrowRight size={15}/>
      </button>
      <small>The image is a reference only. Stress is calculated from the educational load/material inputs; it is not inferred from the X-ray.</small>
    </div>
    <div className={styles.info}><Info size={14}/><span>Images remain in this browser during service checks. No AI analysis, diagnosis, or 3D reconstruction is performed by checking service status. Brightness, contrast, pan, zoom, and rotation are viewing adjustments only. DICOM files are not supported in this version.</span></div>
  </div>;
}
