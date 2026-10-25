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
