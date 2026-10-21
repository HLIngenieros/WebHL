// Zoho SalesIQ solo para lo comercial (D3, plan AG.5). El script de Zoho se carga la primera vez que el agente
// detecta una intención comercial, nunca al cargar una página. Su botón flotante queda oculto: el único botón
// es "Hablar con HL". API usada (zoho.com/salesiq/help/developer-section): ready, floatbutton.visible,
// floatwindow.visible, visitor.question y los eventos chat.online / chat.offline. El departamento Comercial se
// fija con una regla de enrutamiento en SalesIQ (guía §10).
type Config = { widgetcode: string; dominio: string; departamento: string };
type Zoho = {
  salesiq: {
    ready: () => void;
    floatbutton?: { visible: (v: 'show' | 'hide') => void };
    floatwindow?: { visible: (v: 'show' | 'hide') => void };
    visitor?: { question: (q: string) => void };
    chat?: { online: (f: () => void) => void; offline: (f: () => void) => void };
    language?: (l: string) => void;
  };
};
declare global { interface Window { $zoho?: Zoho } }

const ESPERA_MS = 4000;
let carga: Promise<boolean> | undefined;

/** Carga SalesIQ una vez y resuelve si hay asesores en línea (sin respuesta en 4 s: fuera de línea). */
function cargar(c: Config): Promise<boolean> {
  return (carga ??= new Promise<boolean>((resolver) => {
    let listo = false;
    const fin = (v: boolean) => { if (!listo) { listo = true; resolver(v); } };
    window.$zoho = window.$zoho ?? ({} as Zoho);
    window.$zoho.salesiq = window.$zoho.salesiq ?? ({ ready() {} } as Zoho['salesiq']);
    window.$zoho.salesiq.ready = () => {
      const z = window.$zoho!.salesiq;
      z.floatbutton?.visible('hide');
      z.chat?.online(() => fin(true));
      z.chat?.offline(() => fin(false));
    };
    const s = document.createElement('script');
    s.id = 'zsiqscript';
    s.defer = true;
    s.src = `https://${c.dominio}/widget?wc=${encodeURIComponent(c.widgetcode)}`;
    s.onerror = () => fin(false);
    document.head.appendChild(s);
    setTimeout(() => fin(false), ESPERA_MS);
  }));
}

export const asesorEnLinea = (c: Config): Promise<boolean> => cargar(c).catch(() => false);

/** Abre el chat de SalesIQ con la pregunta del visitante ya escrita. */
export async function abrirAsesor(c: Config, pregunta: string, lang: 'es' | 'en'): Promise<void> {
  await cargar(c);
  const z = window.$zoho?.salesiq;
  z?.language?.(lang);
  if (pregunta) z?.visitor?.question(pregunta);
  z?.floatwindow?.visible('show');
}
