// F3.3 · HSE y calidad (guía §12.5).
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ALTO_COLUMNA, COLUMNAS, TOPE, columnaEn, estructura, proyectar, recortar } from '../src/lib/estructura';

test.describe('estructura de la política (funciones)', () => {
  const v = { giro: -0.6, inclinacion: 0.42, ancho: 600, alto: 520 };

  test('tiene cimiento, malla, 4 columnas, marco y cubierta', () => {
    const grupos = new Set(estructura().map((s) => s[2]));
    for (const g of ['base', 'malla', 'marco', 'techo', 'c0', 'c1', 'c2', 'c3']) expect(grupos.has(g as never)).toBe(true);
  });

  test('se levanta por niveles: bajo el cimiento no hay nada y en el tope está completa', () => {
    const S = estructura();
    expect(S.map((s) => recortar(s, -1)).filter(Boolean)).toHaveLength(0);
    expect(S.map((s) => recortar(s, TOPE)).filter(Boolean)).toHaveLength(S.length);
    const medio = recortar([[0, 0, 0], [0, 2, 0], 'marco'], 1)!;
    expect(medio[1][1]).toBe(1);
  });

  test('vista desde arriba: lo alto y lo lejano quedan más arriba en pantalla', () => {
    const [, abajo] = proyectar([0, 0, 0], v), [, arriba] = proyectar([0, ALTO_COLUMNA, 0], v);
    expect(arriba).toBeLessThan(abajo);
    const [, cerca] = proyectar([0, 0, -2], { ...v, giro: 0 }), [, lejos] = proyectar([0, 0, 2], { ...v, giro: 0 });
    expect(lejos).toBeLessThan(cerca);
  });

  test('el cursor sobre una columna la elige; lejos, ninguna', () => {
    COLUMNAS.forEach(([x, z], k) => {
      const [mx, my] = proyectar([x, ALTO_COLUMNA / 2, z], v);
      expect(columnaEn(mx, my, v)).toBe(k);
    });
    expect(columnaEn(-500, -500, v)).toBe(-1);
  });
});

