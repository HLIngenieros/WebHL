import { test, expect } from '@playwright/test';
import { medida, relacionados, sectoresDe, serviciosDe, clientesDe, auditar } from '../src/lib/contenido';
import { cumple, conteos, leerFiltros, escribirFiltros } from '../src/lib/explorador';
import { urlDe } from '../src/i18n/rutas';
import { p, ids, tj, slugs } from './apoyo';

const SITIO = 'https://hlingenieros.com';

test.describe('relaciones de F2', () => {
  const lista = [
    p('base', { servicios: [{ id: 'montaje-mecanico' }, { id: 'obras-civiles' }] }),
    p('gemelo', { cliente: 'Zeta', servicios: [{ id: 'montaje-mecanico' }, { id: 'obras-civiles' }] }),
    p('mismo-sector', { cliente: 'Alfa', servicios: [{ id: 'fabricacion' }] }),
    p('mismo-servicio', { sector: { id: 'mineria' }, servicios: [{ id: 'obras-civiles' }] }),
    p('nada-en-comun', { sector: { id: 'mineria' }, servicios: [{ id: 'fabricacion' }] }),
    p('oculta', { cliente: 'Secreto', visibilidad: 'discreta' }),
  ];

  test('(foco 1) una discreta no entra en relacionados, sectores, servicios ni clientes', () => {
    expect(ids(relacionados(lista, lista[0], 10))).not.toContain('oculta');
    expect(sectoresDe([lista[5]], 'montaje-mecanico')).toEqual([]);
    expect(serviciosDe([lista[5]], 'cemento')).toEqual([]);
    expect(clientesDe(lista, 'cemento')).not.toContain('Secreto');
  });

  test('relacionados: primero mismo sector y servicios, sin la actual ni sin nada en común', () => {
    expect(ids(relacionados(lista, lista[0]))).toEqual(['gemelo', 'mismo-sector', 'mismo-servicio']);
    expect(ids(relacionados(lista, lista[0], 1))).toEqual(['gemelo']);
  });

  test('sectores de un servicio y servicios de un sector, por frecuencia', () => {
    expect(sectoresDe(lista, 'obras-civiles')).toEqual(['cemento', 'mineria']);
    expect(serviciosDe(lista, 'cemento')).toEqual(['montaje-mecanico', 'obras-civiles', 'fabricacion']);
  });

  test('clientes del sector, únicos y en orden alfabético', () => {
    expect(clientesDe(lista, 'cemento')).toEqual(['Alfa', 'Cliente', 'Zeta']);
  });
});

test.describe('medida()', () => {
  test('cifra con unidad en cada idioma', () => {
    expect(medida(9470000, 'hh', 'es')).toBe('9.470.000 HH');
    expect(medida(9470000, 'hh', 'en')).toBe('9,470,000 man-hours');
    expect(medida(5250, 'tpd', 'es')).toBe('5.250 t/día');
    expect(medida(5250, 'tpd', 'en')).toBe('5,250 t/day');
    expect(medida(95000, 'm3', 'es')).toBe('95.000 m³');
  });
  test('porcentaje: espacio fino en español, pegado en inglés', () => {
    expect(medida(30, 'pct', 'es')).toBe('30 %');
    expect(medida(30, 'pct', 'en')).toBe('30%');
  });
  test('sin unidad, solo el número', () => {
    expect(medida(4, undefined, 'es')).toBe('4');
  });
});

test.describe('filtros del explorador', () => {
  const ts = [tj('a', 'montaje-mecanico', 'cemento', 'co'), tj('b', 'obras-civiles', 'cemento', 'gt'), tj('c', 'montaje-mecanico', 'mineria', 'co')];

  test('cumple: Y entre dimensiones', () => {
    expect(ts.filter((t) => cumple(t, { sector: 'cemento', pais: 'co' })).map((t) => t.id)).toEqual(['a']);
    expect(ts.filter((t) => cumple(t, {})).length).toBe(3);
  });

  test('conteos: cada opción cuenta con los otros filtros aplicados', () => {
    const c = conteos(ts, { sector: 'cemento', servicio: 'obras-civiles' }, 'servicio');
    expect(c.get('montaje-mecanico')).toBe(1);
    expect(c.get('obras-civiles')).toBe(1);
    expect(conteos(ts, { servicio: 'montaje-mecanico' }, 'pais').get('gt') ?? 0).toBe(0);
  });

  test('leerFiltros ignora valores desconocidos; escribirFiltros en orden fijo', () => {
    const validos = { servicio: new Set(['montaje-mecanico']), sector: new Set(['cemento']), pais: new Set(['co']) };
    expect(leerFiltros('?sector=nada&pais=co', validos)).toEqual({ pais: 'co' });
    expect(escribirFiltros({})).toBe('');
    expect(escribirFiltros({ pais: 'co', servicio: 'montaje-mecanico' })).toBe('?servicio=montaje-mecanico&pais=co');
  });
});

test.describe('rutas de contenido', () => {
  test('(foco 4) urlDe arma la URL del idioma', () => {
    expect(urlDe('proyectos', { es: 'planta-columbus', en: 'columbus-plant' }, 'en')).toBe('/en/projects/columbus-plant/');
    expect(urlDe('sectores', { es: 'mineria', en: 'mining' }, 'es')).toBe('/sectores/mineria/');
  });

  test('un país desconocido detiene la compilación', () => {
    expect(() => auditar({ proyectos: [p('raro', { pais: 'XX' })] }, { modo: 'desarrollo' })).toThrow(/raro.*XX/);
  });

  for (const seccion of ['proyectos', 'servicios', 'sectores'] as const) {
    test(`(foco 4) cada página de ${seccion} existe en ES y EN y enlaza a su par`, async ({ page }) => {
      for (const slug of slugs(seccion)) {
        const es = urlDe(seccion, slug, 'es');
        const en = urlDe(seccion, slug, 'en');
        for (const [aqui, otra] of [[es, en], [en, es]]) {
          const resp = await page.goto(aqui);
          expect(resp?.status(), aqui).toBe(200);
          const otroLang = otra.startsWith('/en/') ? 'en' : 'es';
          await expect(page.locator(`link[rel=alternate][hreflang=${otroLang}]`)).toHaveAttribute('href', SITIO + otra);
          await expect(page.locator('a.idioma')).toHaveAttribute('href', otra);
        }
      }
    });
  }
});
