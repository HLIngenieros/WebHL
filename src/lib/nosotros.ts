// Nosotros (guía §12.2-12.3): funciones puras de la línea del tiempo y de las secciones que dependen de
// una autorización. La página y los scripts solo las conectan al DOM.
import type { ImageMetadata } from 'astro';
import { bloque, txt, type Entrada, type Texto } from './contenido';
import type { Lang } from '../i18n/rutas';
import { t } from '../i18n/ui';

export type HistoriaData = {
  orden: number; anio: number; decada: Texto; foto?: ImageMetadata; pie?: Texto;
  es: { titulo: string; texto: string }; en?: { titulo: string; texto: string };
};
export type Hito = { id: string; anio: number; decada: string; titulo: string; texto: string; foto?: ImageMetadata; pie?: string; hoy: boolean };

const FUNDACION = 1968;

/** Los hitos en orden y, al final, "Hoy" con el año en curso (no se guarda: se arma al compilar). */
export function hitos(historia: Entrada<HistoriaData>[], lang: Lang, hoy = new Date(), presente: { foto?: ImageMetadata; texto?: string } = {}): Hito[] {
  const xs = [...historia].sort((a, b) => a.data.orden - b.data.orden).map(({ id, data }) => {
    const b = bloque(data, lang);
    return { id, anio: data.anio, decada: txt(data.decada, lang)!, titulo: b.titulo, texto: b.texto, foto: data.foto, pie: txt(data.pie, lang), hoy: false };
  });
  return [...xs, {
    id: 'hoy', anio: hoy.getFullYear(), decada: t(lang, 'presente'), titulo: t(lang, 'hoy'),
    texto: presente.texto ?? t(lang, 'hoyTexto'), foto: presente.foto, hoy: true,
  }];
}

const dos = (n: number) => Math.round(n * 100) / 100;

/** Tratamiento por época (guía §8): el color crece con los años. 1968 en blanco y negro con tono de
 *  papel; el año en curso, a todo color. */
export function tratamiento(anio: number, hoy = new Date()): { gris: number; sepia: number; contraste: number } {
  const k = Math.max(0, Math.min(1, (anio - FUNDACION) / (hoy.getFullYear() - FUNDACION)));
  return { gris: dos(1 - k), sepia: dos(0.35 * (1 - k)), contraste: dos(1.12 - 0.12 * k) };
}

/** Avance de la tira con el scroll: `progreso` 0..1 recorre del primer al último año. Devuelve el año
 *  (entero), el hito en curso y cuánto se ha recorrido hacia el siguiente (0..1). */
export function avance(progreso: number, anios: number[]): { anio: number; indice: number; local: number } {
  const p = Math.max(0, Math.min(1, progreso));
  const primero = anios[0], ultimo = anios[anios.length - 1];
  const exacto = primero + p * (ultimo - primero);
  let indice = 0;
  anios.forEach((a, i) => { if (exacto >= a) indice = i; });
  const siguiente = anios[indice + 1];
  const local = siguiente === undefined ? 0 : (exacto - anios[indice]) / (siguiente - anios[indice]);
  return { anio: Math.round(exacto), indice, local };
}

/** Lo que se publica: en lanzamiento, solo lo autorizado (testimonios) o aprobado (empresas asociadas);
 *  en desarrollo se ve todo, marcado, para poder probarlo. */
export function publicables<T extends { autorizado?: boolean; aprobada?: boolean }>(xs: T[], modo: 'desarrollo' | 'lanzamiento'): T[] {
  return modo === 'lanzamiento' ? xs.filter((x) => x.autorizado === true || x.aprobada === true) : xs;
}

/** Numeración de las secciones que se muestran (01, 02…): una sección oculta no deja salto. */
export function numerar(ids: string[], visibles: Record<string, boolean>): { id: string; n: string }[] {
  return ids.filter((id) => visibles[id] !== false).map((id, i) => ({ id, n: String(i + 1).padStart(2, '0') }));
}
