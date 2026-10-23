import { test, expect } from '@playwright/test';

async function openWorkspace(page) {
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();
  await page.getByRole('button', { name: 'Maximize workspace' }).click();
  await expect(page.getByRole('button', { name: 'Home', exact: true })).toBeVisible();
}

test('neuro & brain explorer opens from sidebar with 3 modes and interactive controls', async ({ page }) => {
  await page.goto('/');
  await openWorkspace(page);

  // 1. Navigate to Neuro & Brain from sidebar
  const neuroNav = page.getByRole('button', { name: 'Neuro & Brain', exact: true });
  await expect(neuroNav).toBeVisible();
  await neuroNav.click();

  // 2. Verify Neuro Explorer page shell and panel mount
  await expect(page.getByTestId('neuro-explorer-page')).toBeVisible();
  await expect(page.getByTestId('neuro-explorer-panel')).toBeVisible();
  await expect(page.getByTestId('neuro-scene-viewport')).toBeVisible();

  // 3. Whole Nervous System default mode
  await expect(page.getByRole('tab', { name: /Whole Nervous System/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('MACROSCOPIC SCALE · 1:1 HUMAN REFERENCE')).toBeVisible();

  // Wait for structure list to load from manifest.json
  await expect(page.getByRole('searchbox', { name: 'Search neuro structures' })).toBeVisible();
  await expect(page.getByTestId('neuro-explorer-panel').getByText('525 structures')).toBeVisible({ timeout: 15_000 });

  // 4. Test Search in Whole Nervous System
  const searchInput = page.getByRole('searchbox', { name: 'Search neuro structures' });
  await searchInput.fill('vagus');
  const vagusItem = page.getByTestId('neuro-explorer-panel').getByRole('button', { name: /Vagus/i }).first();
  await expect(vagusItem).toBeVisible();

  // Select the vagus structure
  await vagusItem.click();
  await expect(page.getByText('1 selected')).toBeVisible();
  await expect(page.getByTestId('neuro-explorer-panel').getByText(/Vagus/i).first()).toBeVisible();

  // Clear search
  await searchInput.fill('');
  await expect(searchInput).toHaveValue('');

  // 5. Test Brain Atlas mode switch
  const brainTab = page.getByRole('tab', { name: /Brain Atlas/ });
  await brainTab.click();
  await expect(brainTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('ORGAN SCALE · CEPHALIC REFERENCE')).toBeVisible();

  // Verify Brain Atlas layers
  const layersRegion = page.getByRole('region', { name: 'Layer visibility controls' });
  await expect(layersRegion.getByText('Cerebral Cortex & Lobes')).toBeVisible();
  await expect(layersRegion.getByText('Cerebellum')).toBeVisible();
  await expect(layersRegion.getByText('Brainstem (Midbrain, Pons, Medulla)')).toBeVisible();

  // 6. Test Neuron Lab mode switch
  const neuronTab = page.getByRole('tab', { name: /Neuron Lab/ });
  await neuronTab.click();
  await expect(neuronTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('MICROSCOPIC SCALE · CELLULAR SCHEMATIC')).toBeVisible();

  // Verify illustrative disclaimers
  await expect(page.getByText(/Illustrative neuron/i)).toBeVisible();
  await expect(page.getByText(/Illustrative schematic · Pending Neuron Lab branch integration/i)).toBeVisible();

  // Verify Neuron Lab structures
  const panel = page.getByTestId('neuro-explorer-panel');
  await expect(panel.getByText('Soma (Perikaryon)')).toBeVisible();
  await expect(panel.getByText('Axon Proper')).toBeVisible();

  // Select Soma
  await panel.getByRole('button', { name: 'Soma (Perikaryon)', exact: true }).click();
  await expect(panel.getByText('1 selected')).toBeVisible();
  await expect(panel.getByText('Corpus neurale')).toBeVisible();

  // 7. Test Action bar (Clear selection)
  const clearBtn = panel.getByRole('button', { name: 'Clear selection' });
  await clearBtn.click();
  await expect(panel.getByText('0 selected')).toBeVisible();
});

test('neuro component contract checks pass all criteria in browser runtime', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const mod = await import('/src/components/NeuroExplorer/verifyComponents.ts');
    return mod.runNeuroComponentContractChecks();
  });
  expect(result.success).toBe(true);
  expect(result.checks.length).toBeGreaterThan(5);
});
