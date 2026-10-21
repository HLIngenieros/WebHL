// Documentos de MUESTRA para desarrollo (se retira en AG.11, cuando el catálogo salga de la colección del repo);
// `--mode lanzamiento` no lo genera: subir
// `dist/` nunca pisa el catálogo real ni publica el de muestra.
import type { APIRoute } from 'astro';
import muestra from '../../lib/documentos-muestra.json';

export const getStaticPaths = () => (import.meta.env.MODE === 'lanzamiento' ? [] : [{ params: { documentos: 'documentos' } }]);
export const GET: APIRoute = () => new Response(JSON.stringify(muestra));
