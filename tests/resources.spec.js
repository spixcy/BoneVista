import { test, expect } from '@playwright/test';

// Resources & Credits module E2E tests

async function openResourcesPage(page) {
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();
  await page.getByRole('button', { name: 'Resources & Credits', exact: true }).click();
  await expect(page.getByTestId('resources-credits-page')).toBeVisible();
}

test('Resources & Credits: sidebar entry is visible and navigates to the module', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  // Check the page heading
  await expect(page.getByRole('heading', { name: 'Resources & Credits', exact: true })).toBeVisible();
});

test('Resources & Credits: centered GitHub repository link appears at the top', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  const repoLink = page.getByRole('link', { name: /spixcy \/ BoneVista/ });
  await expect(repoLink).toBeVisible();
  await expect(repoLink).toHaveAttribute('href', 'https://github.com/spixcy/BoneVista');
  await expect(repoLink).toHaveAttribute('target', '_blank');
  await expect(page.getByText('Ui branch')).toBeVisible();
});

test('Resources & Credits: GitHub links are rendered on cards with upstream repositories', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  // Cards with GitHub repos have GitHub action links or buttons
  const githubActions = page.getByTestId('resources-credits-page').locator('article').locator('text=GitHub');
  expect(await githubActions.count()).toBeGreaterThanOrEqual(1);
});

test('Resources & Credits: exactly four resource category cards are displayed', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  const cards = page.getByTestId('resources-credits-page').locator('article');
  await expect(cards).toHaveCount(4);
});

test('Resources & Credits: card titles are correct', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  await expect(page.getByRole('heading', { name: 'Skeletal Anatomy', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Muscle Atlas', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Brain & Neuroanatomy', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Libraries & Research', exact: true })).toBeVisible();
});

test('Resources & Credits: Sources modal opens for multi-source cards', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  // Skeletal Anatomy has multiple sources → "Sources ↗" button
  const sourcesBtn = page.getByTestId('resources-credits-page').locator('article').first().getByRole('button', { name: /Sources/ });
  await sourcesBtn.click();

  // Modal should be visible with detailed records
  await expect(page.getByRole('heading', { name: /Skeletal Anatomy — Sources/ })).toBeVisible();

  // Close modal
  await page.getByTitle('Close dialog').click();
  await expect(page.getByRole('heading', { name: /Skeletal Anatomy — Sources/ })).not.toBeVisible();
});

test('Resources & Credits: footer links to license documents are present', async ({ page }) => {
  await page.goto('/');
  await openResourcesPage(page);

  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: 'LICENSES.md' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'public/anatomy/NOTICE' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'public/muscle-atlas/README.md' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'public/neuro/NOTICE.md' })).toBeVisible();
});

test('Resources & Credits: existing sidebar pages still work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Launch App' }).click();
  await expect(page.locator('#platform')).toBeInViewport();

  // Navigate to Settings and verify it still works
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
});
