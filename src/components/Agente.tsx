// Agente "Hablar con HL" (D3, 21-oct; plan AG.4-AG.5, maqueta design/maquetas/agente-documentos.html). Pregunta a
// /api/agente.php, que responde con lo publicado (sitio, documentos y vacantes) por medio de un flujo de Power
// Automate. Lo comercial pasa a Zoho SalesIQ si hay un asesor en línea; si no, al formulario de cotización.
// Los temas éticos los responde el PHP sin IA. Si el servicio falla, el panel ofrece los contactos de siempre.
// Se carga con import() al primer clic en el botón (no pesa en la carga de ninguna página).
import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '../i18n/rutas';
import { abrirAsesor, asesorEnLinea } from './salesiq';

export interface DatosAgente {
  lang: Lang;
  api: string;
  whatsapp?: string;
  telefono: string;
  buzones: Record<'cotizacion' | 'proveedor' | 'empleo' | 'etico', string>;
  rutas: Record<'contacto' | 'proveedores' | 'trabaje' | 'buzon' | 'proyectos', string>;
  /** Zoho SalesIQ (AG.5): sin código, lo comercial va directo al formulario. */
  salesiq?: { widgetcode: string; dominio: string; departamento: string };
}

interface Accion { texto: string; href?: string; asesor?: boolean }
interface Derivar { titulo: string; sub: string; estado?: 'on' | 'off'; principal: Accion; otras: Accion[] }
interface Fuente { titulo: string; url: string; tipo: 'pagina' | 'pdf' }
type Msg =
  | { de: 'yo'; texto: string }
  | { de: 'hl'; texto: string; fuentes?: Fuente[]; fijo?: boolean; falla?: boolean; sinIa?: boolean }
  | { de: 'derivar'; d: Derivar };

const MAX_PREGUNTAS = 20;
const ESPERA_MS = 35_000;

const T = {
  es: {
    titulo: 'Asistente HL', ia: 'IA · responde con lo publicado', cerrar: 'Cerrar',
    hola: 'Hola, soy el asistente del Grupo HL. Respondo con lo publicado en este sitio y le indico con quién hablar. No cotizo ni comprometo plazos.',
    escriba: 'Escriba su pregunta…', enviar: 'Enviar', nota: 'Respuestas con IA a partir de lo publicado · verifique en la fuente',
    buscando: 'Buscando en el sitio y los documentos', fuentes: 'Fuentes', recomiendo: 'Le recomiendo', obien: 'O bien:', porConfirmar: 'número por confirmar',
    sugerencias: ['Quiero cotizar', '¿Tienen certificación ISO 45001?', 'Proyectos de cemento', 'Soy proveedor', 'Busco empleo'],
    etico: 'Este asistente no recibe reportes éticos. Para su tranquilidad, se atienden solo por el Buzón ético: es confidencial, llega directo al Comité de Ética y puede ser anónimo.',
    sinIa: 'Su mensaje no se envió a la IA',
    falla: 'El asistente no está disponible en este momento. Puede escribirnos o llamarnos y le respondemos.',
    limite: 'Llegó al máximo de preguntas de esta conversación. Para seguir, escríbanos o llámenos.',
    sinRespuesta: ['Ver proyectos', 'Ir a Contacto'],
    comercialOn: { titulo: 'Asesor comercial', sub: 'En línea · responde en minutos', boton: 'Chatear con un asesor' },
    comercialOff: { titulo: 'Formulario de cotización', sub: 'Asesores fuera de línea · L-V, hora de Bogotá', boton: 'Ir al formulario' },
    formulario: 'Formulario de cotización', llamar: 'Llamar a Bogotá', abrirWa: 'Abrir WhatsApp',
    buzon: { titulo: 'Buzón ético', sub: 'Confidencial · sin represalias', boton: 'Abrir el buzón' },
    contacto: { titulo: 'Contacto', sub: 'Sedes, formulario y teléfonos', boton: 'Ir a Contacto' },
  },
  en: {
    titulo: 'HL Assistant', ia: 'AI · answers from what we publish', cerrar: 'Close',
    hola: "Hi, I'm the Grupo HL assistant. I answer from what is published on this site and point you to the right contact. I don't quote prices or commit to schedules.",
    escriba: 'Type your question…', enviar: 'Send', nota: 'AI answers based on what we publish · check the source',
    buscando: 'Searching the site and documents', fuentes: 'Sources', recomiendo: 'I recommend', obien: 'Or:', porConfirmar: 'number to be confirmed',
    sugerencias: ['Request a quote', 'Are you ISO 45001 certified?', 'Cement projects', "I'm a supplier", "I'm looking for a job"],
    etico: 'This assistant does not take ethics reports. For your peace of mind, they are handled only through the Ethics line: it is confidential, goes straight to the Ethics Committee and may be anonymous.',
    sinIa: 'Your message was not sent to the AI',
    falla: 'The assistant is not available right now. You can write or call us and we will get back to you.',
    limite: 'You reached the maximum number of questions for this conversation. To continue, write or call us.',
    sinRespuesta: ['See projects', 'Go to Contact'],
    comercialOn: { titulo: 'Sales advisor', sub: 'Online · replies within minutes', boton: 'Chat with an advisor' },
    comercialOff: { titulo: 'Quote form', sub: 'Advisors offline · Mon-Fri, Bogotá time', boton: 'Go to the form' },
    formulario: 'Quote form', llamar: 'Call Bogotá', abrirWa: 'Open WhatsApp',
    buzon: { titulo: 'Ethics line', sub: 'Confidential · no retaliation', boton: 'Open the ethics line' },
    contacto: { titulo: 'Contact', sub: 'Offices, form and phone numbers', boton: 'Go to Contact' },
  },
};

