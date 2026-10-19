// Estructura de la política de gestión integral (guía §12.5-4): cimiento, 4 columnas (los compromisos),
// arriostramiento y cubierta, en alambre. Funciones puras; src/scripts/estructura.ts las conecta al canvas.

export type P3 = [number, number, number];
export type Grupo = 'base' | 'malla' | 'marco' | 'techo' | `c${0 | 1 | 2 | 3}`;
export type Segmento = [a: P3, b: P3, grupo: Grupo];
export type Vista = { giro: number; inclinacion: number; ancho: number; alto: number };

/** Altura de las columnas y altura total (con la cubierta). */
export const ALTO_COLUMNA = 3.4;
export const TOPE = ALTO_COLUMNA + 1.4;
/** Esquinas de las 4 columnas, en el orden de los compromisos. */
export const COLUMNAS: [number, number][] = [[-1.7, -1.7], [1.7, -1.7], [1.7, 1.7], [-1.7, 1.7]];

export function estructura(): Segmento[] {
  const S: Segmento[] = [];
  const seg = (a: P3, b: P3, g: Grupo) => S.push([a, b, g]);
  const prisma = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, g: Grupo) => {
    const P: P3[] = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]];
    for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) seg(P[a], P[b], g);
  };
  const H = ALTO_COLUMNA;
  prisma(-2.6, -0.3, -2.6, 2.6, 0, 2.6, 'base');
  for (let i = -2; i <= 2; i++) { seg([i * 1.1, 0, -2.6], [i * 1.1, 0, 2.6], 'malla'); seg([-2.6, 0, i * 1.1], [2.6, 0, i * 1.1], 'malla'); }
  COLUMNAS.forEach(([x, z], k) => {
    const g = `c${k}` as Grupo;
    prisma(x - 0.2, 0, z - 0.2, x + 0.2, H, z + 0.2, g);
    prisma(x - 0.45, 0, z - 0.45, x + 0.45, 0.25, z + 0.45, g);
  });
  for (let k = 0; k < 4; k++) {
    const [x0, z0] = COLUMNAS[k], [x1, z1] = COLUMNAS[(k + 1) % 4];
    for (const y of [H / 2, H]) seg([x0, y, z0], [x1, y, z1], 'marco');
    seg([x0, 0.25, z0], [x1, H / 2, z1], 'marco');
    seg([x1, 0.25, z1], [x0, H / 2, z0], 'marco');
  }
  prisma(-2.2, H, -2.2, 2.2, H + 0.3, 2.2, 'techo');
  for (const [x, z] of [[-2.2, -2.2], [2.2, -2.2], [2.2, 2.2], [-2.2, 2.2]]) seg([x, H + 0.3, z], [0, TOPE - 0.1, 0], 'techo');
  return S;
}

/** Parte del segmento por debajo del nivel `h` (la estructura se levanta por niveles); null si no hay. */
export function recortar([a, b, g]: Segmento, h: number): Segmento | null {
  if (a[1] <= h && b[1] <= h) return [a, b, g];
  if (a[1] > h && b[1] > h) return null;
  const [lo, hi] = a[1] < b[1] ? [a, b] : [b, a];
  const t = (h - lo[1]) / (hi[1] - lo[1]);
  return [lo, lo.map((v, i) => v + (hi[i] - v) * t) as P3, g];
}

/** Perspectiva desde arriba: lo lejano queda más alto en pantalla. */
export function proyectar([x, y, z]: P3, v: Vista): [number, number] {
  const ca = Math.cos(v.giro), sa = Math.sin(v.giro), ci = Math.cos(v.inclinacion), si = Math.sin(v.inclinacion);
  const x1 = x * ca - z * sa, z1 = x * sa + z * ca;
  const y2 = (y - 1.6) * ci + z1 * si, z2 = z1 * ci - (y - 1.6) * si;
  const f = 11 / (11 + z2), e = Math.min(v.ancho, v.alto) / 9;
  return [v.ancho / 2 + x1 * e * f, v.alto / 2 - 6 - y2 * e * f];
}

/** Columna más cercana al punto (px), o -1 si ninguna queda a menos de `radio`. */
export function columnaEn(mx: number, my: number, v: Vista, radio = 30): number {
  let mejor = -1, d0 = radio;
  COLUMNAS.forEach(([x, z], k) => {
    const a = proyectar([x, 0, z], v), b = proyectar([x, ALTO_COLUMNA, z], v);
    const vx = b[0] - a[0], vy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((mx - a[0]) * vx + (my - a[1]) * vy) / (vx * vx + vy * vy)));
    const d = Math.hypot(mx - a[0] - vx * t, my - a[1] - vy * t);
    if (d < d0) { d0 = d; mejor = k; }
  });
  return mejor;
}
