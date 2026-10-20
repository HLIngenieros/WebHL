// Formulario por intención (F4, maqueta aprobada 20-oct): un plano en hojas con burbujas de eje, cota de
// avance, izaje entre hojas, validación al salir de cada campo y sello de radicado. Sin JavaScript se
// renderiza como formulario HTML normal (todas las hojas a la vista) que envía al PHP igual.
import { useEffect, useRef, useState } from 'preact/hooks';
import { FORMULARIOS, TEXTOS, MENSAJE_MIN, MENSAJE_MAX, CV_MAX, type Campo, type Intencion } from '../lib/formularios';
import type { Lang } from '../i18n/rutas';
import './formulario.css';

interface Props {
  lang: Lang;
  accion: string;
  politica: string;
  /** null: la primera hoja pide el motivo (Contacto). */
  inicial: Intencion | null;
  buzones: Record<Intencion, string>;
  enlaces: Record<Intencion, string>;
  opciones: { pais: [string, string][]; servicio: string[]; sector: string[] };
}

type Estado = 'editando' | 'enviando' | 'ok' | 'error';
const CORREO = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function Formulario({ lang, accion, politica, inicial, buzones, enlaces, opciones }: Props) {
  const tx = TEXTOS[lang];
  const elegir = inicial === null;
  const [js, setJs] = useState(false);
  const [int, setInt] = useState<Intencion | null>(inicial);
  const [paso, setPaso] = useState(0);
  const [atras, setAtras] = useState(false);
  const [anon, setAnon] = useState(false);
  const [val, setVal] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string | null>>({});
  const [ley, setLey] = useState(false);
  const [estado, setEstado] = useState<Estado>('editando');
  const [radicado, setRadicado] = useState('');
  const [vacante, setVacante] = useState<{ id: string; titulo: string; sede: string } | null>(null);
  const archivo = useRef<File | null>(null);
  const trampa = useRef<HTMLInputElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const desde = useRef(0);
  const movido = useRef(false);

  useEffect(() => { setJs(true); desde.current = Math.floor(Date.now() / 1000); }, []);
  // "Postularme" en el tablero de vacantes (Vacantes.tsx) entrega aquí la vacante elegida.
  useEffect(() => {
    if (inicial !== 'empleo') return;
    const tomar = (e: Event) => { setVacante((e as CustomEvent).detail); setEstado((s) => (s === 'ok' ? 'editando' : s)); };
    addEventListener('hl:postular', tomar);
    return () => removeEventListener('hl:postular', tomar);
  }, []);
  useEffect(() => { if (movido.current) titulo.current?.focus(); movido.current = true; }, [paso, estado]);

  const def = FORMULARIOS.find((f) => f.id === (int ?? 'cotizacion'))!;
  const pasos = [...(elegir ? [tx.motivo] : []), tx.datos, tx.mensaje, tx.envio];
  const hoja = (elegir ? ['motivo'] : []).concat(['datos', 'mensaje', 'envio'])[paso];
  const visibles = def.campos.filter((c) => !(anon && c.identifica));
  const requerido = (c: Campo) => !c.opcional && !(anon && c.identifica);

  function revisar(c: Campo | 'mensaje', v = c === 'mensaje' ? val.mensaje ?? '' : val[c.id] ?? ''): string | null {
    if (c === 'mensaje') return v.trim().length >= MENSAJE_MIN ? null : `${tx.escriba} ${MENSAJE_MIN} ${lang === 'es' ? 'caracteres' : 'characters'}.`;
    if (c.tipo === 'file') {
      const f = archivo.current;
      return f && f.type === 'application/pdf' && f.size <= CV_MAX ? null : tx.pdfMal;
    }
    if (!v.trim()) return requerido(c) ? tx.obligatorio : null;
    return c.tipo === 'email' && !CORREO.test(v.trim()) ? tx.correoMal : null;
  }
  const marcar = (id: string, e: string | null) => setErr((x) => ({ ...x, [id]: e }));
  const poner = (c: Campo, v: string) => { setVal((x) => ({ ...x, [c.id]: v })); if (err[c.id]) marcar(c.id, revisar(c, v)); };

  function ir(n: number) { setAtras(n < paso); setPaso(n); }
  function siguiente() {
    if (hoja === 'datos') {
      const malos = visibles.map((c) => [c.id, revisar(c)] as const).filter(([, e]) => e);
      setErr((x) => ({ ...x, ...Object.fromEntries(visibles.map((c) => [c.id, revisar(c)])) }));
      if (malos.length) return document.getElementById(`fm-${malos[0][0]}`)?.focus();
    }
    if (hoja === 'mensaje') {
      const e = revisar('mensaje'); marcar('mensaje', e);
      if (e) return document.getElementById('fm-mensaje')?.focus();
    }
    if (hoja !== 'envio') return ir(paso + 1);
    enviar();
  }

  async function enviar() {
    setEstado('enviando');
    const fd = new FormData();
    fd.append('intencion', def.id); fd.append('lang', lang); fd.append('t', String(desde.current));
    fd.append('sitio_web', trampa.current?.value ?? ''); fd.append('ley', ley ? 'si' : '');
    if (anon) fd.append('anonimo', 'si');
    if (vacante) fd.append('vacante', `${vacante.id} · ${vacante.titulo} · ${vacante.sede}`);
    for (const c of visibles) c.tipo === 'file' ? archivo.current && fd.append(c.id, archivo.current) : fd.append(c.id, val[c.id] ?? '');
    fd.append('mensaje', val.mensaje ?? '');
    try {
      const r = await fetch(accion, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j.error);
      setRadicado(j.radicado); setEstado('ok');
    } catch { setEstado('error'); }
  }

  function reiniciar() { setVacante(null); setVal({}); setErr({}); setLey(false); setAnon(false); archivo.current = null; setEstado('editando'); setAtras(true); setPaso(0); if (elegir) setInt(null); }

  const control = (c: Campo) => {
    const props: Record<string, unknown> = {
      id: `fm-${c.id}`, name: c.id, required: js ? undefined : requerido(c), 'aria-invalid': err[c.id] ? true : undefined,
      'aria-describedby': err[c.id] ? `fm-e-${c.id}` : undefined,
      onBlur: (e: Event) => marcar(c.id, revisar(c, (e.target as HTMLInputElement).value)),
    };
    const lista = c.tipo === 'pais' ? [...opciones.pais.map(([, n]) => n), tx.otro] : c.tipo === 'servicio' ? opciones.servicio
      : c.tipo === 'sector' ? [...opciones.sector, tx.otro] : c.opciones?.map((o) => o[lang]);
    if (lista) return (
      <select {...props} value={val[c.id] ?? ''} onChange={(e) => poner(c, (e.target as HTMLSelectElement).value)}>
        <option value="">{tx.seleccione}</option>
        {lista.map((o) => <option key={o}>{o}</option>)}
      </select>
    );
    if (c.tipo === 'file') return (
      <input {...props} type="file" accept="application/pdf,.pdf"
        onChange={(e) => { archivo.current = (e.target as HTMLInputElement).files?.[0] ?? null; setVal((x) => ({ ...x, [c.id]: archivo.current?.name ?? '' })); marcar(c.id, revisar(c)); }} />
    );
    return <input {...props} type={c.tipo as 'text'} autoComplete={c.auto} value={val[c.id] ?? ''} onInput={(e) => poner(c, (e.target as HTMLInputElement).value)} />;
  };

  const campo = (c: Campo, i: number) => (
    <div key={c.id} class={`fm-campo${c.ancho ? ' fm-ancho' : ''}${err[c.id] ? ' fm-mal' : ''}${js && err[c.id] === null && val[c.id] ? ' fm-bien' : ''}`} style={`--i:${i}`}>
      <label class="voz-datos" for={`fm-${c.id}`}>{c.label[lang]}{requerido(c) ? '' : ` · ${tx.opcional}`}</label>
      <div class="fm-caja">{control(c)}<svg class="fm-ok" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8l4 4 8-8" /></svg></div>
      {err[c.id] && <span class="fm-error" id={`fm-e-${c.id}`}>{err[c.id]}</span>}
    </div>
  );

  const n = (val.mensaje ?? '').length;
  const hojaDatos = (
    <>
      {def.id === 'etico' && (
        <>
          <p class="fm-etica">{tx.etica}</p>
          <label class="fm-anon"><input type="checkbox" name="anonimo" value="si" checked={anon} onChange={(e) => setAnon((e.target as HTMLInputElement).checked)} /> <span>{tx.anonimo}</span></label>
        </>
      )}
      <div class="fm-campos">{visibles.map(campo)}</div>
    </>
  );
  const hojaMensaje = (
    <div class={`fm-campo fm-ancho${err.mensaje ? ' fm-mal' : ''}`}>
      <label class="voz-datos" for="fm-mensaje">{def.mensaje[lang]}</label>
      <textarea id="fm-mensaje" name="mensaje" required={!js} minLength={MENSAJE_MIN} maxLength={MENSAJE_MAX} value={val.mensaje ?? ''}
        aria-invalid={err.mensaje ? true : undefined} aria-describedby={err.mensaje ? 'fm-e-mensaje' : undefined}
        onInput={(e) => { const v = (e.target as HTMLTextAreaElement).value; setVal((x) => ({ ...x, mensaje: v })); if (err.mensaje) marcar('mensaje', revisar('mensaje', v)); }}
        onBlur={() => marcar('mensaje', revisar('mensaje'))} />
      {js && (
        <>
          <div class="fm-medidor" aria-hidden="true"><i style={`transform:scaleX(${Math.min(n / MENSAJE_MIN, 1)})`} /></div>
          <div class="fm-medidor-txt voz-datos" aria-hidden="true">
            <span>{n >= MENSAJE_MIN ? tx.suficiente : `${tx.faltan} ${MENSAJE_MIN - n} ${tx.caracteres}`.trim()}</span><span>{n} / {MENSAJE_MAX}</span>
          </div>
        </>
      )}
      {err.mensaje && <span class="fm-error" id="fm-e-mensaje">{err.mensaje}</span>}
    </div>
  );
  const autorizacion = (
    <label class="fm-ley">
      <input type="checkbox" name="ley" value="si" required={!js} checked={ley} onChange={(e) => setLey((e.target as HTMLInputElement).checked)} />
      <span>{tx.ley1} <a href={politica}>{tx.ley2}</a> {tx.ley3}</span>
    </label>
  );
  const fijos = (
    <>
      <input type="hidden" name="intencion" value={def.id} />
      <input type="hidden" name="lang" value={lang} />
      <input type="hidden" name="t" value="0" />
      <input ref={trampa} class="fm-trampa" type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
    </>
  );

  const rotulo = (
    <div class="fm-rotulo voz-datos">
      <span class="fm-cod">{int ? def.codigo : 'F-00'}</span>
      <span>{int ? def.nombre[lang] : tx.pregunta}</span>
      <span aria-live="polite">{estado === 'ok' ? tx.radicada : `${tx.hoja} ${paso + 1} ${tx.de} ${pasos.length}`}</span>
    </div>
  );

  // Sin JavaScript: un formulario HTML completo, con todas las hojas a la vista.
  if (!js) return (
    <form class="fm" method="post" action={accion} encType="multipart/form-data">
      {rotulo}
      <div class="fm-hojas fm-estatico">
        {elegir && <p class="fm-otros">{tx.otros} {FORMULARIOS.filter((f) => f.id !== 'cotizacion').map((f) => <a key={f.id} href={enlaces[f.id]}>{f.nombre[lang]}</a>)}</p>}
        {hojaDatos}{hojaMensaje}{autorizacion}{fijos}
      </div>
      <div class="fm-pie"><span /><button class="fm-btn fm-primario" type="submit">{tx.enviar}</button></div>
    </form>
  );

  return (
    <form class="fm" noValidate onSubmit={(e) => { e.preventDefault(); siguiente(); }}>
      {rotulo}
      <div class="fm-ejes voz-datos" style={`--n:${pasos.length}`}>
        <span class="fm-cota" style={`transform:scaleX(${estado === 'ok' ? 1 : paso / (pasos.length - 1)})`} aria-hidden="true" />
        <ol>
          {pasos.map((p, i) => {
            const e = estado === 'ok' || i < paso ? 'hecho' : i === paso ? 'actual' : '';
            return (
              <li key={p}>
                <button type="button" class="fm-eje" data-estado={e} disabled={i >= paso || estado !== 'editando'} aria-current={i === paso ? 'step' : undefined} onClick={() => ir(i)}>
                  <i>{e === 'hecho' ? <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8l3 3 7-7" /></svg> : String.fromCharCode(65 + i)}</i><span class="fm-eje-txt">{p}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div class="fm-hojas">
        {vacante && estado !== 'ok' && (
          <div class="fm-vacante" key={vacante.id}>
            <span class="voz-datos">{tx.postulacion}</span><strong>{vacante.id} · {vacante.titulo} · {vacante.sede}</strong>
            <button type="button" class="voz-datos" onClick={() => setVacante(null)}>{tx.quitar}</button>
          </div>
        )}
        {estado === 'ok' ? (
          <div class="fm-radicado">
            <p class="voz-datos fm-recibida" ref={titulo as never} tabIndex={-1}>{tx.recibida}</p>
            <div class="fm-sello voz-datos">{tx.radicado}<Rodillo texto={radicado} /></div>
            <div class="fm-traza" aria-hidden="true" />
            <p>{def.respuesta[lang]}</p>
            <p class="voz-datos">{tx.buzon}: {buzones[def.id]}</p>
            <button type="button" class="fm-btn" onClick={reiniciar}>{tx.otraVez}</button>
          </div>
        ) : (
          <fieldset key={hoja + (int ?? '')} class={`fm-hoja${atras ? ' fm-atras' : ''}`}>
            <legend class="fm-sr">{pasos[paso]}</legend>
            <h2 ref={titulo} tabIndex={-1}>{hoja === 'motivo' ? tx.pregunta : hoja === 'datos' ? tx.datos : hoja === 'mensaje' ? tx.cuentenos : tx.revise}</h2>
            {hoja === 'motivo' && (
              <div class="fm-intenciones" role="radiogroup" aria-label={tx.motivo}>
                {FORMULARIOS.map((f, i) => (
                  <button key={f.id} type="button" role="radio" aria-checked={int === f.id} class={`fm-int${f.id === 'etico' ? ' fm-int-etico' : ''}`} style={`--i:${i}`}
                    onClick={() => { setInt(f.id); setAnon(false); setErr({}); }}>
                    <svg viewBox="0 0 40 40" aria-hidden="true"><path d={f.icono} /></svg>
                    <strong>{f.nombre[lang]}</strong><small>{f.desc[lang]}</small>
                  </button>
                ))}
              </div>
            )}
            {hoja === 'datos' && hojaDatos}
            {hoja === 'mensaje' && hojaMensaje}
            {hoja === 'envio' && (
              <>
                <dl class="fm-resumen voz-datos">
                  {[[tx.motivo, def.nombre[lang]], ...(vacante ? [[tx.vacante, `${vacante.id} · ${vacante.titulo}`]] : []), ...(anon ? [[tx.identidad, tx.anonimoSi]] : []),
                    ...visibles.map((c) => [c.label[lang], val[c.id] || '—']),
                    [tx.mensaje, (val.mensaje ?? '').slice(0, 90) + (n > 90 ? '…' : '')]].map(([k, v], i) => (
                    <div key={k} style={`--i:${i}`}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
                {autorizacion}
                {estado === 'error' && <p class="fm-error fm-fallo" role="alert">{tx.fallo} <a href={`mailto:${buzones[def.id]}`}>{buzones[def.id]}</a>.</p>}
              </>
            )}
            <input ref={trampa} class="fm-trampa" type="text" name="sitio_web" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          </fieldset>
        )}
      </div>

      {estado !== 'ok' && (
        <div class="fm-pie">
          {paso > 0 ? <button type="button" class="fm-btn" onClick={() => ir(paso - 1)}>{tx.atras}</button> : <span />}
          <span class="fm-pista voz-datos">{hoja === 'envio' && ley ? tx.pistas[4] : tx.pistas[elegir ? paso : paso + 1]}</span>
          <button type="submit" class={`fm-btn fm-primario${estado === 'enviando' ? ' fm-cargando' : ''}`}
            disabled={(hoja === 'motivo' && !int) || (hoja === 'envio' && !ley) || estado === 'enviando'}>
            {estado === 'enviando' ? tx.enviando : hoja === 'envio' ? tx.enviar : tx.continuar}
          </button>
        </div>
      )}
    </form>
  );
}

/** El radicado cae como un tablero de aeropuerto: cada carácter rueda y se asienta de izquierda a derecha. */
function Rodillo({ texto }: { texto: string }) {
  const [vista, setVista] = useState(texto);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const signos = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
    let k = 0;
    const id = setInterval(() => {
      k++;
      setVista([...texto].map((ch, i) => (i < k / 2 || ch === '-' ? ch : signos[Math.floor(Math.random() * signos.length)])).join(''));
      if (k / 2 >= texto.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [texto]);
  return <b aria-label={texto}><span aria-hidden="true">{vista}</span></b>;
}
