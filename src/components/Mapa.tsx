// Mapa vivo (guía §13.2): SVG propio con los países de Natural Earth ya proyectados, sin teselas ni librerías.
// Acercar y desplazar (botones, Ctrl + rueda, arrastre, pellizco), puntos que se agrupan según la escala y
// siguen a los filtros, clic en un grupo (acerca), en un punto (ventana con la ficha) o en un país (filtra).
// Sin JS es la misma lámina quieta: países con obra, grupos y sedes. El control del país por teclado son
// los chips del explorador; los puntos son botones.
import { Component } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { PAISES_GEO } from '../lib/mapa-geo';
import { ALTO, ANCHO, COMPLETA, KM_POR_UNIDAD, acercar, agrupar, encuadre, limitar, llenar, proyectar, type Caja } from '../lib/mapa';
import { t } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';
import type { Imagen } from '../lib/explorador';

export type ObraMapa = { id: string; x: number; y: number; titulo: string; ciudad?: string; datos?: string; codigo: string; sector: string; url: string; imagen?: Imagen };
type Sede = { x: number; y: number; etiqueta: string };

interface Props {
  lang: Lang;
  /** ISO-2 en minúscula de los países con obra. */
  paises: string[];
  obras: ObraMapa[];
  sedes: Sede[];
  /** Ids que cumplen los filtros; sin valor, todas. */
  visibles?: Set<string>;
  activo?: string;
  alElegir?: (pais: string) => void;
  resaltado?: string | null;
  alResaltar?: (ids: string[] | null) => void;
  /** Fichas sin coordenadas (salen en la lista, no en el mapa). */
  sinUbicacion?: number;
}

const RETICULA = {
  meridianos: [-90, -85, -80, -75, -70, -65, -60].map((lon) => ({ v: proyectar([0, lon])[0], txt: `${-lon}°O` })),
  paralelos: [-5, 0, 5, 10, 15, 20].map((lat) => ({ v: proyectar([lat, -75])[1], txt: `${Math.abs(lat)}°${lat < 0 ? 'S' : lat > 0 ? 'N' : ''}` })),
};
const RONDOS = [50, 100, 200, 250, 500, 1000];
const quieto = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

/** Los países no cambian al acercar: se pintan una vez (solo el activo los repinta). */
class Paises extends Component<{ conObra: Set<string>; activo?: string; alElegir?: (p: string) => void; movio: { current: boolean } }> {
  shouldComponentUpdate(p: Paises['props']) { return p.activo !== this.props.activo || p.conObra !== this.props.conObra; }
  render() {
    const { conObra, activo, alElegir, movio } = this.props;
    return (
      <g className="mapa-paises" aria-hidden="true">
        {PAISES_GEO.map((p) => {
          const obra = conObra.has(p.id);
          return (
            <path key={p.id} d={p.d} data-pais={p.id}
              className={['pais', obra && 'con-obra', obra && alElegir && 'elegible', activo === p.id && 'activo'].filter(Boolean).join(' ')}
              onClick={obra && alElegir ? () => { if (!movio.current) alElegir(p.id); } : undefined} />
          );
        })}
      </g>
    );
  }
}

