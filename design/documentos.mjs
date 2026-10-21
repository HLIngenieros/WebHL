// Documentos para la página Documentos (D3, plan AG.11). Arma en PDF, en español e inglés, lo que el sitio ya
// publica: portafolio de proyectos, brochure corporativo, líneas de servicio, política de gestión integral, Reglas
// de Oro y directorio de sedes; copia la política de datos M-TI-001 tal cual. Salen en documentos-web/<carpeta>/
// con documentos-web/LEEME.md (sus datos). Juan David los revisa; lo aprobado pasa a public/documentos/<carpeta>/.
// Uso: node design/documentos.mjs        (necesita Playwright, ya instalado para las pruebas)
import { readFileSync, readdirSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { chromium } from 'playwright';
import { UNIDADES, SINGULAR, PAISES } from '../src/i18n/ui.ts';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'documentos-web');
const C = (p) => join(RAIZ, 'src', 'content', p);
const leer = (p) => parse(readFileSync(p, 'utf8'));
const frente = (p) => parse(readFileSync(p, 'utf8').split(/^---$/m)[1]);
const coleccion = (d) => readdirSync(C(d)).filter((f) => f.endsWith('.yaml')).map((f) => ({ id: f.replace('.yaml', ''), ...leer(C(`${d}/${f}`)) }));

const sitio = leer(C('sitio.yaml'))[0];
const sedes = leer(C('sedes.yaml'));
const certs = leer(C('certificaciones.yaml'));
const servicios = coleccion('servicios').sort((a, b) => a.grupo.localeCompare(b.grupo) || a.orden - b.orden);
const sectores = coleccion('sectores').sort((a, b) => a.orden - b.orden);
const proyectos = coleccion('proyectos').filter((p) => p.visibilidad !== 'discreta'); // D6: las discretas no van en piezas
const pagina = (n, lang) => frente(C(`paginas/${n}.${lang}.md`));

const hoy = new Date();
const EDAD = hoy.getFullYear() - sitio.fundacion;
const FECHA = hoy.toISOString().slice(0, 10);
const MES = `${String(hoy.getMonth() + 1).padStart(2, '0')}-${hoy.getFullYear()}`;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const tx = (o, lang) => (o && typeof o === 'object' ? o[lang] ?? o.es : o);
const num = (v, lang) => new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', { useGrouping: 'always' }).format(v);
const medida = (v, u, lang) => (!u ? num(v, lang) : u === 'pct' ? `${num(v, lang)}${lang === 'es' ? ' ' : ''}%` : `${num(v, lang)} ${(v === 1 && SINGULAR[u]?.[lang]) || UNIDADES[u][lang]}`);
const datos = (ruta) => `data:${{ '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml' }[extname(ruta).toLowerCase()]};base64,${readFileSync(ruta).toString('base64')}`;
const FUENTE = datos(join(RAIZ, 'public/fonts/archivo-var-latin.woff2')).replace('data:undefined', 'data:font/woff2');
const MONO = readFileSync(join(RAIZ, 'src/assets/marca/monograma-hl.svg'), 'utf8');
const URL_SITIO = 'hlingenieros.com';
const rutas = {
  es: { contacto: '/contacto/', proveedores: '/proveedores/', trabaje: '/trabaje-con-nosotros/', buzon: '/buzon-etico/', proyectos: '/proyectos/' },
  en: { contacto: '/en/contact/', proveedores: '/en/suppliers/', trabaje: '/en/careers/', buzon: '/en/ethics-line/', proyectos: '/en/projects/' },
};

