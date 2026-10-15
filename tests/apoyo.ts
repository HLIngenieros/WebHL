// Datos de ejemplo compartidos por las pruebas puras.
import fs from 'node:fs';
import path from 'node:path';
import type { Proyecto, Entrada } from '../src/lib/contenido';
import type { DatosTarjeta } from '../src/lib/explorador';

/** Proyecto completo de ejemplo; cada prueba cambia solo lo que necesita. */
export function p(id: string, cambios: Partial<Proyecto> = {}): Entrada<Proyecto> {
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
      cifras: [1, 2, 3].map((valor) => ({ valor, unidad: 't' as const, etiqueta: { es: 'E', en: 'E' } })),
      cantidades: [{ valor: 1, unidad: 't' as const, concepto: { es: 'C', en: 'C' } }],
      fotos: [{ archivo: {}, pie: { es: 'Pie', en: 'Caption' } }],
      visibilidad: 'normal',
      fuente: 'web',
      es: { titulo: 'T', resumen: 'R', descripcion: 'D' },
      en: { titulo: 'T', resumen: 'R', descripcion: 'D' },
      ...cambios,
    },
  };
}

export const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

/** Tarjeta de ejemplo del explorador. */
export function tj(id: string, servicio: string, sector: string, pais?: string): DatosTarjeta {
  return {
    id, codigo: 'P-01', url: `/proyectos/${id}/`, titulo: id,
    sector: { id: sector, slug: sector, nombre: sector },
    servicios: [{ id: servicio, slug: servicio, nombre: servicio }],
    pais, discreta: false,
  };
}

/** Slugs ES/EN de cada entrada de una carpeta de contenido, leídos de los YAML. */
export function slugs(carpeta: 'proyectos' | 'servicios' | 'sectores'): { es: string; en: string }[] {
  const dir = path.join(process.cwd(), 'src', 'content', carpeta);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => {
    const m = fs.readFileSync(path.join(dir, f), 'utf8').match(/^slug:\s*\{\s*es:\s*([\w-]+),\s*en:\s*([\w-]+)\s*\}/m);
    if (!m) throw new Error(`sin slug en ${carpeta}/${f}`);
    return { es: m[1], en: m[2] };
  });
}
