// Estructura 3D de la política (guía §12.5-4): canvas, bucle, selección y arrastre. La geometría está en
// src/lib/estructura.ts. Los compromisos son botones en el HTML: sin JS se leen igual (el canvas queda vacío).
//   data-estado del contenedor: quieto · animando · pausa.
import { ALTO_COLUMNA, COLUMNAS, TOPE, columnaEn, estructura, proyectar, recortar, type Vista } from '../lib/estructura';

const CAMBIO = 3200; // ms entre compromisos resaltados
const w = window as any;
let liberar: (() => void) | null = null;

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.trim().replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function iniciar() {
  liberar?.();
  const caja = document.querySelector<HTMLElement>('.estructura');
  const lienzo = caja?.querySelector('canvas');
  const contexto = lienzo?.getContext('2d');
  const botones = [...document.querySelectorAll<HTMLButtonElement>('.compromisos button')];
  if (!caja || !lienzo || !contexto || botones.length !== 4) return;
  const ctx = contexto;
  const css = getComputedStyle(document.documentElement);
  const color = { linea: css.getPropertyValue('--hl-azul-claro'), senal: css.getPropertyValue('--hl-senal'), verde: css.getPropertyValue('--hl-verde'), texto: css.getPropertyValue('--hl-concreto') };
  const fuente = css.getPropertyValue('--f').trim() || 'sans-serif';
  const nombres: string[] = JSON.parse(caja.dataset.nombres ?? '[]');
  const rotulos: { cubierta: string; cimiento: string } = JSON.parse(caja.dataset.rotulos ?? '{}');
  const S = estructura();
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const v: Vista = { giro: -0.6, inclinacion: 0.42, ancho: 0, alto: 0 };
  let dpr = 1, sel = 0, encima = -1, nivel = quieto ? TOPE : -0.3, t0 = 0, pausa = 0;
  let arrastre: { x: number; y: number; giro: number; incl: number } | null = null;

  function medir() {
    dpr = Math.min(2, devicePixelRatio || 1);
    const r = caja!.getBoundingClientRect();
    v.ancho = r.width; v.alto = r.height;
    lienzo!.width = r.width * dpr; lienzo!.height = r.height * dpr;
    if (!marco) dibujar();
  }

  function dibujar() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, v.ancho, v.alto);
    const foco = encima >= 0 ? encima : sel;
    for (const s of S) {
      const c = recortar(s, nivel);
      if (!c) continue;
      const [p, q] = [proyectar(c[0], v), proyectar(c[1], v)], g = c[2], on = g === `c${foco}`;
      ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
      ctx.strokeStyle = on ? color.verde : g === 'malla' ? rgba(color.linea, 0.18) : g === 'techo' ? rgba(color.senal, 0.75) : g === 'base' ? rgba(color.texto, 0.6) : rgba(color.linea, 0.55);
      ctx.lineWidth = on ? 2.4 : 1.1;
      ctx.stroke();
    }
    if (nivel < TOPE) { // línea de corte en señal mientras se levanta
      const P = [[-2.8, -2.8], [2.8, -2.8], [2.8, 2.8], [-2.8, 2.8], [-2.8, -2.8]].map(([x, z]) => proyectar([x, nivel, z], v));
      ctx.setLineDash([5, 5]); ctx.strokeStyle = color.senal; ctx.lineWidth = 1; ctx.beginPath();
      P.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.textAlign = 'center';
    if (nivel >= ALTO_COLUMNA) COLUMNAS.forEach(([x, z], k) => {
      const [px, py] = proyectar([x * 1.42, 1.9, z * 1.42], v), on = k === foco;
      ctx.fillStyle = on ? color.verde : rgba(color.texto, 0.75);
      ctx.font = `${on ? 700 : 600} ${on ? 13 : 11}px ${fuente}`;
      ctx.fillText(`${k + 1} · ${(nombres[k] ?? '').toUpperCase()}`, px, py);
    });
    if (nivel >= TOPE) {
      ctx.font = `600 11px ${fuente}`;
      const [tx, ty] = proyectar([0, TOPE + 0.35, 0], v); ctx.fillStyle = color.senal; ctx.fillText(rotulos.cubierta.toUpperCase(), tx, ty);
      const [bx, by] = proyectar([0, -0.3, -2.6], v); ctx.fillStyle = rgba(color.texto, 0.8); ctx.fillText(rotulos.cimiento.toUpperCase(), bx, by + 20);
    }
  }

  function elegir(k: number, usuario: boolean) {
    if (usuario) pausa = performance.now() + 9000;
    if (k === sel) return;
    sel = k;
    botones.forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
    if (!marco) dibujar();
  }

  let marco = 0, visible = false, visto = false;
  const cuadro = (ahora: number) => {
    if (nivel < TOPE) nivel = Math.min(TOPE, -0.3 + (ahora - t0) / 380); // se levanta en ~2 s
    if (!arrastre) v.giro += 0.0022;
    if (ahora > pausa && nivel >= TOPE && encima < 0) elegir(Math.floor((ahora - t0) / CAMBIO) % 4, false);
    dibujar();
    marco = requestAnimationFrame(cuadro);
  };
  const actualizar = () => {
    const corre = !quieto && visible && !document.hidden;
    if (corre && !marco) { if (!visto) { visto = true; t0 = performance.now(); } marco = requestAnimationFrame(cuadro); caja.dataset.estado = 'animando'; }
    if (!corre && marco) { cancelAnimationFrame(marco); marco = 0; caja.dataset.estado = 'pausa'; }
  };

  const enLienzo = (e: PointerEvent) => { const r = caja.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] as const; };
  const abajo = (e: PointerEvent) => { arrastre = { x: e.clientX, y: e.clientY, giro: v.giro, incl: v.inclinacion }; caja.setPointerCapture(e.pointerId); };
  const arriba = () => { arrastre = null; };
  const mover = (e: PointerEvent) => {
    if (arrastre) {
      v.giro = arrastre.giro + (e.clientX - arrastre.x) / 140;
      v.inclinacion = Math.max(0.1, Math.min(0.9, arrastre.incl + (e.clientY - arrastre.y) / 300));
      pausa = performance.now() + 9000;
      if (!marco) dibujar();
      return;
    }
    const k = columnaEn(...enLienzo(e), v);
    if (k !== encima) { encima = k; if (k >= 0) elegir(k, true); else if (!marco) dibujar(); }
  };
  const fuera = () => { encima = -1; if (!marco) dibujar(); };
  const alBoton = botones.map((b, k) => {
    const clic = () => elegir(k, true);
    const entra = () => { encima = k; elegir(k, true); };
    const sale = () => { encima = -1; if (!marco) dibujar(); };
    b.addEventListener('click', clic); b.addEventListener('mouseenter', entra); b.addEventListener('mouseleave', sale);
    return () => { b.removeEventListener('click', clic); b.removeEventListener('mouseenter', entra); b.removeEventListener('mouseleave', sale); };
  });
  caja.addEventListener('pointerdown', abajo); caja.addEventListener('pointerup', arriba); caja.addEventListener('pointercancel', arriba);
  caja.addEventListener('pointermove', mover); caja.addEventListener('pointerleave', fuera);

  const alCambiarTamano = new ResizeObserver(medir);
  alCambiarTamano.observe(caja);
  medir();
  caja.dataset.estado = quieto ? 'quieto' : 'pausa';
  const vigia = new IntersectionObserver(([e]) => { visible = e.isIntersecting; actualizar(); }, { threshold: 0.2 });
  vigia.observe(caja);
  document.addEventListener('visibilitychange', actualizar);
  w.__estructuraBucles = (w.__estructuraBucles ?? 0) + 1;

  liberar = () => {
    cancelAnimationFrame(marco); marco = 0;
    vigia.disconnect(); alCambiarTamano.disconnect();
    alBoton.forEach((f) => f());
    caja.removeEventListener('pointerdown', abajo); caja.removeEventListener('pointerup', arriba); caja.removeEventListener('pointercancel', arriba);
    caja.removeEventListener('pointermove', mover); caja.removeEventListener('pointerleave', fuera);
    document.removeEventListener('visibilitychange', actualizar);
    w.__estructuraBucles = Math.max(0, (w.__estructuraBucles ?? 1) - 1);
    liberar = null;
  };
}

iniciar();
document.addEventListener('astro:page-load', iniciar);
document.addEventListener('astro:before-swap', () => liberar?.());