const T = {
  es: {
    grupo: 'Grupo HL', antes: 'antes HL Ingenieros', razon: 'HL Ingenieros S.A.', anios: 'años', paises: 'países con obra', sedes: 'sedes',
    rev: 'Revisión', hoja: 'Hoja', cliente: 'Cliente', lugar: 'Lugar', sector: 'Sector', servicios: 'Servicios', rol: 'Rol de HL', duracion: 'Duración',
    roles: { contratista: 'Contratista', subcontratista: 'Subcontratista', consorcio: 'Consorcio' },
    portafolio: ['Portafolio', 'de proyectos'], portafolioTxt: (n) => `${n} proyectos seleccionados de construcción, montaje electromecánico y fabricación para la industria.`,
    brochure: ['Grupo HL', 'presentación'], lineas: ['Líneas', 'de servicio'], lineasTxt: 'Siete líneas en tres grupos, con un mismo equipo responsable de principio a fin.',
    grupos: { A: 'A · Gestión', B: 'B · Construcción y montaje', C: 'C · Fabricación y mantenimiento' },
    quienes: 'Quiénes somos', mision: 'Misión', vision: 'Visión', valores: 'Valores', lineasT: 'Líneas de servicio', sectoresT: 'Sectores', certT: 'Certificaciones',
    presencia: 'Presencia', sedesT: 'Sedes', contacto: 'Contacto', alcance: 'Alcance', normas: 'Normas', aliados: 'Recursos y aliados', referencias: 'Proyectos de referencia',
    politica: ['Política de', 'gestión integral'], compromisos: 'Nos comprometemos con', cimiento: 'Base', cubierta: 'Sistema',
    reglas: ['Reglas de Oro', 'HSE y PIENSA®'], reglasTxt: 'Diez reglas que todo trabajador del Grupo HL conoce y aplica, y la metodología con que se enseñan.', piensaT: 'PIENSA®',
    practicas: 'Prácticas de la cultura de seguridad',
    directorio: ['Sedes', 'y contacto'], directorioTxt: 'Dónde estamos y a qué canal escribir según su solicitud.', telefono: 'Teléfono', direccion: 'Dirección',
    canales: 'Canales en línea', canal: [['Cotizaciones y proyectos', 'contacto'], ['Proveedores', 'proveedores'], ['Trabaje con nosotros', 'trabaje'], ['Buzón ético · confidencial', 'buzon']],
    correo: 'Correo general', publicado: `Contenido publicado en ${URL_SITIO}`, mas: 'Más en',
  },
  en: {
    grupo: 'Grupo HL', antes: 'formerly HL Ingenieros', razon: 'HL Ingenieros S.A.', anios: 'years', paises: 'countries with projects', sedes: 'offices',
    rev: 'Revision', hoja: 'Sheet', cliente: 'Client', lugar: 'Location', sector: 'Sector', servicios: 'Services', rol: "HL's role", duracion: 'Duration',
    roles: { contratista: 'Contractor', subcontratista: 'Subcontractor', consorcio: 'Consortium' },
    portafolio: ['Project', 'portfolio'], portafolioTxt: (n) => `${n} selected construction, electromechanical installation and fabrication projects for industry.`,
    brochure: ['Grupo HL', 'company profile'], lineas: ['Service', 'lines'], lineasTxt: 'Seven lines in three groups, with one team responsible from start to finish.',
    grupos: { A: 'A · Management', B: 'B · Construction and installation', C: 'C · Fabrication and maintenance' },
    quienes: 'Who we are', mision: 'Mission', vision: 'Vision', valores: 'Values', lineasT: 'Service lines', sectoresT: 'Sectors', certT: 'Certifications',
    presencia: 'Presence', sedesT: 'Offices', contacto: 'Contact', alcance: 'Scope', normas: 'Standards', aliados: 'Resources and partners', referencias: 'Reference projects',
    politica: ['Integrated', 'management policy'], compromisos: 'We are committed to', cimiento: 'Foundation', cubierta: 'System',
    reglas: ['HSE Golden Rules', 'and PIENSA®'], reglasTxt: 'Ten rules every Grupo HL worker knows and applies, and the method used to teach them.', piensaT: 'PIENSA®',
    practicas: 'Safety culture practices',
    directorio: ['Offices', 'and contact'], directorioTxt: 'Where we are and which channel to use for your request.', telefono: 'Phone', direccion: 'Address',
    canales: 'Online channels', canal: [['Quotes and projects', 'contacto'], ['Suppliers', 'proveedores'], ['Careers', 'trabaje'], ['Ethics line · confidential', 'buzon']],
    correo: 'General email', publicado: `Content published at ${URL_SITIO}`, mas: 'More at',
  },
};

