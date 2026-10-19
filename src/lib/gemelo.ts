// Gemelo digital del inicio (guía §9, §12.1-1): geometría y proyección, sin DOM. Una planta genérica
// (no una obra concreta) dibujada en alambre; cada segmento sabe a qué disciplina pertenece para poder
// resaltarla. Portado de design/maquetas/inicio.html.

export type Disciplina = 'civil' | 'mecanico' | 'electrico' | 'fabricacion' | 'mantenimiento';
/** En este orden se resaltan; 'mantenimiento' resalta toda la planta. */
export const DISCIPLINAS: Disciplina[] = ['civil', 'mecanico', 'electrico', 'fabricacion', 'mantenimiento'];
export type Grupo = Exclude<Disciplina, 'mantenimiento'> | 'grua' | 'suelo';
export type Segmento = [x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, grupo: Grupo];
type P3 = [number, number, number];

/** Punto de cada disciplina donde se ancla su etiqueta. */
export const ANCLAS: Record<Disciplina, P3> = {
  civil: [-85, 36, -5],
  mecanico: [-25, 92, 0],
  electrico: [110, 28, 55],
  fabricacion: [55, 48, -20],
  mantenimiento: [-25, 112, 0],
};
/** Altura total de la planta (la grúa): el levantamiento termina aquí. */
export const ALTURA = 140;

export function planta(): Segmento[] {
  const S: Segmento[] = [];
  let g: Grupo = 'civil';
  const seg = (a: P3, b: P3) => S.push([...a, ...b, g]);
  // Caja con pisos cada `lv` y una diagonal por piso.
  const caja = (x: number, y: number, z: number, w: number, h: number, d: number, lv: number) => {
    const p: [number, number][] = [[x, z], [x + w, z], [x + w, z + d], [x, z + d]];
    for (let k = y; k <= y + h; k += lv) for (let i = 0; i < 4; i++) seg([p[i][0], k, p[i][1]], [p[(i + 1) % 4][0], k, p[(i + 1) % 4][1]]);
    for (const [px, pz] of p) seg([px, y, pz], [px, y + h, pz]);
    for (let k = y; k + lv <= y + h; k += lv) seg([x, k, z], [x + w, k + lv, z]);
  };
  // Silo: tres anillos, montantes y techo cónico.
  const silo = (x: number, z: number, r: number, h: number, n = 16) => {
    const c = (a: number, y: number): P3 => [x + r * Math.cos(a), y, z + r * Math.sin(a)];
    for (const y of [0, h / 2, h]) for (let i = 0; i < n; i++) seg(c((i / n) * 2 * Math.PI, y), c(((i + 1) / n) * 2 * Math.PI, y));
    for (let i = 0; i < n; i += 2) seg(c((i / n) * 2 * Math.PI, 0), c((i / n) * 2 * Math.PI, h));
    for (let i = 0; i < n; i++) seg(c((i / n) * 2 * Math.PI, h), [x, h + r * 0.7, z]);
  };

  g = 'civil';
  caja(-110, 0, -25, 50, 35, 40, 12); // nave de molienda
  caja(-45, 0, -20, 40, 4, 40, 4);    // losa de la torre
  caja(20, 0, -35, 72, 3, 30, 3);     // losa de los silos
  g = 'mecanico';
  caja(-40, 4, -15, 30, 86, 30, 15);  // torre
  seg([-30, 90, 0], [-30, 110, 0]);
  seg([-25, 90, 0], [-25, 110, 0]);
  g = 'fabricacion';
  silo(30, -20, 10, 45);
  silo(55, -20, 10, 45);
  silo(80, -20, 10, 45);
  for (let i = 0; i < 8; i++) { // banda en cercha
    seg([i * 3.5, 5 + i * 6, 15], [3.5 + i * 3.5, 11 + i * 6, 15]);
    seg([i * 3.5, 5 + i * 6, 22], [3.5 + i * 3.5, 11 + i * 6, 22]);
    seg([i * 3.5, 5 + i * 6, 15], [i * 3.5, 5 + i * 6, 22]);
  }
  g = 'electrico';
  for (const x of [-130, -95, -60, 100, 125]) { seg([x, 0, 55], [x, 28, 55]); seg([x - 4, 26, 55], [x + 4, 26, 55]); }
  seg([-130, 26, 55], [-95, 24, 55]);
  seg([-95, 24, 55], [-60, 26, 55]);
  seg([-60, 26, 55], [100, 26, 55]);
  seg([100, 26, 55], [125, 26, 55]);
  g = 'grua';
  seg([-75, 0, 40], [-75, ALTURA - 10, 40]);
  seg([-75, ALTURA - 10, 40], [60, ALTURA - 10, 40]);
  seg([-75, ALTURA - 10, 40], [-100, ALTURA - 10, 40]);
  g = 'suelo';
  for (let x = -150; x <= 150; x += 25) seg([x, 0, -80], [x, 0, 80]);
  for (let z = -80; z <= 80; z += 20) seg([-150, 0, z], [150, 0, z]);
  return S;
}

/** Corte del levantamiento: el tramo del segmento bajo `nivel`, o null si todavía no asoma. El suelo
 *  no se corta. */
export function recortar(s: Segmento, nivel: number): Segmento | null {
  const [x1, y1, z1, x2, y2, z2, g] = s;
  if (g === 'suelo') return s;
  if (Math.min(y1, y2) > nivel) return null;
  const corta = (ax: number, ay: number, az: number, bx: number, by: number, bz: number): P3 => {
    const k = (nivel - ay) / (by - ay);
    return [ax + (bx - ax) * k, nivel, az + (bz - az) * k];
  };
  let a: P3 = [x1, y1, z1];
  let b: P3 = [x2, y2, z2];
  if (y2 > nivel) b = corta(x1, y1, z1, x2, y2, z2);
  if (y1 > nivel) a = corta(x2, y2, z2, x1, y1, z1);
  return [...a, ...b, g];
}

/** Perspectiva de la maqueta: giro sobre el eje vertical, inclinación y escala según el lienzo. */
export function proyectar(p: P3, v: { giro: number; inclinacion: number; ancho: number; alto: number }): [number, number] {
  const [x, y, z] = p;
  const c = Math.cos(v.giro), s = Math.sin(v.giro);
  const X = x * c - z * s;
  let Z = x * s + z * c;
  const ci = Math.cos(v.inclinacion), si = Math.sin(v.inclinacion);
  const Y = (y - 50) * ci - Z * si;
  Z = (y - 50) * si + Z * ci;
  const f = (520 / (520 + Z + 260)) * (Math.min(v.ancho, v.alto * 1.3) / 165);
  return [v.ancho * 0.5 + X * f, v.alto * 0.56 - Y * f];
}
