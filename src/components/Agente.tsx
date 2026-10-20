// Agente "Hablar con HL" (D3, 20-oct): sin asesores en vivo; el agente conversa y deriva a WhatsApp, a un
// buzón o a un teléfono. En F4 es solo la interfaz: respuestas de muestra con guion y entrada desactivada.
// Se carga con import() al primer clic en el botón (no pesa en la carga de ninguna página).
import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { Lang } from '../i18n/rutas';

export interface DatosAgente {
  lang: Lang;
  edad: number;
  whatsapp?: string;
  telefono: string;
  buzones: Record<'cotizacion' | 'proveedor' | 'empleo' | 'etico', string>;
  rutas: Record<'contacto' | 'proveedores' | 'trabaje' | 'buzon' | 'servicios' | 'nosotros', string>;
}

interface Accion { texto: string; href?: string }
interface Derivar { titulo: string; sub: string; principal: Accion; otras: Accion[] }
interface Respuesta { texto: string; fuente?: string; derivar?: Derivar }
type Msg = { de: 'hl' | 'yo'; texto: string; fuente?: string } | { de: 'derivar'; d: Derivar };

const T = {
  es: {
    titulo: 'Asistente HL', vista: 'Vista previa · sin conectar', cerrar: 'Cerrar',
    hola: 'Hola, soy el asistente del Grupo HL. Respondo con lo publicado en este sitio y le indico con quién hablar. No cotizo ni comprometo plazos.',
    escriba: 'Escriba su pregunta…', enviar: 'Enviar', nota: 'Respuestas de muestra · el agente se conecta en una etapa posterior',
    fuente: 'Fuente', recomiendo: 'Le recomiendo', obien: 'O bien:', porConfirmar: 'número por confirmar',
  },
  en: {
    titulo: 'HL Assistant', vista: 'Preview · not connected', cerrar: 'Close',
    hola: "Hi, I'm the Grupo HL assistant. I answer from what is published on this site and point you to the right contact. I don't quote prices or commit to schedules.",
    escriba: 'Type your question…', enviar: 'Send', nota: 'Sample answers · the agent will be connected at a later stage',
    fuente: 'Source', recomiendo: 'I recommend', obien: 'Or:', porConfirmar: 'number to be confirmed',
  },
};

function guion(d: DatosAgente): Record<string, Respuesta> {
  const es = d.lang === 'es';
  const t = T[d.lang];
  const wa: Accion = d.whatsapp ? { texto: es ? 'Abrir WhatsApp' : 'Open WhatsApp', href: `https://wa.me/${d.whatsapp}` } : { texto: `WhatsApp · ${t.porConfirmar}` };
  const correo = (b: string): Accion => ({ texto: b, href: `mailto:${b}` });
  return {
    [es ? 'Quiero cotizar' : 'Request a quote']: {
      texto: es ? 'Con gusto. HL ejecuta proyectos EPC, obras civiles, montajes, fabricación y mantenimiento. Para una cotización, lo mejor es hablar con el equipo comercial.'
        : 'Gladly. HL delivers EPC projects, civil works, installation, fabrication and maintenance. For a quote, the sales team is the best contact.',
      fuente: d.rutas.servicios,
      derivar: { titulo: es ? 'WhatsApp comercial' : 'Sales WhatsApp', sub: es ? 'Bogotá · días hábiles' : 'Bogotá · business days', principal: wa,
        otras: [{ texto: es ? 'Formulario de cotización' : 'Quote form', href: d.rutas.contacto }, correo(d.buzones.cotizacion), { texto: es ? 'Llamar a Bogotá' : 'Call Bogotá', href: `tel:${d.telefono}` }] },
    },
    [es ? 'Soy proveedor' : "I'm a supplier"]: {
      texto: es ? 'Las inscripciones de proveedores se hacen con su formulario; Compras las revisa en un máximo de 5 días hábiles.' : 'Suppliers register through their form; Procurement reviews them within 5 business days.',
      fuente: d.rutas.proveedores,
      derivar: { titulo: es ? 'Formulario de proveedores' : 'Supplier form', sub: es ? 'Inscripción y precalificación' : 'Registration and prequalification',
        principal: { texto: es ? 'Ir al formulario' : 'Go to form', href: d.rutas.proveedores }, otras: [correo(d.buzones.proveedor)] },
    },
    [es ? 'Busco empleo' : "I'm looking for a job"]: {
      texto: es ? 'Recibimos hojas de vida en Trabaje con nosotros. Talento Humano contacta a los perfiles que coinciden con las vacantes.' : 'We receive résumés through Careers. HR contacts the profiles that match our openings.',
      fuente: d.rutas.trabaje,
      derivar: { titulo: es ? 'Trabaje con nosotros' : 'Careers', sub: es ? 'Hoja de vida en PDF' : 'Résumé in PDF',
        principal: { texto: es ? 'Enviar hoja de vida' : 'Send résumé', href: d.rutas.trabaje }, otras: [correo(d.buzones.empleo)] },
    },
    [es ? 'Reporte ético' : 'Ethics report']: {
      texto: es ? 'Este asistente no recibe reportes éticos: van por un canal confidencial, directo al Comité de Ética, y pueden ser anónimos.' : 'This assistant does not take ethics reports: they go through a confidential channel straight to the Ethics Committee, and may be anonymous.',
      fuente: d.rutas.buzon,
      derivar: { titulo: es ? 'Buzón ético' : 'Ethics line', sub: es ? 'Confidencial · sin represalias' : 'Confidential · no retaliation',
        principal: { texto: es ? 'Abrir el buzón' : 'Open the ethics line', href: d.rutas.buzon }, otras: [] },
    },
    [es ? '¿Desde cuándo existe HL?' : 'How long has HL been around?']: {
      texto: es ? `Grupo HL nació en 1968 como HL Ingenieros, fundada por Guillermo Londoño: ${d.edad} años construyendo la industria.` : `Grupo HL was born in 1968 as HL Ingenieros, founded by Guillermo Londoño: ${d.edad} years building industry.`,
      fuente: d.rutas.nosotros,
    },
  };
}

