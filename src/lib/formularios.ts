// Formularios por intención (especificación §5, D7). Una sola definición alimenta la isla, las páginas y,
// por /api/config.json, al PHP que valida (mismos ids y obligatorios en los dos lados).
import type { ClaveRuta, Lang } from '../i18n/rutas';

type T = Record<Lang, string>;
export type Intencion = 'cotizacion' | 'proveedor' | 'empleo' | 'etico';
export type TipoCampo = 'text' | 'email' | 'tel' | 'pais' | 'servicio' | 'sector' | 'opciones' | 'file';

export interface Campo {
  id: string;
  label: T;
  tipo: TipoCampo;
  opciones?: T[];
  opcional?: boolean;
  /** Se oculta y deja de ser obligatorio si el reporte es anónimo (buzón ético). */
  identifica?: boolean;
  auto?: string;
  ancho?: boolean;
}

export interface DefFormulario {
  id: Intencion;
  codigo: string;
  ruta: ClaveRuta;
  nombre: T;
  desc: T;
  icono: string;
  mensaje: T;
  respuesta: T;
  campos: Campo[];
}

const nombre: Campo = { id: 'nombre', label: { es: 'Nombre y apellido', en: 'Full name' }, tipo: 'text', auto: 'name' };
const correo: Campo = { id: 'correo', label: { es: 'Correo', en: 'Email' }, tipo: 'email', auto: 'email' };
const tel: Campo = { id: 'telefono', label: { es: 'Teléfono', en: 'Phone' }, tipo: 'tel', auto: 'tel', opcional: true };
const op = (...xs: [string, string][]): T[] => xs.map(([es, en]) => ({ es, en }));

export const FORMULARIOS: DefFormulario[] = [
  {
    id: 'cotizacion', codigo: 'F-01', ruta: 'contacto',
    nombre: { es: 'Cotizar un proyecto', en: 'Request a quote' },
    desc: { es: 'EPC, obra civil, montaje, fabricación o mantenimiento', en: 'EPC, civil works, installation, fabrication or maintenance' },
    icono: 'M6 34h28M10 34V14l10-8 10 8v20M16 34v-9h8v9',
    mensaje: { es: 'Alcance del proyecto: qué, dónde y para cuándo', en: 'Project scope: what, where and when' },
    respuesta: { es: 'El equipo comercial le responde en un máximo de 2 días hábiles.', en: 'Our sales team will reply within 2 business days.' },
    campos: [
      nombre,
      { id: 'empresa', label: { es: 'Empresa', en: 'Company' }, tipo: 'text', auto: 'organization' },
      { ...correo, label: { es: 'Correo corporativo', en: 'Business email' } },
      tel,
      { id: 'pais', label: { es: 'País de la obra', en: 'Project country' }, tipo: 'pais' },
      { id: 'servicio', label: { es: 'Servicio', en: 'Service' }, tipo: 'servicio' },
      { id: 'sector', label: { es: 'Sector', en: 'Sector' }, tipo: 'sector' },
      { id: 'inicio', label: { es: 'Inicio estimado', en: 'Expected start' }, tipo: 'opciones',
        opciones: op(['Este trimestre', 'This quarter'], ['Este año', 'This year'], ['Próximo año', 'Next year'], ['En estudio', 'Under study']) },
    ],
  },
  {
    id: 'proveedor', codigo: 'F-02', ruta: 'proveedores',
    nombre: { es: 'Ser proveedor', en: 'Become a supplier' },
    desc: { es: 'Inscripción y precalificación', en: 'Registration and prequalification' },
    icono: 'M4 28h22V12H4zM26 18h6l4 5v5H26M10 32a3 3 0 1 0 0-.1M30 32a3 3 0 1 0 0-.1',
    mensaje: { es: 'Productos o servicios que ofrece', en: 'Products or services you offer' },
    respuesta: { es: 'Compras revisa su inscripción y le escribe en un máximo de 5 días hábiles.', en: 'Procurement will review your registration and reply within 5 business days.' },
    campos: [
      { id: 'empresa', label: { es: 'Razón social', en: 'Company name' }, tipo: 'text', auto: 'organization' },
      { id: 'nit', label: { es: 'NIT / RUC', en: 'Tax ID' }, tipo: 'text' },
      { ...nombre, label: { es: 'Persona de contacto', en: 'Contact person' } },
      correo,
      { id: 'pais', label: { es: 'País', en: 'Country' }, tipo: 'pais' },
      { id: 'categoria', label: { es: 'Categoría', en: 'Category' }, tipo: 'opciones',
        opciones: op(['Materiales', 'Materials'], ['Equipos y alquiler', 'Equipment and rental'], ['Subcontrato de obra', 'Construction subcontract'], ['Transporte', 'Transport'], ['Servicios profesionales', 'Professional services']) },
    ],
  },
  {
    id: 'empleo', codigo: 'F-03', ruta: 'trabaje',
    nombre: { es: 'Trabajar con HL', en: 'Work with HL' },
    desc: { es: 'Hoja de vida para obra u oficina', en: 'Résumé for site or office roles' },
    icono: 'M8 18a12 10 0 0 1 24 0zM6 18h28M20 8v-2M14 26h12v8H14z',
    mensaje: { es: 'Experiencia y cargo al que aspira', en: 'Experience and the role you are seeking' },
    respuesta: { es: 'Si su perfil coincide con una vacante, Talento Humano lo contactará.', en: 'If your profile matches an opening, our HR team will contact you.' },
    campos: [
      nombre, correo, tel,
      { id: 'pais', label: { es: 'País de residencia', en: 'Country of residence' }, tipo: 'pais' },
      { id: 'area', label: { es: 'Área', en: 'Area' }, tipo: 'opciones',
        opciones: op(['Obra', 'Site'], ['Ingeniería', 'Engineering'], ['HSE', 'HSE'], ['Administración', 'Administration']) },
      { id: 'cv', label: { es: 'Hoja de vida (PDF, máx. 5 MB)', en: 'Résumé (PDF, max. 5 MB)' }, tipo: 'file', ancho: true },
    ],
  },
  {
    id: 'etico', codigo: 'F-04', ruta: 'buzon',
    nombre: { es: 'Buzón ético', en: 'Ethics line' },
    desc: { es: 'Confidencial, puede ser anónimo', en: 'Confidential, may be anonymous' },
    icono: 'M20 4l13 5v10c0 8-6 14-13 17C13 33 7 27 7 19V9zM14 20l4 4 8-8',
    mensaje: { es: 'Describa lo ocurrido: qué, cuándo y dónde', en: 'Describe what happened: what, when and where' },
    respuesta: { es: 'Su reporte va directo al Comité de Ética, sin pasar por el asistente ni por el registro comercial. Guarde el radicado para consultar su estado.', en: 'Your report goes straight to the Ethics Committee, bypassing the assistant and sales records. Keep the reference number to check its status.' },
    campos: [
      { ...nombre, identifica: true },
      { ...correo, label: { es: 'Correo para seguimiento', en: 'Email for follow-up' }, identifica: true },
      { id: 'pais', label: { es: 'País', en: 'Country' }, tipo: 'pais' },
      { id: 'tipo', label: { es: 'Tipo de situación', en: 'Type of concern' }, tipo: 'opciones',
        opciones: op(['Conflicto de interés', 'Conflict of interest'], ['Fraude o soborno', 'Fraud or bribery'], ['Acoso', 'Harassment'], ['Seguridad y salud', 'Health and safety'], ['Otra', 'Other']) },
    ],
  },
];

