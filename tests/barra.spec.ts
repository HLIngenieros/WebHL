import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('a 1366 px se ven las 7 secciones sin desbordar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/');
  await expect(page.locator('#nav-principal a')).toHaveCount(7);
  await expect(page.locator('#nav-principal')).toBeVisible();
  await expect(page.locator('#boton-menu')).toBeHidden();
  expect(await sinDesborde(page)).toBe(true);
});

for (const width of [1024, 390]) {
  test(`a ${width} px el menú móvil abre, cierra con Esc y devuelve el foco`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.locator('#nav-principal')).toBeHidden();
    const boton = page.locator('#boton-menu');
    await boton.click();
    await expect(page.locator('#menu-movil')).toBeVisible();
    await expect(page.locator('#menu-movil a[data-seccion]')).toHaveCount(7);
    await page.keyboard.press('Escape');
    await expect(page.locator('#menu-movil')).toBeHidden();
    await expect(boton).toBeFocused();
    expect(await sinDesborde(page)).toBe(true);
  });
}

test('el selector de idioma lleva al par de la página', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/nosotros/');
  const enlace = page.locator('.herramientas a[hreflang=en]');
  await expect(enlace).toHaveAttribute('href', '/en/about/');
  await enlace.click();
  await expect(page).toHaveURL(/\/en\/about\/$/);
  await expect(page.locator('.herramientas a[hreflang=es]')).toHaveAttribute('href', '/nosotros/');
});

test('la sección activa se marca con aria-current en ambos idiomas', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/nosotros/');
  await expect(page.locator('#nav-principal a[aria-current=page]')).toHaveAttribute('href', '/nosotros/');
  await page.goto('/en/about/');
  await expect(page.locator('#nav-principal a[aria-current=page]')).toHaveAttribute('href', '/en/about/');
  await page.goto('/');
  await expect(page.locator('#nav-principal a[aria-current]')).toHaveCount(0);
});

test('con zoom del 200 % a 1366 px (683 px útiles) se usa el menú móvil', async ({ page }) => {
  await page.setViewportSize({ width: 683, height: 400 });
  await page.goto('/en/');
  await expect(page.locator('#boton-menu')).toBeVisible();
  expect(await sinDesborde(page)).toBe(true);
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('el botón Menú es un enlace a la navegación del pie', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await expect(page.locator('#boton-menu')).toHaveAttribute('href', '#navegacion-pie');
    await expect(page.locator('#navegacion-pie a')).toHaveCount(13);
  });
});

test('el tema elegido persiste y se aplica antes de pintar', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('#boton-tema').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      (window as any).__temaAlCargar = document.documentElement.dataset.theme;
    });
  });
  await page.reload();
  expect(await page.evaluate(() => (window as any).__temaAlCargar)).toBe('dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(14, 17, 19)');
});

test('si localStorage está bloqueado la página carga sin errores', async ({ page }) => {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('bloqueado'); } });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.locator('#boton-tema').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errores).toEqual([]);
});

test('el botón Menú se abre con Espacio y anuncia su estado', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/');
  const boton = page.locator('#boton-menu');
  await expect(boton).toHaveJSProperty('tagName', 'BUTTON');
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
  await boton.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#menu-movil')).toBeVisible();
  await expect(boton).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(boton).toHaveAttribute('aria-expanded', 'false');
});

// F3.1 · Marca provisional (guía §2.2): monograma vectorial + "HL INGENIEROS"; reemplaza al cuadro "HL".
test.describe('marca con el monograma', () => {
  const VIEWBOX = '0 0 97.13 97.13';

  test('la barra lleva el monograma y el nombre, sin el cuadro provisional', async ({ page }) => {
    await page.goto('/nosotros/');
    const logo = page.locator('header.barra a.logo');
    await expect(logo.locator(`svg[viewBox="${VIEWBOX}"]`)).toHaveCount(1);
    await expect(logo.locator('svg')).toHaveAttribute('aria-hidden', 'true');
    await expect(logo).toContainText('HL Ingenieros');
    await expect(page.locator('.logo-hl')).toHaveCount(0);
  });

  test('el monograma mide al menos 24 px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/nosotros/');
    const alto = await page.locator('header.barra a.logo svg').evaluate((e) => e.getBoundingClientRect().height);
    expect(alto).toBeGreaterThanOrEqual(24);
  });

  test('el favicon es el monograma en vector', () => {
    const svg = fs.readFileSync('public/favicon.svg', 'utf8');
    expect(svg).toContain('#0B509E');
    expect(svg).toContain('<path');
    expect(svg).not.toContain('<text');
  });

  test('la 404 usa el monograma como burbuja de eje', async ({ page }) => {
    await page.goto('/no-existe/');
    await expect(page.locator(`main .burbuja-marca svg[viewBox="${VIEWBOX}"]`)).toHaveCount(1);
  });
});
