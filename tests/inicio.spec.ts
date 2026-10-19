import { test, expect } from '@playwright/test';
import { cifrasInicio, partirLema } from '../src/lib/inicio';
import { DISCIPLINAS, planta, proyectar, recortar } from '../src/lib/gemelo';
import { auditar } from '../src/lib/contenido';

// ── Datos del inicio (guía §12.1-3) ──

test.describe('cifras del inicio', () => {
  const base = { fundacion: 1968, paises: ['CO', 'PA', 'CR', 'DO', 'GT', 'BO', 'EC'], sedes: 4, certificaciones: 3 };

  test('trayectoria, presencia, sedes y calidad, en ese orden', () => {
    const cifras = cifrasInicio(base, 'es', new Date(2026, 9, 19));
    expect(cifras.map((c) => c.clave)).toEqual(['trayectoria', 'presencia', 'sedes', 'calidad']);
    expect(cifras.map((c) => c.valor)).toEqual([58, 7, 4, 3]);
  });

  test('la edad se calcula con el año', () => {
    expect(cifrasInicio(base, 'es', new Date(2027, 0, 1))[0].valor).toBe(59);
  });

  test('cada cifra lleva su etiqueta en el idioma', () => {
    const es = cifrasInicio(base, 'es', new Date(2026, 9, 19));
    const en = cifrasInicio(base, 'en', new Date(2026, 9, 19));
    expect(es[0].etiqueta).toBe('años');
    expect(en[0].etiqueta).toBe('years');
  });
});

test('el lema se parte en sus tres líneas (guía §2.3)', () => {
  expect(partirLema('Construimos la industria con gente que cumple, desde 1968.')).toEqual(['Construimos', 'la industria', 'con gente que cumple, desde 1968.']);
  expect(partirLema('Building industry with people who deliver, since 1968.')).toEqual(['Building', 'industry', 'with people who deliver, since 1968.']);
});

test('un país de la lista del sitio sin nombre detiene la compilación', () => {
  const sitio = [{ id: 'hl', data: { paises: ['CO', 'XX'], asociadas: [{}], clientes: [], cifras: [] } }];
  expect(() => auditar({ sitio } as never, { modo: 'desarrollo' })).toThrow(/"XX"/);
});

// ── Hero, barra inmersa y botón de trazo (guía §12.1-1, §7) ──

const LEMA = 'Construimos la industria con gente que cumple, desde 1968.';
const texto = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const salirDelHero = (page: import('@playwright/test').Page) =>
  page.evaluate(() => { const h = document.querySelector('.hero')!; window.scrollTo(0, h.getBoundingClientRect().height + 200); });

test.describe('hero del inicio', () => {
  test('un solo h1 con el lema, y el lema como descripción', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(texto(await page.locator('h1').textContent())).toBe(LEMA);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', LEMA);
    await expect(page).toHaveTitle('HL Ingenieros');
  });

  test('en inglés, el lema en inglés', async ({ page }) => {
    await page.goto('/en/');
    expect(texto(await page.locator('h1').textContent())).toBe('Building industry with people who deliver, since 1968.');
  });

  test('el hero solo tiene el botón Ver proyectos', async ({ page }) => {
    await page.goto('/');
    const enlaces = page.locator('.hero a');
    await expect(enlaces).toHaveCount(1);
    await expect(enlaces).toHaveAttribute('href', '/proyectos/');
    await expect(enlaces).toContainText('Ver proyectos');
  });

  test('a 360 px no hay scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });

  test('con movimiento reducido el botón de trazo ya está lleno', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('.hero .boton-trazo')).toHaveCSS('background-color', 'rgb(11, 80, 158)');
  });
});