const CSS = `
@font-face { font-family: Archivo; src: url(${FUENTE}) format('woff2'); font-weight: 100 900; font-stretch: 62% 125%; }
@page { size: A4; margin: 14mm 14mm 18mm; }
* { box-sizing: border-box; }
:root { --azul: #0B509E; --grafito: #14181C; --concreto: #E7EAEB; --papel: #F6F7F7; --muted: #56606A; --line: #C2C9CD; --senal: #B27900; --senal-soft: #F5E7C2; --acero: #8A949B; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { margin: 0; font-family: Archivo, Arial, sans-serif; font-size: 10.5pt; line-height: 1.5; color: var(--grafito); }
h1, h2, h3 { margin: 0; line-height: 1.05; text-wrap: balance; }
.dat { font-stretch: 72%; text-transform: uppercase; letter-spacing: .07em; font-weight: 600; font-size: 7.5pt; color: var(--muted); }
.rotulo { display: grid; grid-template-columns: 34px 1fr auto auto; align-items: stretch; border: 1.5px solid var(--grafito); margin-bottom: 9mm; }
.rotulo > * { padding: 5px 9px; display: flex; align-items: center; }
.rotulo > * + * { border-left: 1.5px solid var(--grafito); }
.rotulo .m { padding: 4px; color: var(--azul); } .rotulo .m svg { width: 100%; height: auto; }
.rotulo b { font-stretch: 115%; font-weight: 800; letter-spacing: .02em; font-size: 9.5pt; }
.portada { min-height: 245mm; display: grid; grid-template-rows: auto 1fr auto; break-after: page; }
.portada h1 { font-stretch: 122%; font-weight: 850; font-size: 46pt; letter-spacing: -.015em; line-height: .98; }
.portada h1 span { display: block; font-weight: 300; color: var(--azul); }
.portada .lead { font-size: 13pt; color: var(--muted); max-width: 120mm; margin: 6mm 0 0; }
.portada .centro { align-self: center; }
.cifras { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1.5px solid var(--grafito); }
.cifras div { padding: 4mm 0 0; } .cifras div + div { padding-left: 5mm; border-left: 1px solid var(--line); }
.cifras b { display: block; font-stretch: 125%; font-weight: 850; font-size: 26pt; line-height: 1; color: var(--azul); }
.lema { margin-top: 8mm; font-stretch: 108%; font-weight: 700; font-size: 12pt; }
.trazo { height: 3px; background: repeating-linear-gradient(-45deg, var(--senal) 0 6px, var(--grafito) 6px 12px); margin: 6mm 0; }
h2 { font-stretch: 115%; font-weight: 800; font-size: 17pt; margin: 0 0 3mm; display: flex; align-items: center; gap: 3mm; }
h2 .b { flex: none; width: 8mm; height: 8mm; border: 1.6px solid var(--azul); border-radius: 50%; display: grid; place-items: center; color: var(--azul); font-size: 10pt; font-stretch: 100%; }
h2::after { content: ""; flex: 1; border-top: 1px dashed var(--azul); }
h3 { font-stretch: 108%; font-weight: 750; font-size: 12.5pt; }
section { margin-bottom: 8mm; break-inside: avoid; }
p { margin: 0 0 2.5mm; }
.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.tres { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; }
.caja { border: 1px solid var(--grafito); background: var(--papel); padding: 4mm; break-inside: avoid; }
.caja h3 { margin-bottom: 1.5mm; }
.caja .dat { display: block; margin-bottom: 1mm; }
ul.lista { margin: 0; padding-left: 4.5mm; } ul.lista li { margin: 0 0 1.5mm; }
.proy { display: grid; grid-template-columns: 70mm 1fr; gap: 5mm; padding: 5mm 0; border-top: 1.5px solid var(--grafito); break-inside: avoid; }
.proy .foto { width: 70mm; height: 47mm; object-fit: cover; border: 1px solid var(--grafito); background: var(--concreto); }
.proy .sinfoto { width: 70mm; height: 47mm; border: 1px dashed var(--line); display: grid; place-items: center; color: var(--acero); }
.proy h3 { font-size: 13.5pt; margin-bottom: 1.5mm; }
.ficha { display: grid; grid-template-columns: auto 1fr; gap: .6mm 3mm; margin: 2mm 0; font-size: 9pt; }
.ficha dt { font-stretch: 72%; text-transform: uppercase; letter-spacing: .07em; font-weight: 600; font-size: 7pt; color: var(--muted); padding-top: .5mm; }
.ficha dd { margin: 0; }
.nums { display: flex; flex-wrap: wrap; gap: 2mm 6mm; margin-top: 2mm; }
.nums div b { display: block; font-stretch: 125%; font-weight: 850; font-size: 13pt; color: var(--azul); line-height: 1.1; }
.nums div span { font-size: 7.5pt; color: var(--muted); }
.sellos { display: flex; gap: 6mm; align-items: center; }
.sellos img { height: 20mm; width: auto; }
.regla { display: grid; grid-template-columns: 9mm 1fr; gap: 3mm; padding: 3mm 0; border-top: 1px solid var(--line); break-inside: avoid; }
.regla .n { font-stretch: 125%; font-weight: 850; font-size: 16pt; color: var(--azul); line-height: 1; }
.regla b { display: block; font-stretch: 108%; }
.pasos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border: 1px solid var(--grafito); }
.pasos div { padding: 3mm; } .pasos div + div { border-left: 1px solid var(--grafito); }
.pasos b { display: block; color: var(--azul); }
.estructura { display: grid; gap: 2mm; }
.estructura .techo, .estructura .base { border: 1.5px solid var(--grafito); padding: 3mm 4mm; background: var(--papel); }
.estructura .cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2mm; }
.estructura .cols div { border: 1px solid var(--grafito); border-top: 3px solid var(--azul); padding: 3mm; }
.estructura .cols b { display: block; font-stretch: 108%; margin-bottom: 1mm; }
.pie-doc { margin-top: 8mm; padding-top: 3mm; border-top: 1px solid var(--line); }
a { color: var(--azul); text-decoration: none; }
.salto { break-before: page; }
`;

