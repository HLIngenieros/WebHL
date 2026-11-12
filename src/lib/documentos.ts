// Catálogo de documentos públicos (plan AG.11) desde la colección `documentos`: lo usan la página Documentos (HTML
// estático) y /api/documentos.json (para agente.php). Un PDF que falte en public/documentos/ detiene la compilación.
import { getCollection } from 'astro:content';
import { statSync } from 'node:fs';
import { ruta, type Lang } from '../i18n/rutas';
import type { Documento } from '../components/Documentos';

export async function documentos(lang: Lang): Promise<(Documento & { datosClave: string })[]> {
  const xs = (await getCollection('documentos')).sort((a, b) => a.data.orden - b.data.orden);
  return xs.map(({ id, data: d }) => {
    const pdf = (lang === 'en' && d.pdf.en) || d.pdf.es;
    let bytes: number;
    try { bytes = statSync(`public/documentos/${pdf}`).size; }
    catch { throw new Error(`[documentos] ${id}: falta public/documentos/${pdf}`); }
    return {
      id, carpeta: d.carpeta, titulo: d.titulo[lang] ?? d.titulo.es, url: `/documentos/${pdf}`,
      idioma: pdf === d.pdf.en ? 'EN' : 'ES', area: d.area, emisor: d.emisor, codigo: d.codigo ?? '',
      vigenteHasta: d.vigenteHasta ?? '', descripcion: d.descripcion[lang] ?? d.descripcion.es, bytes,
      actualizado: d.actualizado, datosClave: d.datosClave ?? '',
    };
  });
}

/** Pestañas de Acreedores · Documentos públicos (R-9): una sola plantilla de pestañas-enlace, como Contacto. */
export function pestanasPublicas(lang: Lang, actual: 'acreedores' | 'documentos') {
  const T = {
    acreedores: { es: ['Acreedores', 'Avisos y convocatorias (Ley 1116)'], en: ['Creditors', 'Notices and calls (Law 1116)'], icono: 'M10 4h14l6 6v26H10zM24 4v6h6M15 18h10M15 24h10M15 30h6' },
    documentos: { es: ['Documentos públicos', 'Certificados, políticas y material'], en: ['Public documents', 'Certificates, policies and materials'], icono: 'M4 10h12l3 4h17v20H4zM4 18h32' },
  } as const;
  return (['acreedores', 'documentos'] as const).map((k) => ({
    href: ruta(k, lang), nombre: T[k][lang][0], desc: T[k][lang][1], icono: T[k].icono, actual: k === actual,
  }));
}