test.describe('página Gestión integral', () => {
  test('lleva los 6 bloques del acta en orden, con índice, y nada más', async ({ page }) => {
    await page.goto('/gestion-integral/');
    await expect(page.locator('h1')).toHaveCount(1);
    const ids = ['cert-titulo', 'ind-titulo', 'pol-titulo', 'reglas-titulo', 'piensa-titulo', 'herr-titulo'];
    expect(await page.locator('main h2').evaluateAll((h) => h.map((x) => x.id))).toEqual(ids);
    expect(await page.locator('.indice a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))).toEqual(ids.map((i) => `#${i}`));
    await expect(page.locator('.certs .cert').first()).toContainText('ISO 9001');
    await expect(page.locator('.indicadores-hse .celdas li')).toHaveCount(4);
    await expect(page.locator('.compromisos button')).toHaveCount(4);
    await expect(page.locator('.reglas .regla')).toHaveCount(10);
    await expect(page.locator('.eje li')).toHaveCount(3);
    // Diagrama: 4 módulos y Microsoft 365 como base transversal.
    await expect(page.locator('.mods .mod')).toHaveCount(4);
    await expect(page.locator('.diag .base')).toContainText('Microsoft 365');
  });

  test('la versión en inglés vive en /en/integrated-management/ y /hse/ ya no existe', async ({ page, request }) => {
    await page.goto('/en/integrated-management/');
    await expect(page.locator('.mods .mod').first()).toContainText('Construction management');
    await expect(page.locator('#nav-principal a[href="/en/integrated-management/"]')).toHaveAttribute('aria-current', 'page');
    expect((await request.get('/hse/')).status()).toBe(404);
  });

  test('cada regla tiene su texto completo en el nombre accesible y gira con el teclado', async ({ page }) => {
    await page.goto('/gestion-integral/');
    const regla = page.locator('.regla').nth(3);
    await expect(regla).toHaveAttribute('aria-label', /LO-TO/);
    await regla.focus();
    await page.keyboard.press('Enter');
    await expect(regla).toHaveClass(/girada/);
  });

  test('la estructura 3D anima en pantalla, elige un compromiso al pasar y se pausa fuera', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/gestion-integral/');
    const caja = page.locator('.estructura');
    await caja.scrollIntoViewIfNeeded();
    await expect(caja).toHaveAttribute('data-estado', 'animando');
    await page.locator('.compromisos button').nth(2).hover();
    await expect(page.locator('.compromisos button').nth(2)).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => scrollTo(0, 0));
    await expect(caja).toHaveAttribute('data-estado', 'pausa');
  });

  test('con movimiento reducido la estructura queda quieta y las reglas visibles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/gestion-integral/');
    await expect(page.locator('.estructura')).toHaveAttribute('data-estado', 'quieto');
    await expect(page.locator('.regla').first()).toHaveCSS('opacity', '1');
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('se leen los 4 compromisos y las reglas; el lienzo no se muestra', async ({ page }) => {
      await page.goto('/gestion-integral/');
      await expect(page.locator('.estructura')).toBeHidden();
      await expect(page.locator('.compromisos .txt').nth(3)).toBeVisible();
      await expect(page.locator('.regla').first()).toHaveCSS('opacity', '1');
    });
  });

  test('ir y volver con el router deja un solo bucle de la estructura', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/gestion-integral/');
    await page.locator('#nav-principal a[href="/nosotros/"]').click();
    await expect(page).toHaveURL(/\/nosotros\/$/);
    await page.locator('#nav-principal a[href="/gestion-integral/"]').click();
    await expect(page).toHaveURL(/\/gestion-integral\/$/);
    expect(await page.evaluate(() => (window as any).__estructuraBucles)).toBe(1);
  });

  test('axe sin violaciones en HSE', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/gestion-integral/');
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

test.describe('acreedores y legales', () => {
  test('acreedores: fuera del pie; se llega desde un texto discreto en Documentos públicos', async ({ page }) => {
    await page.goto('/documentos/');
    await expect(page.locator('footer a[href="/acreedores/"]')).toHaveCount(0);
    await page.locator('.nota-acreedores a').click();
    await expect(page).toHaveURL(/\/acreedores\/$/);
  });

  test('acreedores: las 3 convocatorias en PDF descargables desde el sitio', async ({ page, request }) => {
    await page.goto('/acreedores/');
    const docs = page.locator('.linea .doc');
    await expect(docs).toHaveCount(3);
    const href = await docs.first().getAttribute('href');
    expect(href).toMatch(/^\/documentos\/.+\.pdf$/);
    expect((await request.get(href!)).headers()['content-type']).toContain('pdf');
  });

  test('datos: cajetín con el PDF, aviso jurídico e índice que marca la sección', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/legal/datos/');
    await expect(page.locator('.cajetin')).toContainText('M-TI-001');
    await expect(page.locator('.juridica')).toBeVisible();
    const enlaces = page.locator('.indice a');
    expect(await enlaces.count()).toBeGreaterThan(2);
    await page.locator('.texto h2').nth(2).scrollIntoViewIfNeeded();
    await page.evaluate(() => scrollBy(0, 200));
    await expect(page.locator('.indice a.actual')).toHaveCount(1);
  });

  test('términos existe en los dos idiomas', async ({ page }) => {
    for (const url of ['/legal/terminos/', '/en/legal/terms/', '/en/legal/privacy/', '/en/creditors/']) {
      const r = await page.goto(url);
      expect(r?.status(), url).toBe(200);
      await expect(page.locator('h1'), url).toHaveCount(1);
    }
  });
});

test.describe('noticias (acta: adjudicaciones, iniciativas y eventos)', () => {
  test('el índice filtra por tipo y la marca sigue al botón también en dos filas (móvil)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const r = await page.goto('/noticias/');
    expect(r?.status()).toBe(200);
    await expect(page.locator('#nav-principal a[href="/noticias/"]')).toHaveCount(1);
    const tarjetas = page.locator('.noti:not([hidden])');
    const total = await tarjetas.count();
    expect(total).toBeGreaterThanOrEqual(3);
    const boton = page.locator('.filtros button[data-f="iniciativa"]');
    await boton.click();
    await expect.poll(() => tarjetas.count()).toBeLessThan(total);
    await expect(tarjetas.first()).toHaveAttribute('data-tipo', 'iniciativa');
    await page.waitForTimeout(700);
    const [m, bb] = await Promise.all([page.locator('.filtros .marca').boundingBox(), boton.boundingBox()]);
    expect(Math.abs(m!.y - bb!.y)).toBeLessThan(2);
    expect(Math.abs(m!.height - bb!.height)).toBeLessThan(2);
  });

  test('regla pura: hacen falta 3 en español', async () => {
    const { hayNoticias } = await import('../src/lib/noticias');
    const n = (lang: 'es' | 'en') => ({ id: 'x', data: { lang, fecha: new Date() } });
    expect(hayNoticias([n('es'), n('es')])).toBe(false);
    expect(hayNoticias([n('es'), n('es'), n('en')])).toBe(false);
    expect(hayNoticias([n('es'), n('es'), n('es')])).toBe(true);
  });
});
