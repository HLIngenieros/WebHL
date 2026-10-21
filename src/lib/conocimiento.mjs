// Conocimiento del agente "Hablar con HL" (D3, plan AG.1). Al terminar la compilación se lee el HTML ya
// generado de cada página pública y se parte en fragmentos por título (h1, h2, h3). Así el agente sabe
// exactamente lo que el sitio publica, sin repetir cómo se arma cada página. Sale en
// dist/api/conocimiento.json, que lee agente.php desde el disco (.htaccess niega su acceso web).
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCLUIR = /^\/(muestra|pendientes|api|404)(\/|$)/;
const MAX = 1400; // caracteres por fragmento: varios caben en el contexto de una pregunta

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', middot: '·', laquo: '«', raquo: '»', shy: '' };
const decodificar = (s) => s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  return ENTIDADES[e.toLowerCase()] ?? m;
});

/** Texto plano de un trozo de HTML: sin scripts, estilos, SVG ni plantillas; los bloques pasan a saltos de línea. */
export function textoDe(html) {
  const t = html
    .replace(/<(script|style|svg|template|noscript|button|form)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|hr)\b[^>]*>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article|figcaption|dd|dt|blockquote)>/gi, '\n')
    .replace(/<(td|th)\b[^>]*>/gi, ' · ')
    .replace(/<[^>]+>/g, ' ');
  return decodificar(t)
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').replace(/^[\s·]+|[\s·]+$/g, '').trim())
    .filter(Boolean)
    .join('\n');
}

/** Corta un texto largo en trozos de hasta MAX caracteres, por líneas y, si hace falta, por frases. */
function trozos(texto) {
  const out = [];
  let actual = '';
  const piezas = texto.split('\n').flatMap((l) => (l.length > MAX ? l.match(/[^.!?]+[.!?]*\s*/g) ?? [l] : [l]));
  for (const p of piezas) {
    if (actual && actual.length + p.length + 1 > MAX) { out.push(actual.trim()); actual = ''; }
    actual += (actual ? '\n' : '') + p;
  }
  if (actual.trim()) out.push(actual.trim());
  return out;
}

/** Fragmentos de una página: uno por sección (h1, h2 o h3), con el título de la página delante. */
export function fragmentosDe(html, ruta, sitio) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) return [];
  const pagina = textoDe(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s*·\s*Grupo HL$/, '') || 'Grupo HL';
  const lang = ruta.startsWith('/en/') || ruta === '/en' ? 'en' : 'es';
  const url = new URL(ruta, sitio).href;
  const out = [];
  // Partes separadas por los títulos; cada una lleva el título que la abre.
  const partes = main.split(/(?=<h[1-3]\b)/i);
  for (const parte of partes) {
    const titulo = textoDe(parte.match(/^<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/i)?.[1] ?? '').replace(/\n/g, ' ');
    const cuerpo = textoDe(titulo ? parte.replace(/^<h[1-3]\b[^>]*>[\s\S]*?<\/h[1-3]>/i, '') : parte);
    if (cuerpo.length < 40) continue;
    const nombre = titulo && titulo !== pagina ? `${pagina} · ${titulo}` : pagina;
    for (const texto of trozos(cuerpo)) out.push({ id: `${ruta}#${out.length + 1}`, lang, url, titulo: nombre, texto });
  }
  return out;
}

async function* paginas(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* paginas(p);
    else if (e.name === 'index.html') yield p;
  }
}

/** Integración de Astro: escribe dist/api/conocimiento.json al terminar la compilación. */
export default function conocimiento() {
  let sitio = '';
  return {
    name: 'hl-conocimiento',
    hooks: {
      'astro:config:done': ({ config }) => { sitio = config.site ?? ''; },
      'astro:build:done': async ({ dir, logger }) => {
        const raiz = fileURLToPath(dir);
        const fragmentos = [];
        for await (const archivo of paginas(raiz)) {
          const carpetas = relative(raiz, archivo).split(sep).slice(0, -1);
          const ruta = carpetas.length ? `/${carpetas.join('/')}/` : '/';
          if (EXCLUIR.test(ruta)) continue;
          fragmentos.push(...fragmentosDe(await readFile(archivo, 'utf8'), ruta, sitio));
        }
        fragmentos.sort((a, b) => a.id.localeCompare(b.id));
        await mkdir(join(raiz, 'api'), { recursive: true });
        await writeFile(join(raiz, 'api', 'conocimiento.json'), JSON.stringify({ generado: new Date().toISOString(), fragmentos }));
        logger.info(`conocimiento.json: ${fragmentos.length} fragmentos de ${new Set(fragmentos.map((f) => f.url)).size} páginas`);
      },
    },
  };
}