const rotulo = (codigo, nombre, lang) => `<div class="rotulo"><span class="m">${MONO}</span><b>${T[lang].grupo.toUpperCase()}</b><span class="dat">${esc(codigo)}</span><span class="dat">${esc(nombre)} · ${T[lang].rev} ${MES}</span></div>`;
const portada = (lang, titulo, lead, codigo) => `
  <div class="portada">
    ${rotulo(codigo, titulo.join(' '), lang)}
    <div class="centro"><h1>${esc(titulo[0])}<span>${esc(titulo[1])}</span></h1><p class="lead">${esc(lead)}</p></div>
    <div>
      <div class="cifras">
        <div><b>${EDAD}</b><span class="dat">${T[lang].anios} · ${sitio.fundacion}</span></div>
        <div><b>${sitio.paises.length}</b><span class="dat">${T[lang].paises}</span></div>
        <div><b>${sedes.length}</b><span class="dat">${T[lang].sedes}</span></div>
      </div>
      <p class="lema">${esc(tx(sitio.lema, lang))}</p>
      <p class="dat">${T[lang].grupo}, ${T[lang].antes} · ${T[lang].razon} · ${URL_SITIO}</p>
    </div>
  </div>`;
const html = (lang, cuerpo) => `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${cuerpo}</body></html>`;
const nombreServ = (id, lang) => tx(servicios.find((s) => s.id === id)?.[lang]?.nombre ?? servicios.find((s) => s.id === id)?.es?.nombre, lang) ?? id;
const nombreSector = (id, lang) => (sectores.find((s) => s.id === id)?.[lang] ?? sectores.find((s) => s.id === id)?.es)?.nombre ?? id;
const lugar = (p, lang) => [p.ciudad, p.pais && PAISES[p.pais]?.[lang]].filter(Boolean).join(', ');

// ---------- Piezas ----------
function portafolio(lang) {
  const t = T[lang];
  const orden = [...proyectos].sort((a, b) => (sectores.find((s) => s.id === a.sector)?.orden ?? 9) - (sectores.find((s) => s.id === b.sector)?.orden ?? 9) || (a.visibilidad === 'destacado' ? -1 : 1) - (b.visibilidad === 'destacado' ? -1 : 1));
  let sectorActual = '';
  const fichas = orden.map((p) => {
    const d = p[lang] ?? p.es;
    const foto = p.fotos?.[0] ? `<img class="foto" src="${datos(join(C('proyectos'), p.fotos[0].archivo))}">` : `<div class="sinfoto dat">${esc(nombreSector(p.sector, lang))}</div>`;
    const cab = p.sector !== sectorActual ? `<h2>${esc(nombreSector((sectorActual = p.sector), lang))}</h2>` : '';
    const cifras = (p.cifras ?? []).slice(0, 4).map((c) => `<div><b>${esc(medida(c.valor, c.unidad, lang))}</b><span>${esc(tx(c.etiqueta, lang))}</span></div>`).join('');
    return `${cab}<div class="proy">${foto}<div>
      <h3>${esc(d.titulo)}</h3><p>${esc(d.resumen)}</p>
      <dl class="ficha">
        ${p.cliente ? `<dt>${t.cliente}</dt><dd>${esc(p.cliente)}</dd>` : ''}
        ${lugar(p, lang) ? `<dt>${t.lugar}</dt><dd>${esc(lugar(p, lang))}</dd>` : ''}
        ${p.rol?.tipo ? `<dt>${t.rol}</dt><dd>${esc(t.roles[p.rol.tipo])}</dd>` : ''}
        ${p.meses ? `<dt>${t.duracion}</dt><dd>${esc(medida(p.meses, 'meses', lang))}</dd>` : ''}
        <dt>${t.servicios}</dt><dd>${esc(p.servicios.map((s) => nombreServ(s, lang)).join(' · '))}</dd>
      </dl>
      ${cifras ? `<div class="nums">${cifras}</div>` : ''}
    </div></div>`;
  }).join('');
  return html(lang, portada(lang, t.portafolio, t.portafolioTxt(proyectos.length), 'PORTAFOLIO') + rotulo('PORTAFOLIO', t.portafolio.join(' '), lang) + fichas
    + `<p class="pie-doc dat">${t.mas} ${URL_SITIO}${rutas[lang].proyectos}</p>`);
}

