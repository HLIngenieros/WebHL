// Explorador de proyectos (guía v2.0 §8): isla en Preact (la API de React en ~10 KB). Sin JS, el HTML ya trae
// las tarjetas y el mapa quieto; los filtros solo aparecen con JS. Las tarjetas nunca se desmontan: las que no
// cumplen quedan ocultas y las demás se reacomodan con FLIP (solo transform/opacity).
// Ficha 3.1 como panel: al abrir una tarjeta o un punto del mapa se trae el <article> de la página de la
// ficha (ya compilada) y sube en un <dialog>; Escape, el botón o el fondo lo cierran y el foco vuelve a la
// tarjeta. La URL pasa a la de la ficha con replaceState (el ClientRouter maneja el historial) y vuelve al cerrar.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import Tarjeta from './Tarjeta';
import Mapa, { type ObraMapa } from './Mapa';
import Ilustracion from './Ilustracion';
import { conteos, cumple, escribirFiltros, leerFiltros, type DatosTarjeta, type Filtros } from '../lib/explorador';
import { t, tn } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';

type Dim = keyof Filtros;
export type OpcionSector = { valor: string; nombre: string; id: string; principal: boolean };
export type Opcion = { valor: string; nombre: string };

interface Props {
  lang: Lang;
  tarjetas: DatosTarjeta[];
  opciones: { sector: OpcionSector[]; servicio: Opcion[]; pais: Opcion[] };
  mapa: { paises: string[]; obras: ObraMapa[]; sedes: { x: number; y: number; etiqueta: string }[] };
  ruta: string;
}

const DIMS: Dim[] = ['servicio', 'sector', 'pais'];
const quieto = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

const IZAJE = 'cubic-bezier(.2, .8, .2, 1)';
type Ficha = { articulo: Element; titulo: string } | null;