function Agente({ datos, abierto, cerrar }: { datos: DatosAgente; abierto: boolean; cerrar: () => void }) {
  const t = T[datos.lang];
  const g = useRef(guion(datos)).current;
  const [hilo, setHilo] = useState<Msg[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [usadas, setUsadas] = useState<string[]>([]);
  const caja = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    if (!hilo.length) { const id = setTimeout(() => setHilo([{ de: 'hl', texto: t.hola }]), 250); return () => clearTimeout(id); }
  }, [abierto]);
  useEffect(() => { if (abierto) setTimeout(() => panel.current?.querySelector<HTMLElement>('.ag-sug button, .ag-cerrar')?.focus(), 300); }, [abierto, hilo.length === 1]);
  useEffect(() => { caja.current?.scrollTo({ top: caja.current.scrollHeight, behavior: 'smooth' }); }, [hilo, escribiendo]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && abierto && cerrar();
    addEventListener('keydown', esc);
    return () => removeEventListener('keydown', esc);
  }, [abierto]);

  function preguntar(q: string) {
    setUsadas((u) => [...u, q]);
    setHilo((h) => [...h, { de: 'yo', texto: q }]);
    setEscribiendo(true);
    setTimeout(() => {
      const r = g[q];
      setEscribiendo(false);
      setHilo((h) => [...h, { de: 'hl', texto: r.texto, fuente: r.fuente }, ...(r.derivar ? [{ de: 'derivar' as const, d: r.derivar }] : [])]);
    }, 1100);
  }

  const sugeridas = hilo.length && !escribiendo ? Object.keys(g).filter((k) => !usadas.includes(k)) : [];
  const accion = (a: Accion, cls: string) => (a.href ? <a class={cls} href={a.href} onClick={() => a.href!.startsWith('/') && cerrar()}>{a.texto}</a> : <span class={`${cls} ag-pend`}>{a.texto}</span>);

  return (
    <div ref={panel} class={`ag${abierto ? ' ag-abierto' : ''}`} role="dialog" aria-modal="false" aria-label={t.titulo} aria-hidden={!abierto} inert={!abierto}>
      <div class="ag-cab">
        <div><strong>{t.titulo}</strong><span class="ag-vista voz-datos">{t.vista}</span></div>
        <button type="button" class="ag-cerrar" aria-label={t.cerrar} onClick={cerrar}>×</button>
      </div>
      <div class="ag-hilo" ref={caja} aria-live="polite">
        {hilo.map((m, i) => m.de === 'derivar' ? (
          <div key={i} class="ag-derivar">
            <div class="ag-p3" aria-hidden="true" />
            <div class="ag-princ">
              <span><span class="voz-datos">{t.recomiendo}</span><strong>{m.d.titulo}</strong><small>{m.d.sub}</small></span>
              {accion(m.d.principal, 'ag-btn')}
            </div>
            {m.d.otras.length > 0 && <div class="ag-otras voz-datos"><span>{t.obien}</span>{m.d.otras.map((o) => accion(o, 'ag-link'))}</div>}
          </div>
        ) : (
          <div key={i} class={`ag-msg ag-${m.de}`}>
            {m.texto}
            {m.fuente && <span class="ag-fuente voz-datos">{t.fuente}: <a href={m.fuente} onClick={cerrar}>{m.fuente}</a></span>}
          </div>
        ))}
        {escribiendo && <div class="ag-escribe" aria-hidden="true"><i /><i /><i /></div>}
      </div>
      <div class="ag-sug voz-datos">{sugeridas.map((s, i) => <button key={s} type="button" style={`--i:${i}`} onClick={() => preguntar(s)}>{s}</button>)}</div>
      <div class="ag-entrada">
        <input disabled placeholder={t.escriba} aria-label={t.escriba} />
        <button type="button" disabled class="voz-datos">{t.enviar}</button>
        <small class="voz-datos">{t.nota}</small>
      </div>
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
