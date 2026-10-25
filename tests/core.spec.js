import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sample = fileURLToPath(new URL('../public/test-images/bonevista-hip-ap-sample.jpg', import.meta.url));
const invalid = fileURLToPath(new URL('./fixtures/invalid.txt', import.meta.url));

async function openWorkspace(page) {
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
}

async function mockReconstructionApi(page, capabilities) {
  await page.route('http://127.0.0.1:8000/api/v1/**', async route => {
    const body = route.request().url().endsWith('/health')
      ? { status: 'ok', service: 'bonevista-xray-reconstruction' }
      : capabilities;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

// Test-only mesh for exercising the GLB transport/viewer. It is not model output.
function makeViewerPlumbingGlb() {
  const document = {
    asset: { version: '2.0', generator: 'BoneVista Playwright plumbing fixture' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: 44 }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 3, type: 'VEC3', min: [-1, -1, 0], max: [1, 1, 0] },
      { bufferView: 1, componentType: 5123, count: 3, type: 'SCALAR' },
    ],
  };
  const json = Buffer.from(JSON.stringify(document));
  const jsonLength = Math.ceil(json.length / 4) * 4;
  const bin = Buffer.alloc(44);
  [[-1, -1, 0], [1, -1, 0], [0, 1, 0]].flat().forEach((value, index) => bin.writeFloatLE(value, index * 4));
  [0, 1, 2].forEach((value, index) => bin.writeUInt16LE(value, 36 + index * 2));
  const total = 12 + 8 + jsonLength + 8 + bin.length;
  const glb = Buffer.alloc(total);
  glb.write('glTF', 0); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(total, 8);
  glb.writeUInt32LE(jsonLength, 12); glb.writeUInt32LE(0x4e4f534a, 16); json.copy(glb, 20);
  glb.fill(0x20, 20 + json.length, 20 + jsonLength);
  const binHeader = 20 + jsonLength;
  glb.writeUInt32LE(bin.length, binHeader); glb.writeUInt32LE(0x004e4942, binHeader + 4); bin.copy(glb, binHeader + 8);
  return glb;
}

const availableTestCapabilities = {
  available: true,
  mode: 'research',
  model: 'test-only-mocked-capability',
  supported_anatomies: ['femur'],
  requires_ap: true,
  requires_lateral: true,
  max_upload_bytes: 26214400,
  input_constraints: ['Mocked API flow test; no inference is performed.'],
  reason: null,
};

test('BoneVista landing page scrolls into the working app and remembers day/night mode', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('BoneVista');
  await expect(page.getByRole('heading', { name: /THE ANATOMY WORKSPACE FOR BONE/ })).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await openWorkspace(page);
  await expect(page.getByRole('heading', { name: 'Explore human anatomy' })).toBeVisible();
  const mascot = page.getByAltText('Chotu - BoneVista skeleton guide');
  await expect(mascot).toBeVisible();
  expect(await mascot.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/335 named atlas structures/)).toBeVisible();
  await page.getByRole('button', { name: 'Maximize workspace' }).click();
  await expect(page.getByRole('button', { name: 'Restore workspace size' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Maximize workspace' })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('global anatomy search selects the actual C1 atlas mesh', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  const search = page.getByRole('textbox', { name: 'Search anatomy structures' });
  await search.fill('Atlas (C1)');
  await page.getByRole('option', { name: /Atlas \(C1\)/ }).click();
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
  await expect(page.locator('[class*=selectionBadge]')).toHaveText('1 selected');
  await expect(page.getByText(/Z-Anatomy/)).toBeVisible();
});

test('Neuro Explorer loads the licensed whole-body nerves scene and opens brain atlas search results', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'Neuro & Brain Explorer', exact: true }).click();
  const assetCount = page.locator('[class*=assetCount]');
  await expect(assetCount).toContainText('44 nerve structures', { timeout: 30_000 });
  await expect(assetCount).toContainText('spinal cord unavailable');
  await expect(page.getByTestId('neuro-explorer-panel')).toBeVisible();
  await expect(page.getByTestId('neuro-3d-viewport')).toHaveAttribute('data-model-state', 'ready', { timeout: 30_000 });
  const neuroCanvas = page.getByTestId('neuro-3d-viewport').locator('canvas');
  await expect(neuroCanvas).toBeVisible();
  await neuroCanvas.screenshot({ path: 'test-results/neuro-nervous-system-canvas.png' });
  const medianNerve = page.getByRole('searchbox', { name: 'Search neuro structures' });
  await medianNerve.fill('Median nerve');
  await page.getByRole('button', { name: /Median nerve/ }).first().click();
  await expect(page.locator('[class*=selectionCount]')).toContainText('1 selected');
  await page.getByRole('tab', { name: 'Brain Atlas' }).click();
  await expect(assetCount).toContainText('437 brain structures', { timeout: 30_000 });
  await expect(page.getByTestId('neuro-3d-viewport')).toHaveAttribute('data-model-state', 'ready', { timeout: 30_000 });
  await neuroCanvas.screenshot({ path: 'test-results/neuro-brain-atlas-canvas.png' });
  const brainSearch = page.getByRole('searchbox', { name: 'Search neuro structures' });
  await brainSearch.fill('cerebellum');
  await page.getByRole('button', { name: 'Anterior quadrangular lobule L' }).click();
  await expect(page.locator('[class*=selectionCount]')).toContainText('1 selected');
  await expect(page.getByText('Anterior quadrangular lobule', { exact: true }).last()).toBeVisible();
  await page.getByRole('button', { name: 'Focus camera on selected structures' }).click();
  await page.getByRole('button', { name: 'Reset camera view' }).click();
  await page.getByRole('button', { name: 'Hide Cerebellum', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Show Cerebellum', exact: true })).toBeVisible();
  const canvasBounds = await neuroCanvas.boundingBox();
  if (!canvasBounds) throw new Error('Neuro 3D canvas has no visible bounds.');
  await page.mouse.move(canvasBounds.x + canvasBounds.width * 0.5, canvasBounds.y + canvasBounds.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(canvasBounds.x + canvasBounds.width * 0.62, canvasBounds.y + canvasBounds.height * 0.46, { steps: 6 });
  await page.mouse.up();
});

test('spine filters show individually named vertebrae from the atlas', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'Spine Explorer', exact: true }).click();
  await expect(page.getByTestId('spine-vertebra-grid').locator('button').first()).toHaveText('C1', { timeout: 30_000 });
  await page.getByRole('tab', { name: 'Cervical' }).click();
  await expect(page.getByTestId('spine-vertebra-grid').locator('button')).toHaveCount(7);
  await page.getByRole('tab', { name: 'Thoracic' }).click();
  await expect(page.getByTestId('spine-vertebra-grid').locator('button')).toHaveCount(12);
  await page.getByRole('tab', { name: 'Lumbar' }).click();
  await expect(page.getByTestId('spine-vertebra-grid').locator('button')).toHaveCount(5);
  await page.getByRole('tab', { name: 'Sacral' }).click();
  await expect(page.getByTestId('spine-vertebra-grid').locator('button')).toHaveCount(2);
});

