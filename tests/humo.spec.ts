import { test, expect } from '@playwright/test';

test('el inicio responde y está en español', async ({ page }) => {
  const r = await page.goto('/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});
