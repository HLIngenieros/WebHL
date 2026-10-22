// Catálogo de documentos para agente.php (plan AG.11), en ambos idiomas: el PHP toma los de la pregunta (`lang`).
import type { APIRoute } from 'astro';
import { documentos } from '../../lib/documentos';

export const GET: APIRoute = async () => {
  const [es, en] = await Promise.all([documentos('es'), documentos('en')]);
  return new Response(JSON.stringify([...es.map((d) => ({ ...d, lang: 'es' })), ...en.map((d) => ({ ...d, lang: 'en' }))]));
};
