import { test, expect } from '@playwright/test';
import { NAVEGACION, PIE, ruta } from '../src/i18n/rutas';

for (const lang of ['es', 'en'] as const) {
  test(`el pie (${lang}) enlaza las 13 secciones`, async ({ page }) => {
    await page.goto(ruta('inicio', lang));
    const hrefs = await page.locator('#navegacion-pie a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs).toEqual([...NAVEGACION, ...PIE].map((k) => ruta(k, lang)));
  });
}

test('el rótulo del pie lleva el año actual', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer')).toContainText(String(new Date().getFullYear()));
  await expect(page.locator('footer')).toContainText('1968');
});

test('Hablar con HL lleva a contacto en el idioma de la página', async ({ page }) => {
  await page.goto('/en/about/');
  await expect(page.locator('#hablar')).toHaveAttribute('href', '/en/contact/');
  await expect(page.locator('#hablar')).toContainText('Talk to HL');
});

test('en móvil Hablar con HL es táctil y no tapa el final del pie', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const caja = await page.locator('#hablar').boundingBox();
  expect(caja!.height).toBeGreaterThanOrEqual(44);
  expect(caja!.width).toBeGreaterThan(300);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const ultimo = page.locator('footer a').last();
  const b = await ultimo.boundingBox();
  const encima = await page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    return el?.closest('footer') !== null;
  }, [b!.x + b!.width / 2, b!.y + b!.height / 2]);
  expect(encima).toBe(true);
});
