// Datos del Home (especificación v2.0 §5, maqueta R0). Funciones puras: el Home las alimenta con cargar().
import { edad, numero } from './contenido';
import { t } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';

export type CifraInicio = {
  clave: 'trayectoria' | 'presencia' | 'horas' | 'seguridad';
  valor: number;
  /** Valor final como se escribe en el HTML (el contador termina en él). */
  texto: string;
  signo?: string;
  unidad: string;
  descripcion: string;
};

/**
 * "HL en cifras": años (calculados), países con obra, horas hombre del proyecto visible con más horas y la
 * reducción de accidentes del programa de seguridad (primer indicador con signo de HSE), en ese orden.
 */
export function cifrasInicio(
  d: {
    fundacion: number;
    paises: string[];
    proyecto: { nombre: string; hh: number };
    seguridad: { valor: number; signo?: string };
  },
  lang: Lang,
  hoy = new Date(),
): CifraInicio[] {
  const c = (clave: CifraInicio['clave'], valor: number, unidad: string, descripcion: string, signo?: string): CifraInicio =>
    ({ clave, valor, texto: numero(valor, lang), unidad, descripcion, ...(signo ? { signo } : {}) });
  return [
    c('trayectoria', edad(d.fundacion, hoy), t(lang, 'cifraTrayectoria'), t(lang, 'cifraTrayectoriaTxt').replace('{a}', String(d.fundacion))),
    c('presencia', d.paises.length, t(lang, 'cifraPresencia'), t(lang, 'cifraPresenciaTxt')),
    c('horas', d.proyecto.hh, t(lang, 'cifraHoras'), t(lang, 'cifraHorasTxt').replace('{p}', d.proyecto.nombre)),
    c('seguridad', d.seguridad.valor, t(lang, 'cifraSeguridad'), t(lang, 'cifraSeguridadTxt'), d.seguridad.signo),
  ];
}

/**
 * El lema en el H1 (guía §2.3): dos líneas grandes (primera palabra · hasta "industria") y una línea menor con
 * el resto, cuyo cierre (desde la última coma: "desde 1968.") va subrayado.
 */
export function partirLema(lema: string): { l1: string; l2: string; l3: string; cierre: string } {
  const m = lema.match(/^(\S+)\s+(.*?\bindustr\w*)\s+(.*)$/i);
  if (!m) return { l1: lema, l2: '', l3: '', cierre: '' };
  const coma = m[3].lastIndexOf(', ');
  return coma < 0
    ? { l1: m[1], l2: m[2], l3: m[3], cierre: '' }
    : { l1: m[1], l2: m[2], l3: m[3].slice(0, coma + 1), cierre: m[3].slice(coma + 2) };
}
