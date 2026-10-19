// Regla de publicación de Noticias (especificación §3): con menos de 3 entradas en español, la sección no
// existe (ni página, ni menú, ni pie, ni bloque del inicio). Funciones puras.
import type { Lang } from '../i18n/rutas';

export const MINIMO_NOTICIAS = 3;
type Noticia = { id: string; data: { lang: Lang; fecha: Date } };

export const hayNoticias = (xs: readonly Noticia[]): boolean => xs.filter((x) => x.data.lang === 'es').length >= MINIMO_NOTICIAS;

/** Noticias del idioma, la más reciente primero; si falta la traducción, la versión en español. */
export function noticiasDe<T extends Noticia & { data: { slug: string } }>(xs: readonly T[], lang: Lang): T[] {
  const es = xs.filter((x) => x.data.lang === 'es');
  const propias = lang === 'es' ? es : es.map((x) => xs.find((y) => y.data.lang === lang && y.id.replace(/\.\w+$/, '') === x.id.replace(/\.\w+$/, '')) ?? x);
  return [...propias].sort((a, b) => b.data.fecha.getTime() - a.data.fecha.getTime());
}
