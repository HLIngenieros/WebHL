import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cifrasInicio, partirLema } from '../src/lib/inicio';
import { auditar } from '../src/lib/contenido';

// ── Datos del Home (especificación v2.0 §5) ──

test.describe('cifras del Home', () => {
  const base = {
    fundacion: 1968, paises: ['CO', 'PA', 'CR', 'DO', 'GT', 'BO', 'EC'],
    proyecto: { nombre: 'Planta Columbus', hh: 9470000 }, seguridad: { valor: 64, signo: '−' },
  };

  test('años, países, horas hombre y seguridad, en ese orden', () => {
    const cifras = cifrasInicio(base, 'es', new Date(2026, 10, 12));
    expect(cifras.map((c) => c.clave)).toEqual(['trayectoria', 'presencia', 'horas', 'seguridad']);
    expect(cifras.map((c) => c.valor)).toEqual([58, 7, 9470000, 64]);
    expect(cifras[3].signo).toBe('−');
  });

  test('la edad se calcula con el año', () => {
    expect(cifrasInicio(base, 'es', new Date(2027, 0, 1))[0].valor).toBe(59);
  });

  test('números y textos en el idioma', () => {
    const es = cifrasInicio(base, 'es', new Date(2026, 10, 12));
    const en = cifrasInicio(base, 'en', new Date(2026, 10, 12));
    expect([es[2].texto, en[2].texto]).toEqual(['9.470.000', '9,470,000']);
    expect([es[0].unidad, en[0].unidad]).toEqual(['años', 'years']);
    expect(es[2].descripcion).toContain('Planta Columbus');
  });
});

test('el lema se parte en dos líneas grandes y un cierre subrayado (guía §2.3)', () => {
  expect(partirLema('Construimos la industria con gente que cumple, desde 1968.'))
    .toEqual({ l1: 'Construimos', l2: 'la industria', l3: 'con gente que cumple,', cierre: 'desde 1968.' });
  expect(partirLema('Building industry with people who deliver, since 1968.'))
    .toEqual({ l1: 'Building', l2: 'industry', l3: 'with people who deliver,', cierre: 'since 1968.' });
});

test('un país de la lista del sitio sin nombre detiene la compilación', () => {
  const sitio = [{ id: 'hl', data: { paises: ['CO', 'XX'], asociadas: [{}], clientes: [] } }];
  expect(() => auditar({ sitio } as never, { modo: 'desarrollo' })).toThrow(/"XX"/);
});

test('sin video del Home queda un pendiente que bloquea el lanzamiento', () => {
  const sitio = [{ id: 'hl', data: { paises: ['CO'], asociadas: [{}], clientes: [] } }];
  expect(auditar({ sitio } as never, { modo: 'desarrollo' }).some((x) => x.campo === 'video' && x.bloquea)).toBe(true);
});

// ── Hero: lema sobre el póster o el video, con pausa ──

const LEMA = 'Construimos la industria con gente que cumple, desde 1968.';
const texto = (s: string | null) => (s ?? '').replace(/\s+/g, ' ').trim();
const salirDelHero = (page: import('@playwright/test').Page) =>
  page.evaluate(() => { const h = document.querySelector('.hero')!; window.scrollTo(0, h.getBoundingClientRect().height + 200); });

