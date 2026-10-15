// Explorador de proyectos (especificación §5): la única isla del sitio, en Preact (la API de React en ~10 KB).
// Sin JS, el HTML ya trae las 22 tarjetas y el mapa; los filtros solo aparecen con JS. Las tarjetas nunca se desmontan: las que
// no cumplen quedan ocultas y las demás se reacomodan con FLIP (Web Animations, solo transform/opacity).
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import Tarjeta from './Tarjeta';
import Mapa from './Mapa';
import { conteos, cumple, escribirFiltros, leerFiltros, type DatosTarjeta, type Filtros } from '../lib/explorador';
import type { Punto } from '../lib/mapa';
import { t, tn } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';

type Opcion = { valor: string; nombre: string };
type Dim = keyof Filtros;

interface Props {
  lang: Lang;
  tarjetas: DatosTarjeta[];
  opciones: Record<Dim, Opcion[]>;
  mapa: { paises: string[]; puntos: Punto[]; sedes: { x: number; y: number; etiqueta: string }[] };
}

const DIMS: Dim[] = ['servicio', 'sector', 'pais'];
const ETIQUETA: Record<Dim, 'servicio' | 'sector' | 'pais'> = { servicio: 'servicio', sector: 'sector', pais: 'pais' };
const quieto = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Explorador({ lang, tarjetas, opciones, mapa }: Props) {
  const [filtros, setFiltros] = useState<Filtros>({});
  const [hoja, setHoja] = useState(false);
  const lista = useRef<HTMLDivElement>(null);
  const dialogo = useRef<HTMLDialogElement>(null);
  const antes = useRef<Map<string, DOMRect> | null>(null);

  const validos = useMemo(
    () => Object.fromEntries(DIMS.map((d) => [d, new Set(opciones[d].map((o) => o.valor))])) as Record<Dim, Set<string>>,
    [opciones],
  );
  const cumplen = tarjetas.filter((x) => cumple(x, filtros));
  const activos = DIMS.filter((d) => filtros[d]).length;

  // Al hidratar, la URL manda (enlaces desde servicios y sectores, o una URL compartida).
  useEffect(() => { setFiltros(leerFiltros(location.search, validos)); }, [validos]);

  function cambiar(nuevos: Filtros) {
    // FLIP, primer paso: dónde estaba cada tarjeta visible antes del cambio.
    antes.current = new Map(
      [...(lista.current?.querySelectorAll<HTMLElement>('.tarjeta:not([hidden])') ?? [])].map((el) => [el.dataset.id!, el.getBoundingClientRect()]),
    );
    setFiltros(nuevos);
    history.replaceState(history.state, '', location.pathname + escribirFiltros(nuevos));
  }
  const alternar = (d: Dim, v?: string) => cambiar({ ...filtros, [d]: v && filtros[d] !== v ? v : undefined });

  // FLIP, segundo paso: cada tarjeta parte de donde estaba y llega a su sitio; las nuevas suben (Izaje).
  useLayoutEffect(() => {
    const previas = antes.current;
    antes.current = null;
    if (!previas || quieto()) return;
    for (const el of lista.current?.querySelectorAll<HTMLElement>('.tarjeta:not([hidden])') ?? []) {
      const r = el.getBoundingClientRect();
      const p = previas.get(el.dataset.id!);
      const opciones = { duration: 450, easing: 'cubic-bezier(.2, .8, .2, 1)' };
      if (p) {
        const dx = p.left - r.left, dy = p.top - r.top;
        if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], opciones);
      } else {
        el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], opciones);
      }
    }
  }, [filtros]);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (hoja && !d.open) d.showModal();
    if (!hoja && d.open) d.close();
  }, [hoja]);

  const panel = (
    <div className="panel-filtros">
      {DIMS.map((d) => {
        const c = conteos(tarjetas, filtros, d);
        return (
          <fieldset key={d} data-dim={d} className="grupo-filtro">
            <legend className="voz-datos">{t(lang, ETIQUETA[d])}</legend>
            <div className="opciones">
              <button type="button" className="filtro" aria-pressed={!filtros[d]} onClick={() => alternar(d)}>{t(lang, 'todos')}</button>
              {opciones[d].map((o) => {
                const n = c.get(o.valor) ?? 0;
                const activo = filtros[d] === o.valor;
                return (
                  <button key={o.valor} type="button" className="filtro" data-valor={o.valor} aria-pressed={activo} disabled={!n && !activo} onClick={() => alternar(d, o.valor)}>
                    {o.nombre} <span className="conteo">{n}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <div className="explorador">
      <div className="explorador-cab">
        <Mapa lang={lang} paises={mapa.paises} puntos={mapa.puntos} sedes={mapa.sedes} activo={filtros.pais} alElegir={(p) => alternar('pais', p)} />
        <div className="filtros-inline">
          <p className="voz-datos filtros-titulo">{t(lang, 'filtros')}</p>
          {panel}
        </div>
      </div>

      <div className="explorador-barra">
        <p className="contador voz-datos" aria-live="polite">{tn(lang, 'nProyectos', cumplen.length)}</p>
        <button type="button" className="abrir-filtros voz-datos" onClick={() => setHoja(true)}>
          {t(lang, 'filtrar')}{activos > 0 && ` (${activos})`}
        </button>
        {activos > 0 && <button type="button" className="quitar voz-datos" onClick={() => cambiar({})}>{t(lang, 'quitarFiltros')}</button>}
      </div>

      <dialog ref={dialogo} className="hoja-filtros" aria-label={t(lang, 'filtros')} onClose={() => setHoja(false)}>
        {hoja && (
          <>
            {panel}
            <button type="button" className="ver-n" onClick={() => setHoja(false)}>{t(lang, 'verN').replace('{n}', String(cumplen.length))}</button>
          </>
        )}
      </dialog>

      {cumplen.length === 0 && (
        <div className="sin-resultados">
          <p>{t(lang, 'sinResultados')}</p>
          <button type="button" className="ver-n" onClick={() => cambiar({})}>{t(lang, 'quitarFiltros')}</button>
        </div>
      )}

      <h2 className="sr-only">{t(lang, 'proyectos')}</h2>
      <div className="tarjetas-cont" ref={lista}>
        <div className="tarjetas">
          {/* Sin prioridad: las tarjetas quedan bajo el mapa y sus fotos competirían con la fuente del LCP */}
          {tarjetas.map((x) => <Tarjeta key={x.id} t={x} lang={lang} oculta={!cumple(x, filtros)} />)}
        </div>
      </div>
    </div>
  );
}