export default function Explorador({ lang, tarjetas, opciones, mapa, ruta }: Props) {
  const [filtros, setFiltros] = useState<Filtros>({});
  const [resaltado, setResaltado] = useState<string | null>(null);
  const lista = useRef<HTMLDivElement>(null);
  const total = useRef<HTMLElement>(null);
  const cota = useRef<HTMLSpanElement>(null);
  const antes = useRef<Map<string, DOMRect> | null>(null);
  const panel = useRef<HTMLDialogElement>(null);
  const cuerpo = useRef<HTMLDivElement>(null);
  const origen = useRef<HTMLElement | null>(null);
  const volver = useRef({ url: '', titulo: '' });
  const fichas = useRef(new Map<string, Promise<Ficha>>());
  const urls = useMemo(() => new Set(tarjetas.map((x) => x.url)), [tarjetas]);

  const validos = useMemo(
    () => Object.fromEntries(DIMS.map((d) => [d, new Set(opciones[d].map((o) => o.valor))])) as Record<Dim, Set<string>>,
    [opciones],
  );
  const cumplen = tarjetas.filter((x) => cumple(x, filtros));
  const activos = DIMS.filter((d) => filtros[d]).length;
  const visibles = useMemo(() => (activos ? new Set(cumplen.map((x) => x.id)) : undefined), [filtros]);
  const sinUbicacion = tarjetas.filter((x) => !x.coordenadas).length;

  // Al hidratar, la URL manda (enlaces desde el menú, servicios y sectores, o una URL compartida).
  useEffect(() => { setFiltros(leerFiltros(location.search, validos)); }, [validos]);

  function cambiar(nuevos: Filtros) {
    // FLIP, primer paso: dónde estaba cada tarjeta visible antes del cambio.
    antes.current = new Map(
      [...(lista.current?.querySelectorAll<HTMLElement>('.tarjeta:not([hidden])') ?? [])].map((el) => [el.dataset.id!, el.getBoundingClientRect()]),
    );
    setFiltros(nuevos);
    history.replaceState(history.state, '', location.pathname + escribirFiltros(nuevos));
  }
  const alternar = (d: Dim, v: string) => cambiar({ ...filtros, [d]: filtros[d] !== v ? v : undefined });

  // ── Ficha 3.1 en panel ──
  const traer = (url: string): Promise<Ficha> => {
    let f = fichas.current.get(url);
    if (!f) {
      f = fetch(url)
        .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
        .then((html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const articulo = doc.querySelector('article.ficha');
          return articulo ? { articulo, titulo: doc.title } : null;
        })
        .catch(() => { fichas.current.delete(url); return null; });
      fichas.current.set(url, f);
    }
    return f;
  };

  async function abrir(url: string, desde: HTMLElement) {
    const ficha = await traer(url);
    const d = panel.current;
    if (!ficha || !d || !cuerpo.current) { location.assign(url); return; }
    origen.current = desde;
    volver.current = { url: location.pathname + location.search, titulo: document.title };
    cuerpo.current.replaceChildren(document.importNode(ficha.articulo, true));
    d.showModal();
    d.scrollTop = 0;
    history.replaceState(history.state, '', url);
    document.title = ficha.titulo;
    if (!quieto()) {
      d.animate([{ transform: 'translateY(48px)', clipPath: 'inset(100% 0 0 0)' }, { transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 600, easing: IZAJE });
    }
    // Lo que se revela al entrar (cotas de las cantidades, izajes) se observa dentro del panel.
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { root: d });
    cuerpo.current.querySelectorAll('.izaje, .cota, .trazo, .revela').forEach((el) => io.observe(el));
  }

  function cerrar() {
    const d = panel.current;
    if (!d?.open) return;
    if (quieto()) { d.close(); return; }
    d.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(32px)' }], { duration: 240, easing: 'ease-in' }).onfinish = () => d.close();
  }

  // Al cerrarse (también con Escape): URL y título del explorador, y el foco vuelve a la tarjeta.
  function alCerrar() {
    history.replaceState(history.state, '', volver.current.url);
    document.title = volver.current.titulo;
    cuerpo.current?.replaceChildren();
    origen.current?.focus();
  }

  function alClic(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest?.('a');
    const href = a?.getAttribute('href');
    if (!a || !href) return;
    if (urls.has(href)) { e.preventDefault(); abrir(href, a); return; }
    // Desde el panel, el enlace del sector filtra el explorador en vez de recargarlo.
    if (panel.current?.contains(a) && a.pathname === ruta) {
      e.preventDefault();
      const nuevos = leerFiltros(a.search, validos);
      volver.current.url = ruta + escribirFiltros(nuevos);
      cerrar();
      setFiltros(nuevos);
    }
  }
  // La ficha se descarga al pasar por la tarjeta o al enfocarla.
  const anticipar = (e: Event) => {
    const href = (e.target as Element).closest?.('.tarjeta')?.querySelector('a')?.getAttribute('href');
    if (href && urls.has(href)) traer(href);
  };

  // FLIP, segundo paso; además el total se mide con su cota (guía §13.2).
  useLayoutEffect(() => {
    const previas = antes.current;
    antes.current = null;
    if (!previas || quieto()) return;
    const opc = { duration: 450, easing: 'cubic-bezier(.2, .8, .2, 1)' };
    for (const el of lista.current?.querySelectorAll<HTMLElement>('.tarjeta:not([hidden])') ?? []) {
      const r = el.getBoundingClientRect();
      const p = previas.get(el.dataset.id!);
      if (p) {
        const dx = p.left - r.left, dy = p.top - r.top;
        if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], opc);
      } else {
        el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], opc);
      }
    }
    cota.current?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 600, easing: 'cubic-bezier(.6, 0, .2, 1)' });
    total.current?.animate([{ opacity: 0.2, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], opc);
  }, [filtros]);

  // Pasar por una tarjeta resalta su punto; pasar por un punto resalta sus tarjetas.
  const marcarTarjetas = (ids: string[] | null) => {
    lista.current?.querySelectorAll('.tarjeta.resalta').forEach((el) => el.classList.remove('resalta'));
    for (const id of ids ?? []) lista.current?.querySelector(`.tarjeta[data-id="${id}"]`)?.classList.add('resalta');
  };

  const boton = (d: Dim, valor: string, contenido: ComponentChildren, n: number, clase: string) => {
    const activo = filtros[d] === valor;
    return (
      <button key={valor} type="button" className={clase} data-valor={valor} aria-pressed={activo} disabled={!n && !activo} onClick={() => alternar(d, valor)}>
        {contenido}
      </button>
    );
  };
  const cSector = conteos(tarjetas, filtros, 'sector');
  const cServicio = conteos(tarjetas, filtros, 'servicio');
  const cPais = conteos(tarjetas, filtros, 'pais');

  return (
    <div className="explorador" onClick={alClic}>
      <div className="filtros-explorador">
        <div className="fila-filtro" data-dim="sector" role="group" aria-labelledby="et-sector">
          <span className="voz-datos et" id="et-sector">{t(lang, 'sector')}</span>
          <div className="placas">
            {opciones.sector.map((o) => {
              const n = cSector.get(o.valor) ?? 0;
              return boton('sector', o.valor, (
                <>
                  <span className="placa-txt"><span className="placa-nom">{o.nombre}</span><span className="voz-datos placa-n">{tn(lang, 'nProyectos', n)}</span></span>
                  {o.principal && <span className="placa-dib" aria-hidden="true"><Ilustracion sector={o.id} /></span>}
                </>
              ), n, `placa${o.principal ? ' mayor' : ''}`);
            })}
          </div>
        </div>
        <div className="fila-filtro" data-dim="servicio" role="group" aria-labelledby="et-servicio">
          <span className="voz-datos et" id="et-servicio">{t(lang, 'especialidad')}</span>
          <div className="especialidades">
            {opciones.servicio.map((o) => {
              const n = cServicio.get(o.valor) ?? 0;
              return boton('servicio', o.valor, <>{o.nombre} <span className="conteo">{n}</span></>, n, 'filtro');
            })}
          </div>
        </div>
      </div>

      <div className="estado-explorador">
        <p className="contador" aria-live="polite"><b ref={total}>{cumplen.length}</b> <span className="voz-datos">{tn(lang, 'nProyectos', cumplen.length).replace(String(cumplen.length), '').trim()}</span></p>
        <span className="cota-estado" ref={cota} aria-hidden="true" />
        <span className="voz-datos url-estado" aria-hidden="true">{ruta}{escribirFiltros(filtros)}</span>
        {activos > 0 && <button type="button" className="quitar voz-datos" onClick={() => cambiar({})}>{t(lang, 'quitarFiltros')} ×</button>}
      </div>

      <div className="escena-explorador">
        <div className="lado-mapa">
          <Mapa lang={lang} paises={mapa.paises} obras={mapa.obras} sedes={mapa.sedes} visibles={visibles} activo={filtros.pais}
            alElegir={(p) => alternar('pais', p)} resaltado={resaltado} alResaltar={marcarTarjetas} sinUbicacion={sinUbicacion} />
          <div className="fila-filtro paises" data-dim="pais" role="group" aria-labelledby="et-pais">
            <span className="voz-datos et" id="et-pais">{t(lang, 'pais')}</span>
            {opciones.pais.map((o) => {
              const n = cPais.get(o.valor) ?? 0;
              return boton('pais', o.valor, <>{o.nombre} <span className="conteo">{n}</span></>, n, 'filtro');
            })}
          </div>
        </div>

        <div className="lado-lista">
          {cumplen.length === 0 && (
            <div className="sin-resultados">
              <p>{t(lang, 'sinResultados')}</p>
              <button type="button" className="ver-n" onClick={() => cambiar({})}>{t(lang, 'quitarFiltros')}</button>
            </div>
          )}
          <h2 className="sr-only">{t(lang, 'proyectos')}</h2>
          <div className="tarjetas-cont lista-explorador" ref={lista}
            onFocusIn={anticipar}
            onMouseOver={(e) => { anticipar(e); const id = (e.target as Element).closest<HTMLElement>('.tarjeta')?.dataset.id ?? null; if (id !== resaltado) setResaltado(id); }}
            onMouseLeave={() => setResaltado(null)}>
            <div className="tarjetas">
              {/* Sin prioridad: sus fotos competirían con la fuente del LCP */}
              {tarjetas.map((x) => <Tarjeta key={x.id} t={x} lang={lang} oculta={!cumple(x, filtros)} />)}
            </div>
          </div>
        </div>
      </div>

      <dialog ref={panel} className="panel-ficha" aria-label={t(lang, 'fichaProyecto')}
        onClose={alCerrar}
        onCancel={(e) => { e.preventDefault(); cerrar(); }}
        onClick={(e) => { if (e.target === panel.current) cerrar(); }}>
        <div className="panel-barra">
          <button type="button" className="panel-cerrar voz-datos" onClick={cerrar}>{t(lang, 'cerrar')} <span aria-hidden="true">×</span></button>
        </div>
        <div ref={cuerpo} />
      </dialog>
    </div>
  );
}
