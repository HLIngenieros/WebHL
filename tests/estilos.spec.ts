import { test, expect } from '@playwright/test';

test('carga Archivo autoalojada', async ({ page }) => {
  const fuentes: string[] = [];
  page.on('response', (r) => { if (r.url().endsWith('.woff2')) fuentes.push(new URL(r.url()).pathname); });
  await page.goto('/');
  const cargada = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Archivo' && f.status === 'loaded');
  });
  expect(cargada).toBe(true);
  expect(fuentes.every((f) => f.startsWith('/fonts/'))).toBe(true);
  expect(fuentes.length).toBeGreaterThan(0);
});

test('el fondo sale de los tokens en claro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(231, 234, 235)');
});

test('el fondo sale de los tokens en oscuro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 17, 19)');
});

test('no hay peticiones a dominios externos', async ({ page }) => {
  const externas: string[] = [];
  page.on('request', (r) => {
    if (!r.url().startsWith('http://localhost:4321')) externas.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(externas).toEqual([]);
});
