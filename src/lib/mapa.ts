// Proyección del mapa de presencia (especificación §6: SVG propio, sin terceros). Equirectangular
// corregida por el coseno de la latitud media: a estas latitudes (−6° a 21°) la deformación no se nota.
// design/mapa.mjs usa esta misma función para que los trazos de los países y los puntos coincidan.

/** Guatemala a Ecuador y el Caribe, con margen. */
export const CAJA = { oeste: -93, este: -59, sur: -6, norte: 21 };
export const ANCHO = 1000;

const K = Math.cos((((CAJA.norte + CAJA.sur) / 2) * Math.PI) / 180);
export const ESCALA = ANCHO / ((CAJA.este - CAJA.oeste) * K);
export const ALTO = Math.round((CAJA.norte - CAJA.sur) * ESCALA);

const r1 = (n: number) => Math.round(n * 10) / 10;

/** [lat, lon] → [x, y] en el viewBox `0 0 ANCHO ALTO`. */
export function proyectar([lat, lon]: readonly [number, number]): [number, number] {
  return [r1((lon - CAJA.oeste) * K * ESCALA), r1((CAJA.norte - lat) * ESCALA)];
}

// ── Mapa vivo (guía §13.2): encuadre, acercamiento y grupos. Funciones puras; la isla las conecta. ──

/** Rectángulo del viewBox, en unidades del lienzo. */
export type Caja = { x: number; y: number; w: number; h: number };
export const COMPLETA: Caja = { x: 0, y: 0, w: ANCHO, h: ALTO };
/** Ancho mínimo visible: acercamiento máximo ≈ 6×. */
export const ANCHO_MIN = 160;
/** Kilómetros por unidad del lienzo (1° de latitud ≈ 111,32 km). */
export const KM_POR_UNIDAD = 111.32 / ESCALA;

const proporcion = (w: number): Caja => ({ x: 0, y: 0, w, h: (w * ALTO) / ANCHO });

/** Acercamiento entre ANCHO_MIN y el lienzo completo, con la proporción del lienzo; el centro no sale del lienzo. */
export function limitar(c: Caja): Caja {
  const { w, h } = proporcion(Math.min(Math.max(c.w, ANCHO_MIN), ANCHO));
  const cx = Math.min(Math.max(c.x + c.w / 2, 0), ANCHO);
  const cy = Math.min(Math.max(c.y + c.h / 2, 0), ALTO);
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Acerca (f < 1) o aleja (f > 1) dejando quieto el punto (cx, cy). */
export function acercar(c: Caja, f: number, cx = c.x + c.w / 2, cy = c.y + c.h / 2): Caja {
  const w = Math.min(Math.max(c.w * f, ANCHO_MIN), ANCHO);
  const k = w / c.w;
  return limitar({ x: cx - (cx - c.x) * k, y: cy - (cy - c.y) * k, w, h: c.h * k });
}

/** Caja que encuadra unos puntos con margen, con un ancho mínimo para no acercar de más. */
export function encuadre(ps: readonly { x: number; y: number }[], margen = 60, minimo = 260): Caja {
  if (!ps.length) return COMPLETA;
  const xs = ps.map((p) => p.x), ys = ps.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const w = Math.max(x1 - x0 + margen * 2, ((y1 - y0 + margen * 2) * ANCHO) / ALTO, minimo);
  return limitar({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - (w * ALTO) / ANCHO / 2, w, h: (w * ALTO) / ANCHO });
}

/** Amplía la caja hasta el aspecto del contenedor (ancho / alto) para llenarlo sin bandas. */
export function llenar(c: Caja, aspecto: number): Caja {
  if (c.w / c.h > aspecto) { const h = c.w / aspecto; return { ...c, y: c.y - (h - c.h) / 2, h }; }
  const w = c.h * aspecto;
  return { ...c, x: c.x - (w - c.w) / 2, w };
}

export type Grupo<T> = { clave: string; x: number; y: number; miembros: T[] };

/** Junta los puntos que en pantalla quedan a menos de `radio` px; al acercar se separan. */
export function agrupar<T extends { id: string; x: number; y: number }>(ps: readonly T[], unidadesPorPx: number, radio = 34): Grupo<T>[] {
  const gs: Grupo<T>[] = [];
  for (const p of ps) {
    const g = gs.find((g) => Math.hypot(g.x - p.x, g.y - p.y) / unidadesPorPx < radio);
    if (!g) { gs.push({ clave: '', x: p.x, y: p.y, miembros: [p] }); continue; }
    g.miembros.push(p);
    g.x = g.miembros.reduce((s, q) => s + q.x, 0) / g.miembros.length;
    g.y = g.miembros.reduce((s, q) => s + q.y, 0) / g.miembros.length;
  }
  for (const g of gs) g.clave = g.miembros.map((p) => p.id).sort().join('|');
  return gs;
}
