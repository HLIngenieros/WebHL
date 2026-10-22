// Documentos públicos (D3, plan AG.6 y AG.11, maqueta aprobada 21-oct). Recibe el catálogo ya armado al compilar
// (src/lib/documentos.ts): Astro lo deja en el HTML y la isla solo agrega filtro y búsqueda. Carpetas con burbuja de
// eje, láminas con cajetín y cota de vigencia. Los vencidos no se muestran (se filtra también al abrir la página).
import { useMemo, useState } from 'preact/hooks';
import type { Lang } from '../i18n/rutas';
import './documentos.css';

export interface Documento {
  id: string; carpeta: string; titulo: string; url: string; idioma: string; area: string; emisor: string; codigo: string;
  vigenteHasta: string; descripcion: string; bytes: number; actualizado: string;
}

const CARPETAS = ['certificaciones', 'politicas', 'portafolio', 'brochures', 'formularios', 'directorio'] as const;
const NOMBRES: Record<Lang, Record<string, string>> = {
  es: { certificaciones: 'Certificaciones', politicas: 'Políticas', portafolio: 'Portafolio', brochures: 'Brochures', formularios: 'Formularios', directorio: 'Directorio' },
  en: { certificaciones: 'Certifications', politicas: 'Policies', portafolio: 'Portfolio', brochures: 'Brochures', formularios: 'Forms', directorio: 'Directory' },
};
const T = {
  es: {
    actualizado: 'Actualizado el', documentos: (n: number) => `${n} documento${n === 1 ? '' : 's'}`, buscar: 'Buscar: ISO, política, brochure…', boton: 'Buscar',
    todos: 'Todos', emite: 'Emite', vigente: 'Vigente hasta', pronto: 'Vence pronto', version: 'Versión vigente · actualizada', bajar: 'Descargar PDF',
    vacio: 'No hay documentos con esa búsqueda. Pruebe otra palabra o pregúntele al asistente.', sinDocs: 'Muy pronto publicaremos aquí nuestras certificaciones y políticas.',
  },
  en: {
    actualizado: 'Updated on', documentos: (n: number) => `${n} document${n === 1 ? '' : 's'}`, buscar: 'Search: ISO, policy, brochure…', boton: 'Search',
    todos: 'All', emite: 'Issued by', vigente: 'Valid until', pronto: 'Expires soon', version: 'Current version · updated', bajar: 'Download PDF',
    vacio: 'No documents match that search. Try another word or ask the assistant.', sinDocs: 'We will publish our certifications and policies here very soon.',
  },
};
const DIA = 86_400_000;
const plano = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function Documentos({ lang, docs }: { lang: Lang; docs: Documento[] }) {
  const t = T[lang];
  const [carpeta, setCarpeta] = useState('');
  const [q, setQ] = useState('');

  const hoy = Date.now();
  const vigentes = useMemo(() => docs.filter((d) => d.url && d.titulo && (!d.vigenteHasta || Date.parse(d.vigenteHasta) + DIA > hoy)), [docs]);
  const enCarpetas = CARPETAS.filter((c) => vigentes.some((d) => d.carpeta === c));
  const termino = plano(q.trim());
  const visibles = vigentes.filter((d) => (!carpeta || d.carpeta === carpeta) && (!termino || plano(`${d.titulo} ${d.descripcion} ${d.emisor} ${d.codigo} ${NOMBRES[lang][d.carpeta]}`).includes(termino)));
  const ultima = vigentes.reduce((m, d) => (d.actualizado > m ? d.actualizado : m), '');
  const fecha = (iso: string, mes = false) => {
    const [a, m, d] = iso.split('-');
    return mes ? `${m}-${a}` : `${d}-${m}-${a}`;
  };
  const mb = (b: number) => new Intl.NumberFormat(lang === 'es' ? 'es-CO' : 'en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(b / 1048576);

  if (!vigentes.length) return <p class="dc-estado">{t.sinDocs}</p>;

  return (
    <div class="dc">
      <div class="dc-herr">
        <div class="dc-fila">
          <span class="dc-act voz-datos"><i aria-hidden="true" />{ultima && `${t.actualizado} ${fecha(ultima)} · `}{t.documentos(visibles.length)}</span>
          <label class="dc-buscar">
            <input type="search" value={q} placeholder={t.buscar} aria-label={t.buscar} onInput={(e) => setQ((e.target as HTMLInputElement).value)} />
            <span class="voz-datos" aria-hidden="true">{t.boton}</span>
          </label>
        </div>
        <div class="dc-chips voz-datos" role="group">
          {['', ...enCarpetas].map((c) => (
            <button type="button" aria-pressed={carpeta === c} onClick={() => setCarpeta(c)}>
              {c ? NOMBRES[lang][c] : t.todos} <sup>{c ? vigentes.filter((d) => d.carpeta === c).length : vigentes.length}</sup>
            </button>
          ))}
        </div>
      </div>

      {enCarpetas.map((c, k) => {
        const xs = visibles.filter((d) => d.carpeta === c);
        if (!xs.length) return null;
        return (
          <section class="dc-grupo" id={c} key={c} aria-labelledby={`dc-${c}`}>
            <div class="dc-cab">
              <span class="dc-p2" aria-hidden="true">{'ABCDEF'[k]}</span>
              <h2 id={`dc-${c}`}>{NOMBRES[lang][c]}</h2>
              <span class="dc-eje" aria-hidden="true" />
              <span class="voz-datos dc-n">{xs.length}</span>
            </div>
            <div class="dc-laminas">
              {xs.map((d, i) => {
                const restante = d.vigenteHasta ? Date.parse(d.vigenteHasta) - hoy : 0;
                const pronto = !!d.vigenteHasta && restante < 60 * DIA;
                return (
                  <article class="dc-lam" style={`--i:${i}`} key={d.id}>
                    <div class="dc-lam-cab voz-datos"><span>{d.codigo || '—'}</span><span>{NOMBRES[lang][c]}</span></div>
                    <div class="dc-lam-cu">
                      <h3>{d.titulo}</h3>
                      {d.descripcion && <p>{d.descripcion}</p>}
                      <div class="dc-meta voz-datos">
                        {d.emisor && <span>{t.emite} <b>{d.emisor}</b></span>}
                        <span>{d.idioma}</span>
                        <span>PDF · {mb(d.bytes)} MB</span>
                      </div>
                    </div>
                    <div class={`dc-vig${pronto ? ' dc-pronto' : ''}`}>
                      <div class="dc-vig-l voz-datos">
                        {d.vigenteHasta ? <span>{t.vigente} <b>{fecha(d.vigenteHasta, true)}</b></span> : <span>{t.version} {fecha(d.actualizado, true)}</span>}
                        {pronto && <span class="dc-aviso">{t.pronto}</span>}
                      </div>
                      {d.vigenteHasta && (
                        <div class="dc-regla" style={`--p:${Math.max(4, Math.min(100, (restante / (365 * DIA)) * 100))}%`} aria-hidden="true">
                          <span class="dc-f" />{[0, 25, 50, 75, 100].map((v) => <i style={`left:${v}%`} />)}
                        </div>
                      )}
                    </div>
                    <a class="dc-bajar" href={d.url} target="_blank" rel="noopener">
                      <span>{t.bajar}</span><span class="dc-fl" aria-hidden="true">↓</span>
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
      {!visibles.length && <p class="dc-estado">{t.vacio}</p>}
    </div>
  );
}
