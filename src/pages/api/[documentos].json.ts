// Documentos de MUESTRA para desarrollo. En producción, /api/documentos.json lo mantiene documentos.php con lo
// que envía Power Automate desde la biblioteca de SharePoint; por eso `--mode lanzamiento` no lo genera: subir
// `dist/` nunca pisa el catálogo real ni publica el de muestra.
import type { APIRoute } from 'astro';
import muestra from '../../lib/documentos-muestra.json';

export const getStaticPaths = () => (import.meta.env.MODE === 'lanzamiento' ? [] : [{ params: { documentos: 'documentos' } }]);
export const GET: APIRoute = () => new Response(JSON.stringify(muestra));
