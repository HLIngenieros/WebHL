// Genera src/lib/mapa-geo.ts: los países de la región ya proyectados y simplificados, como trazos SVG.
// Fuente: Natural Earth 1:50m Admin 0 – Countries (dominio público), descargado aparte (no se versiona):
//   https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
// Uso: node design/mapa.mjs <ruta-al-geojson>
import { readFileSync, writeFileSync } from 'node:fs';
import { CAJA, proyectar } from '../src/lib/mapa.ts';

const entrada = process.argv[2];
if (!entrada) throw new Error('Uso: node design/mapa.mjs <ne_50m_admin_0_countries.geojson>');
const geo = JSON.parse(readFileSync(entrada, 'utf8'));
if (geo.type !== 'FeatureCollection' || !Array.isArray(geo.features)) throw new Error('No es un GeoJSON de países');

const TOLERANCIA = 1; // unidades del viewBox
const MARGEN = 2; // grados fuera de la caja que aún se dibujan (para que las costas no corten en seco)

// Douglas-Peucker sobre puntos ya proyectados.
function simplificar(pts) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let max = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.abs(dy * x - dx * y + b[0] * a[1] - b[1] * a[0]) / (Math.hypot(dx, dy) || 1);
    if (d > max) { max = d; idx = i; }
  }
  if (max <= TOLERANCIA) return [a, b];
  return [...simplificar(pts.slice(0, idx + 1)).slice(0, -1), ...simplificar(pts.slice(idx))];
}

// Un anillo cerrado empieza y termina en el mismo punto: se parte en el punto más lejano del inicio.
function simplificarAnillo(pts) {
  const [x0, y0] = pts[0];
  let lejos = 1;
  for (let i = 1; i < pts.length; i++) if (Math.hypot(pts[i][0] - x0, pts[i][1] - y0) > Math.hypot(pts[lejos][0] - x0, pts[lejos][1] - y0)) lejos = i;
  return [...simplificar(pts.slice(0, lejos + 1)).slice(0, -1), ...simplificar(pts.slice(lejos))];
}

const recorte = (v, min, max) => Math.min(max + MARGEN, Math.max(min - MARGEN, v));
const dentro = ([lon, lat]) =>
  lon > CAJA.oeste - MARGEN && lon < CAJA.este + MARGEN && lat > CAJA.sur - MARGEN && lat < CAJA.norte + MARGEN;

const paises = [];
for (const f of geo.features) {
  const id = (f.properties.ISO_A2_EH ?? f.properties.ISO_A2 ?? '').toLowerCase();
  if (!/^[a-z]{2}$/.test(id)) continue;
  const poligonos = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
  const anillos = poligonos.flatMap((p) => p).filter((anillo) => anillo.some(dentro));
  const trazos = anillos
    // Fuera de la caja (con margen) los puntos se recortan a su borde: quedan rectas que la simplificación elimina.
    .map((anillo) => simplificarAnillo(anillo.map(([lon, lat]) => proyectar([recorte(lat, CAJA.sur, CAJA.norte), recorte(lon, CAJA.oeste, CAJA.este)]))))
    .filter((pts) => pts.length >= 4)
    .map((pts) => 'M' + pts.map(([x, y]) => `${x} ${y}`).join('L') + 'Z');
  if (trazos.length) paises.push({ id, d: trazos.join('') });
}
paises.sort((a, b) => a.id.localeCompare(b.id));

const salida = `// Generado por design/mapa.mjs desde Natural Earth 1:50m (dominio público). No editar a mano.
// Comando: node design/mapa.mjs <ne_50m_admin_0_countries.geojson>
export const PAISES_GEO: { id: string; d: string }[] = ${JSON.stringify(paises, null, 0).replace(/},{/g, '},\n  {')};
`;
writeFileSync(new URL('../src/lib/mapa-geo.ts', import.meta.url), salida);
console.log(`${paises.length} países, ${(Buffer.byteLength(salida) / 1024).toFixed(1)} KB`);