export const MENSAJE_MIN = 20;
export const MENSAJE_MAX = 1500;
export const CV_MAX = 5 * 1024 * 1024;

export const formulario = (id: Intencion) => FORMULARIOS.find((f) => f.id === id)!;

/** Reglas que comparte el PHP: obligatorios por intención (con y sin anonimato). */
export const reglasServidor = () => Object.fromEntries(FORMULARIOS.map((f) => [f.id, {
  codigo: f.codigo,
  nombre: f.nombre.es,
  campos: f.campos.map((c) => ({ id: c.id, label: c.label.es, tipo: c.tipo, opcional: !!c.opcional, identifica: !!c.identifica })),
}]));

/** Textos de la isla (se pasan ya resueltos al idioma). */
export const TEXTOS = {
  es: {
    motivo: 'Motivo', datos: 'Sus datos', mensaje: 'Mensaje', envio: 'Envío', hoja: 'Hoja', de: 'de', radicada: 'Radicada',
    pregunta: '¿En qué le podemos ayudar?', cuentenos: 'Cuéntenos', revise: 'Revise y envíe', seleccione: 'Seleccione…', opcional: 'opcional',
    atras: '← Atrás', continuar: 'Continuar →', enviar: 'Enviar solicitud', enviando: 'Enviando…',
    pistas: ['Elija un motivo para continuar', 'Los campos se revisan al salir de cada uno', 'Sea concreto: alcance, lugar y plazo', 'Falta la autorización de datos', 'Listo para enviar'],
    obligatorio: 'Este campo es obligatorio.', correoMal: 'Revise el correo (ejemplo: nombre@empresa.com).', pdfMal: 'Adjunte un PDF de máximo 5 MB.',
    minimo: 'Mínimo', faltan: 'Faltan', caracteres: 'caracteres', suficiente: 'Suficiente', escriba: 'Escriba al menos',
    ley1: 'Autorizo a Grupo HL (HL Ingenieros S.A., HL Infraestructura S.A.S. y ECOHL S.A.S.) a tratar mis datos personales para atender esta solicitud, según la', ley2: 'política de tratamiento de datos', ley3: '(Ley 1581 de 2012).',
    anonimo: 'Enviar de forma anónima (sin nombre ni correo)', anonimoSi: 'Anónimo', identidad: 'Identidad',
    etica: 'Canal confidencial. HL no toma represalias contra quien reporta de buena fe.',
    recibida: 'Solicitud recibida', radicado: 'Radicado', buzon: 'Buzón', otraVez: 'Enviar otra solicitud',
    postulacion: 'Postulación a', quitar: 'Quitar ×', vacante: 'Vacante',
    fallo: 'No se pudo enviar. Revise su conexión e intente de nuevo, o escriba a', otros: '¿Es proveedor, busca empleo o quiere hacer un reporte ético?', otro: 'Otro',
  },
  en: {
    motivo: 'Reason', datos: 'Your details', mensaje: 'Message', envio: 'Send', hoja: 'Sheet', de: 'of', radicada: 'Filed',
    pregunta: 'How can we help?', cuentenos: 'Tell us', revise: 'Review and send', seleccione: 'Select…', opcional: 'optional',
    atras: '← Back', continuar: 'Continue →', enviar: 'Send request', enviando: 'Sending…',
    pistas: ['Choose a reason to continue', 'Fields are checked as you leave each one', 'Be specific: scope, location and timing', 'Data authorization is missing', 'Ready to send'],
    obligatorio: 'This field is required.', correoMal: 'Check the email (e.g. name@company.com).', pdfMal: 'Attach a PDF of up to 5 MB.',
    minimo: 'Minimum', faltan: '', caracteres: 'characters left', suficiente: 'Enough', escriba: 'Write at least',
    ley1: 'I authorize Grupo HL (HL Ingenieros S.A., HL Infraestructura S.A.S. and ECOHL S.A.S.) to process my personal data to handle this request, under its', ley2: 'data processing policy', ley3: '(Colombian Law 1581 of 2012).',
    anonimo: 'Send anonymously (no name or email)', anonimoSi: 'Anonymous', identidad: 'Identity',
    etica: 'Confidential channel. HL does not retaliate against anyone reporting in good faith.',
    recibida: 'Request received', radicado: 'Reference', buzon: 'Inbox', otraVez: 'Send another request',
    postulacion: 'Applying for', quitar: 'Remove ×', vacante: 'Position',
    fallo: 'The request could not be sent. Check your connection and try again, or write to', otros: 'Supplier, job seeker or ethics report?', otro: 'Other',
  },
} as const;

