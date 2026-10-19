import { test, expect } from '@playwright/test';
import fs from 'node:fs';

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
    if (!r.url().startsWith('http://localhost:4322')) externas.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(externas).toEqual([]);
});

test('en pantallas grandes el contenido y los títulos crecen', async ({ page }) => {
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.goto('/muestra/');
  const m = await page.evaluate(() => ({
    ancho: document.querySelector('main .wrap')!.getBoundingClientRect().width,
    h1: parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize),
    cuerpo: parseFloat(getComputedStyle(document.body).fontSize),
  }));
  expect(m.ancho).toBeGreaterThanOrEqual(1500);
  expect(m.h1).toBeGreaterThan(90);
  expect(m.cuerpo).toBeGreaterThanOrEqual(18);
});

test('a 1366 px la escala base no cambia', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/muestra/');
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize))).toBe(68);
});

// F3.0 · Fuente y LCP (especificación §7): archivo reducido y respaldo con métricas ajustadas, para que
// el cambio de fuente no mueva el texto (el repintado era lo que retrasaba el LCP).
test.describe('fuente sin repintado', () => {
  test('la fuente reducida pesa a lo sumo 73 KB (antes 88)', () => {
    const kb = fs.statSync('public/fonts/archivo-var-latin.woff2').size / 1024;
    expect(kb).toBeLessThanOrEqual(73);
  });

  test('la hoja declara los dos respaldos con métricas', async ({ page }) => {
    await page.goto('/');
    const caras = await page.evaluate(() =>
      [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r instanceof CSSFontFaceRule).map((r) => (r as CSSFontFaceRule).cssText));
    for (const nombre of ['"Archivo respaldo"', '"Archivo respaldo ancho"']) {
      const cara = caras.find((c) => c.includes(`font-family: ${nombre};`));
      expect(cara, nombre).toBeTruthy();
      expect(cara).toContain('size-adjust');
      expect(cara).toContain('ascent-override');
    }
  });

  // Medido el 2026-10-19: la precarga competía con el HTML y el CSS en 4G (explorador 2,3 → 1,8 s).
  test('la fuente no se precarga', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(0);
  });

  test('títulos y texto usan su respaldo', async ({ page }) => {
    await page.goto('/proyectos/planta-columbus/');
    expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Archivo respaldo ancho');
    expect(await page.locator('main p').first().evaluate((e) => getComputedStyle(e).fontFamily)).toMatch(/Archivo respaldo(?! ancho)/);
  });

  test('sin la fuente, el título de la ficha mide casi lo mismo', async ({ browser }) => {
    const alto = async (bloquear: boolean) => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      if (bloquear) await page.route('**/*.woff2', (r) => r.abort());
      await page.goto('/proyectos/planta-columbus/');
      await page.evaluate(() => document.fonts.ready);
      const h = await page.locator('h1').evaluate((e) => e.getBoundingClientRect().height);
      await ctx.close();
      return h;
    };
    const [con, sin] = [await alto(false), await alto(true)];
    expect(Math.abs(con - sin) / con).toBeLessThanOrEqual(0.04);
  });
});
