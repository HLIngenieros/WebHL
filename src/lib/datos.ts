// Carga única del contenido para todas las páginas (especificación §4). Aquí corre auditar(): una
// referencia rota o un slug repetido detiene cualquier compilación, y en `--mode lanzamiento` también
// lo que falte, sin depender de que exista /pendientes/.
import { getCollection } from 'astro:content';
import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';
import { auditar, bloque, txt, medida, periodo, paraExplorador, type Datos, type Entrada, type Pendiente, type Proyecto } from './contenido';
import type { DatosTarjeta, Imagen } from './explorador';
import { RUTAS, urlDe, type Lang, type Seccion } from '../i18n/rutas';
import { PAISES } from '../i18n/ui';

const NOMBRES = ['proyectos', 'servicios', 'sectores', 'sedes', 'certificaciones', 'historia', 'testimonios', 'sitio', 'paginas'] as const;

async function leer() {
  const datos = Object.fromEntries(await Promise.all(NOMBRES.map(async (n) => [n, await getCollection(n)]))) as {
    [K in (typeof NOMBRES)[number]]: Awaited<ReturnType<typeof getCollection<K>>>;
  };
  const modo = import.meta.env.MODE === 'lanzamiento' ? 'lanzamiento' : 'desarrollo';
  const pendientes = auditar(datos as unknown as Datos, { modo });
  if (modo === 'desarrollo') {
    for (const x of pendientes) if (x.coleccion === 'certificaciones' && x.tipo === 'aviso') console.warn(`[contenido] ${x.id}: ${x.detalle}`);
  }
  return { datos, pendientes };
}

let cache: ReturnType<typeof leer> | undefined;
export const cargar = (): ReturnType<typeof leer> => (cache ??= leer());
export type Contenido = Awaited<ReturnType<typeof leer>>;
export type { Pendiente };

export type TipoContenido = 'proyectos' | 'ficha' | 'servicios' | 'servicio' | 'sectores' | 'sector';
export type PropsContenido = { tipo: TipoContenido; lang: Lang; id?: string; alterno: string };

const LANGS: Lang[] = ['es', 'en'];
const sinBarras = (url: string) => url.replace(/^\/|\/$/g, '');

/** Rutas de las páginas de contenido en ambos idiomas, cada una con su par. */
export async function rutasDeContenido(): Promise<{ params: { ruta: string }; props: PropsContenido }[]> {
  const { datos } = await cargar();
  const out: { params: { ruta: string }; props: PropsContenido }[] = [];
  const indices: [Seccion, TipoContenido, TipoContenido][] = [
    ['proyectos', 'proyectos', 'ficha'],
    ['servicios', 'servicios', 'servicio'],
    ['sectores', 'sectores', 'sector'],
  ];
  for (const [seccion, indice, detalle] of indices) {
    for (const lang of LANGS) {
      const otro = lang === 'es' ? 'en' : 'es';
      out.push({ params: { ruta: sinBarras(RUTAS[seccion][lang]) }, props: { tipo: indice, lang, alterno: RUTAS[seccion][otro] } });
      for (const { id, data } of datos[seccion]) {
        out.push({
          params: { ruta: sinBarras(urlDe(seccion, data.slug, lang)) },
          props: { tipo: detalle, lang, id, alterno: urlDe(seccion, data.slug, otro) },
        });
      }
    }
  }
  return out;
}

// ── Imágenes y tarjetas: datos serializables para los componentes .tsx (Preact) ──

/** AVIF y WebP a 480 y 800 px (nunca más: guía §8), con el respaldo a 800. */
export async function imagen(src: ImageMetadata, alt: string): Promise<Imagen> {
  const ancho = Math.min(800, src.width);
  const widths = [480, 800].filter((w) => w <= src.width);
  const base = { src, width: ancho, widths: widths.length ? widths : [ancho] };
  const [avif, webp] = await Promise.all([getImage({ ...base, format: 'avif' }), getImage({ ...base, format: 'webp' })]);
  return {
    avif: avif.srcSet.attribute, webp: webp.srcSet.attribute, src: webp.src,
    width: ancho, height: Math.round((ancho * src.height) / src.width), alt,
  };
}

type ProyectoEntrada = Entrada<Proyecto>;

/** Lugar legible: "Cartagena, Colombia". */
export const lugarDe = (p: Proyecto, lang: Lang) =>
  [p.ciudad, p.pais ? PAISES[p.pais]?.[lang] : undefined].filter(Boolean).join(', ') || undefined;

/** Código de lámina estable en todo el sitio: la posición en el explorador. */
export async function codigos(): Promise<Map<string, string>> {
  const { datos } = await cargar();
  return new Map(paraExplorador(datos.proyectos as unknown as ProyectoEntrada[]).map((x, i) => [x.id, `P-${String(i + 1).padStart(2, '0')}`]));
}

export async function tarjetas(xs: ProyectoEntrada[], lang: Lang): Promise<DatosTarjeta[]> {
  const { datos } = await cargar();
  const cods = await codigos();
  const etiqueta = (seccion: 'servicios' | 'sectores', id: string) => {
    const e = datos[seccion].find((x) => x.id === id)!;
    return { id, slug: e.data.slug[lang], nombre: bloque(e.data as { es: { nombre: string }; en?: { nombre: string } }, lang).nombre };
  };
  return Promise.all(xs.map(async ({ id, data: p }) => {
    const textos = bloque(p, lang);
    const foto = p.fotos[0];
    const c = p.cifras[0];
    return {
      id,
      codigo: cods.get(id)!,
      url: urlDe('proyectos', p.slug, lang),
      titulo: textos.titulo,
      cliente: p.cliente,
      lugar: lugarDe(p, lang),
      periodo: periodo(p),
      sector: etiqueta('sectores', p.sector.id),
      servicios: p.servicios.map((s) => etiqueta('servicios', s.id)),
      pais: p.pais?.toLowerCase(),
      coordenadas: p.coordenadas,
      cifra: c ? { valor: medida(c.valor, c.unidad, lang), etiqueta: txt(c.etiqueta, lang)! } : undefined,
      imagen: foto ? await imagen(foto.archivo as ImageMetadata, txt(foto.pie, lang) ?? [textos.titulo, p.ciudad].filter(Boolean).join(' · ')) : undefined,
      discreta: p.visibilidad === 'discreta',
    };
  }));
}