function brochure(lang) {
  const t = T[lang];
  const n = pagina('nosotros', lang);
  const porGrupo = Object.entries(t.grupos).map(([g, nombre]) => `<div class="caja"><span class="dat">${esc(nombre)}</span>${servicios.filter((s) => s.grupo === g).map((s) => `<h3>${esc((s[lang] ?? s.es).nombre)}</h3><p>${esc((s[lang] ?? s.es).resumen)}</p>`).join('')}</div>`).join('');
  const sellos = certs.filter((c) => c.id.startsWith('iso')).map((c) => `<img src="${datos(join(C(''), c.sello))}" alt="">`).join('');
  return html(lang, portada(lang, t.brochure, n.quienes?.[0] ?? '', 'BROCHURE') + rotulo('BROCHURE', t.brochure.join(' '), lang) + `
    <section><h2>${t.quienes}</h2>${(n.quienes ?? []).map((q) => `<p>${esc(q)}</p>`).join('')}</section>
    <section class="dos">
      <div class="caja"><span class="dat">${t.mision}</span><h3>${esc(n.mision?.antes)} ${esc(n.mision?.clave)}</h3></div>
      <div class="caja"><span class="dat">${t.vision}</span><p>${esc(n.vision?.texto)}</p></div>
    </section>
    <section><h2>${t.valores}</h2><div class="tres">${(n.valores ?? []).map((v) => `<div class="caja"><h3>${esc(v.nombre)}</h3><p>${esc(v.frase)}</p></div>`).join('')}</div></section>
    <section class="salto"><h2>${t.lineasT}</h2><div class="tres">${porGrupo}</div></section>
    <section><h2>${t.sectoresT}</h2><div class="tres">${sectores.map((s) => `<div class="caja"><h3>${esc((s[lang] ?? s.es).nombre)}</h3><p>${esc((s[lang] ?? s.es).intro)}</p></div>`).join('')}</div></section>
    <section class="dos">
      <div><h2>${t.certT}</h2><div class="sellos">${sellos}</div><p class="dat" style="margin-top:3mm">${esc(certs.filter((c) => c.id.startsWith('iso')).map((c) => `${tx(c.norma, lang)} · ${c.ente}`).join('   '))}</p></div>
      <div><h2>${t.presencia}</h2><p>${esc(sitio.paises.map((p) => PAISES[p][lang]).join(' · '))}</p>
        <p class="dat">${t.sedesT}: ${esc(sedes.map((s) => s.ciudad).join(' · '))}</p></div>
    </section>
    <p class="pie-doc dat">${t.contacto}: ${URL_SITIO}${rutas[lang].contacto} · ${esc(sedes[0].telefono)}</p>`);
}

