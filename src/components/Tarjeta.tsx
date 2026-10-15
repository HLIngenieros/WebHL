// Tarjeta de proyecto (guía §7): lámina 4:3, pod con el código, título, una cifra y datos clave.
// Toda la tarjeta es clicable por el enlace estirado del título. Lleva el acento de Proyectos aunque
// aparezca en una página de servicio o sector.
import Lamina from './Lamina';
import { t } from '../i18n/ui';
import type { Lang } from '../i18n/rutas';
import type { DatosTarjeta } from '../lib/explorador';

interface Props { t: DatosTarjeta; lang: Lang; prioridad?: boolean; oculta?: boolean }

const SIZES = '(min-width: 1600px) 340px, (min-width: 1100px) 360px, (min-width: 640px) 50vw, 100vw';

export default function Tarjeta({ t: d, lang, prioridad = false, oculta = false }: Props) {
  const datos = [
    [t(lang, 'cliente'), d.cliente],
    [t(lang, 'ubicacion'), d.lugar],
    [t(lang, 'periodo'), d.periodo],
  ].filter((x): x is [string, string] => Boolean(x[1]));
  return (
    <article className="tarjeta con-lamina" data-seccion="proyectos" data-id={d.id} hidden={oculta || undefined}>
      {/* Sin título: la ilustración es decorativa y el H3 ya nombra el proyecto */}
      <Lamina imagen={d.imagen} sector={d.sector.id} sizes={SIZES} prioridad={prioridad} />
      <div className="tarjeta-cuerpo">
        <span className="pod-rotulo voz-datos"><span className="pod-cod">{d.codigo}</span><span className="pod-nom">{d.sector.nombre}</span></span>
        <h3 className="tarjeta-titulo"><a href={d.url}>{d.titulo}</a></h3>
        {d.cifra && (
          <p className="tarjeta-cifra"><span className="cifra">{d.cifra.valor}</span> <span className="voz-datos">{d.cifra.etiqueta}</span></p>
        )}
        {datos.length > 0 && (
          <dl className="tarjeta-datos">
            {datos.map(([k, v]) => <div key={k}><dt className="voz-datos">{k}</dt><dd>{v}</dd></div>)}
          </dl>
        )}
      </div>
    </article>
  );
}
