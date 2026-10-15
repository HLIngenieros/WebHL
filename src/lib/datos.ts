// Carga única del contenido para todas las páginas (especificación §4). Aquí corre auditar(): una
// referencia rota o un slug repetido detiene cualquier compilación, y en `--mode lanzamiento` también
// lo que falte, sin depender de que exista /pendientes/.
import { getCollection } from 'astro:content';
import { auditar, type Datos, type Pendiente } from './contenido';
import { RUTAS, urlDe, type Lang, type Seccion } from '../i18n/rutas';

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
