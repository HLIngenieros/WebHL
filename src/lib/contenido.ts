// Funciones puras sobre las colecciones (especificación §4). No importa astro:content para poder
// probarse fuera de Astro; las páginas le pasan lo que devuelve getCollection().
import type { Lang } from '../i18n/rutas';
import { UNIDADES, SINGULAR, PAISES, type Unidad } from '../i18n/ui';

export type Texto = { es: string; en?: string };
export type Entrada<T> = { id: string; data: T };
type Ref = { id: string };

export interface Proyecto {
  slug: { es: string; en: string };
  cliente?: string;
  duenoFinal?: string;
  rol?: { tipo: 'contratista' | 'subcontratista' | 'consorcio'; nombre?: string };
  pais?: string;
  ciudad?: string;
  coordenadas?: [number, number];
  inicio?: number;
  fin?: number;
  meses?: number;
  hh?: number;
  sector: Ref;
  servicios: Ref[];
  cifras: { valor: number; unidad?: Unidad; etiqueta: Texto }[];
  cantidades: { valor?: number; unidad?: Unidad; concepto: Texto }[];
  fotos: { archivo: unknown; pie?: Texto }[];
  visibilidad: 'destacado' | 'normal' | 'discreta';
  fuente: 'web' | 'ecohl';
  confirmar?: string[];
  es: { titulo: string; resumen: string; descripcion: string; reto?: string };
  en?: { titulo: string; resumen: string; descripcion: string; reto?: string };
}

interface ConIdiomas { es?: object; en?: object; confirmar?: string[] }
interface Servicio extends ConIdiomas { buzon?: string }
interface Sede { nombre: Texto; buzon?: string; confirmar?: string[] }
interface Certificacion { norma: Texto; vence?: Date; pdf?: string; confirmar?: string[] }
interface Hito extends ConIdiomas { anio?: number }
interface Testimonio { autorizado: boolean; cargo: Texto; cita: Texto }
interface Sitio { asociadas?: unknown[]; clientes?: { nombre?: string }[]; cifras?: { etiqueta: Texto }[]; confirmar?: string[] }
interface Pagina { pagina: string; lang: Lang; revisionJuridica?: boolean; confirmar?: string[] }

export interface Datos {
  proyectos?: Entrada<Proyecto>[];
  servicios?: Entrada<Servicio>[];
  sectores?: Entrada<ConIdiomas>[];
  sedes?: Entrada<Sede>[];
  certificaciones?: Entrada<Certificacion>[];
  historia?: Entrada<Hito>[];
  testimonios?: Entrada<Testimonio>[];
  sitio?: Entrada<Sitio>[];
  paginas?: Entrada<Pagina>[];
}

export type Pendiente = {
  coleccion: string;
  id: string;
  campo: string;
  tipo: 'insumo' | 'traduccion' | 'confirmar' | 'aviso';
  bloquea: boolean;
  detalle?: string;
};

// ── Textos y números ──

export const txt = (t: Texto | undefined, lang: Lang): string | undefined => (t ? t[lang] ?? t.es : undefined);

/** Bloque de textos del idioma pedido (`es:` / `en:`), con respaldo en español. */
export const bloque = <T>(d: { es: T; en?: T }, lang: Lang): T => d[lang] ?? d.es;

const formatos = {
  es: new Intl.NumberFormat('es-CO', { useGrouping: 'always' }),
  en: new Intl.NumberFormat('en-US', { useGrouping: 'always' }),
};
export const numero = (valor: number, lang: Lang): string => formatos[lang].format(valor);

/** Cifra con su unidad: `5.250 t/día` / `5,250 t/day`; el porcentaje lleva espacio fino solo en español. */
export function medida(valor: number, unidad: Unidad | undefined, lang: Lang): string {
  const n = numero(valor, lang);
  if (!unidad) return n;
  if (unidad === 'pct') return lang === 'es' ? `${n} %` : `${n}%`;
  return `${n} ${(valor === 1 && SINGULAR[unidad]?.[lang]) || UNIDADES[unidad][lang]}`;
}

export const edad = (fundacion: number, hoy = new Date()): number => hoy.getFullYear() - fundacion;

export function periodo(p: { inicio?: number; fin?: number }): string | undefined {
  const { inicio, fin } = p;
  if (inicio && fin && inicio !== fin) return `${inicio}–${fin}`;
  return String(inicio ?? fin ?? '') || undefined;
}

// ── Relaciones derivadas: las discretas nunca entran en listas, destacados ni portada ──

type P = Entrada<Proyecto>;
const peso = (x: P) => (x.data.visibilidad === 'destacado' ? 0 : 1);
const ordenar = (xs: P[]) =>
  [...xs].sort((a, b) => peso(a) - peso(b) || (b.data.fin ?? 0) - (a.data.fin ?? 0) || a.id.localeCompare(b.id));
const visibles = (xs: P[]) => xs.filter((x) => x.data.visibilidad !== 'discreta');

