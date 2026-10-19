// Colecciones del sitio (especificación §4). El esquema es tolerante: lo que falta para lanzar no rompe la
// compilación, lo reporta auditar() en /pendientes/ y bloquea solo con `astro build --mode lanzamiento`.
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';
import { UNIDADES, type Unidad } from './i18n/ui';

const texto = z.object({ es: z.string(), en: z.string().optional() });
const slug = z.object({ es: z.string().regex(/^[a-z0-9-]+$/), en: z.string().regex(/^[a-z0-9-]+$/) });
const confirmar = z.array(z.string()).optional();
const coordenadas = z.tuple([z.number(), z.number()]); // [lat, lon] de la ciudad, nunca de la planta
// Unidades cerradas: su texto por idioma está en src/i18n/ui.ts.
const unidad = z.enum(Object.keys(UNIDADES) as [Unidad, ...Unidad[]]);
// El id es el nombre del archivo: glob() usaría el campo slug, que aquí es un objeto { es, en }.
const porArchivo = ({ entry }: { entry: string }) => entry.replace(/\.(yaml|md)$/, '');
const yaml = (carpeta: string) => glob({ pattern: '*.yaml', base: `./src/content/${carpeta}`, generateId: porArchivo });
const idiomas = <T extends z.ZodType>(t: T) => ({ es: t, en: t.optional() });

const proyectos = defineCollection({
  loader: yaml('proyectos'),
  schema: ({ image }) => z.object({
    slug,
    cliente: z.string().optional(),
    duenoFinal: z.string().optional(),
    rol: z.object({ tipo: z.enum(['contratista', 'subcontratista', 'consorcio']), nombre: z.string().optional() }).optional(),
    pais: z.string().length(2).optional(),
    ciudad: z.string().optional(),
    region: z.string().optional(),
    coordenadas: coordenadas.optional(),
    inicio: z.number().int().optional(),
    fin: z.number().int().optional(),
    meses: z.number().optional(),
    hh: z.number().optional(),
    sector: reference('sectores'),
    servicios: z.array(reference('servicios')).min(1),
    cifras: z.array(z.object({ valor: z.number(), unidad: unidad.optional(), etiqueta: texto })).default([]),
    cantidades: z.array(z.object({ valor: z.number().optional(), unidad: unidad.optional(), concepto: texto })).default([]),
    fotos: z.array(z.object({ archivo: image(), pie: texto.optional() })).default([]),
    visibilidad: z.enum(['destacado', 'normal', 'discreta']),
    fuente: z.enum(['web', 'ecohl']),
    confirmar,
    ...idiomas(z.object({ titulo: z.string(), resumen: z.string(), descripcion: z.string(), reto: z.string().optional() })),
  }),
});

const servicios = defineCollection({
  loader: yaml('servicios'),
  schema: z.object({
    grupo: z.enum(['A', 'B', 'C']),
    orden: z.number(),
    slug,
    buzon: z.string().optional(),
    normas: z.array(z.string()).default([]),
    confirmar,
    ...idiomas(z.object({
      nombre: z.string(),
      resumen: z.string(),
      alcance: z.array(z.object({ subcapacidad: z.string(), texto: z.string() })),
      propios: z.string().optional(),
      aliados: z.string().optional(),
      capacidad: z.string().optional(),
      contratos: z.array(z.string()).optional(),
      faq: z.array(z.object({ p: z.string(), r: z.string() })).optional(),
    })),
  }),
});

const sectores = defineCollection({
  loader: yaml('sectores'),
  schema: z.object({
    orden: z.number(),
    /** Sector principal de HL (Cemento y Minería): va primero y más grande (guía §13). */
    principal: z.boolean().default(false),
    slug,
    confirmar,
    ...idiomas(z.object({ nombre: z.string(), intro: z.string(), serviciosTipicos: z.string().optional() })),
  }),
});

const sedes = defineCollection({
  loader: file('src/content/sedes.yaml'),
  schema: z.object({
    nombre: texto,
    ciudad: z.string(),
    pais: z.string().length(2),
    direccion: z.string(),
    telefono: z.string().optional(),
    horario: texto.optional(),
    buzon: z.string().optional(),
    coordenadas,
    confirmar,
  }),
});

const certificaciones = defineCollection({
  loader: file('src/content/certificaciones.yaml'),
  schema: ({ image }) => z.object({
    norma: texto,
    ente: z.string(),
    codigo: z.string().optional(),
    vence: z.coerce.date().optional(),
    sello: image().optional(),
    pdf: z.string().optional(),
    confirmar,
  }),
});

const historia = defineCollection({
  loader: file('src/content/historia.yaml'),
  schema: ({ image }) => z.object({
    orden: z.number(),
    anio: z.number().int(), // de la década si no hay año exacto (guía §12.3)
    decada: texto,
    foto: image().optional(),
    pie: texto.optional(), // solo si es verificable
    confirmar,
    ...idiomas(z.object({ titulo: z.string(), texto: z.string() })),
  }),
});

const testimonios = defineCollection({
  loader: file('src/content/testimonios.yaml'),
  schema: ({ image }) => z.object({
    orden: z.number(), // la colección se lee por id: el orden de la página va aquí
    nombre: z.string(),
    cargo: texto,
    foto: image().optional(),
    autorizado: z.boolean(),
    cita: texto,
    fragmento: texto.optional(), // palabras textuales; omisiones con "[…]"
    anios: z.number().optional(), // años en la casa, solo si la cita lo dice
    aniosMas: z.boolean().optional(), // "más de N años"
    confirmar,
  }),
});

const sitio = defineCollection({
  loader: file('src/content/sitio.yaml'),
  schema: ({ image }) => z.object({
    fundacion: z.number().int(),
    lema: texto,
    paises: z.array(z.string().length(2)).min(1),
    cifras: z.array(z.object({ valor: z.number(), prefijo: z.string().optional(), unidad: unidad.optional(), etiqueta: texto })),
    redes: z.array(z.object({ red: z.string(), url: z.url() })),
    asociadas: z.array(z.object({ nombre: z.string(), logo: image().optional(), area: texto.optional(), descripcion: texto.optional(), aprobada: z.boolean() })).optional(),
    clientes: z.array(z.object({ nombre: z.string().optional(), logo: image() })).default([]),
    confirmar,
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/paginas', generateId: porArchivo }),
  schema: ({ image }) => z.object({
    pagina: z.enum(['nosotros', 'hse', 'datos', 'terminos', 'acreedores']),
    lang: z.enum(['es', 'en']),
    titulo: z.string(),
    descripcion: z.string(),
    revisionJuridica: z.boolean().optional(),
    confirmar,
    // Nosotros (guía §12.2) y, de estos, `indicadores` también en HSE (franja del inicio, §12.1-4).
    quienes: z.array(z.string()).optional(),
    mision: z.object({ antes: z.string(), clave: z.string() }).optional(),
    vision: z.object({ texto: z.string(), promesas: z.array(z.string()) }).optional(),
    foto: image().optional(),
    indicadores: z.array(z.object({ valor: z.number(), signo: z.string().optional(), unidad: z.string(), etiqueta: z.string(), fuente: z.string() })).optional(),
    valores: z.array(z.object({ nombre: z.string(), frase: z.string(), icono: z.enum(['ventana', 'anillos', 'calendario', 'escalones', 'casco']) })).optional(),
    presencia: z.object({ titulo: z.string(), clave: z.string(), texto: z.string() }).optional(),
  }),
});

export const collections = { proyectos, servicios, sectores, sedes, certificaciones, historia, testimonios, sitio, paginas };
