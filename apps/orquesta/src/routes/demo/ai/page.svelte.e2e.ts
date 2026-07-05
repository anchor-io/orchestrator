import { expect, test } from '@playwright/test';

test('renders the AI workbench fixture demo', async ({ page }) => {
  await page.goto('/demo/ai');

  await expect(page.getByRole('heading', { name: 'Workbench setup' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Workbench setup/ })).toBeVisible();
  const transcript = page.locator('[data-slot="ai-transcript"]');
  await expect(transcript.getByText('Run /grill-me and read the latest handoff')).toBeVisible();
  await expect(transcript.locator('[data-slot="ai-content-thinking"]').first()).toContainText(
    'Reasoning'
  );
  await expect(transcript.locator('[data-slot="ai-content-tool-call"]').first()).toContainText(
    'grep'
  );
  await expect(transcript.locator('[data-slot="ai-tool-result"]')).toHaveCount(0);

  await transcript.locator('[data-slot="ai-content-tool-call"] button').first().click();
  await expect(transcript).toContainText('snapshot = reduceAiEvent');
  await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Debug' })).toBeVisible();
});

test('updates composer actions for active runs', async ({ page }) => {
  await page.goto('/demo/ai');

  await page.getByRole('button', { name: /Active run/ }).click();
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();

  const composer = page.locator('[data-slot="ai-composer"]');
  await expect(composer.locator('[data-slot="ai-run-status"]')).toContainText('Streaming');

  const textarea = page.getByPlaceholder('Queue follow-up');
  await textarea.fill('Keep the transcript narrow.');
  await expect(page.getByRole('button', { name: 'Queue' })).toBeVisible();

  await textarea.press('Control+Enter');
  await expect(page.locator('[data-slot="ai-queue"]')).toContainText('Keep the transcript narrow.');
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible();
});