test.describe('barra inmersa', () => {
  // Ventana baja: el hero mide al menos 600 px, así siempre hay hacia dónde bajar.
  test.use({ viewport: { width: 1366, height: 300 } });

  test('está inmersa en el hero y pasa a la barra normal al bajar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header.barra')).toHaveClass(/inmersa/);
    await salirDelHero(page);
    await expect(page.locator('header.barra')).not.toHaveClass(/inmersa/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('header.barra')).toHaveClass(/inmersa/);
  });

  test('en el hero, Hablar con HL va en la barra; al bajar, vuelve el botón flotante', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header.barra .hablar-barra')).toBeVisible();
    await expect(page.locator('#hablar')).toBeHidden();
    await salirDelHero(page);
    await expect(page.locator('#hablar')).toBeVisible();
  });

  test('las demás páginas nunca la tienen', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('header.barra')).not.toHaveClass(/inmersa/);
    await expect(page.locator('header.barra .hablar-barra')).toBeHidden();
  });

  test('ir y volver con el router la restablece con un solo observador', async ({ page }) => {
    await page.goto('/');
    await page.locator('#nav-principal a[href="/nosotros/"]').click();
    await expect(page).toHaveURL(/\/nosotros\/$/);
    await expect(page.locator('header.barra')).not.toHaveClass(/inmersa/);
    await page.locator('header.barra a.logo').click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('header.barra')).toHaveClass(/inmersa/);
    expect(await page.evaluate(() => (window as any).__barraObs)).toBe(1);
  });
});

// ── Gemelo digital (guía §9, §12.1-1) ──

test.describe('geometría del gemelo', () => {
  test('cada disciplina tiene piezas, además de grúa y suelo', () => {
    const grupos = new Set(planta().map((s) => s[6]));
    for (const d of DISCIPLINAS.filter((d) => d !== 'mantenimiento')) expect(grupos.has(d), d).toBe(true);
    expect(grupos.has('grua')).toBe(true);
    expect(grupos.has('suelo')).toBe(true);
  });

  test('el levantamiento recorta por niveles', () => {
    expect(recortar([0, 0, 0, 0, 90, 0, 'mecanico'], 45)).toEqual([0, 0, 0, 0, 45, 0, 'mecanico']);
    expect(recortar([0, 0, 0, 0, 90, 0, 'mecanico'], -1)).toBeNull();
    expect(recortar([0, 50, 0, 0, 90, 0, 'mecanico'], 100)).toEqual([0, 50, 0, 0, 90, 0, 'mecanico']);
    expect(recortar([-150, 0, 0, 150, 0, 0, 'suelo'], -1)).toEqual([-150, 0, 0, 150, 0, 0, 'suelo']);
  });

  test('el origen, sin giro, cae en el centro horizontal', () => {
    const [x] = proyectar([0, 0, 0], { giro: 0, inclinacion: 0.3, ancho: 800, alto: 600 });
    expect(x).toBeCloseTo(400, 5);
  });

  test('mantenimiento es la última disciplina', () => {
    expect(DISCIPLINAS).toEqual(['civil', 'mecanico', 'electrico', 'fabricacion', 'mantenimiento']);
  });
});

test.describe('gemelo en la página', () => {
  test('el canvas es decorativo y arranca la animación', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.gemelo')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.gemelo canvas')).toHaveCount(1);
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'animando', { timeout: 5000 });
  });

  test('se pausa fuera de pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 300 });
    await page.goto('/');
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'animando', { timeout: 5000 });
    await salirDelHero(page);
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'pausa');
  });

  test('con movimiento reducido queda quieto', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForTimeout(1500);
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'quieto');
  });

  test('ir y volver con el router deja un solo bucle', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto('/');
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'animando', { timeout: 5000 });
    await page.locator('#nav-principal a[href="/nosotros/"]').click();
    await expect(page).toHaveURL(/\/nosotros\/$/);
    expect(await page.evaluate(() => (window as any).__gemeloBucles)).toBe(0);
    await page.locator('header.barra a.logo').click();
    await expect(page.locator('.gemelo')).toHaveAttribute('data-estado', 'animando', { timeout: 5000 });
    expect(await page.evaluate(() => (window as any).__gemeloBucles)).toBe(1);
  });
});
