// Datos del inicio (guía §12.1). Funciones puras: el inicio las alimenta con el contenido de cargar().
import { edad } from './contenido';
import { t } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';

export type CifraInicio = { clave: 'trayectoria' | 'presencia' | 'sedes' | 'calidad'; valor: number; etiqueta: string };

/** "HL en cifras": años (calculados), países con obra, sedes y normas ISO, en ese orden. */
export function cifrasInicio(
  d: { fundacion: number; paises: string[]; sedes: number; certificaciones: number },
  lang: Lang,
  hoy = new Date(),
): CifraInicio[] {
  return [
    { clave: 'trayectoria', valor: edad(d.fundacion, hoy), etiqueta: t(lang, 'cifraTrayectoria') },
    { clave: 'presencia', valor: d.paises.length, etiqueta: t(lang, 'cifraPresencia') },
    { clave: 'sedes', valor: d.sedes, etiqueta: t(lang, 'cifraSedes') },
    { clave: 'calidad', valor: d.certificaciones, etiqueta: t(lang, 'cifraCalidad') },
  ];
}
