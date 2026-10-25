export interface ReconstructionHealth {
  status: 'ok';
  service: string;
}

export interface ReconstructionCapabilities {
  available: boolean;
  mode: 'unavailable' | 'research';
  model: string | null;
  supported_anatomies: string[];
  requires_ap: boolean;
  requires_lateral: boolean;
  max_upload_bytes: number;
  input_constraints?: string[];
  reason?: string | null;
}

export class ReconstructionApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReconstructionApiError';
  }
}

export const reconstructionApiBaseUrl = (
  import.meta.env.VITE_XRAY_RECON_API_URL?.trim() || 'http://127.0.0.1:8000'
).replace(/\/+$/, '');

async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${reconstructionApiBaseUrl}${path}`, { signal });
  } catch {
    if (signal?.aborted) throw new ReconstructionApiError('The service check was cancelled.');
    throw new ReconstructionApiError('Could not connect to the local reconstruction service.');
  }

  if (!response.ok) throw new ReconstructionApiError(`The service returned HTTP ${response.status}.`);
  try {
    return await response.json();
  } catch {
    throw new ReconstructionApiError('The service returned an invalid response.');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function getReconstructionHealth(signal?: AbortSignal): Promise<ReconstructionHealth> {
  const value = await getJson('/api/v1/health', signal);
  if (!isRecord(value) || value.status !== 'ok' || typeof value.service !== 'string') {
    throw new ReconstructionApiError('The service returned an invalid health response.');
  }
  return { status: 'ok', service: value.service };
}

export async function getReconstructionCapabilities(signal?: AbortSignal): Promise<ReconstructionCapabilities> {
  const value = await getJson('/api/v1/reconstruction/capabilities', signal);
  const validMode = isRecord(value) && (value.mode === 'unavailable' || value.mode === 'research');
  if (
    !isRecord(value)
    || typeof value.available !== 'boolean'
    || !validMode
    || !(typeof value.model === 'string' || value.model === null)
    || !Array.isArray(value.supported_anatomies)
    || !value.supported_anatomies.every((anatomy) => typeof anatomy === 'string')
    || typeof value.requires_ap !== 'boolean'
    || typeof value.requires_lateral !== 'boolean'
    || !Number.isSafeInteger(value.max_upload_bytes)
    || (value.max_upload_bytes as number) <= 0
    || (value.input_constraints !== undefined && (!Array.isArray(value.input_constraints) || !value.input_constraints.every((item) => typeof item === 'string')))
    || (value.reason !== undefined && value.reason !== null && typeof value.reason !== 'string')
  ) {
    throw new ReconstructionApiError('The service returned invalid reconstruction capabilities.');
  }

  return value as unknown as ReconstructionCapabilities;
}

export interface ReconstructionJobSubmitResponse {
  job_id: string;
  status: 'queued';
}

export interface ReconstructionJobStatusResponse {
  job_id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress: number | null;
  message: string;
  model_url: string | null;
  model_type: string | null;
}

export async function fetchReconstructionModel(url: string, signal?: AbortSignal): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(resolveModelGlbUrl(url), { signal });
  } catch {
    if (signal?.aborted) throw new ReconstructionApiError('Model download was cancelled.');
    throw new ReconstructionApiError('Could not download the reconstruction model from the local service.');
  }
  if (!response.ok) throw new ReconstructionApiError(`The model download returned HTTP ${response.status}.`);

  let bytes: ArrayBuffer;
  try { bytes = await response.arrayBuffer(); }
  catch { throw new ReconstructionApiError('The service returned an unreadable model file.'); }
  const header = new DataView(bytes);
  if (bytes.byteLength < 20 || header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2 || header.getUint32(8, true) !== bytes.byteLength) {
    throw new ReconstructionApiError('The service response is not a valid binary GLB file.');
  }
  return new Blob([bytes], { type: 'model/gltf-binary' });
}

export interface ReconstructionErrorPayload {
  error: {
    code: string;
    message: string;
  };
}

export async function submitReconstructionJob(
  apFile: File,
  lateralFile: File,
  anatomy: string,
  signal?: AbortSignal
): Promise<ReconstructionJobSubmitResponse> {
  const formData = new FormData();
  formData.append('ap', apFile);
  formData.append('lateral', lateralFile);
  formData.append('anatomy', anatomy);

  let response: Response;
  try {
    response = await fetch(`${reconstructionApiBaseUrl}/api/v1/reconstruction/jobs`, {
      method: 'POST',
      body: formData,
      signal,
    });
  } catch {
    if (signal?.aborted) throw new ReconstructionApiError('Job submission was cancelled.');
    throw new ReconstructionApiError('Could not connect to the local reconstruction service.');
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ReconstructionApiError(`The service returned HTTP ${response.status} with an unparseable response.`);
  }

  if (!response.ok) {
    if (isRecord(body) && isRecord(body.error) && typeof body.error.message === 'string') {
      throw new ReconstructionApiError(`[${body.error.code ?? 'ERROR'}] ${body.error.message}`);
    }
    throw new ReconstructionApiError(`The service returned HTTP ${response.status}.`);
  }

  if (!isRecord(body) || typeof body.job_id !== 'string' || body.status !== 'queued') {
    throw new ReconstructionApiError('The service returned an invalid job submission response.');
  }

  return { job_id: body.job_id, status: 'queued' };
}

export async function getReconstructionJobStatus(
  jobId: string,
  signal?: AbortSignal
): Promise<ReconstructionJobStatusResponse> {
  const value = await getJson(`/api/v1/reconstruction/jobs/${encodeURIComponent(jobId)}`, signal);
  if (
    !isRecord(value) ||
    typeof value.job_id !== 'string' ||
    typeof value.status !== 'string' ||
    !['queued', 'processing', 'succeeded', 'failed'].includes(value.status as string) ||
    typeof value.message !== 'string' ||
    !(value.progress === null || (typeof value.progress === 'number' && Number.isFinite(value.progress) && value.progress >= 0 && value.progress <= 100)) ||
    !(value.model_url === null || typeof value.model_url === 'string') ||
    !(value.model_type === null || typeof value.model_type === 'string') ||
    (value.status === 'succeeded' && (typeof value.model_url !== 'string' || !value.model_url.trim())) ||
    (value.status !== 'succeeded' && value.model_url !== null)
  ) {
    throw new ReconstructionApiError('The service returned an invalid job status response.');
  }

  return value as unknown as ReconstructionJobStatusResponse;
}

export function resolveModelGlbUrl(relativeOrAbsoluteUrl: string): string {
  try {
    const base = new URL(`${reconstructionApiBaseUrl}/`);
    const resolved = new URL(relativeOrAbsoluteUrl, base);
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') throw new Error();
    if (resolved.origin !== base.origin) throw new Error();
    return resolved.toString();
  } catch {
    throw new ReconstructionApiError('The service returned an invalid model URL.');
  }
}

