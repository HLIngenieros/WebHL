// Mapa de presencia (especificación §5 y §6): SVG propio con los países de Natural Earth ya proyectados.
// El SVG es decorativo para lectores de pantalla: el control accesible del país es el filtro del
// explorador. Firma de Proyectos: los puntos caen como estacas de topografía al entrar en pantalla.
import { PAISES_GEO } from '../lib/mapa-geo';
import { ANCHO, ALTO, type Punto } from '../lib/mapa';
import { t } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';

interface Props {
  lang: Lang;
  /** ISO-2 en minúscula de los países con obra. */
  paises: string[];
  puntos: Punto[];
  sedes: { x: number; y: number; etiqueta: string }[];
  activo?: string;
  alElegir?: (pais: string) => void;
}

export default function Mapa({ lang, paises, puntos, sedes, activo, alElegir }: Props) {
  const conObra = new Set(paises);
  return (
    <figure className="mapa-cont">
      <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mapa estacas" aria-hidden="true">
        <g className="mapa-paises">
          {PAISES_GEO.map((p) => {
            const obra = conObra.has(p.id);
            return (
              <path
                key={p.id}
                d={p.d}
                data-pais={p.id}
                className={['pais', obra && 'con-obra', obra && alElegir && 'elegible', activo === p.id && 'activo'].filter(Boolean).join(' ')}
                onClick={obra && alElegir ? () => alElegir(p.id) : undefined}
              />
            );
          })}
        </g>
        <g className="mapa-sedes">
          {sedes.map((s) => (
            <rect key={s.etiqueta} className="sede" x={s.x - 5} y={s.y - 5} width={10} height={10}><title>{s.etiqueta}</title></rect>
          ))}
        </g>
        <g className="mapa-puntos">
          {puntos.map((p, i) => (
            <g key={`${p.x}-${p.y}`} className="punto" transform={`translate(${p.x} ${p.y})`}>
              <g className="estaca" style={{ '--i': i } as React.CSSProperties}>
                <line x1={0} y1={-26} x2={0} y2={0} />
                <circle r={p.n > 1 ? 9 : 5} />
                {p.n > 1 && <text y={4}>{p.n}</text>}
              </g>
              <title>{p.etiqueta}</title>
            </g>
          ))}
        </g>
      </svg>
      <figcaption className="mapa-leyenda voz-datos">
        <span className="ley-punto">{t(lang, 'proyectos')}</span>
        <span className="ley-sede">{t(lang, 'sedes')}</span>
      </figcaption>
    </figure>
  );
}
