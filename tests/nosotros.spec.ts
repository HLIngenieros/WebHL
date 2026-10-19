import { test, expect } from '@playwright/test';
import { hitos, tratamiento, avance, publicables } from '../src/lib/nosotros';
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