function lineas(lang) {
  const t = T[lang];
  const paginas = servicios.map((s, i) => {
    const d = s[lang] ?? s.es;
    const refs = proyectos.filter((p) => p.servicios.includes(s.id)).sort((a) => (a.visibilidad === 'destacado' ? -1 : 1)).slice(0, 4);
    return `<div class="${i ? 'salto' : ''}">${rotulo(t.grupos[s.grupo].split(' · ')[0] + '-0' + s.orden, d.nombre, lang)}
      <h1 style="font-stretch:115%;font-weight:800;font-size:26pt;margin-bottom:3mm">${esc(d.nombre)}</h1>
      <p class="dat" style="margin-bottom:4mm">${esc(t.grupos[s.grupo])}</p>
      <p style="font-size:12pt">${esc(d.resumen)}</p>
      <div class="trazo"></div>
      <section><h2>${t.alcance}</h2><div class="dos">${(d.alcance ?? []).map((a) => `<div class="caja"><h3>${esc(a.subcapacidad)}</h3><p>${esc(a.texto)}</p></div>`).join('')}</div></section>
      ${d.aliados ? `<section><h2>${t.aliados}</h2><p>${esc(d.aliados)}</p></section>` : ''}
      ${s.normas?.length ? `<section><h2>${t.normas}</h2><p>${esc(s.normas.join(' · '))}</p></section>` : ''}
      ${refs.length ? `<section><h2>${t.referencias}</h2><ul class="lista">${refs.map((p) => `<li><b>${esc((p[lang] ?? p.es).titulo)}</b> · ${esc(p.cliente ?? '')}${lugar(p, lang) ? ` · ${esc(lugar(p, lang))}` : ''}</li>`).join('')}</ul></section>` : ''}
    </div>`;
  }).join('');
  return html(lang, portada(lang, t.lineas, t.lineasTxt, 'SERVICIOS') + paginas);
}

function politica(lang) {
  const t = T[lang];
  const h = pagina('hse', lang).politica;
  return html(lang, rotulo('SGI', t.politica.join(' '), lang) + `
    <h1 style="font-stretch:122%;font-weight:850;font-size:34pt;margin-bottom:6mm">${esc(t.politica[0])} <span style="font-weight:300;color:var(--azul)">${esc(t.politica[1])}</span></h1>
    <p style="font-size:12.5pt;max-width:150mm">${esc(h.intro)}</p>
    <div class="trazo"></div>
    <div class="estructura">
      <div class="techo"><span class="dat">${t.cubierta}</span><p style="margin:0">${esc(h.cubierta)}</p></div>
      <div class="cols">${h.compromisos.map((c) => `<div><b>${esc(c.titulo)}</b>${esc(c.texto)}</div>`).join('')}</div>
      <div class="base"><span class="dat">${t.cimiento}</span><p style="margin:0">${esc(h.cimiento)}</p></div>
    </div>
    <section style="margin-top:8mm"><h2>${t.certT}</h2><div class="sellos">${certs.filter((c) => c.id.startsWith('iso')).map((c) => `<img src="${datos(join(C(''), c.sello))}" alt="">`).join('')}</div></section>
    <p class="pie-doc dat">${t.publicado}${lang === 'es' ? '/hse/' : '/en/hse/'}</p>`);
}

function reglas(lang) {
  const t = T[lang];
  const h = pagina('hse', lang);
  return html(lang, rotulo('HSE', t.reglas.join(' '), lang) + `
    <h1 style="font-stretch:122%;font-weight:850;font-size:32pt;margin-bottom:4mm">${esc(t.reglas[0])} <span style="font-weight:300;color:var(--azul)">${esc(t.reglas[1])}</span></h1>
    <p style="font-size:12pt">${esc(t.reglasTxt)}</p>
    <div class="trazo"></div>
    <div class="dos">${[0, 1].map((col) => `<div>${h.reglas.slice(col * 5, col * 5 + 5).map((r, i) => `<div class="regla"><span class="n">${String(col * 5 + i + 1).padStart(2, '0')}</span><span><b>${esc(r.titulo)}</b>${esc(r.texto)}</span></div>`).join('')}</div>`).join('')}</div>
    <section class="salto">${rotulo('HSE', t.piensaT, lang)}<h2>${t.piensaT}</h2><p>${esc(h.piensa.texto)}</p>
      <div class="pasos">${h.piensa.pasos.map((p) => `<div><b>${esc(p.titulo)}</b>${esc(p.texto)}</div>`).join('')}</div></section>
    <section><h2>${t.practicas}</h2><div class="dos">${(h.practicas ?? []).map((p) => `<div class="caja"><span class="dat">${esc(p.quien)}</span><h3>${esc(p.titulo)}</h3><p>${esc(p.texto)}</p></div>`).join('')}</div></section>
    <p class="pie-doc dat">${t.publicado}${lang === 'es' ? '/hse/' : '/en/hse/'}</p>`);
}

