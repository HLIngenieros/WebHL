import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import {
  txt, numero, edad, periodo, deServicio, deSector, destacados, paraExplorador, auditar,
  type Proyecto, type Entrada, type Pendiente,
} from '../src/lib/contenido';

// Proyecto completo de ejemplo; cada prueba cambia solo lo que necesita.
function p(id: string, cambios: Partial<Proyecto> = {}): Entrada<Proyecto> {
  return {
    id,
    data: {
      slug: { es: id, en: `${id}-en` },
      cliente: 'Cliente',
      rol: { tipo: 'contratista' },
      pais: 'CO',
      ciudad: 'Bogotá',
      inicio: 2015,
      fin: 2017,
      sector: { id: 'cemento' },
      servicios: [{ id: 'montaje-mecanico' }],
      cifras: [1, 2, 3].map((valor) => ({ valor, unidad: 't', etiqueta: { es: 'E', en: 'E' } })),
      cantidades: [{ valor: 1, unidad: 't', concepto: { es: 'C', en: 'C' } }],
      fotos: [{ archivo: {}, pie: { es: 'Pie', en: 'Caption' } }],
      visibilidad: 'normal',
      fuente: 'web',
      es: { titulo: 'T', resumen: 'R', descripcion: 'D' },
      en: { titulo: 'T', resumen: 'R', descripcion: 'D' },
      ...cambios,
    },
  };
}

const ids = (xs: Entrada<Proyecto>[]) => xs.map((x) => x.id);
const de = (ps: Pendiente[], id: string) => ps.filter((x) => x.id === id);

test.describe('relaciones derivadas', () => {
  const lista = [
    p('normal'),
    p('discreta', { visibilidad: 'discreta', fin: 2020 }),
    p('destacado', { visibilidad: 'destacado', fin: 2010 }),
    p('otro-sector', { sector: { id: 'mineria' }, servicios: [{ id: 'obras-civiles' }] }),
  ];

  test('una discreta nunca entra en servicio, sector ni destacados', () => {
    expect(ids(deServicio(lista, 'montaje-mecanico'))).toEqual(['destacado', 'normal']);
    expect(ids(deSector(lista, 'cemento'))).toEqual(['destacado', 'normal']);
    expect(ids(destacados(lista))).toEqual(['destacado']);
  });

  test('el explorador muestra todas, con las discretas al final', () => {
    expect(ids(paraExplorador(lista))).toEqual(['destacado', 'normal', 'otro-sector', 'discreta']);
  });

  test('orden: destacados, luego el más reciente, y sin año al final', () => {
    const xs = [p('sin-anio', { fin: undefined }), p('viejo', { fin: 2001 }), p('nuevo', { fin: 2019 }),
      p('estrella', { visibilidad: 'destacado', fin: 1999 })];
    expect(ids(paraExplorador(xs))).toEqual(['estrella', 'nuevo', 'viejo', 'sin-anio']);
  });
});

