// Tablero de vacantes de Trabaje con nosotros (maqueta aprobada 20-oct). Lee /api/vacantes.json al abrir:
// en producción lo publica Power Automate desde SharePoint, así el sitio no se recompila por cada vacante.
// Conteo en tablero de aeropuerto, filtros en placas con reacomodo (FLIP), órdenes de trabajo que se
// despliegan y "Postularme", que entrega la vacante al formulario F-03 (evento `hl:postular`).
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '../i18n/rutas';
import './vacantes.css';

export interface Vacante {
  id: string; titulo: string; area: string; sede: string; pais: string; modalidad: string; contrato: string;
  publicada: string; cierre: string; resumen: string; requisitos: string[];
}

const T = {
  es: {
    abiertas: 'Vacantes abiertas', abierta: 'Vacante abierta', vivo: 'Actualizado por Talento Humano', area: 'Área', sede: 'Sede', todas: 'Todas',
    nueva: 'Nueva', hace: (d: number) => (d === 0 ? 'Publicada hoy' : d === 1 ? 'Publicada ayer' : `Publicada hace ${d} días`),
    cierra: 'Cierra', en: (d: number) => (d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`), laVacante: 'La vacante', requisitos: 'Requisitos',
    postular: 'Postularme a esta vacante', copiar: 'Copiar enlace', copiado: 'Enlace copiado ✓',
    vacioFiltro: 'Sin vacantes con este filtro', vacio: 'Hoy no hay vacantes abiertas', vacioTxt: 'Déjenos su hoja de vida abajo: la tendremos en cuenta en las próximas convocatorias.',
    cargando: 'Cargando vacantes…', sinJs: 'Las vacantes se muestran con JavaScript activo. Puede dejar su hoja de vida en el formulario.',
  },
  en: {
    abiertas: 'Open positions', abierta: 'Open position', vivo: 'Updated by HR', area: 'Area', sede: 'Location', todas: 'All',
    nueva: 'New', hace: (d: number) => (d === 0 ? 'Posted today' : d === 1 ? 'Posted yesterday' : `Posted ${d} days ago`),
    cierra: 'Closes', en: (d: number) => (d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days`), laVacante: 'The role', requisitos: 'Requirements',
    postular: 'Apply for this position', copiar: 'Copy link', copiado: 'Link copied ✓',
    vacioFiltro: 'No positions match this filter', vacio: 'No open positions today', vacioTxt: 'Leave your résumé below: we will consider it for upcoming openings.',
    cargando: 'Loading positions…', sinJs: 'Positions are shown with JavaScript enabled. You can leave your résumé in the form.',
  },
};

const DIA = 864e5;
const fecha = (iso: string) => new Date(`${iso}T00:00:00`);
const dias = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DIA);
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const valida = (v: Partial<Vacante>): v is Vacante =>
  !!(v && v.id && v.titulo && v.publicada && v.cierre && !isNaN(fecha(v.cierre).getTime())) && Array.isArray(v.requisitos ?? []);

