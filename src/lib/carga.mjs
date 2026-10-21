// Carga de insumos (plan AG.9): solo en `astro dev`. Inyecta /carga/ y un middleware que guarda en insumos/entrada/.
// En `astro build` no hace nada: ni la página ni el middleware llegan a dist/ ni al hosting.
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const RAIZ = 'insumos/entrada';
const ESTADO = join(RAIZ, 'estado.json');
const EXT = /\.(pdf|jpe?g|png|webp|xlsx|csv|docx|pptx|txt|md)$/i;
const MAX = 50 * 1024 * 1024;
const LOCAL = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/** Nombre seguro: sin tildes, minúsculas, solo [a-z0-9.-]; null si la extensión no está en la lista. */
export function nombreSeguro(nombre) {
  const base = String(nombre).split(/[\\/]/).pop().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|-+(?=\.)|-+$/g, '');
  return base.includes('..') || !EXT.test(base) ? null : base;
}

const leerEstado = async () => JSON.parse(await readFile(ESTADO, 'utf8').catch(() => '[]'));
const ahora = () => new Date().toLocaleString('sv-SE').slice(0, 16); // AAAA-MM-DD HH:MM, hora local

function responder(res, codigo, cuerpo) {
  res.statusCode = codigo;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(cuerpo));
}

async function recibir(req, res) {
  const url = new URL(req.url, 'http://local');
  const nombre = nombreSeguro(url.searchParams.get('nombre') ?? '');
  if (!nombre) return responder(res, 415, { error: 'Tipo no admitido' });
  if (Number(req.headers['content-length'] ?? 0) > MAX) return responder(res, 413, { error: 'Pasa de 50 MB' });

  const dia = ahora().slice(0, 10);
  await mkdir(join(RAIZ, dia), { recursive: true });
  let final = nombre;
  for (let n = 2; await stat(join(RAIZ, dia, final)).then(() => true, () => false); n++) final = nombre.replace(/(\.[^.]+)$/, `-${n}$1`);
  const destino = join(RAIZ, dia, final), temporal = destino + '.parcial';

  let bytes = 0, excedido = false;
  await new Promise((ok, mal) => {
    const salida = createWriteStream(temporal);
    req.on('data', (b) => { bytes += b.length; if (bytes > MAX && !excedido) { excedido = true; req.unpipe(salida); salida.end(); } });
    req.pipe(salida);
    salida.on('finish', ok).on('error', mal);
  });
  if (excedido || !bytes) {
    await unlink(temporal).catch(() => {});
    return responder(res, excedido ? 413 : 400, { error: excedido ? 'Pasa de 50 MB' : 'Archivo vacío' });
  }
  await rename(temporal, destino);

  const registro = await leerEstado();
  const fila = { archivo: `${dia}/${final}`, nota: (url.searchParams.get('nota') ?? '').slice(0, 300), bytes, subido: ahora(), estado: 'recibido', destino: '', detalle: '' };
  registro.unshift(fila);
  await writeFile(ESTADO, JSON.stringify(registro, null, 2) + '\n');
  responder(res, 201, fila);
}

export default function carga() {
  return {
    name: 'hl-carga',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, updateConfig }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/carga', entrypoint: './src/lib/carga.astro' });
        updateConfig({
          vite: {
            plugins: [{
              name: 'hl-carga',
              configureServer(server) {
                server.middlewares.use('/__carga', (req, res) => {
                  // Solo desde este equipo y desde la propia página (otro sitio abierto en el navegador no puede subir).
                  const origen = req.headers.origin;
                  if (!LOCAL.has(req.socket.remoteAddress ?? '') || (origen && new URL(origen).host !== req.headers.host)) {
                    return responder(res, 403, { error: 'Solo local' });
                  }
                  if (req.method === 'GET') return leerEstado().then((r) => responder(res, 200, r));
                  if (req.method === 'POST' && req.headers['x-carga'] === '1') {
                    return recibir(req, res).catch((e) => responder(res, 500, { error: String(e.message ?? e) }));
                  }
                  responder(res, 405, { error: 'Método no admitido' });
                });
              },
            }],
          },
        });
      },
    },
  };
}
