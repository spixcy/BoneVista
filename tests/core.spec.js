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
  const mascot = page.getByAltText("BoneVista's waving hooded skeleton mascot");
  await expect(mascot).toBeVisible();
  expect(await mascot.evaluate(image => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.getByText(/335 named atlas structures/)).toBeVisible();
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

