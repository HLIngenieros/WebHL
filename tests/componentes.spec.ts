import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const colorScheme of ['light', 'dark'] as const) {
  test(`la muestra no tiene violaciones de accesibilidad (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto('/muestra/');
    await expect(page.locator('.encabezado')).not.toHaveCount(0);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}

test('la muestra existe y no se indexa', async ({ page }) => {
  const r = await page.goto('/muestra/');
  expect(r?.status()).toBe(200);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('las cifras de Columbus están escritas en el HTML', async ({ page }) => {
    await page.goto('/muestra/');
    const cifras = page.locator('.cifras');
    await expect(cifras).toContainText('9.470.000');
    await expect(cifras).toContainText('5.250');
    await expect(cifras.locator('dd').first()).toHaveCSS('opacity', '1');
  });
});

test('a 360 px la tabla se desplaza sola y la página no', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/muestra/');
  const r = await page.evaluate(() => {
    const t = document.querySelector('.tabla') as HTMLElement;
    return { pagina: document.documentElement.scrollWidth <= innerWidth, tabla: t.scrollWidth > t.clientWidth };
  });
  expect(r.pagina).toBe(true);
  expect(r.tabla).toBe(true);
});

test('el campo con error lo anuncia con aria-describedby', async ({ page }) => {
  await page.goto('/muestra/');
  const campo = page.locator('input[aria-invalid=true]').first();
  const id = await campo.getAttribute('aria-describedby');
  await expect(page.locator(`#${id}`)).not.toBeEmpty();
});

for (const width of [360, 1366, 1920, 2560]) {
  test(`a ${width} px ninguna cifra destacada se sale de su celda`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/muestra/');
    const desbordes = await page.evaluate(() =>
      [...document.querySelectorAll('.cifras > div')].filter((celda) => {
        const c = celda.getBoundingClientRect();
        const v = celda.querySelector('dd')!;
        const r = document.createRange(); r.selectNodeContents(v);
        const t = r.getBoundingClientRect();
        return t.right > c.right - 8 || t.left < c.left;
      }).length);
    expect(desbordes).toBe(0);
  });
}
