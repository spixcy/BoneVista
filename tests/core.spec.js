import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url));
const invalid = fileURLToPath(new URL('./fixtures/invalid.txt', import.meta.url));

async function openWorkspace(page) {
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
}

test('BoneVista landing page scrolls into the working app and remembers day/night mode', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('BoneVista');
  await expect(page.getByRole('heading', { name: /THE ANATOMY WORKSPACE FOR BONE/ })).toBeVisible();
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await openWorkspace(page);
  await expect(page.getByRole('heading', { name: 'Explore human anatomy' })).toBeVisible();
  const mascot = page.getByAltText('BoneVista mascot learning anatomy');
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
  await page.goto('/');
  await openWorkspace(page);
  const search = page.getByRole('textbox', { name: 'Search anatomy structures' });
  await search.fill('Atlas (C1)');
  await page.getByRole('option', { name: /Atlas \(C1\)/ }).click();
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
  await expect(page.locator('[class*=selectionBadge]')).toHaveText('1 selected');
  await expect(page.getByText(/Z-Anatomy/)).toBeVisible();
});

test('Neuro Explorer loads the licensed whole-body nerves scene and opens brain atlas search results', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
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
  await page.goto('/');
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
  await page.goto('/');
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
  await expect(page.getByText(/no AI analysis, diagnosis, or 3D reconstruction/)).toBeVisible();
  await page.getByLabel('Remove AP radiograph').click();
  await page.getByLabel('AP radiograph file input').setInputFiles(invalid);
  await expect(page.getByText('Choose a JPEG, PNG, or WebP image. DICOM is not supported yet.')).toBeVisible();
});

test('runs the educational finite-element stress model and validates invalid inputs', async ({ page }) => {
  await page.goto('/');
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
  await page.goto('/');
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
  await page.goto('/');
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
  await page.goto('/');
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

