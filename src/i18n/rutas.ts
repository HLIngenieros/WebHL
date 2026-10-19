// Mapa del sitio (especificación §3): cada clave une la URL en español con su par en inglés.
export type Lang = 'es' | 'en';

export const RUTAS = {
  inicio: { es: '/', en: '/en/' },
  nosotros: { es: '/nosotros/', en: '/en/about/' },
  proyectos: { es: '/proyectos/', en: '/en/projects/' },
  servicios: { es: '/servicios/', en: '/en/services/' },
  sectores: { es: '/sectores/', en: '/en/sectors/' },
  hse: { es: '/hse/', en: '/en/hse/' },
  noticias: { es: '/noticias/', en: '/en/news/' },
  contacto: { es: '/contacto/', en: '/en/contact/' },
  trabaje: { es: '/trabaje-con-nosotros/', en: '/en/careers/' },
  proveedores: { es: '/proveedores/', en: '/en/suppliers/' },
  buzon: { es: '/buzon-etico/', en: '/en/ethics-line/' },
  acreedores: { es: '/acreedores/', en: '/en/creditors/' },
  datos: { es: '/legal/datos/', en: '/en/legal/privacy/' },
  terminos: { es: '/legal/terminos/', en: '/en/legal/terms/' },
} as const satisfies Record<string, Record<Lang, string>>;

export type ClaveRuta = keyof typeof RUTAS;

/** Barra (especificación §3): Servicios y Sectores van en el submenú de Proyectos. */
export const MENU: ClaveRuta[] = ['nosotros', 'proyectos', 'hse', 'noticias', 'contacto'];
/** Navegación completa del pie, con Servicios y Sectores. */
export const NAVEGACION: ClaveRuta[] = ['nosotros', 'proyectos', 'servicios', 'sectores', 'hse', 'noticias', 'contacto'];
/** Secciones que cuelgan de Proyectos en la barra. */
export const BAJO_PROYECTOS: ClaveRuta[] = ['servicios', 'sectores'];
export const PIE: ClaveRuta[] = ['trabaje', 'proveedores', 'buzon', 'acreedores', 'datos', 'terminos'];

export const ruta = (clave: ClaveRuta, lang: Lang): string => RUTAS[clave][lang];

/** Secciones con páginas de contenido (una por entrada de la colección del mismo nombre). */
export type Seccion = 'proyectos' | 'servicios' | 'sectores';
export const urlDe = (seccion: Seccion, slug: { es: string; en: string }, lang: Lang): string => `${RUTAS[seccion][lang]}${slug[lang]}/`;

export const langDe = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es');

/** URL equivalente en el otro idioma, o undefined si la página no tiene par (para hreflang). */
export function parExacto(pathname: string): string | undefined {
  const lang = langDe(pathname);
  const otro: Lang = lang === 'es' ? 'en' : 'es';
  return Object.values(RUTAS).find((x) => x[lang] === pathname)?.[otro];
}

/** Destino del selector de idioma: el par, o el inicio del otro idioma si no lo hay. */
export function par(pathname: string): string {
  return parExacto(pathname) ?? RUTAS.inicio[langDe(pathname) === 'es' ? 'en' : 'es'];
}

/** Sección a la que pertenece una URL (también sus subpáginas); el inicio no cuenta. */
export function seccionDe(pathname: string): ClaveRuta | undefined {
  const lang = langDe(pathname);
  return (Object.keys(RUTAS) as ClaveRuta[])
    .filter((k) => k !== 'inicio')
    .find((k) => pathname.startsWith(RUTAS[k][lang]));
}
