import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('carga Poppins y Open Sans autoalojadas', async ({ page }) => {
  const fuentes: string[] = [];
  page.on('response', (r) => { if (r.url().endsWith('.woff2')) fuentes.push(new URL(r.url()).pathname); });
  await page.goto('/');
  const cargada = await page.evaluate(async () => {
    await document.fonts.ready;
    const ok = (n: string) => [...document.fonts].some((f) => f.family.replace(/"/g, '') === n && f.status === 'loaded');
    return ok('Poppins') && ok('Open Sans');
  });
  expect(cargada).toBe(true);
  expect(fuentes.every((f) => f.startsWith('/fonts/'))).toBe(true);
  expect(fuentes.length).toBeGreaterThan(0);
});

test('el fondo sale de los tokens en claro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});

test('el fondo sale de los tokens en oscuro', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(4, 15, 38)');
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
  expect(m.h1).toBeGreaterThan(80); // tokens v2.0: tope de 88 px
  expect(m.cuerpo).toBeGreaterThanOrEqual(18);
});

test('a 1366 px la escala base no cambia', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/muestra/');
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('h1')!).fontSize))).toBe(56); // tokens v2.0: tope de 56 px
});

// R1 · Fuentes (Plan R, R-1): archivos reducidos y respaldos con métricas ajustadas, para que el cambio
// de fuente no mueva el texto (el repintado era lo que retrasaba el LCP).
test.describe('fuente sin repintado', () => {
  test('las cinco fuentes reducidas suman a lo sumo 55 KB (Archivo pesaba 73)', () => {
    const kb = fs.readdirSync('public/fonts').reduce((t, f) => t + fs.statSync(`public/fonts/${f}`).size, 0) / 1024;
    expect(kb).toBeLessThanOrEqual(55);
  });

  test('la hoja declara los tres respaldos con métricas', async ({ page }) => {
    await page.goto('/');
    const caras = await page.evaluate(() =>
      [...document.styleSheets].flatMap((s) => [...s.cssRules]).filter((r) => r instanceof CSSFontFaceRule).map((r) => (r as CSSFontFaceRule).cssText));
    for (const nombre of ['"Open Sans respaldo"', '"Poppins respaldo"', '"Plex respaldo"']) {
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
    expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Poppins respaldo');
    expect(await page.locator('main p').first().evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Open Sans respaldo');
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
