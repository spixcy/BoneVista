import { test, expect } from '@playwright/test';

async function openWorkspace(page) {
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();
  await page.getByRole('button', { name: 'Maximize workspace' }).click();
  await expect(page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
}

test('Neuro Explorer supports mesh modes and the shared illustrative Neuron Lab controls', async ({ page }) => {
  await page.goto('/');
  await openWorkspace(page);

  await page.getByRole('button', { name: /Neuro & Brain/ }).click();
  const panel = page.getByTestId('neuro-explorer-panel');
  await expect(page.getByTestId('neuro-explorer-page')).toBeVisible();
  await expect(panel).toBeVisible();
  await expect(page.getByTestId('neuro-3d-viewport')).toBeVisible();

  await expect(page.getByRole('tab', { name: /Whole Nervous System/ })).toHaveAttribute('aria-selected', 'true');
  const search = page.getByRole('searchbox', { name: 'Search neuro structures' });
  await expect(search).toBeVisible();
  await expect(page.locator('[class*=assetCount]')).toContainText('44 nerve structures', { timeout: 15_000 });

  await search.fill('median nerve');
  const nerve = panel.getByRole('button', { name: /Median nerve/i }).first();
  await expect(nerve).toBeVisible();
  await nerve.click();
  await expect(panel.getByText('1 selected')).toBeVisible();
  await search.fill('');

  const brainTab = page.getByRole('tab', { name: /Brain Atlas/ });
  await brainTab.click();
  await expect(brainTab).toHaveAttribute('aria-selected', 'true');
  const layers = page.getByRole('region', { name: 'Layer visibility controls' });
  await expect(layers.getByText('Cerebellum')).toBeVisible();
  await expect(layers.getByText('Brainstem')).toBeVisible();

  const neuronTab = page.getByRole('tab', { name: /Neuron Lab/ });
  await neuronTab.click();
  await expect(neuronTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(/MICROSCOPIC SCALE/)).toBeVisible();
  await expect(panel.getByText(/Illustrative neuron/i)).toBeVisible();
  await expect(page.getByText(/Illustrative schematic.*Educational visualization only/i)).toBeVisible();

  await panel.getByRole('button', { name: 'Hide Soma & Cell Body' }).click();
  await expect(panel.getByRole('button', { name: 'Show Soma & Cell Body' })).toBeVisible();
  await panel.getByRole('button', { name: 'Soma (Perikaryon)', exact: true }).click();
  await expect(panel.getByText('1 selected')).toBeVisible();
  await expect(panel.getByText('Corpus neurale')).toBeVisible();
  await panel.getByRole('button', { name: 'Clear selection' }).click();
  await expect(panel.getByText('0 selected')).toBeVisible();
});
