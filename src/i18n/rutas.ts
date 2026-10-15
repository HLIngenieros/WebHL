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

export const MENU: ClaveRuta[] = ['nosotros', 'proyectos', 'servicios', 'sectores', 'hse', 'noticias', 'contacto'];
export const PIE: ClaveRuta[] = ['trabaje', 'proveedores', 'buzon', 'acreedores', 'datos', 'terminos'];

export const ruta = (clave: ClaveRuta, lang: Lang): string => RUTAS[clave][lang];

export const langDe = (pathname: string): Lang => (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'es');

/** URL equivalente en el otro idioma; si la página no tiene par, el inicio del otro idioma. */
export function par(pathname: string): string {
  const lang = langDe(pathname);
  const otro: Lang = lang === 'es' ? 'en' : 'es';
  const r = Object.values(RUTAS).find((x) => x[lang] === pathname);
  return r ? r[otro] : RUTAS.inicio[otro];
}

/** Sección a la que pertenece una URL (también sus subpáginas); el inicio no cuenta. */
export function seccionDe(pathname: string): ClaveRuta | undefined {
  const lang = langDe(pathname);
  return (Object.keys(RUTAS) as ClaveRuta[])
    .filter((k) => k !== 'inicio')
    .find((k) => pathname.startsWith(RUTAS[k][lang]));
}