test('views local AP and lateral images with working controls and no claimed inference', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await expect(page.getByRole('region', { name: '3D reconstruction status' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reconstruct 3D bone' })).toBeDisabled();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await expect(page.getByText('AP input').locator('..')).toContainText('Ready');
  await expect(page.getByText('Lateral input').locator('..')).toContainText('Ready');
  await expect(page.getByRole('button', { name: 'Reconstruct 3D bone' })).toBeDisabled();
  await expect(page.getByAltText('AP radiograph')).toBeVisible();
  await expect(page.getByText(/\d+ × \d+px/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Zoom in' }).click();
  await expect(page.getByText('120%', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Rotate right' }).click();
  await page.getByRole('slider', { name: 'Brightness' }).fill('130');
  await page.getByRole('tab', { name: /Lateral/ }).click();
  await expect(page.getByAltText('Lateral radiograph')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom in' })).toBeEnabled();
  await expect(page.getByText(/no AI analysis, diagnosis, or 3D reconstruction/i)).toBeVisible();
  await page.getByLabel('Remove AP radiograph').click();
  await page.getByLabel('AP radiograph file input').setInputFiles(invalid);
  await expect(page.getByText('Choose a JPEG, PNG, or WebP image. DICOM is not supported yet.')).toBeVisible();
  await page.getByLabel('AP radiograph file input').setInputFiles({ name: 'corrupt.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('alert')).toContainText('could not be decoded as a JPEG, PNG, or WebP image');
  await expect(page.getByText('AP input').locator('..')).toContainText('Waiting for image');
});

test('reports an offline reconstruction API while keeping local image viewing available', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/v1/**', route => route.abort());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await expect(page.getByText('API offline')).toBeVisible();
  await expect(page.getByText(/Local image viewing remains available/)).toBeVisible();
  await expect(page.getByRole('region', { name: 'Radiograph viewer' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reconstruct 3D bone' })).toBeDisabled();
});

test('distinguishes a healthy API from an unavailable inference model', async ({ page }) => {
  await mockReconstructionApi(page, {
    available: false,
    mode: 'unavailable',
    model: null,
    supported_anatomies: [],
    requires_ap: true,
    requires_lateral: true,
    max_upload_bytes: 26214400,
    input_constraints: ['A verified compatible checkpoint is not configured.'],
    reason: 'No verified inference checkpoint is configured.',
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await expect(page.getByText('Model unavailable')).toBeVisible();
  await expect(page.getByText('No verified inference checkpoint is configured.')).toBeVisible();
  await expect(page.getByLabel('Reconstruction anatomy target')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reconstruct 3D bone' })).toBeDisabled();
});

test('uses only backend-supported reconstruction targets and keeps atlas association separate', async ({ page }) => {
  const jobRequests = [];
  page.on('request', request => { if (request.url().includes('/api/v1/reconstruction/jobs')) jobRequests.push(request.method()); });
  await mockReconstructionApi(page, {
    available: true,
    mode: 'research',
    model: 'verified-research-checkpoint',
    supported_anatomies: ['vertebra', 'femur'],
    requires_ap: true,
    requires_lateral: true,
    max_upload_bytes: 26214400,
    input_constraints: ['Use paired orthogonal AP and lateral views.'],
    reason: null,
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  const reconstructionTarget = page.getByLabel('Reconstruction anatomy target');
  await expect(reconstructionTarget).toBeVisible();
  await expect(reconstructionTarget.locator('option')).toHaveCount(3);
  await expect(reconstructionTarget.locator('option').nth(1)).toHaveAttribute('value', 'vertebra');
  await expect(reconstructionTarget.locator('option').nth(2)).toHaveAttribute('value', 'femur');
  await reconstructionTarget.selectOption('vertebra');
  await page.getByLabel('Bone associated with radiographs').selectOption('femur_l');
  await expect(reconstructionTarget).toHaveValue('vertebra');
  await page.getByRole('button', { name: 'Load real AP + lateral sample X-rays' }).click();
  await expect(page.getByText(/may be outside the model’s validated input domain/)).toBeVisible();
  await expect(page.getByText('Ready for submission').first()).toBeVisible();
  expect(jobRequests).toEqual([]);
});

test('submits only on explicit action, polls the mocked job, and displays its returned GLB', async ({ page }) => {
  let submissions = 0;
  let statusPolls = 0;
  const glbFixture = makeViewerPlumbingGlb();
  await page.route('http://127.0.0.1:8000/api/v1/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/health')) return route.fulfill({ json: { status: 'ok', service: 'bonevista-test' } });
    if (url.endsWith('/capabilities')) return route.fulfill({ json: availableTestCapabilities });
    if (url.endsWith('/model.glb')) return route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: glbFixture });
    if (url.endsWith('/jobs') && route.request().method() === 'POST') {
      submissions += 1;
      expect(route.request().headers()['content-type']).toMatch(/^multipart\/form-data; boundary=/);
      expect(route.request().postData()).toContain('name="ap"');
      expect(route.request().postData()).toContain('name="lateral"');
      expect(route.request().postData()).toContain('name="anatomy"');
      return route.fulfill({ status: 202, json: { job_id: 'test-job', status: 'queued' } });
    }
    if (url.endsWith('/jobs/test-job')) {
      statusPolls += 1;
      return route.fulfill({ json: statusPolls === 1
        ? { job_id: 'test-job', status: 'processing', progress: null, message: 'Mocked processing state', model_url: null, model_type: null }
        : { job_id: 'test-job', status: 'succeeded', progress: 100, message: 'Mocked plumbing success', model_url: '/api/v1/reconstruction/jobs/test-job/model.glb', model_type: 'estimated_3d_bone_segmentation' } });
    }
    return route.fulfill({ status: 404, json: { error: { code: 'NOT_FOUND', message: 'Unmocked test endpoint.' } } });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await page.getByLabel('Reconstruction anatomy target').selectOption('femur');
  expect(submissions).toBe(0);
  await page.getByRole('button', { name: 'Reconstruct 3D bone' }).click();
  await expect(page.getByRole('region', { name: 'Reconstruction model viewer' })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Mocked plumbing success')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download GLB mesh' })).toHaveAttribute('href', /^blob:/);
  await expect(page.getByRole('region', { name: 'Reconstruction model viewer' }).locator('canvas')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download GLB mesh' }).click(),
  ]);
  expect((await readFile(await download.path())).subarray(0, 4).toString()).toBe('glTF');
  expect(submissions).toBe(1);
  expect(statusPolls).toBeGreaterThanOrEqual(2);
});

test('shows mocked backend failure safely and does not create a result viewer', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/v1/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/health')) return route.fulfill({ json: { status: 'ok', service: 'bonevista-test' } });
    if (url.endsWith('/capabilities')) return route.fulfill({ json: availableTestCapabilities });
    if (url.endsWith('/jobs') && route.request().method() === 'POST') return route.fulfill({ status: 503, json: { error: { code: 'MODEL_UNAVAILABLE', message: 'No verified checkpoint is configured.' } } });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await page.getByLabel('Reconstruction anatomy target').selectOption('femur');
  await page.getByRole('button', { name: 'Reconstruct 3D bone' }).click();
  await expect(page.getByRole('alert')).toContainText('MODEL_UNAVAILABLE');
  await expect(page.getByRole('region', { name: 'Reconstruction model viewer' })).toHaveCount(0);
});

test('rejects a non-GLB response from a successful mock job', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/v1/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/health')) return route.fulfill({ json: { status: 'ok', service: 'bonevista-test' } });
    if (url.endsWith('/capabilities')) return route.fulfill({ json: availableTestCapabilities });
    if (url.endsWith('/model.glb')) return route.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'not a GLB' });
    if (url.endsWith('/jobs') && route.request().method() === 'POST') return route.fulfill({ status: 202, json: { job_id: 'bad-glb-job', status: 'queued' } });
    if (url.endsWith('/jobs/bad-glb-job')) return route.fulfill({ json: { job_id: 'bad-glb-job', status: 'succeeded', progress: 100, message: 'Plumbing response only', model_url: '/api/v1/reconstruction/jobs/bad-glb-job/model.glb', model_type: 'test-fixture' } });
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await page.getByLabel('Reconstruction anatomy target').selectOption('femur');
  await page.getByRole('button', { name: 'Reconstruct 3D bone' }).click();
  await expect(page.getByRole('alert')).toContainText('not a valid binary GLB');
  await expect(page.getByRole('region', { name: 'Reconstruction model viewer' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Download GLB mesh' })).toHaveCount(0);
});

test('stopping a queued job stops browser polling and labels server-side status honestly', async ({ page }) => {
  let statusPolls = 0;
  await page.route('http://127.0.0.1:8000/api/v1/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/health')) return route.fulfill({ json: { status: 'ok', service: 'bonevista-test' } });
    if (url.endsWith('/capabilities')) return route.fulfill({ json: availableTestCapabilities });
    if (url.endsWith('/jobs') && route.request().method() === 'POST') return route.fulfill({ status: 202, json: { job_id: 'queued-job', status: 'queued' } });
    if (url.endsWith('/jobs/queued-job')) {
      statusPolls += 1;
      return route.fulfill({ json: { job_id: 'queued-job', status: 'processing', progress: null, message: 'Still processing', model_url: null, model_type: null } });
    }
    return route.fulfill({ status: 404, json: {} });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'X-Ray Workspace', exact: true }).click();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await page.getByLabel('Reconstruction anatomy target').selectOption('femur');
  await page.getByRole('button', { name: 'Reconstruct 3D bone' }).click();
  await expect(page.getByText('Still processing')).toBeVisible();
  await page.getByRole('button', { name: 'Stop waiting' }).click();
  await expect(page.getByText('Status:')).toContainText('cancelled');
  await expect(page.getByText(/server may continue processing the job/)).toBeVisible();
  const countAfterStop = statusPolls;
  await page.waitForTimeout(1800);
  expect(statusPolls).toBe(countAfterStop);
});

test('runs the educational finite-element stress model and validates invalid inputs', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: '3D Anatomy', exact: true }).click();
  await page.getByRole('tab', { name: 'Stress' }).click();
  await expect(page.getByRole('heading', { name: 'Axial Bone Stress' })).toBeVisible();
  await page.getByLabel('Bone to color').selectOption('femur_l');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await expect(page.getByText('1.6667 MPa')).toBeVisible();
  await expect(page.getByText('0.039216 mm')).toBeVisible();
  await page.getByLabel('Cross-sectional area').fill('0');
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await expect(page.getByRole('alert')).toContainText('area, length, and modulus must be positive');
});

test('toolbar X-Ray and Stress modes remain in the 3D anatomy viewer', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: '3D Anatomy', exact: true }).click();
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
  await page.getByRole('tab', { name: 'X-Ray' }).click();
  await expect(page.getByRole('region', { name: 'Radiograph viewer' })).toBeVisible();
  await page.getByRole('button', { name: 'Load real AP + lateral sample X-rays' }).click();
  await expect(page.getByAltText('AP radiograph')).toBeVisible();
  await page.getByRole('tab', { name: /Lateral/ }).click();
  await expect(page.getByAltText('Lateral radiograph')).toBeVisible();
  await page.getByLabel('Bone associated with radiographs').selectOption('femur_l');
  await page.getByRole('button', { name: /Open stress mapping for/ }).click();
  await expect(page.getByRole('tab', { name: 'Bone' })).toHaveAttribute('aria-selected', 'false');
  await expect(page.getByRole('heading', { name: 'Axial Bone Stress' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Associated X-ray reference' })).toBeVisible();
  await page.getByRole('button', { name: 'Run simulation' }).click();
  await expect(page.getByTestId('stress-mapped-target')).toContainText('mapped onto the selected atlas mesh');
  await expect(page.locator('[class*=assetCount]')).toBeVisible();
  await page.getByRole('tab', { name: 'Bone' }).click();
  await expect(page.getByRole('heading', { name: 'Axial Bone Stress' })).toHaveCount(0);
});

test('exports a binary GLB reference model', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: '3D Anatomy', exact: true }).click();
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export GLB' }).click(),
  ]);
  const path = await download.path();
  const bytes = await readFile(path);
  expect(bytes.subarray(0, 4).toString()).toBe('glTF');
  expect(bytes.readUInt32LE(8)).toBe(bytes.length);
});

test('muscle explorer loads local layered anatomy and shares selection with global search', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await openWorkspace(page);
  await page.getByRole('button', { name: 'Muscle Explorer', exact: true }).click();
  await expect(page.getByTestId('muscle-explorer-host')).toBeVisible();
  await expect(page.getByText('Select an anatomical structure from the 3D model or list to inspect verified atlas details.')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('tab', { name: 'Superficial layer (Outer)' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[class*=assetCount]')).toContainText('199');

  const search = page.getByRole('textbox', { name: 'Search anatomy structures' });
  await search.fill('External intercostal muscle');
  await page.getByRole('option', { name: /External intercostal muscle/ }).click();
  await expect(page.getByRole('tab', { name: 'Deep layer (Intrinsic)' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByLabel('Details for External intercostal muscle')).toBeVisible();

  await page.getByRole('tab', { name: 'Combined layer (Bones+Muscles)' }).click();
  await expect(page.getByRole('tab', { name: 'Combined layer (Bones+Muscles)' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[class*=assetCount]')).toContainText('556');
  await page.getByRole('tab', { name: 'Bones layer (Skeleton)' }).click();
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
});

