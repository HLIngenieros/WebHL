// Detalles menores de la revisión final de F0.
import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const fuentes = (dir: string): string[] => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? fuentes(p) : /\.(astro|css)$/.test(p) ? [p] : [];
});

const bloquearAlmacenamiento = () => {
  Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });
};

test('con localStorage bloqueado el tema elegido se mantiene al navegar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.addInitScript(bloquearAlmacenamiento);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('#boton-tema').click();
  await page.locator('#nav-principal a[href="/nosotros/"]').click();
  await expect(page).toHaveURL(/\/nosotros\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('el botón de tema anuncia si el tema oscuro está activo', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const boton = page.locator('#boton-tema');
  await expect(boton).toHaveAttribute('aria-pressed', 'false');
  await boton.click();
  await expect(boton).toHaveAttribute('aria-pressed', 'true');
});

test('el botón de tema refleja el tema del sistema', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('#boton-tema')).toHaveAttribute('aria-pressed', 'true');
});

test('no hay tamaños de letra ni anchos tipográficos escritos a mano fuera de los tokens', () => {
  const sueltos = fuentes('src').flatMap((archivo) =>
    readFileSync(archivo, 'utf8').split('\n')
      .map((linea, i) => ({ linea, i }))
      .filter(({ linea }) => /(font-size|font-stretch|font-weight):\s*\d[\w.%]*\s*;/.test(linea))
      .map(({ i }) => `${archivo}:${i + 1}`));
  expect(sueltos).toEqual([]);
});

test('el foco de los campos usa contorno, no sombra', async ({ page }) => {
  await page.goto('/muestra/');
  const campo = page.locator('#campo-nombre');
  await campo.focus();
  await expect(campo).toHaveCSS('box-shadow', 'none');
  await expect(campo).toHaveCSS('outline-style', 'solid');
});

test('el título de primera pantalla aparece sin esperar al script de revelado', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).IntersectionObserver = function () { throw new Error('sin IntersectionObserver'); };
  });
  await page.goto('/');
  await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1', { timeout: 1500 });
});

test('al imprimir no queda contenido sin revelar', async ({ page }) => {
  await page.goto('/muestra/');
  await page.emulateMedia({ media: 'print' });
  const ocultos = await page.evaluate(() =>
    [...document.querySelectorAll('.izaje, .aparece, .cota-linea')].filter((el) => {
      const s = getComputedStyle(el);
      return s.opacity !== '1' || (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)');
    }).length);
  expect(ocultos).toBe(0);
});

test('la primera carga observa cada elemento animable una sola vez', async ({ page }) => {
  await page.addInitScript(() => {
    const observados = new Map<Element, number>();
    (window as any).__observados = observados;
    const original = IntersectionObserver.prototype.observe;
    IntersectionObserver.prototype.observe = function (el: Element) {
      observados.set(el, (observados.get(el) ?? 0) + 1);
      return original.call(this, el);
    };
  });
  await page.goto('/muestra/');
  await page.waitForLoadState('networkidle');
  const repetidos = await page.evaluate(() =>
    [...(window as any).__observados.entries()].filter(([el, n]: [Element, number]) => el.matches('.izaje, .cota') && n > 1).length);
  expect(repetidos).toBe(0);
});