/** Textos de cada página de formulario (título del documento, H1 en dos líneas y entrada). */
export const PAGINAS: Record<Intencion, { titulo: T; h1: [T, T]; lead: T }> = {
  cotizacion: {
    titulo: { es: 'Contacto', en: 'Contact' },
    h1: [{ es: 'Hablemos de', en: "Let's talk about" }, { es: 'su proyecto', en: 'your project' }],
    lead: { es: 'Escríbanos por el motivo que corresponda: cada solicitud llega al equipo indicado y recibe un radicado.', en: 'Write to us for the right reason: each request reaches the right team and gets a reference number.' },
  },
  proveedor: {
    titulo: { es: 'Proveedores', en: 'Suppliers' },
    h1: [{ es: 'Sea proveedor', en: 'Become a' }, { es: 'de HL', en: 'HL supplier' }],
    lead: { es: 'Inscriba su empresa para participar en nuestras compras y subcontratos. Compras revisa cada inscripción.', en: 'Register your company to take part in our purchasing and subcontracting. Procurement reviews every registration.' },
  },
  empleo: {
    titulo: { es: 'Trabaje con nosotros', en: 'Careers' },
    h1: [{ es: 'Construya', en: 'Build your' }, { es: 'con nosotros', en: 'career with us' }],
    lead: { es: 'Buscamos gente que cumple, en obra y en oficina. Déjenos su hoja de vida y la tendremos en cuenta en las vacantes que se abran.', en: 'We look for people who deliver, on site and in the office. Leave us your résumé and we will consider it for upcoming openings.' },
  },
  etico: {
    titulo: { es: 'Buzón ético', en: 'Ethics line' },
    h1: [{ es: 'Reporte', en: 'Report' }, { es: 'con confianza', en: 'with confidence' }],
    lead: { es: 'Un canal confidencial para reportar conductas contrarias a la ética, la ley o nuestras políticas. Puede hacerlo de forma anónima.', en: 'A confidential channel to report conduct contrary to ethics, the law or our policies. You may do so anonymously.' },
  },
};