export const deServicio = (xs: P[], id: string) => ordenar(visibles(xs).filter((x) => x.data.servicios.some((s) => s.id === id)));
export const deSector = (xs: P[], id: string) => ordenar(visibles(xs).filter((x) => x.data.sector.id === id));
export const destacados = (xs: P[]) => ordenar(xs.filter((x) => x.data.visibilidad === 'destacado'));
export const paraExplorador = (xs: P[]) => [...ordenar(visibles(xs)), ...ordenar(xs.filter((x) => x.data.visibilidad === 'discreta'))];

/** Proyectos parecidos: 2 puntos por mismo sector y 1 por servicio compartido; sin la actual ni discretas. */
export function relacionados(xs: P[], actual: P, n = 3): P[] {
  const mios = new Set(actual.data.servicios.map((s) => s.id));
  const puntaje = (x: P) => (x.data.sector.id === actual.data.sector.id ? 2 : 0) + x.data.servicios.filter((s) => mios.has(s.id)).length;
  const orden = new Map(ordenar(xs).map((x, i) => [x.id, i]));
  return visibles(xs)
    .filter((x) => x.id !== actual.id && puntaje(x) > 0)
    .sort((a, b) => puntaje(b) - puntaje(a) || orden.get(a.id)! - orden.get(b.id)!)
    .slice(0, n);
}

/** Ids más frecuentes primero (empate por id). */
function porFrecuencia(ids: string[]): string[] {
  const c = new Map<string, number>();
  for (const id of ids) c.set(id, (c.get(id) ?? 0) + 1);
  return [...c.keys()].sort((a, b) => c.get(b)! - c.get(a)! || a.localeCompare(b));
}
export const sectoresDe = (xs: P[], servicioId: string) => porFrecuencia(deServicio(xs, servicioId).map((x) => x.data.sector.id));
export const serviciosDe = (xs: P[], sectorId: string) => porFrecuencia(deSector(xs, sectorId).flatMap((x) => x.data.servicios.map((s) => s.id)));
export const clientesDe = (xs: P[], sectorId: string) =>
  [...new Set(deSector(xs, sectorId).flatMap((x) => (x.data.cliente ? [x.data.cliente] : [])))].sort((a, b) => a.localeCompare(b, 'es'));

// ── Auditoría: lo que falta para lanzar (especificación §4, validación en dos modos) ──

/** Falta el bloque `en` o alguno de los campos que sí tiene el bloque `es` (p. ej. `reto`, `faq`). */
const bloqueIncompleto = (d: { es?: object; en?: object }) =>
  !d.en || Object.entries(d.es ?? {}).some(([k, v]) => v !== undefined && (d.en as Record<string, unknown>)[k] === undefined);

function faltaIngles(p: Proyecto): boolean {
  const etiquetas = [...p.cifras.map((c) => c.etiqueta), ...p.cantidades.map((c) => c.concepto), ...p.fotos.flatMap((f) => (f.pie ? [f.pie] : []))];
  return bloqueIncompleto(p) || etiquetas.some((t) => !t.en);
}

