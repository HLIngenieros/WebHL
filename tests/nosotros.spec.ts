import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { hitos, tratamiento, avance, publicables, numerar } from '../src/lib/nosotros';
import { auditar, type Pendiente } from '../src/lib/contenido';

// ── Contenido de Nosotros (guía §12.2-12.3) ──

const HOY = new Date(2026, 9, 19);
const hito = (id: string, orden: number, anio: number, decada: string) =>
  ({ id, data: { orden, anio, decada: { es: decada, en: decada }, es: { titulo: id, texto: 'T' } } });
const HISTORIA = [
  hito('la-idea-de-servicio', 1, 1968, 'Década de los 60'),
  hito('iniciando-la-operacion', 2, 1970, 'Década de los 70'),
  hito('hacia-la-especializacion', 3, 1980, 'Década de los 80'),
  hito('el-desarrollo', 4, 1990, 'Década de los 90'),
  hito('alianzas-para-crecer', 5, 2000, 'Desde el 2000'),
];

test.describe('línea del tiempo', () => {
  test('hitos(): los 5 en orden y "Hoy" al final con el año actual', () => {
    const xs = hitos([...HISTORIA].reverse() as never, 'es', HOY);
    expect(xs).toHaveLength(6);
    expect(xs.map((h) => h.anio)).toEqual([1968, 1970, 1980, 1990, 2000, 2026]);
    expect(xs.at(-1)!.hoy).toBe(true);
    expect(xs.slice(0, 5).every((h) => !h.hoy)).toBe(true);
    expect(xs[0].decada).toBe('Década de los 60');
  });

  test('tratamiento(): blanco y negro en 1968, color pleno hoy', () => {
    expect(tratamiento(1968, HOY)).toEqual({ gris: 1, sepia: 0.35, contraste: 1.12 });
    expect(tratamiento(2026, HOY)).toEqual({ gris: 0, sepia: 0, contraste: 1 });
    const medio = tratamiento(1997, HOY);
    expect(medio.gris).toBeGreaterThan(0);
    expect(medio.gris).toBeLessThan(1);
  });

  test('avance(): del primer hito al último con el scroll', () => {
    const anios = [1968, 1970, 1980, 1990, 2000, 2026];
    expect(avance(0, anios)).toEqual({ anio: 1968, indice: 0, local: 0 });
    expect(avance(1, anios)).toMatchObject({ anio: 2026, indice: 5 });
    const entre = avance((1985 - 1968) / (2026 - 1968), anios);
    expect(entre.indice).toBe(2);
    expect(entre.local).toBeGreaterThan(0);
    expect(entre.local).toBeLessThan(1);
  });
});

test.describe('secciones que dependen de autorización', () => {
  const sinAutorizar = [1, 2, 3, 4].map((i) => ({ id: `t${i}`, autorizado: false }));

  test('en lanzamiento no se publica ningún testimonio sin autorizar', () => {
    expect(publicables(sinAutorizar, 'lanzamiento')).toEqual([]);
    expect(publicables(sinAutorizar, 'desarrollo')).toHaveLength(4);
    expect(publicables([{ aprobada: true }, { aprobada: false }], 'lanzamiento')).toEqual([{ aprobada: true }]);
  });

  test('testimonios y asociadas sin aprobar son avisos: no bloquean el lanzamiento', () => {
    const datos = {
      testimonios: [{ id: 't1', data: { autorizado: false, cargo: { es: 'C', en: 'C' }, cita: { es: 'Q', en: 'Q' } } }],
      sitio: [{ id: 'hl', data: { paises: ['CO'], asociadas: [{ nombre: 'ECOHL', aprobada: false }], clientes: [], cifras: [] } }],
    };
    let ps: Pendiente[] = [];
    expect(() => { ps = auditar(datos as never, { modo: 'lanzamiento' }); }).not.toThrow();
    const asociada = ps.find((p) => p.coleccion === 'sitio' && p.campo === 'asociadas');
    expect(asociada).toMatchObject({ tipo: 'aviso', bloquea: false });
  });

  test('las fotos de archivo en baja resolución son un aviso, no un bloqueo', () => {
    const ps = auditar({ historia: HISTORIA } as never, { modo: 'desarrollo' });
    expect(ps.filter((p) => p.coleccion === 'historia' && p.campo === 'anio')).toEqual([]);
    expect(ps.find((p) => p.coleccion === 'historia' && p.campo === 'fotos')).toMatchObject({ tipo: 'aviso', bloquea: false });
  });
});

test('numerar(): las secciones visibles se numeran sin saltos', () => {
  const ids = ['mision', 'valores', 'presencia', 'testimonios', 'asociadas'];
  expect(numerar(ids, { testimonios: false, asociadas: false })).toEqual([
    { id: 'mision', n: '01' }, { id: 'valores', n: '02' }, { id: 'presencia', n: '03' },
  ]);
  expect(numerar(ids, {}).map((x) => x.n)).toEqual(['01', '02', '03', '04', '05']);
});

// ── Página Nosotros (guía §12.2) ──