export default function Mapa({ lang, paises, obras, sedes, visibles, activo, alElegir, resaltado, alResaltar, sinUbicacion = 0 }: Props) {
  // Interactivo solo tras hidratar: sin JS no quedan botones muertos (el HTML es la lámina quieta).
  const [hidratado, setHidratado] = useState(false);
  useEffect(() => setHidratado(true), []);
  const interactivo = Boolean(alElegir) && hidratado;
  const [caja, setCaja] = useState<Caja>(COMPLETA);
  const [tam, setTam] = useState({ w: 640, h: (640 * ALTO) / ANCHO });
  const [ventana, setVentana] = useState<ObraMapa | null>(null);
  const [pista, setPista] = useState(false);
  const cont = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const actual = useRef(caja);
  const anim = useRef(0);
  const movio = useRef(false);
  const conObra = useRef(new Set(paises)).current;
  actual.current = caja;

  const vista = llenar(caja, tam.w / tam.h);
  const u = vista.w / tam.w; // unidades por píxel
  const esta = (id: string) => !visibles || visibles.has(id);
  const grupos = agrupar(obras.filter((o) => esta(o.id)), u);
  const fuera = obras.filter((o) => !esta(o.id));

  // Tamaño real del lienzo (el SSR supone 640 px).
  useLayoutEffect(() => {
    const el = cont.current;
    if (!el || !interactivo) return;
    const medir = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setTam({ w: r.width, h: r.height }); };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, [interactivo]);

  function ir(destino: Caja, ms = 650) {
    cancelAnimationFrame(anim.current);
    const inicio = actual.current, t0 = performance.now(), dur = quieto() ? 0 : ms;
    const paso = (ahora: number) => {
      const p = dur ? Math.min(1, (ahora - t0) / dur) : 1, e = suave(p);
      setCaja({ x: inicio.x + (destino.x - inicio.x) * e, y: inicio.y + (destino.y - inicio.y) * e, w: inicio.w + (destino.w - inicio.w) * e, h: inicio.h + (destino.h - inicio.h) * e });
      if (p < 1) anim.current = requestAnimationFrame(paso);
    };
    anim.current = requestAnimationFrame(paso);
  }
  useEffect(() => () => cancelAnimationFrame(anim.current), []);

  // Al filtrar, el mapa encuadra lo que queda; con un país elegido, ese país.
  const firma = `${activo ?? ''}|${obras.filter((o) => esta(o.id)).map((o) => o.id).join(',')}`;
  const primera = useRef(true);
  useEffect(() => {
    if (!interactivo) return;
    if (primera.current && !activo && !visibles) { primera.current = false; return; }
    primera.current = false;
    setVentana((v) => (v && esta(v.id) ? v : null));
    const camino = activo ? svg.current?.querySelector<SVGGraphicsElement>(`path[data-pais="${activo}"]`) : null;
    if (camino) {
      const b = camino.getBBox();
      ir(encuadre([{ x: b.x, y: b.y }, { x: b.x + b.width, y: b.y + b.height }], 30));
    } else if (!visibles || visibles.size === obras.length) ir(COMPLETA);
    else ir(encuadre(obras.filter((o) => esta(o.id))));
  }, [firma]);

  // Rueda: solo con Ctrl/⌘ (la rueda sola sigue bajando la página y muestra la pista).
  useEffect(() => {
    const el = svg.current;
    if (!el || !interactivo) return;
    let tiempo = 0;
    const rueda = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) { setPista(true); clearTimeout(tiempo); tiempo = window.setTimeout(() => setPista(false), 1200); return; }
      e.preventDefault();
      const [cx, cy] = aLienzo(e.clientX, e.clientY);
      ir(acercar(actual.current, e.deltaY > 0 ? 1.35 : 0.74, cx, cy), 300);
    };
    el.addEventListener('wheel', rueda, { passive: false });
    return () => el.removeEventListener('wheel', rueda);
  }, [interactivo, tam]);

  function aLienzo(px: number, py: number): [number, number] {
    const r = svg.current!.getBoundingClientRect();
    const v = llenar(actual.current, r.width / r.height);
    return [v.x + ((px - r.left) / r.width) * v.w, v.y + ((py - r.top) / r.height) * v.h];
  }

  // Arrastre (mouse o lápiz) y pellizco (dos dedos). Un dedo desplaza la página (touch-action: pan-y).
  const punteros = useRef(new Map<number, PointerEvent>());
  const inicio = useRef<{ caja: Caja; punteros: Map<number, PointerEvent> } | null>(null);
  const abajo = (e: PointerEvent) => {
    punteros.current.set(e.pointerId, e);
    inicio.current = { caja: actual.current, punteros: new Map(punteros.current) };
    movio.current = false;
  };
  const mover = (e: PointerEvent) => {
    if (!punteros.current.has(e.pointerId) || !inicio.current) return;
    punteros.current.set(e.pointerId, e);
    const r = svg.current!.getBoundingClientRect();
    const v = llenar(inicio.current.caja, r.width / r.height);
    if (punteros.current.size === 1 && e.pointerType !== 'touch') {
      const p0 = inicio.current.punteros.get(e.pointerId);
      if (!p0) return;
      const dx = e.clientX - p0.clientX, dy = e.clientY - p0.clientY;
      if (!movio.current && Math.hypot(dx, dy) < 4) return;
      if (!movio.current) svg.current!.setPointerCapture(e.pointerId);
      movio.current = true;
      cancelAnimationFrame(anim.current);
      const c = inicio.current.caja;
      setCaja(limitar({ ...c, x: c.x - (dx * v.w) / r.width, y: c.y - (dy * v.h) / r.height }));
    } else if (punteros.current.size === 2) {
      const [a, b] = [...punteros.current.values()], [a0, b0] = [...inicio.current.punteros.values()];
      if (!a0 || !b0) { inicio.current = { caja: actual.current, punteros: new Map(punteros.current) }; return; }
      e.preventDefault();
      movio.current = true;
      cancelAnimationFrame(anim.current);
      const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), d0 = Math.hypot(a0.clientX - b0.clientX, a0.clientY - b0.clientY);
      const cx = v.x + (((a0.clientX + b0.clientX) / 2 - r.left) / r.width) * v.w;
      const cy = v.y + (((a0.clientY + b0.clientY) / 2 - r.top) / r.height) * v.h;
      setCaja(acercar(inicio.current.caja, d0 / Math.max(d, 1), cx, cy));
    }
  };
  const arriba = (e: PointerEvent) => {
    punteros.current.delete(e.pointerId);
    inicio.current = punteros.current.size ? { caja: actual.current, punteros: new Map(punteros.current) } : null;
    setTimeout(() => { movio.current = false; }, 0);
  };

  function abrirGrupo(g: (typeof grupos)[number]) {
    if (movio.current) return;
    if (g.miembros.length === 1) { setVentana(g.miembros[0]); return; }
    ir(encuadre(g.miembros, 40, 200));
  }

  useEffect(() => {
    if (!ventana) return;
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setVentana(null); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [ventana]);

  // Escala gráfica: 80 px redondeados a una distancia "redonda".
  const km = 80 * u * KM_POR_UNIDAD;
  const redondo = RONDOS.reduce((m, n) => (Math.abs(n - km) < Math.abs(m - km) ? n : m));
  const enPx = (x: number, y: number) => ({ x: ((x - vista.x) / vista.w) * tam.w, y: ((y - vista.y) / vista.h) * tam.h });
  // La ventana no se sale del lienzo: se corre hacia dentro y, cerca del borde de arriba, abre hacia abajo.
  const posVentana = ventana && enPx(ventana.x, ventana.y);
  const medio = Math.min(150, tam.w * 0.4);
  const cercano = vista.w < 420;
  const nombre = (g: (typeof grupos)[number]) => g.miembros.length === 1
    ? `${g.miembros[0].titulo}${g.miembros[0].ciudad ? `, ${g.miembros[0].ciudad}` : ''}`
    : `${t(lang, 'grupoMapa').replace('{n}', String(g.miembros.length))}: ${g.miembros.map((m) => m.titulo).join(' · ')}`;

  return (
    <figure className={`mapa-cont${interactivo ? ' mapa-vivo' : ''}`}>
      <div className="mapa-lienzo" ref={cont}>
        <svg ref={svg} viewBox={`${vista.x} ${vista.y} ${vista.w} ${vista.h}`} className="mapa estacas" role="group" aria-label={t(lang, 'mapaProyectos')}
          onPointerDown={interactivo ? abajo : undefined} onPointerMove={interactivo ? mover : undefined}
          onPointerUp={interactivo ? arriba : undefined} onPointerCancel={interactivo ? arriba : undefined}
          onClick={interactivo ? (e) => { if (!movio.current && e.target === svg.current) setVentana(null); } : undefined}>
          <Paises conObra={conObra} activo={activo} alElegir={alElegir} movio={movio} />
          <g className="reticula" aria-hidden="true">
            {RETICULA.meridianos.map((m) => <line key={m.txt} x1={m.v} y1={-ALTO} x2={m.v} y2={ALTO * 2} />)}
            {RETICULA.paralelos.map((p) => <line key={p.txt} x1={-ANCHO} y1={p.v} x2={ANCHO * 2} y2={p.v} />)}
            {RETICULA.meridianos.map((m) => <text key={m.txt} transform={`translate(${m.v + 4 * u} ${vista.y + 14 * u}) scale(${u})`}>{m.txt}</text>)}
            {RETICULA.paralelos.map((p) => <text key={p.txt} transform={`translate(${vista.x + 6 * u} ${p.v - 4 * u}) scale(${u})`}>{p.txt}</text>)}
          </g>
          <g className="mapa-sedes" aria-hidden="true">
            {sedes.map((s) => (
              <g key={s.etiqueta} transform={`translate(${s.x} ${s.y}) scale(${u})`}>
                <rect className="sede" x={-5} y={-5} width={10} height={10}><title>{s.etiqueta}</title></rect>
                {vista.w < 260 && <text className="rotulo-mapa" x={9} y={16}>{s.etiqueta}</text>}
              </g>
            ))}
          </g>
          <g className="mapa-puntos">
            {fuera.map((o) => (
              <g key={o.id} className="punto fuera" transform={`translate(${o.x} ${o.y}) scale(${u})`} aria-hidden="true">
                <g className="estaca"><circle className="uno" r={6} /></g>
              </g>
            ))}
            {grupos.map((g, i) => {
              const n = g.miembros.length;
              const marcado = Boolean(resaltado && g.miembros.some((m) => m.id === resaltado));
              return (
                <g key={g.clave} className={`punto${n > 1 ? ' grupo' : ''}${marcado ? ' resalta' : ''}`} transform={`translate(${g.x} ${g.y}) scale(${u})`}
                  style={`--i:${i}`} role={interactivo ? 'button' : undefined} aria-label={nombre(g)}
                  {...(interactivo ? { tabindex: 0 } : {}) /* en SVG el atributo va en minúscula */}
                  onClick={interactivo ? (e) => { e.stopPropagation(); abrirGrupo(g); } : undefined}
                  onKeyDown={interactivo ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirGrupo(g); } } : undefined}
                  onMouseEnter={alResaltar ? () => alResaltar(g.miembros.map((m) => m.id)) : undefined}
                  onMouseLeave={alResaltar ? () => alResaltar(null) : undefined}>
                  <g className="estaca">
                    {n > 1 ? (
                      <>
                        <circle className="anillo" r={14 + Math.min(n, 6)} />
                        <circle className="cuerpo-grupo" r={11 + Math.min(n, 6)} />
                        <text className="n" y={4}>{n}</text>
                      </>
                    ) : (
                      <>
                        <line x1={0} y1={-22} x2={0} y2={0} />
                        <circle className="anillo" r={10} />
                        <circle className="uno" r={6} />
                      </>
                    )}
                  </g>
                  {n === 1 && cercano && g.miembros[0].ciudad && <text className="rotulo-mapa" x={11} y={4}>{g.miembros[0].ciudad}</text>}
                  {!interactivo && <title>{nombre(g)}</title>}
                </g>
              );
            })}
          </g>
        </svg>

        {interactivo && (
          <>
            <div className="mapa-controles">
              <button type="button" aria-label={t(lang, 'acercar')} disabled={caja.w <= 161} onClick={() => ir(acercar(actual.current, 0.55), 350)}>+</button>
              <button type="button" aria-label={t(lang, 'alejar')} disabled={caja.w >= ANCHO - 1} onClick={() => ir(acercar(actual.current, 1.8), 350)}>−</button>
              <button type="button" aria-label={t(lang, 'verRegion')} onClick={() => ir(COMPLETA)}>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M1 6V1h5M10 1h5v5M15 10v5h-5M6 15H1v-5" fill="none" stroke="currentColor" stroke-width="1.6" /></svg>
              </button>
            </div>
            <div className="mapa-escala voz-datos" aria-hidden="true"><span>{redondo} km</span><i style={`width:${Math.round((80 * redondo) / km)}px`} /></div>
            <p className={`mapa-pista voz-datos${pista ? ' ver' : ''}`} aria-hidden="true">{t(lang, 'pistaRueda')}</p>
            {ventana && (
              <div className={`mapa-ventana${posVentana!.y < 190 ? ' abajo' : ''}`} role="dialog" aria-label={ventana.titulo}
                style={`left:${Math.min(Math.max(posVentana!.x, medio), tam.w - medio)}px;top:${posVentana!.y}px`}>
                <div className="lamina-mini">
                  {ventana.imagen ? (
                    <picture>
                      <source type="image/avif" srcSet={ventana.imagen.avif} sizes="96px" />
                      <img src={ventana.imagen.src} alt="" width={96} height={96} />
                    </picture>
                  ) : <span className="sin-foto" />}
                </div>
                <div className="ventana-cuerpo">
                  <span className="voz-datos ventana-cod">{ventana.codigo} · {ventana.sector}</span>
                  <strong>{ventana.titulo}</strong>
                  {ventana.datos && <small>{ventana.datos}</small>}
                  <a href={ventana.url}>{t(lang, 'verFicha')} →</a>
                </div>
                <button type="button" className="ventana-cerrar" aria-label={t(lang, 'cerrar')} onClick={() => setVentana(null)}>×</button>
              </div>
            )}
          </>
        )}
      </div>
      <figcaption className="mapa-leyenda voz-datos">
        <span className="ley-punto">{t(lang, 'proyectos')}</span>
        {interactivo && <span className="ley-grupo">{t(lang, 'grupoLeyenda')}</span>}
        <span className="ley-sede">{t(lang, 'sedes')}</span>
        {sinUbicacion > 0 && <span className="ley-sin">{t(lang, 'sinUbicacion').replace('{n}', String(sinUbicacion))}</span>}
      </figcaption>
    </figure>
  );
}
