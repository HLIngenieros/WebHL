// Vacantes de MUESTRA para desarrollo. En producción, /api/vacantes.json lo escribe Power Automate desde la
// lista "Vacantes" de SharePoint (Talento Humano); por eso `--mode lanzamiento` no lo genera: subir `dist/`
// nunca pisa las vacantes reales ni publica las de muestra.
import type { APIRoute } from 'astro';
import muestra from '../../lib/vacantes-muestra.json';

export const getStaticPaths = () => (import.meta.env.MODE === 'lanzamiento' ? [] : [{ params: { vacantes: 'vacantes' } }]);
export const GET: APIRoute = () => new Response(JSON.stringify(muestra));
