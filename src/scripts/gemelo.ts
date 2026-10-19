// Gemelo digital del inicio (guía §9, §12.1-1): canvas, bucle, cursor y pausa. La geometría está en
// src/lib/gemelo.ts. Decorativo: el contenido del hero no depende de él.
//   data-estado del contenedor: quieto (movimiento reducido o sin iniciar) · animando · pausa.
import { ALTURA, ANCLAS, DISCIPLINAS, planta, proyectar, recortar, type Grupo } from '../lib/gemelo';

const CAMBIO = 2800;      // ms entre disciplinas resaltadas
const LEVANTA = ALTURA / 2; // niveles por segundo: la planta se levanta en ~2 s
const w = window as any;

let liberar: (() => void) | null = null;

const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.trim().replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

function iniciar() {
  liberar?.();
  const caja = document.querySelector<HTMLElement>('.gemelo');
  const lienzo = caja?.querySelector('canvas');
  const hero = document.querySelector('.hero');
  const contexto = lienzo?.getContext('2d');
  if (!caja || !lienzo || !hero || !contexto) return;
  const ctx = contexto; // con tipo no nulo: lo usan funciones declaradas más abajo

  const css = getComputedStyle(document.documentElement);
  const color = { linea: css.getPropertyValue('--hl-azul-claro'), senal: css.getPropertyValue('--hl-senal'), acero: css.getPropertyValue('--hl-acero'), texto: css.getPropertyValue('--hl-concreto') };
  const etiquetas: Record<string, string> = JSON.parse(caja.dataset.etiquetas ?? '{}');
  const S = planta();
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let ancho = 0, alto = 0;
  const medir = () => {
    const r = lienzo.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    ancho = r.width; alto = r.height;
    lienzo.width = Math.round(ancho * dpr); lienzo.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  let giro = 0.6, inclinacion = 0.3, giroMeta = 0.6, inclMeta = 0.3;
  let t0 = performance.now(), cambio = t0, indice = 0;

  function dibujar(ahora: number, completo = false) {
    const t = (ahora - t0) / 1000;
    const nivel = completo ? ALTURA : Math.min(ALTURA, t * LEVANTA);
    if (!completo && t > 2 && ahora - cambio > CAMBIO) { indice = (indice + 1) % DISCIPLINAS.length; cambio = ahora; }
    const resalta = !completo && t > 2 ? DISCIPLINAS[indice] : null;
    const pulso = Math.min(1, (ahora - cambio) / 500);
    const vista = { giro, inclinacion, ancho, alto };
    ctx.clearRect(0, 0, ancho, alto);
    for (const s0 of S) {
      const s = recortar(s0, nivel);
      if (!s) continue;
      const g: Grupo = s[6];
      const encendido = resalta !== null && g !== 'grua' && g !== 'suelo' && (g === resalta || resalta === 'mantenimiento');
      ctx.strokeStyle = g === 'suelo' ? rgba(color.acero, 0.15) : g === 'grua' ? rgba(color.senal, 0.9)
        : encendido ? rgba(color.senal, 0.5 + 0.5 * pulso) : rgba(color.linea, 0.55);
      ctx.lineWidth = encendido ? 1.6 : 1;
      const a = proyectar([s[0], s[1], s[2]], vista), b = proyectar([s[3], s[4], s[5]], vista);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    if (nivel < ALTURA) { // línea de corte del levantamiento
      const a = proyectar([-150, nivel, 0], vista), b = proyectar([150, nivel, 0], vista);
      ctx.strokeStyle = rgba(color.senal, 0.5); ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (resalta && etiquetas[resalta]) { // una sola etiqueta, discreta
      const [x, y] = proyectar(ANCLAS[resalta], vista);
      ctx.globalAlpha = Math.min(1, (ahora - cambio) / 400) * 0.9;
      ctx.strokeStyle = ctx.fillStyle = color.senal;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 22, y - 22); ctx.lineTo(x + 32, y - 22); ctx.stroke();
      ctx.font = '600 11px Archivo, sans-serif';
      (ctx as any).fontStretch = 'condensed';
      (ctx as any).letterSpacing = '1px';
      ctx.fillStyle = color.texto;
      ctx.fillText(etiquetas[resalta].toUpperCase(), x + 36, y - 18);
      ctx.globalAlpha = 1;
    }
  }

  medir();
  const alCambiarTamano = new ResizeObserver(() => { medir(); if (quieto) dibujar(performance.now(), true); });
  alCambiarTamano.observe(lienzo);

  if (quieto) {
    dibujar(performance.now(), true);
    caja.dataset.estado = 'quieto';
    liberar = () => { alCambiarTamano.disconnect(); liberar = null; };
    return;
  }

  let marco = 0, visible = true;
  const cuadro = (ahora: number) => {
    giroMeta += 0.001;
    giro += (giroMeta - giro) * 0.05;
    inclinacion += (inclMeta - inclinacion) * 0.05;
    dibujar(ahora);
    marco = requestAnimationFrame(cuadro);
  };
  const actualizar = () => {
    const corre = visible && !document.hidden;
    if (corre && !marco) { marco = requestAnimationFrame(cuadro); caja.dataset.estado = 'animando'; }
    if (!corre && marco) { cancelAnimationFrame(marco); marco = 0; caja.dataset.estado = 'pausa'; }
  };
  const vigia = new IntersectionObserver(([e]) => { visible = e.isIntersecting; actualizar(); });
  vigia.observe(hero);
  const cursor = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect();
    giroMeta = 0.6 + ((e.clientX - r.left) / r.width - 0.5) * 1.4;
    inclMeta = 0.2 + ((e.clientY - r.top) / r.height) * 0.3;
  };
  hero.addEventListener('pointermove', cursor as EventListener);
  document.addEventListener('visibilitychange', actualizar);
  t0 = cambio = performance.now();
  w.__gemeloBucles = (w.__gemeloBucles ?? 0) + 1;
  actualizar();

  liberar = () => {
    cancelAnimationFrame(marco); marco = 0;
    vigia.disconnect(); alCambiarTamano.disconnect();
    hero.removeEventListener('pointermove', cursor as EventListener);
    document.removeEventListener('visibilitychange', actualizar);
    w.__gemeloBucles = Math.max(0, (w.__gemeloBucles ?? 1) - 1);
    liberar = null;
  };
}

// Después del primer pintado: el H1 es el LCP y no debe esperar al canvas.
const arrancar = () => ('requestIdleCallback' in window ? (window as any).requestIdleCallback(iniciar, { timeout: 1200 }) : setTimeout(iniciar, 200));
if (document.readyState === 'complete') arrancar(); else addEventListener('load', arrancar, { once: true });
document.addEventListener('astro:page-load', () => { if (document.readyState === 'complete') arrancar(); });
document.addEventListener('astro:before-swap', () => liberar?.());
