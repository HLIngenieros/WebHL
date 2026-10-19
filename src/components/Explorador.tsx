// Explorador de proyectos (guía §13.2): la única isla del sitio, en Preact (la API de React en ~10 KB).
// Sin JS, el HTML ya trae las tarjetas y el mapa quieto; los filtros solo aparecen con JS. Las tarjetas nunca
// se desmontan: las que no cumplen quedan ocultas y las demás se reacomodan con FLIP (solo transform/opacity).
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
export type OpcionServicio = { valor: string; nombre: string; grupo: 'A' | 'B' | 'C' };
export type Opcion = { valor: string; nombre: string };
/** Resumen de una línea (sector o servicio) para el pod del explorador. */
export type Linea = { codigo: string; nombre: string; texto: string; url: string };

interface Props {
  lang: Lang;
  tarjetas: DatosTarjeta[];
  opciones: { sector: OpcionSector[]; servicio: OpcionServicio[]; pais: Opcion[] };
  grupos: Record<'A' | 'B' | 'C', string>;
  lineas: { sector: Record<string, Linea>; servicio: Record<string, Linea> };
  mapa: { paises: string[]; obras: ObraMapa[]; sedes: { x: number; y: number; etiqueta: string }[] };
  ruta: string;
}

const DIMS: Dim[] = ['servicio', 'sector', 'pais'];
const quieto = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function Explorador({ lang, tarjetas, opciones, grupos, lineas, mapa, ruta }: Props) {
  const [filtros, setFiltros] = useState<Filtros>({});
  const [resaltado, setResaltado] = useState<string | null>(null);
  const lista = useRef<HTMLDivElement>(null);
  const total = useRef<HTMLElement>(null);
  const cota = useRef<HTMLSpanElement>(null);
  const antes = useRef<Map<string, DOMRect> | null>(null);

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
  const pods = [
    filtros.sector && lineas.sector[filtros.sector] && { ...lineas.sector[filtros.sector], dim: 'sectores', tipo: t(lang, 'sector'), ir: t(lang, 'verSector') },
    filtros.servicio && lineas.servicio[filtros.servicio] && { ...lineas.servicio[filtros.servicio], dim: 'servicios', tipo: t(lang, 'servicio'), ir: t(lang, 'verServicio') },
  ].filter(Boolean) as (Linea & { dim: string; tipo: string; ir: string })[];

  return (
    <div className="explorador">
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
          <span className="voz-datos et" id="et-servicio">{t(lang, 'servicio')}</span>
          <div className="grupos-servicio">
            {(['A', 'B', 'C'] as const).map((g) => (
              <div key={g} className="grupo-servicio">
                <span className="burbuja voz-datos" title={grupos[g]} aria-hidden="true">{g}</span>
                {opciones.servicio.filter((o) => o.grupo === g).map((o) => {
                  const n = cServicio.get(o.valor) ?? 0;
                  return boton('servicio', o.valor, <>{o.nombre} <span className="conteo">{n}</span></>, n, 'filtro');
                })}
              </div>
            ))}
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
          {pods.map((p) => (
            <aside key={p.dim} className="pod-linea" data-seccion={p.dim}>
              <span className="voz-datos">{p.codigo} · {p.tipo}</span>
              <strong>{p.nombre}</strong>
              <p>{p.texto}</p>
              <a href={p.url}>{p.ir} →</a>
            </aside>
          ))}
          {cumplen.length === 0 && (
            <div className="sin-resultados">
              <p>{t(lang, 'sinResultados')}</p>
              <button type="button" className="ver-n" onClick={() => cambiar({})}>{t(lang, 'quitarFiltros')}</button>
            </div>
          )}
          <h2 className="sr-only">{t(lang, 'proyectos')}</h2>
          <div className="tarjetas-cont lista-explorador" ref={lista}
            onMouseOver={(e) => { const id = (e.target as Element).closest<HTMLElement>('.tarjeta')?.dataset.id ?? null; if (id !== resaltado) setResaltado(id); }}
            onMouseLeave={() => setResaltado(null)}>
            <div className="tarjetas">
              {/* Sin prioridad: sus fotos competirían con la fuente del LCP */}
              {tarjetas.map((x) => <Tarjeta key={x.id} t={x} lang={lang} oculta={!cumple(x, filtros)} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