test.describe('textos y números', () => {
  test('txt usa el idioma pedido y, si falta, el español', () => {
    expect(txt({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello');
    expect(txt({ es: 'Hola' }, 'en')).toBe('Hola');
    expect(txt(undefined, 'es')).toBeUndefined();
  });

  test('el mismo número se escribe según el idioma', () => {
    expect(numero(5250, 'es')).toBe('5.250');
    expect(numero(5250, 'en')).toBe('5,250');
    expect(numero(9470000, 'es')).toBe('9.470.000');
    expect(numero(9470000, 'en')).toBe('9,470,000');
    expect(numero(2.5, 'es')).toBe('2,5');
    expect(numero(2.5, 'en')).toBe('2.5');
  });

  test('la edad se calcula con el año en curso', () => {
    expect(edad(1968, new Date(2026, 9, 15))).toBe(58);
    expect(edad(1968, new Date(2027, 0, 1))).toBe(59);
  });

  test('periodo con uno, dos o ningún año', () => {
    expect(periodo({ inicio: 2015, fin: 2018 })).toBe('2015–2018');
    expect(periodo({ inicio: 2015, fin: 2015 })).toBe('2015');
    expect(periodo({ fin: 2018 })).toBe('2018');
    expect(periodo({})).toBeUndefined();
  });
});

test.describe('auditar()', () => {
  const hoy = new Date(2026, 9, 15);

  test('un proyecto completo no deja pendientes', () => {
    expect(auditar({ proyectos: [p('completo')] }, { modo: 'desarrollo', hoy })).toEqual([]);
  });

  test('lo faltante se reporta sin romper: años y traducción bloquean, fotos es aviso', () => {
    const incompleto = p('incompleto', { inicio: undefined, fin: undefined, fotos: [], en: undefined });
    const ps = de(auditar({ proyectos: [incompleto] }, { modo: 'desarrollo', hoy }), 'incompleto');
    expect(ps.find((x) => x.campo === 'años')).toMatchObject({ tipo: 'insumo', bloquea: true });
    expect(ps.find((x) => x.campo === 'en')).toMatchObject({ tipo: 'traduccion', bloquea: true });
    expect(ps.find((x) => x.campo === 'fotos')).toMatchObject({ tipo: 'aviso', bloquea: false });
    expect(periodo(incompleto.data)).toBeUndefined();
  });

  test('cliente, rol, lugar, cifras, pies y dudas por confirmar', () => {
    const x = p('x', {
      cliente: undefined, rol: undefined, pais: undefined, ciudad: undefined, cifras: [],
      fotos: [{ archivo: {} }], confirmar: ['¿Silo de crudo o de cemento?'],
    });
    const ps = de(auditar({ proyectos: [x] }, { modo: 'desarrollo', hoy }), 'x');
    for (const campo of ['cliente', 'rol', 'pais', 'ciudad', 'cifras', 'pies de foto']) {
      expect(ps.find((y) => y.campo === campo), campo).toMatchObject({ bloquea: true });
    }
    expect(ps.find((y) => y.tipo === 'confirmar')).toMatchObject({ detalle: '¿Silo de crudo o de cemento?' });
  });

  test('una ficha sin cantidades de obra da un aviso que no bloquea', () => {
    const ps = de(auditar({ proyectos: [p('sin-cantidades', { cantidades: [] })] }, { modo: 'desarrollo', hoy }), 'sin-cantidades');
    expect(ps).toMatchObject([{ campo: 'cantidades', tipo: 'aviso', bloquea: false }]);
  });

  test('una etiqueta sin inglés cuenta como traducción pendiente', () => {
    const x = p('x', { cantidades: [{ valor: 3, unidad: 't', concepto: { es: 'Equipos' } }] });
    expect(de(auditar({ proyectos: [x] }, { modo: 'desarrollo', hoy }), 'x')).toMatchObject([{ campo: 'en' }]);
  });

  test('dos proyectos con el mismo slug en inglés bloquean', () => {
    const a = p('a', { slug: { es: 'a', en: 'igual' } });
    const b = p('b', { slug: { es: 'b', en: 'igual' } });
    const ps = auditar({ proyectos: [a, b] }, { modo: 'desarrollo', hoy });
    expect(ps.filter((x) => x.campo === 'slug.en' && x.bloquea)).toHaveLength(1);
  });

  test('una referencia a un servicio o sector inexistente falla en cualquier modo', () => {
    const servicios = [{ id: 'montaje-mecanico', data: { en: {} } }];
    const sectores = [{ id: 'cemento', data: { en: {} } }];
    const malo = p('malo', { servicios: [{ id: 'montaje-mecanicos' }], sector: { id: 'cementos' } });
    expect(() => auditar({ proyectos: [malo], servicios, sectores }, { modo: 'desarrollo', hoy }))
      .toThrow(/malo[\s\S]*montaje-mecanicos[\s\S]*malo[\s\S]*cementos/);
    expect(() => auditar({ proyectos: [p('bueno')], servicios, sectores }, { modo: 'desarrollo', hoy })).not.toThrow();
  });

  test('en lanzamiento falla con todos los bloqueantes en el mensaje', () => {
    const datos = { proyectos: [p('uno', { rol: undefined }), p('dos', { ciudad: undefined, fotos: [] })] };
    expect(() => auditar(datos, { modo: 'lanzamiento', hoy })).toThrow(/2 pendientes[\s\S]*uno[\s\S]*rol[\s\S]*dos[\s\S]*ciudad/);
    expect(() => auditar({ proyectos: [p('ok', { fotos: [] })] }, { modo: 'lanzamiento', hoy })).not.toThrow();
  });

  test('certificación vencida: aviso que bloquea el lanzamiento', () => {
    const c = { id: 'iso-9001', data: { norma: 'ISO 9001', ente: 'SGS', vence: new Date(2026, 0, 1), pdf: 'x.pdf' } };
    const ps = auditar({ certificaciones: [c] }, { modo: 'desarrollo', hoy });
    expect(ps).toMatchObject([{ id: 'iso-9001', tipo: 'aviso', bloquea: true }]);
  });

  test('sede sin buzón ni nombre en inglés: insumo y traducción', () => {
    const s = { id: 'bogota', data: { nombre: { es: 'Sede principal' } } };
    const ps = auditar({ sedes: [s] }, { modo: 'desarrollo', hoy });
    expect(ps.map((x) => x.campo).sort()).toEqual(['buzon', 'en']);
  });

  test('testimonio sin autorizar: aviso que no bloquea', () => {
    const t = { id: 'ana', data: { nombre: 'Ana', cargo: { es: 'Ingeniera' }, autorizado: false, cita: { es: 'Cita' } } };
    expect(auditar({ testimonios: [t] }, { modo: 'desarrollo', hoy })).toMatchObject([{ tipo: 'aviso', bloquea: false }]);
  });
});

test.describe('página de pendientes', () => {
  test('responde, no se indexa y es accesible', async ({ page }) => {
    const resp = await page.goto('/pendientes/');
    expect(resp?.status()).toBe(200);
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('[data-conteo="proyectos"]')).toHaveCount(1);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(violations).toEqual([]);
  });
});

test.describe('fotos', () => {
  test('salen en AVIF y WebP con dimensiones fijas', async ({ page }) => {
    await page.goto('/muestra/');
    const foto = page.locator('picture').first();
    await expect(foto.locator('source[type="image/avif"]')).toHaveCount(1);
    await expect(foto.locator('source[type="image/webp"]')).toHaveCount(1);
    const img = foto.locator('img');
    await expect(img).toHaveAttribute('width', /^\d+$/);
    await expect(img).toHaveAttribute('height', /^\d+$/);
    await expect(img).toHaveAttribute('alt', /.+/);
  });

  test('ninguna variante optimizada pasa de 200 KB', () => {
    const dir = path.join(process.cwd(), 'dist', '_astro');
    const pesadas = fs.readdirSync(dir).filter((f) => /\.(avif|webp)$/.test(f))
      .map((f) => [f, fs.statSync(path.join(dir, f)).size] as const).filter(([, kb]) => kb > 200 * 1024);
    expect(pesadas).toEqual([]);
  });
});

const conteo = (page: import('@playwright/test').Page, coleccion: string) => page.locator(`[data-conteo="${coleccion}"] dd`);

test.describe('contenido migrado', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/pendientes/'); });

  test('7 servicios y 6 sectores; los servicios esperan su buzón (D7)', async ({ page }) => {
    await expect(conteo(page, 'servicios')).toHaveText('7');
    await expect(conteo(page, 'sectores')).toHaveText('6');
    await expect(page.locator('tr[data-coleccion="servicios"] li[data-campo="buzon"]')).toHaveCount(7);
  });

  test('22 proyectos: 2 discretos (D6) y 4 destacados', async ({ page }) => {
    await expect(conteo(page, 'proyectos')).toHaveText('22');
    const discretos = page.locator('tr[data-visibilidad="discreta"]');
    await expect(discretos).toHaveCount(2);
    await expect(page.locator('tr[data-proyecto="patio-de-carbon-estrella"]')).toHaveAttribute('data-visibilidad', 'discreta');
    await expect(page.locator('tr[data-proyecto="tanques-cobre-panama"]')).toHaveAttribute('data-visibilidad', 'discreta');
    await expect(page.locator('tr[data-visibilidad="destacado"]')).toHaveCount(4);
    await expect(page.locator('tr[data-proyecto][data-fuente="ecohl"]')).toHaveCount(6);
  });

  test('institucional: sedes, certificaciones, historia, testimonios, sitio y páginas', async ({ page }) => {
    await expect(conteo(page, 'sedes')).toHaveText('4');
    expect(Number(await conteo(page, 'certificaciones').textContent())).toBeGreaterThanOrEqual(3);
    await expect(conteo(page, 'historia')).toHaveText('5');
    await expect(conteo(page, 'testimonios')).toHaveText('4');
    await expect(conteo(page, 'sitio')).toHaveText('1');
    await expect(conteo(page, 'paginas')).toHaveText('5');
    await expect(page.locator('tr[data-coleccion="testimonios"] li[data-campo="autorizado"]')).toHaveCount(4);
    await expect(page.locator('tr[data-coleccion="paginas"] li[data-campo="revisión jurídica"]')).toHaveCount(3);
  });

  test('el contenido no publica correos personales, solo buzones por función', () => {
    const permitidos = ['buzonetico@hlingenieros.com', 'hlisa@hlingenieros.com', 'administracionpanama@hlingenieros.com'];
    const raiz = path.join(process.cwd(), 'src', 'content');
    const archivos = fs.readdirSync(raiz, { recursive: true }).map(String).filter((f) => /\.(ya?ml|md)$/.test(f));
    const correos = archivos.flatMap((f) => fs.readFileSync(path.join(raiz, f), 'utf8').match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []);
    expect(correos.filter((c) => !permitidos.includes(c.toLowerCase()))).toEqual([]);
  });

  test('cada ficha actual del inventario apunta a una URL nueva de proyecto', () => {
    const filas = fs.readFileSync(path.join(process.cwd(), 'contenido', 'inventario.csv'), 'utf8').split(/\r?\n/).filter((l) => l.includes(',proyecto,'));
    expect(filas).toHaveLength(32);
    for (const f of filas) {
      const [, idioma, , , , , , destino] = f.split(',');
      expect(destino, f).toMatch(idioma === 'es' ? /^\/proyectos\/[a-z0-9-]+\/$/ : /^\/en\/projects\/[a-z0-9-]+\/$/);
    }
  });
});
