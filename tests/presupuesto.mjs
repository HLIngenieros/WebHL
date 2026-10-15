// Presupuesto de rendimiento (especificación §6): JS por página ≤ 30 KB gzip (explorador de proyectos
// ≤ 100 KB). Cuenta los scripts de la página y todos los módulos que importan, comprimidos uno a uno
// como viajan por la red. Uso: npm run presupuesto (PRESUPUESTO_KB cambia el límite general).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const DIST = 'dist';
const LIMITE = Number(process.env.PRESUPUESTO_KB ?? 30) * 1024;
const LIMITES_RUTA = [[/^dist[\\/](en[\\/]projects|proyectos)[\\/]index\.html$/, 100 * 1024]];

const htmls = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? htmls(p) : p.endsWith('.html') ? [p] : [];
});

const sinQuery = (src) => src.split(/[?#]/)[0];
const importsDe = (codigo) =>
  [...codigo.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+\.js)["']/g)].map((m) => sinQuery(m[1]));

/** Archivos JS que carga la página: <script src> y, recursivamente, sus import estáticos y dinámicos. */
export function modulosDe(html) {
  const contenido = readFileSync(html, 'utf8');
  const vistos = new Set();
  const pendientes = [];
  for (const m of contenido.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)) {
    pendientes.push(resolve(DIST, '.' + sinQuery(m[1])));
  }
  for (const m of contenido.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
    for (const i of importsDe(m[1])) pendientes.push(resolve(DIST, '.' + (i.startsWith('/') ? i : '/' + i)));
  }
  while (pendientes.length) {
    const archivo = pendientes.pop();
    if (vistos.has(archivo)) continue;
    vistos.add(archivo);
    for (const i of importsDe(readFileSync(archivo, 'utf8'))) {
      pendientes.push(i.startsWith('/') ? resolve(DIST, '.' + i) : resolve(dirname(archivo), i));
    }
  }
  return [...vistos];
}

/** Bytes gzip de todo el JS de una página: scripts en línea + cada módulo comprimido por separado. */
export function pesoPagina(html) {
  const contenido = readFileSync(html, 'utf8');
  const enLinea = [...contenido.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .reduce((t, m) => t + gzipSync(Buffer.from(m[1])).length, 0);
  return modulosDe(html).reduce((t, f) => t + gzipSync(readFileSync(f)).length, enLinea);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let falla = false;
  const paginas = htmls(DIST);
  for (const archivo of paginas) {
    const limite = LIMITES_RUTA.find(([re]) => re.test(archivo))?.[1] ?? LIMITE;
    const bytes = pesoPagina(archivo);
    if (bytes > limite) { falla = true; console.log(`EXCEDE ${archivo}: ${(bytes / 1024).toFixed(1)} KB`); }
  }
  console.log(`JS del inicio: ${(pesoPagina(join(DIST, 'index.html')) / 1024).toFixed(1)} KB gzip`);
  console.log(`Fuente: ${(statSync(join(DIST, 'fonts/archivo-var-latin.woff2')).size / 1024).toFixed(1)} KB`);
  console.log(`${paginas.length} páginas revisadas: ${falla ? 'FALLA' : 'OK'}`);
  process.exit(falla ? 1 : 0);
}
