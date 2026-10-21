import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';

const sinDesborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

test('a 1366 px se ven las 5 secciones sin desbordar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/');
  await expect(page.locator('#nav-principal > ul > li > a')).toHaveCount(5);
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
    await expect(page.locator('#menu-movil .fila a[data-seccion]')).toHaveCount(5);
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
    await expect(page.locator('#navegacion-pie a')).toHaveCount(14); // 7 secciones + 7 del pie (con Documentos)
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
    await expect(logo).toContainText('Grupo HL');
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

// Guía §13.1 · Submenú de Proyectos: Sectores (Cemento y Minería al frente) y Servicios.
test.describe('submenú de Proyectos', () => {
  test.beforeEach(async ({ page }) => { await page.setViewportSize({ width: 1366, height: 800 }); });

  test('"Proyectos" sigue siendo un enlace y el botón abre el panel', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('#nav-principal a[data-seccion=proyectos]')).toHaveAttribute('href', '/proyectos/');
    const boton = page.locator('.desplegar');
    const panel = page.locator('#panel-proyectos');
    await expect(panel).toBeHidden();
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await page.mouse.click(10, 700);
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('se abre con flecha abajo, Esc lo cierra y devuelve el foco', async ({ page }) => {
    await page.goto('/nosotros/');
    const boton = page.locator('.desplegar');
    await boton.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#panel-proyectos a').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('#panel-proyectos')).toBeHidden();
    await expect(boton).toBeFocused();
  });

  test('Cemento y Minería van primero; los 6 sectores y los 7 servicios enlazan a su página', async ({ page }) => {
    await page.goto('/nosotros/');
    await page.locator('.desplegar').click();
    const panel = page.locator('#panel-proyectos');
    await expect(panel.locator('.principales a')).toHaveCount(2);
    await expect(panel.locator('.principales a').nth(0)).toHaveAttribute('href', '/sectores/cemento/');
    await expect(panel.locator('.principales a').nth(1)).toHaveAttribute('href', '/sectores/mineria/');
    await expect(panel.locator('.otros a')).toHaveCount(4);
    await expect(panel.locator('.panel-servicios li a')).toHaveCount(7);
    await expect(panel.locator('a[href="/proyectos/"]')).toHaveCount(1);
    await expect(panel.locator('a[href="/sectores/"]')).toHaveCount(1);
  });

  test('en Servicios y Sectores se marca Proyectos', async ({ page }) => {
    for (const url of ['/sectores/', '/servicios/obras-civiles/', '/en/sectors/']) {
      await page.goto(url);
      await expect(page.locator('#nav-principal a[data-seccion=proyectos]')).toHaveAttribute('aria-current', 'true');
    }
  });

  test('sin desborde con el panel abierto y en la barra inmersa del inicio', async ({ page }) => {
    await page.goto('/');
    await page.locator('.desplegar').click();
    await expect(page.locator('#panel-proyectos')).toBeVisible();
    expect(await sinDesborde(page)).toBe(true);
  });

  test('en el menú móvil, Proyectos despliega sectores y servicios', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await page.locator('#boton-menu').click();
    const mas = page.locator('.desplegar-movil');
    await expect(page.locator('#sub-proyectos')).toBeHidden();
    await mas.click();
    await expect(mas).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#sub-proyectos .sub-principales a')).toHaveCount(2);
    await expect(page.locator('#sub-proyectos .sub-servicios a')).toHaveCount(7);
    expect(await sinDesborde(page)).toBe(true);
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('no hay botón ni panel; Proyectos es un enlace', async ({ page }) => {
      await page.goto('/nosotros/');
      await expect(page.locator('.desplegar')).toBeHidden();
      await expect(page.locator('#panel-proyectos')).toBeHidden();
      await expect(page.locator('#nav-principal a[data-seccion=proyectos]')).toHaveAttribute('href', '/proyectos/');
    });
  });
});
