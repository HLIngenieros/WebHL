// Proyección del mapa de presencia (especificación §6: SVG propio, sin terceros). Equirectangular
// corregida por el coseno de la latitud media: a estas latitudes (−6° a 21°) la deformación no se nota.
// design/mapa.mjs usa esta misma función para que los trazos de los países y los puntos coincidan.

/** Guatemala a Ecuador y el Caribe, con margen. */
export const CAJA = { oeste: -93, este: -59, sur: -6, norte: 21 };
export const ANCHO = 1000;

const K = Math.cos((((CAJA.norte + CAJA.sur) / 2) * Math.PI) / 180);
const ESCALA = ANCHO / ((CAJA.este - CAJA.oeste) * K);
export const ALTO = Math.round((CAJA.norte - CAJA.sur) * ESCALA);

const r1 = (n: number) => Math.round(n * 10) / 10;

/** [lat, lon] → [x, y] en el viewBox `0 0 ANCHO ALTO`. */
export function proyectar([lat, lon]: readonly [number, number]): [number, number] {
  return [r1((lon - CAJA.oeste) * K * ESCALA), r1((CAJA.norte - lat) * ESCALA)];
}

export type Punto = { x: number; y: number; n: number; etiqueta: string; pais?: string };

/** Un punto por ciudad (mismas coordenadas), con cuántos proyectos tiene y sus nombres. */
export function puntosDe(xs: { coordenadas?: readonly [number, number]; titulo: string; pais?: string }[]): Punto[] {
  const grupos = new Map<string, Punto>();
  for (const x of xs) {
    if (!x.coordenadas) continue;
    const clave = x.coordenadas.join(',');
    const previo = grupos.get(clave);
    if (previo) { previo.n++; previo.etiqueta += ` · ${x.titulo}`; }
    else { const [px, py] = proyectar(x.coordenadas); grupos.set(clave, { x: px, y: py, n: 1, etiqueta: x.titulo, pais: x.pais }); }
  }
  return [...grupos.values()];
}
