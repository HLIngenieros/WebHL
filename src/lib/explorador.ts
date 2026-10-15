// Datos y filtros del explorador de proyectos. Lo importa la isla de React: nada de Astro aquí.

/** Imagen ya resuelta al compilar (srcset por formato). */
export type Imagen = { avif: string; webp: string; src: string; width: number; height: number; alt: string };

type Etiqueta = { id: string; slug: string; nombre: string };

/** Lo que necesita una tarjeta de proyecto; `slug` es el del idioma de la página. */
export type DatosTarjeta = {
  id: string;
  codigo: string;
  url: string;
  titulo: string;
  cliente?: string;
  lugar?: string;
  periodo?: string;
  sector: Etiqueta;
  servicios: Etiqueta[];
  pais?: string;
  coordenadas?: [number, number];
  cifra?: { valor: string; etiqueta: string };
  imagen?: Imagen;
  discreta: boolean;
};

/** Valores = slug del idioma; país = ISO-2 en minúscula. */
export type Filtros = { servicio?: string; sector?: string; pais?: string };
const DIMENSIONES = ['servicio', 'sector', 'pais'] as const;
type Dimension = (typeof DIMENSIONES)[number];

const valores = (t: DatosTarjeta, dim: Dimension): string[] =>
  dim === 'servicio' ? t.servicios.map((s) => s.slug) : dim === 'sector' ? [t.sector.slug] : t.pais ? [t.pais] : [];

/** Y entre dimensiones; una dimensión sin valor no filtra. */
export const cumple = (t: DatosTarjeta, f: Filtros): boolean =>
  DIMENSIONES.every((d) => !f[d] || valores(t, d).includes(f[d]!));

/** Para cada valor de `dim`, cuántas tarjetas cumplen los otros filtros. */
export function conteos(ts: DatosTarjeta[], f: Filtros, dim: Dimension): Map<string, number> {
  const resto = { ...f, [dim]: undefined };
  const c = new Map<string, number>();
  for (const t of ts) if (cumple(t, resto)) for (const v of valores(t, dim)) c.set(v, (c.get(v) ?? 0) + 1);
  return c;
}

export function leerFiltros(search: string, validos: Record<Dimension, Set<string>>): Filtros {
  const q = new URLSearchParams(search);
  const f: Filtros = {};
  for (const d of DIMENSIONES) {
    const v = q.get(d);
    if (v && validos[d].has(v)) f[d] = v;
  }
  return f;
}

export function escribirFiltros(f: Filtros): string {
  const q = new URLSearchParams();
  for (const d of DIMENSIONES) if (f[d]) q.set(d, f[d]!);
  const s = q.toString();
  return s ? `?${s}` : '';
}