function directorio(lang) {
  const t = T[lang];
  return html(lang, rotulo('DIRECTORIO', t.directorio.join(' '), lang) + `
    <h1 style="font-stretch:122%;font-weight:850;font-size:34pt;margin-bottom:4mm">${esc(t.directorio[0])} <span style="font-weight:300;color:var(--azul)">${esc(t.directorio[1])}</span></h1>
    <p style="font-size:12pt">${esc(t.directorioTxt)}</p>
    <div class="trazo"></div>
    <section><div class="dos">${sedes.map((s) => `<div class="caja"><span class="dat">${esc(tx(s.nombre, lang))}</span><h3>${esc(s.ciudad)}, ${esc(PAISES[s.pais][lang])}</h3>
      <dl class="ficha"><dt>${t.direccion}</dt><dd>${esc(s.direccion)}</dd><dt>${t.telefono}</dt><dd>${esc(s.telefono)}</dd></dl></div>`).join('')}</div></section>
    <section><h2>${t.canales}</h2><dl class="ficha" style="font-size:10.5pt;gap:2mm 6mm">${t.canal.map(([nombre, r]) => `<dt>${esc(nombre)}</dt><dd><a href="https://${URL_SITIO}${rutas[lang][r]}">${URL_SITIO}${rutas[lang][r]}</a></dd>`).join('')}
      <dt>${t.correo}</dt><dd>hlisa@hlingenieros.com</dd></dl></section>
    <p class="pie-doc dat">${T[lang].razon} · ${URL_SITIO}</p>`);
}

// ---------- Salida ----------
const PIEZAS = [
  { carpeta: 'Portafolio', base: 'HL-Portafolio-de-proyectos', fn: portafolio, titulo: { es: 'Portafolio de proyectos', en: 'Project portfolio' }, area: 'Comercial', desc: { es: `${proyectos.length} proyectos seleccionados con cliente, lugar, servicios y cifras`, en: `${proyectos.length} selected projects with client, location, services and figures` } },
  { carpeta: 'Brochures', base: 'HL-Brochure-corporativo', fn: brochure, titulo: { es: 'Brochure corporativo', en: 'Company profile' }, area: 'Comunicaciones', desc: { es: 'Quiénes somos, valores, líneas de servicio, sectores, certificaciones y presencia', en: 'Who we are, values, service lines, sectors, certifications and presence' } },
  { carpeta: 'Brochures', base: 'HL-Lineas-de-servicio', fn: lineas, titulo: { es: 'Líneas de servicio', en: 'Service lines' }, area: 'Comercial', desc: { es: 'Las 7 líneas: alcance, recursos, normas y proyectos de referencia', en: 'The 7 lines: scope, resources, standards and reference projects' } },
  { carpeta: 'Politicas', base: 'HL-Politica-de-gestion-integral', fn: politica, titulo: { es: 'Política de gestión integral', en: 'Integrated management policy' }, area: 'Calidad', desc: { es: 'Compromisos con clientes, gente, comunidades y grupo; base de valores y sistema de gestión', en: 'Commitments to clients, people, communities and the group; values and management system' } },
  { carpeta: 'Politicas', base: 'HL-Reglas-de-Oro-HSE', fn: reglas, titulo: { es: 'Reglas de Oro HSE y PIENSA®', en: 'HSE Golden Rules and PIENSA®' }, area: 'HSE', desc: { es: 'Las 10 Reglas de Oro, la metodología PIENSA® y las prácticas de la cultura de seguridad', en: 'The 10 Golden Rules, the PIENSA® method and safety culture practices' } },
  { carpeta: 'Directorio', base: 'HL-Sedes-y-contacto', fn: directorio, titulo: { es: 'Sedes y contacto', en: 'Offices and contact' }, area: 'Comunicaciones', desc: { es: 'Las 4 sedes con dirección y teléfono, y los canales en línea por tipo de solicitud', en: 'The 4 offices with address and phone, and the online channels by type of request' } },
];

