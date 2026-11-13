// Catálogo de documentos públicos (plan AG.11) desde la colección `documentos`: lo usan la página Documentos (HTML
// estático) y /api/documentos.json (para agente.php). Un PDF que falte en public/documentos/ detiene la compilación.
import { getCollection } from 'astro:content';
import { statSync } from 'node:fs';
import type { Lang } from '../i18n/rutas';
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
