import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
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
    await expect(page).toHaveTitle('Grupo HL');
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

// ── Franja de sectores y HL en cifras (guía §12.1-2 y 3) ──

const SECTORES = ['cemento', 'mineria', 'agua-y-energia', 'petroleo-y-gas', 'infraestructura', 'industria'];

test.describe('franja de sectores', () => {
  test('enlaza a los 6 sectores con una sola copia accesible', async ({ page }) => {
    await page.goto('/');
    const lista = page.locator('.franja .cinta-lista a');
    await expect(lista).toHaveCount(6);
    for (const s of SECTORES) await expect(page.locator(`.franja .cinta-lista a[href="/sectores/${s}/"]`)).toHaveCount(1);
    const copia = page.locator('.franja .cinta-copia');
    await expect(copia).toHaveAttribute('aria-hidden', 'true');
    await expect(copia).toHaveAttribute('inert', '');
  });

  test('en inglés enlaza a las rutas en inglés', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.franja .cinta-lista a[href="/en/sectors/cement/"]')).toHaveCount(1);
  });
});

test.describe('HL en cifras', () => {
  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('las cifras están escritas en su valor final y los dibujos se ven', async ({ page }) => {
      await page.goto('/');
      const valores = await page.locator('.fichas .ficha-cifra').allTextContents();
      expect(valores.map((v) => v.trim())).toEqual([String(new Date().getFullYear() - 1968), '7', '4', '3']);
      // Las líneas rectas miden 0 de alto (toBeVisible no sirve): ningún trazo queda recortado.
      const recortes = await page.locator('.fichas svg .t').evaluateAll((xs) => xs.map((x) => getComputedStyle(x).clipPath));
      expect(recortes.length).toBeGreaterThan(10);
      expect(recortes.every((c) => c === 'none')).toBe(true);
    });
  });

  test('las estacas llevan los 7 países', async ({ page }) => {
    await page.goto('/');
    const codigos = await page.locator('.fichas .estaca-codigo').allTextContents();
    expect(codigos).toEqual(['CO', 'PA', 'CR', 'DO', 'GT', 'BO', 'EC']);
  });

  test('los sellos ISO van en orden', async ({ page }) => {
    await page.goto('/');
    const sellos = await page.locator('.ficha:nth-child(4) svg text').allTextContents();
    expect(sellos).toEqual(['9001', '14001', '45001']);
  });

  test('la cota de trayectoria llega al año actual', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.fichas .cota-fin')).toHaveText(String(new Date().getFullYear()));
  });
});

test.describe('accesibilidad del inicio', () => {
  for (const [ruta, tema] of [['/', 'light'], ['/en/', 'light'], ['/', 'dark']] as const) {
    test(`${ruta} sin violaciones (${tema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
      await page.goto(ruta);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});

// ── Resto del inicio (Tarea 8, guía §12.1-4 y §13) ──

test.describe('resto del inicio', () => {
  test('destacados: 4 obras, la grande es Columbus y ninguna es discreta', async ({ page }) => {
    await page.goto('/');
    const fichas = page.locator('.destacados .dest');
    await expect(fichas).toHaveCount(4);
    await expect(fichas.first()).toHaveAttribute('data-id', 'planta-columbus');
    const ids = await fichas.evaluateAll((xs) => xs.map((x) => x.getAttribute('data-id')));
    expect(ids).not.toContain('patio-de-carbon-estrella');
    expect(ids).not.toContain('tanques-cobre-panama');
    await expect(page.locator('.destacados .ver-mas')).toHaveAttribute('href', '/proyectos/');
  });

  test('servicios: los 3 grupos con las 7 líneas enlazadas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.servicios-inicio .grupo')).toHaveCount(3);
    await expect(page.locator('.servicios-inicio li a[href^="/servicios/"]')).toHaveCount(7);
  });

  test('sectores: Cemento y Minería al frente y en grande, los otros 4 pequeños', async ({ page }) => {
    await page.goto('/');
    const mayores = page.locator('.sectores-inicio .mayor a');
    await expect(mayores).toHaveCount(2);
    await expect(mayores.nth(0)).toHaveAttribute('href', '/sectores/cemento/');
    await expect(mayores.nth(1)).toHaveAttribute('href', '/sectores/mineria/');
    await expect(page.locator('.sectores-inicio .menor')).toHaveCount(4);
    // Minería cuenta solo las visibles: Cobre Panamá es discreta.
    await expect(page.locator('.sectores-inicio .mayor').nth(1).locator('.grande b')).toHaveText('3');
  });

  test('la franja HSE lleva los 3 indicadores y enlaza a HSE', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.franja-hse .indicadores li')).toHaveCount(3);
    await expect(page.locator('.franja-hse .valor').first()).toHaveText('−64 %');
    await expect(page.locator('.franja-hse .hse-ir')).toHaveAttribute('href', '/hse/');
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

  test('sin noticias no hay bloque de noticias', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main .noticias')).toHaveCount(0);
  });

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('los bloques nuevos se ven completos', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('.franja-hse .indicadores li').first()).toHaveCSS('opacity', '1');
      await expect(page.locator('.destacados .dest').first()).toHaveCSS('opacity', '1');
    });
  });

  test('con movimiento reducido las cintas de clientes no corren', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('.clientes .cinta').first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator('.franja-hse .indicadores li').first()).toHaveCSS('opacity', '1');
  });

  test('en inglés los enlaces van a las rutas EN', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('.sectores-inicio .mayor a').first()).toHaveAttribute('href', '/en/sectors/cement/');
    await expect(page.locator('.franja-hse .hse-ir')).toHaveAttribute('href', '/en/hse/');
  });
});