type Respuesta = { estado: 'ok' | 'etico' | 'limite' | 'sin_servicio' | 'error'; respuesta?: string; intencion?: string; fuentes?: Fuente[] };

async function consultar(api: string, pregunta: string, lang: Lang, historial: { de: 'yo' | 'hl'; texto: string }[]): Promise<Respuesta> {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), ESPERA_MS);
  try {
    const r = await fetch(api, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: ctl.signal,
      body: JSON.stringify({ pregunta, idioma: lang, pagina: location.pathname, historial }),
    });
    const j = (await r.json().catch(() => null)) as Respuesta | null;
    return j && r.ok ? j : { estado: r.status === 429 ? 'limite' : 'sin_servicio' };
  } catch {
    return { estado: 'sin_servicio' };
  } finally {
    clearTimeout(id);
  }
}

function Agente({ datos, abierto, cerrar }: { datos: DatosAgente; abierto: boolean; cerrar: () => void }) {
  const t = T[datos.lang];
  const [hilo, setHilo] = useState<Msg[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [texto, setTexto] = useState('');
  const [usadas, setUsadas] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [hechas, setHechas] = useState(0);
  const caja = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!abierto) return;
    if (!hilo.length) { const id = setTimeout(() => setHilo([{ de: 'hl', texto: t.hola }]), 250); return () => clearTimeout(id); }
  }, [abierto]);
  useEffect(() => { if (abierto) setTimeout(() => entrada.current?.focus(), 300); }, [abierto]);
  useEffect(() => { caja.current?.scrollTo({ top: caja.current.scrollHeight, behavior: 'smooth' }); }, [hilo, buscando]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && abierto && cerrar();
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [abierto]);

  const wa = (): Accion => (datos.whatsapp ? { texto: t.abrirWa, href: `https://wa.me/${datos.whatsapp}` } : { texto: `WhatsApp · ${t.porConfirmar}` });
  const tel: Accion = { texto: t.llamar, href: `tel:${datos.telefono}` };
  const contactos = (): Derivar => ({ titulo: t.contacto.titulo, sub: t.contacto.sub, principal: { texto: t.contacto.boton, href: datos.rutas.contacto }, otras: [wa(), tel] });

  async function comercial(): Promise<Derivar> {
    const formulario: Accion = { texto: t.formulario, href: datos.rutas.contacto };
    if (datos.salesiq && (await asesorEnLinea(datos.salesiq))) {
      return { ...t.comercialOn, estado: 'on', principal: { texto: t.comercialOn.boton, asesor: true }, otras: [formulario, wa()] };
    }
    return { ...t.comercialOff, estado: 'off', principal: { texto: t.comercialOff.boton, href: datos.rutas.contacto }, otras: [{ texto: datos.buzones.cotizacion, href: `mailto:${datos.buzones.cotizacion}` }, tel] };
  }

  async function preguntar(q: string) {
    q = q.trim().slice(0, 500);
    if (!q || buscando || hechas >= MAX_PREGUNTAS) return;
    const previo = hilo.flatMap((m) => (m.de === 'derivar' ? [] : [{ de: m.de, texto: m.texto }])).slice(1).slice(-6);
    setUsadas((u) => [...u, q]);
    setExtra([]);
    setTexto('');
    setHechas((n) => n + 1);
    setHilo((h) => [...h, { de: 'yo', texto: q }]);
    setBuscando(true);
    const r = await consultar(datos.api, q, datos.lang, previo);
    const nuevos: Msg[] = [];
    if (r.estado === 'ok' && r.respuesta) {
      nuevos.push({ de: 'hl', texto: r.respuesta, fuentes: r.fuentes });
      if (r.intencion === 'comercial') nuevos.push({ de: 'derivar', d: await comercial() });
      if (r.intencion === 'sin_respuesta' || r.intencion === 'fuera_de_alcance') setExtra(t.sinRespuesta);
    } else if (r.estado === 'etico') {
      nuevos.push({ de: 'hl', texto: t.etico, fijo: true, sinIa: true });
      nuevos.push({ de: 'derivar', d: { titulo: t.buzon.titulo, sub: t.buzon.sub, principal: { texto: t.buzon.boton, href: datos.rutas.buzon }, otras: [] } });
    } else {
      nuevos.push({ de: 'hl', texto: r.estado === 'limite' ? t.limite : t.falla, falla: true });
      nuevos.push({ de: 'derivar', d: contactos() });
    }
    if (hechas + 1 >= MAX_PREGUNTAS && r.estado !== 'limite') nuevos.push({ de: 'hl', texto: t.limite, falla: true });
    setBuscando(false);
    setHilo((h) => [...h, ...nuevos]);
  }

  function pulsarSugerencia(s: string) {
    // "Ver proyectos" e "Ir a Contacto" son atajos, no preguntas.
    const i = t.sinRespuesta.indexOf(s);
    if (i >= 0) { location.href = i === 0 ? datos.rutas.proyectos : datos.rutas.contacto; cerrar(); return; }
    preguntar(s);
  }

  const agotado = hechas >= MAX_PREGUNTAS;
  const sugeridas = hilo.length && !buscando && !agotado ? [...extra, ...t.sugerencias.filter((k) => !usadas.includes(k))].slice(0, 4) : [];
  const accion = (a: Accion, cls: string) => {
    if (a.asesor && datos.salesiq) {
      const s = datos.salesiq;
      const ultima = [...hilo].reverse().find((m) => m.de === 'yo') as { texto: string } | undefined;
      return <button type="button" class={cls} onClick={() => { cerrar(); abrirAsesor(s, ultima?.texto ?? '', datos.lang); }}>{a.texto}</button>;
    }
    return a.href ? <a class={cls} href={a.href} onClick={() => a.href!.startsWith('/') && cerrar()}>{a.texto}</a> : <span class={`${cls} ag-pend`}>{a.texto}</span>;
  };

  return (
    <div ref={panel} class={`ag${abierto ? ' ag-abierto' : ''}`} role="dialog" aria-modal="false" aria-label={t.titulo} aria-hidden={!abierto} inert={!abierto}>
      <div class="ag-cab">
        <div><strong>{t.titulo}</strong><span class="ag-ia voz-datos"><i aria-hidden="true" />{t.ia}</span></div>
        <button type="button" class="ag-cerrar" aria-label={t.cerrar} onClick={cerrar}>×</button>
      </div>
      <div class="ag-hilo" ref={caja} aria-live="polite">
        {hilo.map((m, i) => m.de === 'derivar' ? (
          <div key={i} class="ag-derivar">
            <div class="ag-p3" aria-hidden="true" />
            <div class="ag-princ">
              <span>
                <span class="voz-datos">{t.recomiendo}</span><strong>{m.d.titulo}</strong>
                <small class={`voz-datos${m.d.estado ? ` ag-estado ag-${m.d.estado}` : ''}`}>{m.d.estado && <i aria-hidden="true" />}{m.d.sub}</small>
              </span>
              {accion(m.d.principal, 'ag-btn')}
            </div>
            {m.d.otras.length > 0 && <div class="ag-otras voz-datos"><span>{t.obien}</span>{m.d.otras.map((o) => accion(o, 'ag-link'))}</div>}
          </div>
        ) : (
          <div key={i} class={`ag-msg ag-${m.de}${m.de === 'hl' && m.fijo ? ' ag-fijo' : ''}${m.de === 'hl' && m.falla ? ' ag-falla' : ''}`}>
            {m.texto}
            {m.de === 'hl' && m.sinIa && <span class="ag-sinia voz-datos">{t.sinIa}</span>}
            {m.de === 'hl' && !!m.fuentes?.length && (
              <>
                <span class="ag-titfuente voz-datos">{t.fuentes}</span>
                <div class="ag-fuentes">
                  {m.fuentes.map((f) => (
                    <a href={f.url} onClick={() => f.tipo === 'pagina' && cerrar()} {...(f.tipo === 'pdf' ? { target: '_blank', rel: 'noopener' } : {})}>
                      <span class={`ag-ic ag-ic-${f.tipo}`} aria-hidden="true" />
                      <span class="ag-tx"><b>{f.titulo}</b><span class="voz-datos">{f.tipo === 'pdf' ? `PDF · ${f.url.replace(/[^/]+$/, '')}` : f.url}</span></span>
                      <span class="ag-fl" aria-hidden="true">{f.tipo === 'pdf' ? '↓' : '→'}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
        {buscando && (
          <div class="ag-piensa" role="status">
            <span class="ag-barras" aria-hidden="true"><i /><i /><i /></span>
            <span class="voz-datos">{t.buscando}</span>
            <span class="ag-cota" aria-hidden="true" />
          </div>
        )}
      </div>
      <div class="ag-sug voz-datos">{sugeridas.map((s, i) => <button key={s} type="button" style={`--i:${i}`} onClick={() => pulsarSugerencia(s)}>{s}</button>)}</div>
      <form class="ag-entrada" onSubmit={(e) => { e.preventDefault(); preguntar(texto); }}>
        <input ref={entrada} value={texto} maxLength={500} disabled={agotado} placeholder={t.escriba} aria-label={t.escriba} onInput={(e) => setTexto((e.target as HTMLInputElement).value)} />
        <button type="submit" disabled={buscando || agotado || !texto.trim()} class="voz-datos">{t.enviar}</button>
        <small class="voz-datos"><span>{t.nota}</span>{hechas > 0 && <span class="ag-cnt">{hechas} / {MAX_PREGUNTAS}</span>}</small>
      </form>
    </div>
  );
}

let abierto = false;
/** Abre o cierra el panel en `el` (se monta la primera vez). Devuelve el estado nuevo. */
export function alternar(el: HTMLElement, datos: DatosAgente, boton: HTMLElement, forzar?: boolean): boolean {
  abierto = forzar ?? !abierto;
  const cerrar = () => { alternar(el, datos, boton, false); boton.focus(); };
  render(<Agente datos={datos} abierto={abierto} cerrar={cerrar} />, el);
  boton.setAttribute('aria-expanded', String(abierto));
  return abierto;
}