export function auditar(datos: Datos, opciones: { modo: 'desarrollo' | 'lanzamiento'; hoy?: Date }): Pendiente[] {
  const hoy = opciones.hoy ?? new Date();
  const out: Pendiente[] = [];
  const add = (coleccion: string, id: string, campo: string, tipo: Pendiente['tipo'], bloquea = true, detalle?: string) =>
    out.push({ coleccion, id, campo, tipo, bloquea, ...(detalle ? { detalle } : {}) });
  const dudas = (coleccion: string, id: string, xs?: string[]) => xs?.forEach((d) => add(coleccion, id, 'confirmar', 'confirmar', true, d));
  const ingles = (coleccion: string, xs: Entrada<ConIdiomas>[] = []) =>
    xs.forEach(({ id, data }) => { if (bloqueIncompleto(data)) add(coleccion, id, 'en', 'traduccion'); dudas(coleccion, id, data.confirmar); });

  const proyectos = datos.proyectos ?? [];
  // Errores que rompen rutas o relaciones: detienen la compilación en cualquier modo. Astro solo registra
  // las referencias rotas, y un slug repetido haría que una ficha tapara a otra sin aviso.
  const errores: string[] = [];
  const existe = (xs: Entrada<unknown>[] | undefined, ref: Ref) => !xs || xs.some((x) => x.id === ref.id);
  for (const { id, data: p } of proyectos) {
    for (const s of p.servicios) if (!existe(datos.servicios, s)) errores.push(`- proyectos/${id}: servicio "${s.id}" no existe`);
    if (!existe(datos.sectores, p.sector)) errores.push(`- proyectos/${id}: sector "${p.sector.id}" no existe`);
    if (p.pais && !PAISES[p.pais]) errores.push(`- proyectos/${id}: país "${p.pais}" sin nombre en src/i18n/ui.ts (PAISES)`);
    if (p.slug.es !== id) errores.push(`- proyectos/${id}: slug.es "${p.slug.es}" debe ser igual al nombre del archivo`);
  }
  for (const lang of ['es', 'en'] as const) {
    const vistos = new Map<string, string>();
    for (const { id, data } of proyectos) {
      const previo = vistos.get(data.slug[lang]);
      if (previo) errores.push(`- proyectos/${id}: slug.${lang} "${data.slug[lang]}" repite el de ${previo}`);
      else vistos.set(data.slug[lang], id);
    }
  }
  if (errores.length) throw new Error(`Errores en el contenido:\n${errores.join('\n')}`);

  for (const { id, data: p } of proyectos) {
    if (!p.cliente) add('proyectos', id, 'cliente', 'insumo');
    if (!p.rol) add('proyectos', id, 'rol', 'insumo');
    if (!p.pais) add('proyectos', id, 'pais', 'insumo');
    if (!p.ciudad) add('proyectos', id, 'ciudad', 'insumo');
    if (!p.inicio || !p.fin) add('proyectos', id, 'años', 'insumo');
    if (p.cifras.length < 3 || p.cifras.length > 4) add('proyectos', id, 'cifras', 'insumo', true, `tiene ${p.cifras.length}; se necesitan 3-4`);
    if (!p.fotos.length) add('proyectos', id, 'fotos', 'aviso', false, 'se muestra una ilustración de línea');
    if (!p.cantidades.length) add('proyectos', id, 'cantidades', 'aviso', false, 'sin cantidades de obra');
    const sinPie = p.fotos.filter((f) => !f.pie).length;
    if (sinPie) add('proyectos', id, 'pies de foto', 'insumo', true, `${sinPie} de ${p.fotos.length}`);
    if (faltaIngles(p)) add('proyectos', id, 'en', 'traduccion');
    dudas('proyectos', id, p.confirmar);
  }
  for (const { id, data } of datos.servicios ?? []) if (!data.buzon) add('servicios', id, 'buzon', 'insumo', true, 'D7');
  ingles('servicios', datos.servicios);
  ingles('sectores', datos.sectores);
  for (const { id, data } of datos.sedes ?? []) {
    if (!data.buzon) add('sedes', id, 'buzon', 'insumo', true, 'D7');
    if (!data.nombre.en) add('sedes', id, 'en', 'traduccion');
    dudas('sedes', id, data.confirmar);
  }
  for (const { id, data } of datos.certificaciones ?? []) {
    if (!data.vence) add('certificaciones', id, 'vence', 'insumo');
    else if (data.vence < hoy) add('certificaciones', id, 'vence', 'aviso', true, `vencida desde ${data.vence.toISOString().slice(0, 10)}`);
    if (!data.pdf) add('certificaciones', id, 'pdf', 'insumo');
    if (!data.norma.en) add('certificaciones', id, 'en', 'traduccion');
    dudas('certificaciones', id, data.confirmar);
  }
  for (const { id, data } of datos.historia ?? []) if (!data.anio) add('historia', id, 'anio', 'insumo');
  ingles('historia', datos.historia);
  for (const { id, data } of datos.testimonios ?? []) {
    if (!data.autorizado) add('testimonios', id, 'autorizado', 'aviso', false, 'no se publica hasta tener la autorización');
    else if (!data.cita.en || !data.cargo.en) add('testimonios', id, 'en', 'traduccion');
  }
  for (const { id, data } of datos.sitio ?? []) {
    if (!data.asociadas?.length) add('sitio', id, 'asociadas', 'insumo', true, 'D1');
    const sinNombre = data.clientes?.filter((c) => !c.nombre).length;
    if (sinNombre) add('sitio', id, 'clientes', 'insumo', true, `${sinNombre} logos sin nombre`);
    if (data.cifras?.some((c) => !c.etiqueta.en)) add('sitio', id, 'en', 'traduccion');
    dudas('sitio', id, data.confirmar);
  }
  const paginas = datos.paginas ?? [];
  for (const { id, data } of paginas) {
    if (data.lang === 'es' && !paginas.some((x) => x.data.pagina === data.pagina && x.data.lang === 'en')) add('paginas', id, 'en', 'traduccion');
    if (['datos', 'terminos', 'acreedores'].includes(data.pagina) && !data.revisionJuridica) add('paginas', id, 'revisión jurídica', 'confirmar');
    dudas('paginas', id, data.confirmar);
  }

  const bloqueantes = out.filter((x) => x.bloquea);
  if (opciones.modo === 'lanzamiento' && bloqueantes.length) {
    const lista = bloqueantes.map((x) => `- ${x.coleccion}/${x.id}: ${x.campo}${x.detalle ? ` (${x.detalle})` : ''}`);
    throw new Error(`${bloqueantes.length} pendientes bloquean el lanzamiento:\n${lista.join('\n')}`);
  }
  return out;
}