test.describe('página Nosotros', () => {
  test('un solo h1, misión y visión de nosotros.es.md', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('h1')).toHaveCount(1);
    expect((await page.locator('h1').textContent())!.replace(/\s+/g, ' ').trim()).toBe('Gente que cumple desde 1968');
    await expect(page.locator('.mision')).toContainText('Gestionar proyectos de construcción generando valor y confianza.');
    await expect(page.locator('.vision')).toContainText('con la entrega anticipada de sus proyectos');
  });

  test('cuatro indicadores con su valor escrito', async ({ page }) => {
    await page.goto('/nosotros/');
    expect((await page.locator('.indicador-valor').allTextContents()).map((v) => v.trim())).toEqual(['1', '3', '−64', '−72']);
  });

  test('cinco valores, cada uno con su pictograma y su frase', async ({ page }) => {
    await page.goto('/nosotros/');
    const valores = page.locator('.valor');
    await expect(valores).toHaveCount(5);
    await expect(page.locator('.valor svg[aria-hidden="true"]')).toHaveCount(5);
    await expect(valores.nth(0)).toContainText('Transparencia');
    await expect(valores.nth(0)).toContainText('En todos nuestros negocios.');
    // Frases con comas: no se cortan (YAML en línea).
    await expect(valores.nth(1)).toContainText('Con clientes, proveedores y subcontratistas.');
    await expect(valores.nth(2)).toContainText('De cronogramas, especificaciones y presupuestos.');
  });

  test('la descripción de ECOHL se lee completa', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('.asociada').first()).toContainText('Servicios EPCM, gerencias de proyecto, interventoría, comisionamiento, administración de contratos y gerencia de riesgos.');
  });

  test('siete estacas con los nombres de país', async ({ page }) => {
    await page.goto('/nosotros/');
    expect(await page.locator('.presencia .estaca-pais').allTextContents()).toEqual(
      ['Colombia', 'Panamá', 'Costa Rica', 'República Dominicana', 'Guatemala', 'Bolivia', 'Ecuador']);
  });

  test('las secciones numeradas van sin saltos', async ({ page }) => {
    await page.goto('/nosotros/');
    const ns = await page.locator('[data-numero]').evaluateAll((xs) => xs.map((x) => (x as HTMLElement).dataset.numero));
    expect(ns).toEqual(ns.map((_, i) => String(i + 1).padStart(2, '0')));
  });

  test('en desarrollo se ven los 4 testimonios marcados sin autorizar y las 4 empresas del grupo por confirmar', async ({ page }) => {
    await page.goto('/nosotros/');
    await expect(page.locator('.testimonios [aria-pressed]')).toHaveCount(4);
    await expect(page.locator('.testimonios .chip-pendiente')).toContainText('sin autorizar');
    await expect(page.locator('.asociada')).toHaveCount(4); // sin Megacranes ni Aktino (20-oct)
    await expect(page.locator('.asociadas .chip-pendiente')).toContainText('por confirmar');
  });

  test('elegir un testimonio muestra su fragmento', async ({ page }) => {
    await page.goto('/nosotros/');
    const botones = page.locator('.testimonios [aria-pressed]');
    await botones.nth(2).click();
    await expect(botones.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.testimonio.activo .testimonio-cita')).toContainText('Han pasado más de 15 años');
  });

  test('el selector avanza solo cada 9 s', async ({ page }) => {
    await page.clock.install();
    await page.goto('/nosotros/');
    const botones = page.locator('.testimonios [aria-pressed]');
    await expect(botones.nth(0)).toHaveAttribute('aria-pressed', 'true');
    await page.clock.fastForward(9500);
    await expect(botones.nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('con movimiento reducido el selector no avanza', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('/nosotros/');
    await page.clock.fastForward(20000);
    await expect(page.locator('.testimonios [aria-pressed]').nth(0)).toHaveAttribute('aria-pressed', 'true');
  });

  for (const tema of ['light', 'dark'] as const) {
    test(`sin violaciones de accesibilidad (${tema})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
      await page.goto('/nosotros/');
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }

  test('a 360 px sin scroll horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/nosotros/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

// ── Tira de negativos (guía §12.3) ──

const ANIO = new Date().getFullYear();
const irA = (page: import('@playwright/test').Page, fraccion: number) =>
  page.evaluate((f) => {
    const s = document.querySelector<HTMLElement>('[data-tira]')!;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + (s.offsetHeight - window.innerHeight) * f);
  }, fraccion);

test.describe('tira de negativos', () => {
  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('los 6 hitos se leen en lista con su foto y su década', async ({ page }) => {
      await page.goto('/nosotros/');
      const hitos = page.locator('.tira-lista > li');
      await expect(hitos).toHaveCount(6);
      await expect(page.locator('.tira-lista img')).toHaveCount(6);
      await expect(hitos.nth(0)).toContainText('Década de los 60');
      await expect(hitos.nth(5)).toContainText(String(ANIO));
      await expect(page.locator('.tira-escena')).toBeHidden();
    });
  });

  test('con movimiento reducido es la misma lista, sin escenario fijo', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/nosotros/');
    await expect(page.locator('.tira-lista > li').nth(3)).toBeVisible();
    await expect(page.locator('.tira-escena')).toBeHidden();
  });

  test('con el scroll, el año corre y cambian los hitos', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 800 });
    await page.goto('/nosotros/');
    await expect(page.locator('[data-tira]')).toHaveClass(/activa/);
    await irA(page, 0.55);
    await expect(page.locator('.escena-titulo')).toHaveText(/El desarrollo|Alianzas para crecer/);
    await expect.poll(async () => Number(await page.locator('.escena-anio-texto').textContent())).toBeGreaterThanOrEqual(1990);
    expect(Number(await page.locator('.escena-anio-texto').textContent())).toBeLessThanOrEqual(2000);
    await irA(page, 1);
    await expect(page.locator('.escena-titulo')).toHaveText('Hoy');
    await expect(page.locator('.escena-anio-texto')).toHaveText(String(ANIO));
  });

  test('a 360 px el año no desborda', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/nosotros/');
    await irA(page, 0.3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});
