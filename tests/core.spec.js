import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sample = fileURLToPath(new URL('./fixtures/sample.png', import.meta.url));
const invalid = fileURLToPath(new URL('./fixtures/invalid.txt', import.meta.url));

test('loads the licensed atlas and selects the named C1 mesh', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[class*=assetCount]')).toContainText('335', { timeout: 30_000 });
  await page.getByRole('button', { name: 'Atlas (C1)', exact: true }).click();
  await expect(page.locator('[class*=selectionBadge]')).toHaveText('1 selected');
  await expect(page.getByText(/Z-Anatomy/)).toBeVisible();
});

test('spine filters show individually named vertebrae from the atlas', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Spine', exact: true }).click();
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

test('previews local AP and lateral images without enabling inference', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'X-Ray', exact: true }).click();
  await page.getByLabel('AP radiograph file input').setInputFiles(sample);
  await page.getByLabel('Lateral radiograph file input').setInputFiles(sample);
  await expect(page.getByAltText('AP radiograph preview')).toBeVisible();
  await expect(page.getByAltText('Lateral radiograph preview')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inference unavailable' })).toBeDisabled();
  await page.getByLabel('Remove AP radiograph').click();
  await page.getByLabel('AP radiograph file input').setInputFiles(invalid);
  await expect(page.getByText('Choose a JPEG or PNG image.')).toBeVisible();
});


test('exports a binary GLB reference model', async ({ page }) => {
  await page.goto('/');
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



