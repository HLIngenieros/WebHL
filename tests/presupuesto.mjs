// Presupuesto de rendimiento (especificación §6): JS por página ≤ 30 KB gzip; informa el peso de la fuente.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const LIMITE = Number(process.env.PRESUPUESTO_KB ?? 30) * 1024;
const htmls = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? htmls(p) : p.endsWith('.html') ? [p] : [];
});

let falla = false;
for (const archivo of htmls(DIST)) {
  const html = readFileSync(archivo, 'utf8');
  const externos = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => readFileSync(join(DIST, m[1])));
  const enLinea = [...html.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => Buffer.from(m[1]));
  const bytes = gzipSync(Buffer.concat([...externos, ...enLinea])).length;
  if (bytes > LIMITE) { falla = true; console.log(`EXCEDE ${archivo}: ${(bytes / 1024).toFixed(1)} KB`); }
}
const paginas = htmls(DIST).length;
const muestra = readFileSync(join(DIST, 'index.html'), 'utf8');
const ext = [...muestra.matchAll(/<script[^>]*src="([^"]+)"/g)].map((m) => readFileSync(join(DIST, m[1])));
const inl = [...muestra.matchAll(/<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => Buffer.from(m[1]));
console.log(`JS del inicio: ${(gzipSync(Buffer.concat([...ext, ...inl])).length / 1024).toFixed(1)} KB gzip`);
console.log(`Fuente: ${(statSync(join(DIST, 'fonts/archivo-var-latin.woff2')).size / 1024).toFixed(1)} KB`);
console.log(`${paginas} páginas revisadas: ${falla ? 'FALLA' : 'OK'}`);
process.exit(falla ? 1 : 0);
