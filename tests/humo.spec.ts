import { test, expect } from '@playwright/test';

test('el inicio responde y está en español', async ({ page }) => {
  const r = await page.goto('/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('la página carga sin errores de consola ni recursos faltantes', async ({ page }) => {
  const errores: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  page.on('response', (r) => { if (r.status() >= 400) errores.push(`${r.status()} ${r.url()}`); });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(errores).toEqual([]);
});

test('el ícono declarado existe', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('link[rel=icon]').getAttribute('href');
  expect(href).toBeTruthy();
  expect((await page.request.get(href!)).status()).toBe(200);
});