export default function Vacantes({ lang, fuente }: { lang: Lang; fuente: string }) {
  const t = T[lang];
  const [lista, setLista] = useState<Vacante[] | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [sede, setSede] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [copiada, setCopiada] = useState<string | null>(null);
  const nodos = useRef(new Map<string, HTMLLIElement>());
  const antes = useRef(new Map<string, number>());

  useEffect(() => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    fetch(fuente, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => [])
      .then((xs: Partial<Vacante>[]) => {
        const vigentes = (Array.isArray(xs) ? xs : []).filter(valida).map((v) => ({ ...v, requisitos: v.requisitos ?? [] }))
          .filter((v) => dias(hoy, fecha(v.cierre)) >= 0)
          .sort((a, b) => b.publicada.localeCompare(a.publicada));
        setLista(vigentes);
        const pedida = new URLSearchParams(location.search).get('vacante');
        if (pedida && vigentes.some((v) => v.id === pedida)) {
          setAbierta(pedida);
          requestAnimationFrame(() => nodos.current.get(pedida)?.scrollIntoView({ behavior: quieto() ? 'auto' : 'smooth', block: 'center' }));
        }
      });
  }, []);

  // FLIP: antes de filtrar se guarda la posición; después, cada tarjeta que sigue viaja desde allí.
  const filtrar = (fn: () => void) => {
    antes.current = new Map([...nodos.current].map(([id, el]) => [id, el.getBoundingClientRect().top]));
    fn();
  };
  useLayoutEffect(() => {
    if (quieto() || !antes.current.size) return;
    const ms = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--t-izaje')) * 1000 || 600;
    for (const [id, el] of nodos.current) {
      const t0 = antes.current.get(id);
      const d = t0 === undefined ? 0 : t0 - el.getBoundingClientRect().top;
      if (d) el.animate([{ transform: `translateY(${d}px)` }, { transform: 'none' }], { duration: ms, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    antes.current.clear();
  }, [area, sede]);

  if (lista === null) return (
    <div class="vc vc-cargando" aria-busy="true">
      <Tablero n={null} t={t} />
      <noscript><p class="vc-vacio">{t.sinJs}</p></noscript>
      <ul class="vc-lista" aria-hidden="true">{[0, 1, 2].map((i) => <li key={i} class="vc-fantasma" />)}</ul>
      <p class="vc-sr">{t.cargando}</p>
    </div>
  );

  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const visibles = lista.filter((v) => (!area || v.area === area) && (!sede || v.sede === sede));
  const placas = (campo: 'area' | 'sede', valor: string | null, poner: (x: string | null) => void) => {
    const opciones = [...new Set(lista.map((v) => v[campo]))];
    return [null, ...opciones].map((o) => (
      <button key={o ?? '*'} type="button" class="vc-placa" aria-pressed={valor === o} onClick={() => filtrar(() => poner(o))}>
        <span>{o ?? t.todas}<em>{o ? lista.filter((v) => v[campo] === o).length : lista.length}</em></span>
      </button>
    ));
  };
  const copiar = (id: string) => {
    const url = `${location.origin}${location.pathname}?vacante=${encodeURIComponent(id)}`;
    navigator.clipboard?.writeText(url).then(() => { setCopiada(id); setTimeout(() => setCopiada(null), 1600); });
  };
  const postular = (v: Vacante) => {
    dispatchEvent(new CustomEvent('hl:postular', { detail: { id: v.id, titulo: v.titulo, sede: v.sede } }));
    document.getElementById('formulario')?.scrollIntoView({ behavior: quieto() ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div class="vc">
      <Tablero n={visibles.length} t={t} />
      {lista.length > 0 && (
        <div class="vc-filtros voz-datos">
          <div class="vc-grupo" role="group" aria-label={t.area}><span>{t.area}</span>{placas('area', area, setArea)}</div>
          <div class="vc-grupo" role="group" aria-label={t.sede}><span>{t.sede}</span>{placas('sede', sede, setSede)}</div>
        </div>
      )}
      <ul class="vc-lista">
        {visibles.map((v, i) => {
          const total = Math.max(dias(fecha(v.publicada), fecha(v.cierre)), 1);
          const quedan = dias(hoy, fecha(v.cierre));
          const hace = Math.max(dias(fecha(v.publicada), hoy), 0);
          const abre = abierta === v.id;
          return (
            <li key={v.id} ref={(el) => { if (el) nodos.current.set(v.id, el); else nodos.current.delete(v.id); }} class={`vc-vac${abre ? ' vc-abierta' : ''}`} style={`--i:${i}`}>
              <button type="button" class="vc-fila" aria-expanded={abre} aria-controls={`vc-${v.id}`} onClick={() => setAbierta(abre ? null : v.id)}>
                <span class="vc-burbuja voz-datos" aria-hidden="true">{v.id.replace(/^\D+-?/, '')}</span>
                <span class="vc-titulo">
                  <strong>{v.titulo}{hace <= 7 && <span class="vc-nueva voz-datos"><i aria-hidden="true" />{t.nueva}</span>}</strong>
                  <span class="vc-chips voz-datos"><span>{v.area}</span><span>{v.sede}</span><span>{v.modalidad}</span><span>{v.contrato}</span></span>
                </span>
                <span class="vc-der">
                  <span class="voz-datos vc-hace">{t.hace(hace)} <span class="vc-flecha" aria-hidden="true">›</span></span>
                  <span class="vc-cierre">
                    <span class={`vc-barra${quedan <= 7 ? ' vc-urge' : ''}`} aria-hidden="true"><i style={`transform:scaleX(${Math.max(Math.min(quedan / total, 1), 0.04)})`} /></span>
                    <span class="voz-datos"><span>{t.cierra}</span><span>{t.en(quedan)}</span></span>
                  </span>
                </span>
              </button>
              <div class="vc-detalle" id={`vc-${v.id}`} role="region" aria-label={v.titulo} inert={!abre}>
                <div><div class="vc-cuerpo">
                  <div><h3 class="voz-datos">{t.laVacante}</h3><p>{v.resumen}</p></div>
                  <div><h3 class="voz-datos">{t.requisitos}</h3>
                    <ul class="vc-req">{v.requisitos.map((r, j) => <li key={r} style={`--j:${j}`}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8l4 4 8-8" /></svg>{r}</li>)}</ul>
                  </div>
                  <div class="vc-acciones">
                    <button type="button" class="fm-btn fm-primario" onClick={() => postular(v)}>{t.postular}</button>
                    <button type="button" class="fm-btn" onClick={() => copiar(v.id)}>{copiada === v.id ? t.copiado : t.copiar}</button>
                  </div>
                </div></div>
              </div>
            </li>
          );
        })}
      </ul>
      {visibles.length === 0 && (
        <div class="vc-vacio" role="status"><p class="voz-datos">{lista.length ? t.vacioFiltro : t.vacio}</p><p>{t.vacioTxt}</p></div>
      )}
    </div>
  );
}

/** Conteo en tablero de aeropuerto: cada dígito rueda y se asienta de izquierda a derecha. */
function Tablero({ n, t }: { n: number | null; t: (typeof T)['es'] }) {
  const objetivo = n === null ? '--' : String(n).padStart(2, '0');
  const [vista, setVista] = useState(n === null ? '--' : '00');
  useEffect(() => {
    if (n === null) return;
    if (quieto()) return setVista(objetivo);
    let paso = 0;
    const id = setInterval(() => {
      paso++;
      setVista([...objetivo].map((ch, i) => (paso > 6 + i * 4 ? ch : String(Math.floor(Math.random() * 10)))).join(''));
      if (paso > 6 + objetivo.length * 4) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [objetivo]);
  return (
    <div class="vc-tablero">
      <div class="vc-flap" aria-hidden="true">{[...vista].map((ch, i) => <b key={`${i}${ch}`}>{ch}</b>)}</div>
      <div>
        <p class="voz-datos">{n === 1 ? t.abierta : t.abiertas}<span class="vc-sr" aria-live="polite">{n === null ? '' : `: ${n}`}</span></p>
        <p class="voz-datos vc-vivo"><i aria-hidden="true" />{t.vivo}</p>
      </div>
    </div>
  );
}
