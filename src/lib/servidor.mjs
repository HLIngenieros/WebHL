// Archivos del servidor (Plan R, R6; especificación §3 y §8). Al terminar la compilación escribe en dist/:
// - .htaccess: HTTPS sin www, las 301/410 de contenido/inventario.csv (columna `destino`) y las internas del Plan R,
//   la página 404, caché (un año para lo que lleva hash, HTML sin caché) y compresión.
// - sitemap.xml: todas las páginas públicas (el hreflang ya va en el <head> de cada una).
// Si un destino del inventario no existe en la compilación, la compilación falla: nunca se publica una 301 rota.
import { readFile, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITIO = 'https://hlingenieros.com';
const EXCLUIR = /^\/(muestra|pendientes|api|404)(\/|$)/;
// 301 del propio sitio nuevo (R-9): rutas que cambiaron durante el Plan R.
const INTERNAS = [['/hse/', '/gestion-integral/'], ['/en/hse/', '/en/integrated-management/']];

/** Filas del inventario como objetos (CSV con comillas, BOM y CRLF). */
export function leerCsv(texto) {
  const filas = [];
  let fila = [], campo = '', comillas = false;
  const t = texto.replace(/^\uFEFF/, '');
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (comillas) {
      if (c === '"' && t[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ',') { fila.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      fila.push(campo); campo = '';
      if (fila.some((x) => x !== '')) filas.push(fila);
      fila = [];
    } else campo += c;
  }
  if (campo || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas;
  return resto.map((f) => Object.fromEntries(cab.map((k, i) => [k, f[i] ?? ''])));
}

const escaparRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** Patrón de RedirectMatch para una ruta vieja: con o sin la barra final. */
const patron = (ruta) => `^${escaparRegex(ruta.replace(/\/$/, ''))}/?$`;

/** Reglas 301/410 a partir del inventario. Pura: la usa la integración y la prueba. */
export function reglas(filas) {
  const r301 = [], r410 = [];
  for (const f of filas) {
    const ruta = f.url.replace(SITIO, '');
    if (f.accion === '410') r410.push(ruta);
    else if (f.accion === '301') {
      if (!f.destino) throw new Error(`[servidor] ${ruta}: 301 sin destino en inventario.csv`);
      if (f.destino === ruta) throw new Error(`[servidor] ${ruta}: 301 hacia sí misma`);
      r301.push([ruta, f.destino]);
    }
  }
  return { r301: [...r301, ...INTERNAS], r410 };
}

export function htaccess({ r301, r410 }) {
  return `# Generado al compilar por src/lib/servidor.mjs desde contenido/inventario.csv: no editar a mano.
Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
AddDefaultCharset utf-8
AddType image/avif .avif
AddType font/woff2 .woff2

# HTTPS y dominio sin www
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off [OR]
  RewriteCond %{HTTP_HOST} ^www\\. [NC]
  RewriteRule ^ https://hlingenieros.com%{REQUEST_URI} [R=301,L]
</IfModule>

# Sitio anterior (WordPress) → sitio nuevo: ${r301.length} redirecciones permanentes
${r301.map(([de, a]) => `RedirectMatch 301 ${patron(de)} ${a}`).join('\n')}

# Páginas retiradas sin equivalente: ${r410.length}
${r410.map((de) => `RedirectMatch 410 ${patron(de)}`).join('\n')}

# Caché: lo que lleva hash en el nombre (/_astro/) y las fuentes, un año; el HTML se revalida siempre.
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|xml|txt|json)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\\.(js|css|avif|webp|jpg|jpeg|png|svg|woff2)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <If "%{REQUEST_URI} =~ m#^/(_astro|fonts)/#">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </If>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/plain text/xml application/javascript application/json application/xml image/svg+xml
</IfModule>
`;
}

export function sitemap(rutas) {
  const urls = [...rutas].sort().map((r) => `  <url><loc>${SITIO}${r}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const existe = (p) => access(p).then(() => true, () => false);

export default function servidor() {
  return {
    name: 'hl-servidor',
    hooks: {
      'astro:build:done': async ({ dir, pages, logger }) => {
        const raiz = fileURLToPath(dir);
        const filas = leerCsv(await readFile('contenido/inventario.csv', 'utf8'));
        const r = reglas(filas);
        const rotos = [];
        for (const [, a] of r.r301) {
          const camino = a.split('?')[0];
          if (!(await existe(join(raiz, camino, 'index.html')))) rotos.push(a);
        }
        if (rotos.length) throw new Error(`[servidor] destinos 301 que no existen en la compilación:\n${rotos.join('\n')}`);
        const rutas = pages.map((p) => `/${p.pathname}`.replace(/\/?$/, '/').replace(/^\/\/$/, '/')).filter((p) => !EXCLUIR.test(p));
        await writeFile(join(raiz, '.htaccess'), htaccess(r));
        await writeFile(join(raiz, 'sitemap.xml'), sitemap(rutas));
        logger.info(`.htaccess (${r.r301.length} × 301, ${r.r410.length} × 410) y sitemap.xml (${rutas.length} páginas)`);
      },
    },
  };
}
