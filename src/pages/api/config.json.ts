// Configuración que lee public/api/enviar.php (D7): buzones por función y reglas de cada formulario.
// Sale del mismo contenido que las páginas, así el PHP no repite datos.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { reglasServidor, MENSAJE_MIN, MENSAJE_MAX, CV_MAX } from '../../lib/formularios';

export const GET: APIRoute = async () => {
  const [sitio] = await getCollection('sitio');
  const { buzones, confirmado } = sitio.data.contacto;
  return new Response(JSON.stringify({ buzones, confirmado, formularios: reglasServidor(), mensaje: { min: MENSAJE_MIN, max: MENSAJE_MAX }, cvMax: CV_MAX }));
};