test.describe('hero del Home', () => {
  test('un solo h1 con el lema, y el lema como descripción', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(texto(await page.locator('h1').textContent())).toBe(LEMA);
    await expect(page.locator('meta[name=description]')).toHaveAttribute('content', LEMA);
    await expect(page).toHaveTitle('Grupo HL');
  });

  test('en inglés, el lema en inglés', async ({ page }) => {
    await page.goto('/en/');
    expect(texto(await page.locator('h1').textContent())).toBe('Building industry with people who deliver, since 1968.');
  });

  test('solo el título y la pausa: sin enlaces ni gráficas encima', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hero a, .hero canvas')).toHaveCount(0);
    await expect(page.locator('.hero img.hero-poster')).toHaveAttribute('fetchpriority', 'high');
  });

  test('la pausa detiene el acercamiento del póster y cambia su nombre', async ({ page }) => {
    await page.goto('/');
    const boton = page.locator('.hero-pausa');
    await expect(boton).toHaveAttribute('aria-label', 'Pausar el video de fondo');
    await boton.click();
    await expect(boton).toHaveAttribute('aria-pressed', 'true');
    await expect(boton).toHaveAttribute('aria-label', 'Reproducir el video de fondo');
    await expect(page.locator('.hero img.hero-poster')).toHaveCSS('animation-play-state', 'paused');
  });

  test('con movimiento reducido arranca en pausa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.hero-pausa')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.hero img.hero-poster')).toHaveCSS('animation-name', 'none');
  });

  test('a 360 px no hay scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

test.describe('barra inmersa', () => {
  // Ventana baja: el hero mide al menos 560 px, así siempre hay hacia dónde bajar.
  test.use({ viewport: { width: 1366, height: 300 } });

  test('está inmersa en el hero y pasa a la barra normal al bajar', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header.barra')).toHaveClass(/inmersa/);
    await salirDelHero(page);
    await expect(page.locator('header.barra')).not.toHaveClass(/inmersa/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('header.barra')).toHaveClass(/inmersa/);
  });

  test('Hablar con HL sigue flotante en el hero y al bajar (R2)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hablar')).toBeVisible();
    await salirDelHero(page);
    await expect(page.locator('#hablar')).toBeVisible();
  });

  test('las demás páginas nunca la tienen', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('header.barra')).not.toHaveClass(/inmersa/);
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

// ── Cifras y clientes ──

test.describe('HL en cifras', () => {
  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('las 4 cifras están escritas en su valor final', async ({ page }) => {
      await page.goto('/');
      const valores = await page.locator('.ci-valor').allTextContents();
      expect(valores.map(texto)).toEqual([String(new Date().getFullYear() - 1968), '7', '9.470.000', '−64 %']);
    });
  });

  test('al entrar en pantalla, la cota se mide y el contador termina en el valor final', async ({ page }) => {
    await page.goto('/');
    await page.locator('.ci').scrollIntoViewIfNeeded();
    await expect(page.locator('.ci-cifra').first()).toHaveClass(/visible/);
    await expect(page.locator('.ci-cifra').nth(2).locator('[data-n]')).toHaveText('9.470.000');
  });

  test('en inglés, con su formato', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('.ci').scrollIntoViewIfNeeded();
    await expect(page.locator('.ci-cifra').nth(2).locator('[data-n]')).toHaveText('9,470,000');
    await expect(page.locator('.ci-valor').nth(3)).toHaveText('−64%');
  });
});

test.describe('el Home solo lleva lo del acta', () => {
  test('hero, cifras y clientes; nada más', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('main > section').evaluateAll((xs) => xs.map((x) => x.className.split(' ')[0])))
      .toEqual(['hero', 'ci', 'clientes']);
  });

  test('clientes: cada logo con su nombre y una sola copia accesible', async ({ page }) => {
    await page.goto('/');
    const leibles = page.locator('.clientes .cinta ul:not([aria-hidden]) img');
    const n = await leibles.count();
    expect(n).toBeGreaterThan(10);
    const alts = await leibles.evaluateAll((xs) => xs.map((x) => x.getAttribute('alt')));
    expect(alts.every(Boolean)).toBe(true);
    await expect(page.locator('.clientes ul[aria-hidden] img[alt=""]')).toHaveCount(n);
  });

  test('con movimiento reducido las cintas de clientes no corren', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.clientes .cinta').first()).toHaveCSS('animation-name', 'none');
  });
});

test.describe('accesibilidad del Home', () => {
  for (const [ruta, tema] of [['/', 'light'], ['/en/', 'light'], ['/', 'dark']] as const) {
    test(`${ruta} sin violaciones (${tema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
      await page.goto(ruta);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});