rmSync(SALIDA, { recursive: true, force: true });
for (const c of ['Certificaciones', 'Portafolio', 'Brochures', 'Formularios', 'Politicas', 'Directorio']) mkdirSync(join(SALIDA, c), { recursive: true });
const filas = [];
const navegador = await chromium.launch();
for (const pieza of PIEZAS) {
  for (const lang of ['es', 'en']) {
    const archivo = `${pieza.base}${lang === 'en' ? '-EN' : ''}.pdf`;
    const p = await navegador.newPage();
    await p.setContent(pieza.fn(lang), { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    if (process.env.CAPTURAS && lang === 'es') { // revisión visual: el mismo HTML en modo impresión, a ancho A4
      await p.emulateMedia({ media: 'print' }); await p.setViewportSize({ width: 794, height: 1123 });
      await p.screenshot({ path: join(process.env.CAPTURAS, `${pieza.base}.png`), fullPage: true });
    }
    await p.pdf({
      path: join(SALIDA, pieza.carpeta, archivo), format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: `<div style="width:100%;font-family:Arial,sans-serif;font-size:7px;letter-spacing:.06em;text-transform:uppercase;color:#56606A;padding:0 14mm;display:flex;justify-content:space-between"><span>Grupo HL · ${esc(pieza.titulo[lang])} · ${URL_SITIO}</span><span>${T[lang].hoja} <span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    await p.close();
    filas.push({ carpeta: pieza.carpeta, archivo, titulo: pieza.titulo[lang], idioma: lang.toUpperCase(), area: pieza.area, emisor: 'Grupo HL', desc: pieza.desc[lang] });
  }
}
await navegador.close();

// La política de datos oficial va tal cual (ya publicada en /legal/datos/).
const m = join(RAIZ, 'public/documentos/politica-datos-M-TI-001-act-2.pdf');
if (existsSync(m)) {
  copyFileSync(m, join(SALIDA, 'Politicas', 'HL-Politica-de-tratamiento-de-datos-M-TI-001.pdf'));
  filas.push({ carpeta: 'Politicas', archivo: 'HL-Politica-de-tratamiento-de-datos-M-TI-001.pdf', titulo: 'Política de tratamiento de datos personales', idioma: 'ES', area: 'Jurídica', emisor: 'HL Ingenieros S.A.', codigo: 'M-TI-001', desc: 'Manual de políticas y procedimientos de protección de datos (Ley 1581 de 2012)' });
}

const leeme = `# Documentos para la página Documentos (borrador)

Generados el ${FECHA} con \`node design/documentos.mjs\` a partir del contenido del sitio (\`src/content/\`).
**Revísalos antes de aprobarlos**: lo aprobado pasa a \`public/documentos/<carpeta>/\` y a la colección de documentos
(plan AG.11), queda público en la página Documentos y el agente lo cita. La tabla trae los datos de cada uno.

| Carpeta | Archivo | Título | Idioma | Área | Emisor | Código | Descripción |
|---|---|---|---|---|---|---|---|
${filas.map((f) => `| ${f.carpeta} | \`${f.archivo}\` | ${f.titulo} | ${f.idioma} | ${f.area} | ${f.emisor} | ${f.codigo ?? ''} | ${f.desc} |`).join('\n')}

**Datos clave:** para los generados, copia la *Descripción*. Para la política M-TI-001: "Manual M-TI-001 · Ley 1581 de 2012 · responsable HL Ingenieros S.A.".
**Vigente hasta:** vacío en todos (no vencen; se regeneran cuando cambie el sitio).

## Lo que no se pudo armar (falta el original)
- **Certificaciones:** los certificados ISO 9001, 14001 y 45001 en PDF los emite SGS; en el proyecto solo están los sellos. Hay que pedirlos a Calidad.
- **Formularios:** no hay formatos en PDF; la inscripción de proveedores y la hoja de vida se reciben por los formularios del sitio. Si Compras usa un formato propio, va aquí.
- **Portafolio de ECOHL:** el PDF original no está en el proyecto (solo su texto en \`contenido/institucional.md\`).

## Antes de subir, confirma
- **Sedes y contacto:** la dirección de Panamá dice "Patio MegaCranes" (Megacranes ya salió del grupo) y no está confirmado si el +507 6781 0368 es institucional (ver \`/pendientes/\`).
- **Portafolio:** las cifras de Columbus están por confirmar (web 8.300 t y 18.600 t vs. ECOHL), y ninguna ficha es posterior a 2020. Los proyectos discretos (D6) no se incluyen.
- **Brochure:** no lleva las cifras de 2020 (+530 proyectos, +4.000.000 HH al año) ni las empresas del grupo (D1), porque están pendientes.
`;
writeFileSync(join(SALIDA, 'LEEME.md'), leeme);
console.log(`${filas.length} PDF en documentos-web/`);
