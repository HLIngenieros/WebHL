# Plan F2 · Proyectos

> **Para agentes:** sub-skill requerida: superpowers:executing-plans (o subagent-driven-development).
> Los pasos usan casillas (`- [ ]`). Convención del proyecto: plan sin código completo; cada paso dice
> qué hacer y cómo verificarlo.

**Objetivo:** el corazón del sitio: fichas de proyecto, explorador con filtros y mapa de presencia, y
páginas de servicio y sector cuyas listas de proyectos se derivan del contenido, en ES y EN; con la
identidad por sección de la guía v1.2 (acentos, pods, lámina de foto, hoja de contactos y firmas de
movimiento de Proyectos, Servicios y Sectores).

**Arquitectura:** un módulo `src/lib/datos.ts` carga las colecciones y corre `auditar()` una sola vez;
todas las páginas de contenido lo usan, así la validación (referencias, slugs, modo lanzamiento) ya no
depende de `/pendientes/`. El enrutador `[...ruta].astro` sigue siendo el único archivo de rutas: suma
las de contenido (explorador, 22 fichas, índices, 7 servicios, 6 sectores, × 2 idiomas) y entrega cada
una a su plantilla en `src/plantillas/`. React entra con `@astrojs/react`: la tarjeta de proyecto y la
ilustración son componentes React **sin hidratar** (Astro los compila a HTML, 0 KB de JS) que comparten
fichas, servicios, sectores y el explorador; solo el explorador es isla (`client:idle`). Las imágenes de
las tarjetas se resuelven en Astro con `getImage()` y llegan a React como datos serializables. El mapa
es un SVG propio con geometría de Natural Earth (dominio público) proyectada al compilar el archivo.
La identidad por sección es CSS: `tokens.css` define `--sec`/`--sec-soft`/`--sec-ink` por
`[data-seccion]` (en `<html>` y en cualquier elemento, para que una tarjeta lleve el color de la
sección a la que enlaza) y los pods son clases de `global.css` que escriben igual Astro y React.

**Herramientas:** Astro 7.3, `@astrojs/react` + React 19 (nuevas), Tailwind 4 con los tokens,
Playwright Test. Sin Motion: el reacomodo es FLIP con la Web Animations API (~1 KB); Motion queda como
alternativa si el FLIP no se ve bien (guía §9 lo permite solo en el explorador).

**Especificación:** [especificacion.md](especificacion.md) §3, §4 (relaciones derivadas, material que
falta), §5 (Proyectos, Ficha, Servicio, Sector), §6 y §7 (F2); guía visual §5 (móvil y pantallas
grandes), §6 (rótulo, línea estructural, código de lámina, ejes con burbuja), §7 (filtros, tarjetas,
cifras, tablas), §3.5 (acentos de sección), §6 (pods y lámina de foto), §8 (fotografía: ≤ 800 px,
lámina, hoja de contactos) y §9 (Trazo, Izaje y firmas por sección).

## Restricciones globales

- **No inventar datos.** Lo que falta no se muestra (ni "Pendiente", ni celdas vacías, ni `undefined`):
  queda en `/pendientes/`. Excepción permitida: el pie de una foto sin pie es "Título · periodo".
- Discretas (D6): ficha propia, indexada y al final del explorador; **nunca** en listas de servicio o
  sector, relacionados, destacados, clientes del sector ni conteos de esas páginas.
- Cifras con `numero()` y unidades de `ui.ts`; la misma cifra se escribe igual en todo el sitio.
- El inglés se traduce en F5: en F2 las páginas EN existen con slugs EN, enlaces EN y textos de
  interfaz EN; el contenido cae al español con `bloque()`/`txt()`.
- Presupuesto: JS ≤ 30 KB gz por página, explorador ≤ 100 KB; fichas, servicios y sectores sin JS de
  React. Lighthouse móvil ≥ 95 en las 4 categorías. Solo `transform`, `opacity` y `clip-path`;
  reduced-motion sin animación.
- Accesibilidad: un H1 por página, axe sin violaciones en la matriz de pantallas, foco visible, el
  estado de los filtros con `aria-pressed` y texto (no solo color).
- Sin peticiones a terceros en tiempo de ejecución (el mapa es propio).
- **Fotos:** ninguna se muestra a más de 800 px CSS de ancho ni a sangre; la protagonista va en lámina
  (monocromo teñido con `--sec` + trazo; color al pasar el cursor) y las galerías en hoja de contactos.
  Variantes generadas: 480 y 800 px (nada de 1200).
- **Color por sección:** los componentes usan `--sec`, nunca un valor; `--accent` (azul) queda para
  logo, botón primario, foco y enlaces de texto corrido. Un estado siempre es chip con texto.
- Pods: P1 una por página (encima del H1) y en tarjetas; P2 para estructura; P3 a lo sumo una por
  pantalla.
- Todo lo de F0 y F1 sigue vigente: tokens, sin prettier, pocos archivos.
- Rama `f2-proyectos`; al cerrar, merge fast-forward a `main` y borrar la rama.

## Estructura de archivos

```
astro.config.mjs               + integración react
src/lib/datos.ts               carga única de colecciones + auditar(); rutas de contenido; tarjetas()
src/lib/contenido.ts           + medida(), relacionados(), sectoresDe(), serviciosDe(), clientesDe()
src/lib/explorador.ts          tipos serializables y filtros puros (los usa la isla: nada de Astro)
src/lib/mapa.ts                proyección y caja del mapa (pura)
src/lib/mapa-geo.ts            trazos de países ya proyectados (generado por design/mapa.mjs)
design/mapa.mjs                generador del mapa desde Natural Earth 50m (se corre a mano)
src/i18n/rutas.ts              + urlDe()
src/i18n/ui.ts                 + unidades, países, rótulos y textos de F2
design/tokens.css · contraste.py + acentos de sección claro/oscuro y sus pares de contraste
src/styles/global.css          + pods (.pod-rotulo, .pod-eje, .pod-senal), lámina, hoja de contactos
src/components/Pod.astro       atajo Astro para los 3 pods
src/components/Lamina.tsx      foto en lámina: picture + tinte + trazo (React sin estado)
src/components/Tarjeta.tsx     tarjeta de proyecto (React sin estado)
src/components/Ilustracion.tsx línea estructural por sector, en 3 capas (React sin estado)
src/components/Mapa.tsx        mapa de presencia (React sin estado; lo usa la isla)
src/components/Explorador.tsx  isla: filtros, hoja inferior, FLIP, sincronía con la URL
src/plantillas/                Proyectos, Ficha, Servicios, Servicio, Sectores, Sector (.astro)
src/pages/[...ruta].astro      enrutador: provisionales + contenido
tests/proyectos.spec.ts        pruebas puras de F2 y de las páginas nuevas
```

## Interfaces compartidas

**`src/i18n/rutas.ts`**
- `type Seccion = 'proyectos' | 'servicios' | 'sectores'`.
- `urlDe(seccion: Seccion, slug: { es: string; en: string }, lang: Lang): string` →
  `RUTAS[seccion][lang] + slug[lang] + '/'`.

**`src/i18n/ui.ts`**
- `UNIDADES: Record<Unidad, Record<Lang, string>>` con las 14 unidades del esquema: `t`, `kg`, `m`,
  `m²`, `m³`, `pd` (pulgadas-diámetro / inch-diameters), `u` (unidades / units), `t/día` / `t/day`,
  `t/año` / `t/yr`, `HH` / `man-hours`, `meses` / `months`, `días` / `days`, `%`, `MW`. `Unidad` se
  exporta desde `content.config.ts` (o se mueve el `z.enum` a `ui.ts` y el esquema lo importa).
- `PAISES: Record<string, Record<Lang, string>>` con los ISO-2 en uso (CO, EC, GT, PA, DO).
- Claves nuevas de `t()`: rótulo (cliente, dueño final, rol, ubicación, periodo, duración, HH, sector,
  servicios), roles (contratista, subcontratista, consorcio), secciones de plantillas (alcance,
  normas, capacidad, contratos, FAQ, cantidades, galería, relacionados, clientes, servicios aplicados),
  explorador (filtrar, todos, quitar filtros, sin resultados, `n` proyectos, sedes, países con obra) y
  llamadas a contacto.

**`src/lib/contenido.ts`** (puras; no incluyen discretas salvo `paraExplorador`)
- `medida(valor: number, unidad: Unidad | undefined, lang: Lang): string` → `"9.470.000 HH"`,
  `"5.250 t/día"`, `"30 %"` (espacio fino antes de `%` en ES, sin espacio en EN).
- `relacionados(xs, actual: Entrada<Proyecto>, n = 3)`: visibles, sin la actual; puntaje = 2 por mismo
  sector + 1 por servicio compartido; empate por el orden de siempre; solo puntaje > 0.
- `sectoresDe(xs, servicioId): string[]` y `serviciosDe(xs, sectorId): string[]`: ids derivados de los
  proyectos visibles, por frecuencia descendente y luego id.
- `clientesDe(xs, sectorId): string[]`: clientes únicos de los proyectos visibles del sector, en orden
  alfabético.
- `auditar()` además: un `pais` que no esté en `PAISES` es error de compilación (como los slugs).

**`src/lib/explorador.ts`** (lo importa la isla; sin dependencias de Astro)
- `type Imagen = { avif: string; webp: string; src: string; width: number; height: number; alt: string }`
  (`avif`/`webp` son `srcset`).
- `type DatosTarjeta = { id: string; codigo: string; url: string; titulo: string; cliente?: string;
  lugar?: string; periodo?: string; sector: { id: string; slug: string; nombre: string };
  servicios: { id: string; slug: string; nombre: string }[]; pais?: string; coordenadas?: [number,
  number]; cifra?: { valor: string; etiqueta: string }; imagen?: Imagen; discreta: boolean }`. `slug`
  es el del idioma de la página (lo que va en la URL del filtro).
- `type Filtros = { servicio?: string; sector?: string; pais?: string }` (valores = slug del idioma;
  país = ISO-2 en minúscula).
- `cumple(t: DatosTarjeta, f: Filtros): boolean` (Y entre dimensiones).
- `conteos(ts: DatosTarjeta[], f: Filtros, dim: keyof Filtros): Map<string, number>`: cuántas cumplen
  los **otros** filtros para cada valor de `dim` (una opción con 0 se muestra deshabilitada).
- `leerFiltros(search: string, validos: Record<keyof Filtros, Set<string>>): Filtros` (ignora valores
  desconocidos) y `escribirFiltros(f: Filtros): string` (`''` sin filtros; orden fijo servicio, sector,
  país).

**`src/lib/mapa.ts`**
- `CAJA = { oeste: -93, este: -59, sur: -6, norte: 21 }` (Guatemala a Ecuador y el Caribe; se ajusta en
  la Tarea 4 si algún país queda cortado) y `ANCHO = 1000`; `ALTO` se deriva.
- `proyectar([lat, lon]): [x, y]`: equirectangular con `cos(latitud media)`, redondeado a 1 decimal.
  `design/mapa.mjs` importa esta misma función para que trazos y puntos coincidan.

**`src/lib/datos.ts`** (solo Astro)
- `cargar(): Promise<{ datos: Required<Datos>; pendientes: Pendiente[] }>`: memoizada en el módulo;
  `auditar()` en modo `lanzamiento` si `import.meta.env.MODE === 'lanzamiento'`; en desarrollo, un
  `console.warn` por certificación vencida (sale de `pendientes.astro`).
- `rutasDeContenido(): Promise<{ params: { ruta: string }; props: PropsContenido }[]>` con
  `PropsContenido = { tipo: 'proyectos' | 'ficha' | 'servicios' | 'servicio' | 'sectores' | 'sector';
  lang: Lang; id?: string; alterno: string }`.
- `tarjetas(xs: Entrada<Proyecto>[], lang: Lang): Promise<DatosTarjeta[]>`: código `P-01…` por la
  posición en `paraExplorador` (estable en todo el sitio); imagen = primera foto con `getImage()` en
  AVIF y WebP, anchos `[480, 800]`; `cifra` = la primera de `cifras`; sin fotos, `imagen` vacía.

**Componentes**
- Pods (guía §6), clases de `global.css` con el mismo marcado en Astro y React:
  `.pod-rotulo` (P1: barra, código, nombre), `.pod-eje` (P2: burbuja con letra, nombre, línea y dato
  opcional; con `.con-eje` el eje punteado baja por el borde del bloque) y `.pod-senal` (P3: rayas,
  nombre en bloque `--sec`, código). `Pod.astro`: `{ forma: 'rotulo' | 'eje' | 'senal'; nombre:
  string; codigo?: string; letra?: string; dato?: string; seccion?: Seccion | 'hse' | 'noticias' |
  'nosotros' }` (con `seccion`, agrega `data-seccion` para tomar ese acento).
- `Lamina.tsx`: `{ imagen?: Imagen; sector: string; sizes: string; prioridad?: boolean; clase?: string }`.
  `<picture>` en monocromo (`filter: grayscale(1) contrast(1.15)`) + capa `--sec` en `multiply` +
  `Ilustracion` del sector en blanco encima (capa de trazo). Con `@media (hover: hover)`, al pasar el
  cursor (o con foco dentro del enlace que la contiene) el tinte y el trazo se retiran y la foto queda
  a color. Sin `imagen`: solo la `Ilustracion` sobre `--paper` con el mismo marco. `max-width: 800px`.
- `Tarjeta.tsx`: `{ t: DatosTarjeta; lang: Lang; prioridad?: boolean }`, con `data-seccion="proyectos"`.
  Guía §7: `Lamina` 4:3 arriba, P1 pequeño con el código `P-xx`, H3 con enlace a la ficha (toda la
  tarjeta clicable por el enlace estirado), cifra en `--sec` y rejilla clave/valor (cliente, lugar,
  periodo), solo con lo que exista. Discreta: sin marca visible.
- `Ilustracion.tsx`: `{ sector: string; titulo?: string; clase?: string }`. Seis dibujos de línea
  estructural (cemento: torre de precalentador y silo; minería: espesador y banda; agua y energía:
  digestores; petróleo y gas: tanques API y tubería; infraestructura: viga y pila; industria: nave con
  cercha) en `viewBox="0 0 300 200"`, en tres `<g>` (`.capa-estructura` con trazos `--ink` en los tres
  grosores, `.capa-ejes` punteada en `--sec`, `.capa-cotas` en `--signal`) para el paralaje de
  Sectores; prop `tono?: 'linea' | 'blanco'` (blanco para la lámina). `role="img"` + `aria-label` si lleva título; si no, `aria-hidden`. Clase
  `trazo` para el gesto Trazo.
- `Mapa.tsx`: `{ paises: string[]; puntos: { x, y, n, etiqueta }[]; sedes: { x, y, etiqueta }[];
  activo?: string; alElegir?: (pais: string) => void }`.
- `Imagen` se arma en `datos.ts` con `imagen(src: ImageMetadata, alt: string): Promise<Imagen>`
  (`getImage()` en AVIF y WebP, anchos `[480, 800]` sin ampliar); la usan `tarjetas()`, la ficha y la
  hoja de contactos.

## Foco de revisión

1. **Una discreta se cuela** en un servicio, un sector, los relacionados, los clientes del sector o un
   conteo de índice; en el explorador sí está, al final → Tareas 1, 4 y 7.
2. **Una ficha con datos faltantes se ve rota** (sin fotos, país, años, rol o con 0-2 cifras):
   ninguna celda vacía, ningún "undefined", "NaN" o "null", y la ilustración en lámina ocupa el lugar
   de la foto → Tarea 4.
3. **Una foto se ve grande y pobre:** a 2560 px ninguna `img` de `main` pasa de 800 px de ancho
   renderizado y ninguna variante generada pasa de 800 px → Tareas 2 y 4.
4. **El par de idioma o el color de sección fallan en páginas dinámicas:** cada ficha, servicio y
   sector EN enlaza a su par ES con `hreflang` y el selector, sus enlaces internos son EN, y `<html>`
   lleva el `data-seccion` correcto (una ficha es `proyectos` aunque se llegue desde un servicio) →
   Tareas 1, 2 y 4.
5. **El explorador sin JS, con filtros raros o en móvil:** sin JS se ven las 22 tarjetas y no hay
   controles muertos; `?sector=inexistente` se ignora; sin resultados aparece "Quitar filtros"; la hoja
   inferior atrapa el foco, cierra con Esc y lo devuelve; con reduced-motion no hay FLIP, estacas,
   capas ni paralaje → Tareas 5, 6 y 7.

---

### Tarea 1: Datos centralizados, rutas de contenido y funciones puras

**Archivos:** crear `src/lib/datos.ts`, `src/lib/explorador.ts`, `src/plantillas/` (vacío salvo lo de
esta tarea), `tests/proyectos.spec.ts`; modificar `src/lib/contenido.ts`, `src/i18n/rutas.ts`,
`src/i18n/ui.ts`, `src/pages/[...ruta].astro`, `src/pages/pendientes.astro`, `src/content/sitio.yaml`.

- [ ] Crear la rama `f2-proyectos`.
- [ ] `ui.ts`: `UNIDADES`, `PAISES` y las claves nuevas (ver Interfaces).
- [ ] `contenido.ts`: `medida`, `relacionados`, `sectoresDe`, `serviciosDe`, `clientesDe` y el error
  por país desconocido en `auditar()`.
- [ ] `rutas.ts`: `Seccion` y `urlDe`.
- [ ] `explorador.ts`: tipos, `cumple`, `conteos`, `leerFiltros`, `escribirFiltros`.
- [ ] `datos.ts`: `cargar()` y `rutasDeContenido()` (sin `tarjetas()` aún). `pendientes.astro` pasa a
  usar `cargar()`.
- [ ] `[...ruta].astro`: las claves `proyectos`, `servicios` y `sectores` salen de las provisionales;
  `getStaticPaths` concatena `rutasDeContenido()`; por ahora cada `tipo` muestra un H1 provisional con
  `alterno` pasado a `Base` (las Tareas 4-7 cambian cada uno por su plantilla).
- [ ] `sitio.yaml`: agregar a `confirmar` "Cifra de 7 países: las fichas solo registran CO, EC, GT y
  PA (y la sede de DO). ¿Cuáles son los otros?".
- [ ] Pruebas puras en `tests/proyectos.spec.ts` (reutilizar el generador `p()` de
  `contenido.spec.ts`; si hace falta, moverlo a `tests/apoyo.ts`):
  - (foco 1) con una discreta del mismo sector y servicio, `relacionados`, `sectoresDe`,
    `serviciosDe` y `clientesDe` no la incluyen;
  - `relacionados` prefiere mismo sector + servicio, excluye la actual, respeta `n` y no devuelve
    proyectos sin nada en común;
  - `medida(9470000, 'hh', …)`, `medida(5250, 'tpd', …)`, `medida(30, 'pct', …)` en ES y EN, y sin
    unidad;
  - `conteos` cuenta con los otros filtros aplicados; `cumple` es Y entre dimensiones;
  - `leerFiltros('?sector=nada&pais=co', …)` → `{ pais: 'co' }`; `escribirFiltros({})` → `''`;
  - (foco 4) `urlDe('proyectos', { es: 'planta-columbus', en: 'columbus-plant' }, 'en')` →
    `/en/projects/columbus-plant/`;
  - un proyecto con `pais: 'XX'` hace que `auditar` lance un error que lo nombra.
- [ ] Prueba de página (foco 4): para las 22 fichas, 7 servicios y 6 sectores, la ruta ES y la EN
  responden 200, el `hreflang` de cada una apunta a la otra y el selector de idioma lleva al par.
  Obtener la lista desde los YAML (`fs` + parseo simple de `slug:`) para no depender del HTML.
- [ ] Verificación manual una vez: renombrar `pendientes.astro` a `_pendientes.astro` y correr
  `npm run build:lanzamiento`: debe fallar igual (la validación ya no depende de esa página); revertir.
- [ ] `npm run check`, `npm run build`, `npm test` en verde. Commit: "F2: datos centralizados, rutas de
  contenido y funciones de relación".

### Tarea 2: Identidad por sección: acentos y pods

**Archivos:** modificar `design/tokens.css`, `design/contraste.py`, `docs/guia-visual.md` (§3.4 con
los resultados y valores oscuros en §3.5), `src/layouts/Base.astro`, `src/components/Barra.astro`,
`src/components/ui/Encabezado.astro`, `src/styles/global.css`, `src/pages/muestra.astro`; crear
`src/components/Pod.astro`; ampliar `tests/proyectos.spec.ts`.

- [ ] `tokens.css`: `--sec`, `--sec-soft`, `--sec-ink` por defecto iguales a `--accent`,
  `--accent-soft`, `--accent-ink`; un bloque `[data-seccion="proyectos"]` (y `servicios`, `sectores`,
  `hse`, `noticias`) con los valores claros de la guía §3.5 y sus `-soft`; los mismos selectores dentro
  de los dos bloques oscuros (que siguen idénticos) con acentos aclarados (punto de partida: ámbar
  `#F2B42A`, cian `#4FC3D9`, violeta `#A894E0`, verde `#5CC27D`, óxido `#F08A5D`), ajustados hasta pasar.
- [ ] `contraste.py`: leer también cada bloque `[data-seccion]` y verificar por sección `sec`/`bg` y
  `sec`/`paper` (4,5), `sec-ink`/`sec` (4,5), `sec`/`sec-soft` (4,5), en claro y oscuro.
  `python design/contraste.py` debe terminar en OK; copiar la tabla a la guía §3.4.
- [ ] `Base.astro`: `<html data-seccion={…}>` a partir de `seccionDe(Astro.url.pathname)` (prop
  `seccion` para forzarla). Inicio, Nosotros, Contacto y pie quedan sin atributo (azul).
- [ ] `Barra.astro`: el indicador de la sección activa y su texto usan `--sec`. En el menú móvil, cada
  enlace lleva un cuadro de 6 px en el acento de su sección (`data-seccion` por enlace).
- [ ] `global.css`: pods (ver Interfaces) y la regla de que `--sec` vale en cualquier elemento con
  `data-seccion`. `Encabezado.astro` usa `--sec` en la cota y el código de lámina, y acepta un slot
  `pod` encima del H1. `Pod.astro` (ver Interfaces).
- [ ] En `/muestra/`: los 3 pods en las 6 secciones, en claro y oscuro.
- [ ] Pruebas:
  - (foco 4) `<html>` tiene `data-seccion="proyectos"` en `/proyectos/` y en una ficha,
    `"servicios"` en `/en/services/`, y no lo tiene en `/` ni en `/nosotros/`;
  - el color calculado del indicador del menú en `/proyectos/` es distinto del de `/servicios/` e igual
    al de `--sec`;
  - un `.pod-rotulo` con `data-seccion="hse"` dentro de una página de proyectos toma el verde;
  - axe sin violaciones en `/muestra/` en claro y oscuro (contraste de los pods).
- [ ] Commit: "F2: acentos de sección y pods".

### Tarea 3: React, lámina, tarjeta e ilustraciones

**Archivos:** modificar `astro.config.mjs`, `package.json`, `src/lib/datos.ts` (`imagen()`,
`tarjetas()`), `src/scripts/revela.ts` (`.trazo`), `src/styles/global.css` (gesto Trazo, lámina),
`src/components/ui/Foto.astro` (anchos `[480, 800]`), `src/pages/muestra.astro`; crear
`src/components/Lamina.tsx`, `src/components/Tarjeta.tsx`, `src/components/Ilustracion.tsx`; ampliar
`tests/proyectos.spec.ts`.

- [ ] `npx astro add react` (React 19 y la versión de `@astrojs/react` compatible con Astro 7.3);
  revisar el diff de `astro.config.mjs` y `tsconfig.json` antes de aceptarlo.
- [ ] `Foto.astro`: anchos `[480, 800]` y `max-width: 800px` (guía §8). `imagen()` en `datos.ts`.
- [ ] `tarjetas()` en `datos.ts` (ver Interfaces). `alt` de la imagen: el pie si existe; si no, "Título
  · ciudad".
- [ ] `Ilustracion.tsx` con los 6 dibujos. Trazo (guía §9): cada trazo con `pathLength="1"`,
  `stroke-dasharray: 1` y `stroke-dashoffset` de 1 a 0 en `--t-trazo` con `--ease-plano`, escalonado
  por `--i`; el estado oculto solo existe bajo `html.js`; `revela.ts` agrega `.trazo` a su selector;
  `sin-revela` y reduced-motion muestran el dibujo completo. Probar cada dibujo en claro y oscuro.
- [ ] `Lamina.tsx` (ver Interfaces): el tinte y el trazo blanco con el gesto Trazo al entrar; la vuelta
  al color solo anima `opacity` de las capas y `filter` del propio `img` (no recalcula la página);
  reduced-motion: sin transición, el trazo completo.
- [ ] `Tarjeta.tsx` (ver Interfaces). Estilos con utilidades de Tailwind sobre los tokens; lo que no
  se pueda expresar así va en `global.css` bajo `.tarjeta`. Rejillas de tarjetas compartiendo bordes
  (guía §7): clase `.tarjetas` en `global.css`, 1/2/3 columnas por container query, 4 desde 1600 px.
- [ ] En `/muestra/`: una tarjeta con foto (Columbus), una sin foto (Maceo), una lámina suelta y las
  6 ilustraciones.
- [ ] Pruebas:
  - en `/muestra/` la tarjeta con foto tiene `picture` con `source` AVIF y WebP e `img` con `width` y
    `height`; la de Maceo tiene una ilustración con `role="img"` y ningún `img`;
  - `/muestra/` no carga JS de React (`npm run presupuesto` igual que antes, ≤ 30 KB);
  - con reduced-motion, los trazos tienen `stroke-dashoffset` 0;
  - (foco 3) ninguna variante en `dist/_astro` pasa de 800 px de ancho (leer dimensiones con sharp);
  - la lámina de la tarjeta de Columbus tiene `filter` gris y, con hover, el `img` queda sin filtro.
- [ ] Commit: "F2: React, lámina, tarjeta de proyecto e ilustraciones de línea".

### Tarea 4: Ficha de proyecto

**Archivos:** crear `src/plantillas/Ficha.astro`; modificar `src/pages/[...ruta].astro`; ampliar
`tests/proyectos.spec.ts`.

- [ ] Estructura (especificación §5, guía §6):
  - migas: enlace "Proyectos" al explorador del idioma;
  - `Encabezado` nivel 1 con P1 (`P-xx` · Proyectos) encima, el título, el resumen como entrada y la
    cota con el periodo (`medida` vacía si no hay años);
  - foto principal 3:2 en `Lamina prioridad` (LCP; ≤ 800 px, en ≥ 900 px a la derecha del encabezado,
    columnas 7+5) o la lámina con la ilustración del sector;
  - subsecciones (datos, descripción, cantidades, galería) marcadas con P2 (`.con-eje`): el eje
    punteado baja por el borde de la ficha;
  - `Rotulo` con cliente, dueño final (solo si difiere), rol (con nombre del consorcio si existe),
    ubicación (ciudad, país), periodo, duración, HH, sector (enlace) y servicios (enlaces); solo las
    celdas con valor;
  - `Cifras` con las cifras de la ficha (0 → la sección no aparece); se miden con su cota (firma de
    Proyectos);
  - descripción y, si existe, "Reto y resultado";
  - cantidades en `Tabla` (concepto, cantidad con `medida`), si existen;
  - galería en hoja de contactos (guía §8) con las fotos 2…n, si hay más de una: recorte 4:5 a color,
    marcas de corte, número y `figcaption` (pie o "Título · periodo"); cada foto es un `<button
    popovertarget>` que abre un `<div popover>` con la foto a ≤ 800 px y su pie (sin JS; cierra con Esc
    o clic fuera);
  - los enlaces a servicio y sector del rótulo llevan su `data-seccion` (cian, violeta);
  - relacionados: hasta 3 `Tarjeta` (`relacionados()`), si hay;
  - llamada a contacto: "¿Tiene un proyecto similar?" + `Boton` a `contacto`.
- [ ] `descripcion` de la página = resumen; `alterno` = la ficha en el otro idioma.
- [ ] Pruebas:
  - (foco 2) en todas las fichas ES y EN: un H1, ningún texto `undefined|NaN|null` en `main`, ninguna
    celda de rótulo vacía, y las fichas sin fotos muestran la ilustración;
  - Columbus: 4 cifras con `9.470.000` (ES) y `9,470,000` (EN), 11 filas de cantidades, 4 fotos en
    la hoja de contactos y la lámina principal con `fetchpriority="high"`; al pulsar la 2.ª foto se
    abre su `popover` y Esc lo cierra;
  - (foco 3) a 2560×1440, ninguna `img` visible de `main` (ni la del `popover` abierto) mide más de
    800 px de ancho;
  - (foco 1) los relacionados de cualquier ficha no enlazan a `patio-de-carbon-estrella` ni a
    `tanques-cobre-panama`; las fichas discretas sí existen y no tienen `noindex`;
  - (foco 4) en `/en/projects/columbus-plant/` todos los enlaces de `main` a proyectos, servicios y
    sectores empiezan por `/en/`;
  - las 51 fotos de `src/assets/proyectos/` aparecen como foto principal o de galería de su ficha
    (sumar `img` fuera de los relacionados) y ninguna variante en `dist/_astro` pasa de 200 KB (la
    prueba existente, que ahora recorre todas).
- [ ] Revisar en el navegador Columbus y Maceo a 390 y 1366 px, claro y oscuro.
- [ ] Commit: "F2: ficha de proyecto".

### Tarea 5: Mapa de presencia

**Archivos:** crear `design/mapa.mjs`, `src/lib/mapa.ts`, `src/lib/mapa-geo.ts`,
`src/components/Mapa.tsx`; modificar `src/pages/muestra.astro`; ampliar `tests/proyectos.spec.ts`.

- [ ] Descargar al scratchpad, en una carpeta propia, `ne_50m_admin_0_countries.geojson` de Natural
  Earth (dominio público). Es un dato externo: verificar que sea GeoJSON válido antes de usarlo.
- [ ] `design/mapa.mjs` (Node, sin dependencias): recibe la ruta del GeoJSON, recorta a `CAJA`,
  proyecta con `proyectar()` de `mapa.ts`, simplifica (Douglas-Peucker a ~1 unidad del `viewBox`) y
  escribe `mapa-geo.ts` con `{ id: ISO-2, d: string }[]` de los países que tocan la caja. Encabezado del
  archivo generado: fuente, licencia y comando. Meta: `mapa-geo.ts` ≤ 25 KB sin comprimir.
- [ ] `Mapa.tsx` (ver Interfaces): países en `--line-soft` con borde `--line`; los países con obra en
  `--accent-soft` con borde `--accent`; puntos por ciudad (círculo `--accent`, radio según `n`, número
  si `n > 1`); sedes con un cuadrado `--signal`; retícula de fondo `--grid` (guía §5); leyenda en HTML
  ("N países con obra · N sedes"). El SVG es `aria-hidden` (el filtro por país es el control
  accesible); con `alElegir`, clic en un país con obra lo elige y el activo se marca con borde `--ink`.
  Ancho completo del contenedor; en ≥ 1440 px ocupa todo el ancho de la ventana (guía §5). Colores en
  `--sec` (ámbar de Proyectos) en lugar de `--accent`.
  **Firma de Proyectos:** al entrar en pantalla, cada punto cae como una estaca (una línea vertical que
  baja con `transform` y el círculo que aparece al tocar suelo, escalonado ≤ .6 s en total, una vez);
  usa la clase `.izaje` del observador existente. Reduced-motion: puntos quietos.
- [ ] En `/muestra/`, el mapa con los puntos y sedes reales (sin isla).
- [ ] Pruebas:
  - `proyectar` deja Bogotá, Ciudad de Guatemala, Riobamba y Santo Domingo dentro de `0..ANCHO` ×
    `0..ALTO`, y Bogotá queda al sur y al este de Guatemala;
  - en `/muestra/`, el mapa tiene un `path` por cada país con obra (`data-pais`) y un punto por ciudad;
  - a 360 px no hay scroll horizontal (cubierto por la matriz; `/muestra/` ya está);
  - (foco 5) con reduced-motion, las estacas tienen `transform: none`.
- [ ] Commit: "F2: mapa de presencia".

### Tarea 6: Explorador de proyectos

**Archivos:** crear `src/components/Explorador.tsx`, `src/plantillas/Proyectos.astro`; modificar
`src/pages/[...ruta].astro`, `tests/presupuesto.mjs` (solo si la ruta del explorador cambió);
ampliar `tests/proyectos.spec.ts`.

- [ ] `Proyectos.astro`: `Encabezado` nivel 1 ("Proyectos", entrada con el total) y la isla
  `<Explorador client:idle …>` con `tarjetas(paraExplorador(...))`, las opciones de cada filtro
  (servicios por grupo y orden, sectores por orden, países con nombre) y los datos del mapa.
- [ ] `Explorador.tsx`:
  - SSR completo: mapa, barra de filtros y las 22 tarjetas (las 3 primeras con `prioridad`). Sin JS,
    la barra de filtros no se muestra (`html:not(.js)`) y la lista queda completa;
  - filtros (guía §7): tres grupos de botones con `aria-pressed` (activo en `--sec-soft` con borde
    `--sec`), "Todos" y conteo de `conteos()`;
    opción con 0 deshabilitada; el mapa también elige país;
  - al hidratar, `leerFiltros(location.search)`; cada cambio actualiza la URL con `replaceState`
    (`escribirFiltros`), el contador "N proyectos" (`aria-live="polite"`) y la lista;
  - las tarjetas no se desmontan: las que no cumplen llevan `hidden`; FLIP con
    `element.animate()` sobre `transform` para las que se mueven e Izaje para las que aparecen;
    sin animación con reduced-motion;
  - sin resultados: mensaje + botón "Quitar filtros";
  - < 900 px: botón "Filtrar (n)" que abre los filtros en `<dialog>` como hoja inferior (entra con
    `transform`), con "Ver N proyectos" para cerrar; Esc y el botón devuelven el foco;
  - ≥ 900 px: mapa (7 col.) y filtros (5 col.) arriba, tarjetas abajo.
- [ ] Enlaces de servicio y sector hacia el explorador filtrado (los usa la Tarea 7):
  `RUTAS.proyectos[lang] + '?' + escribirFiltros({ servicio: slug })`.
- [ ] Pruebas:
  - (foco 5) con `javaScriptEnabled: false`: 22 tarjetas visibles, la barra de filtros oculta;
  - (foco 1) las 2 últimas tarjetas son las discretas;
  - tras hidratar (`astro-island:not([ssr])`): clic en "Minería" → `aria-pressed="true"`, URL con
    `?sector=mineria`, solo tarjetas de minería y el contador coincide; en `/en/projects/` el
    parámetro es `?sector=mining`;
  - `/proyectos/?sector=cemento&servicio=fabricacion` llega filtrado; `?sector=nada` muestra 22;
  - (foco 5) una combinación sin resultados muestra "Quitar filtros" y al pulsarlo vuelven las 22;
  - clic en Panamá en el mapa filtra por país;
  - (foco 5) a 390 px: "Filtrar" abre el `dialog`, el foco queda dentro, Esc lo cierra y el foco vuelve
    al botón;
  - `npm run presupuesto`: explorador ≤ 100 KB gz (anotar el valor). Si se pasa o el TBT en Lighthouse
    queda bajo 95, cambiar a `@astrojs/preact` con `compat: true` (mismo código) y anotarlo aquí.
- [ ] Commit: "F2: explorador de proyectos".

### Tarea 7: Servicios y sectores

**Archivos:** crear `src/plantillas/{Servicios,Servicio,Sectores,Sector}.astro`; modificar
`src/pages/[...ruta].astro`; ampliar `tests/proyectos.spec.ts`.

- [ ] `Servicios.astro`: `Encabezado` nivel 1 con P1 y los 3 grupos con P2 A/B/C (guía §6); cada
  servicio con nombre (enlace), resumen y "N proyectos" (`deServicio().length`).
- [ ] `Servicio.astro` (especificación §5), cada bloque solo si tiene contenido:
  - `Encabezado` nivel 1 con P1 (código del grupo `A-01`… · Servicios), nombre y resumen;
  - alcance por subcapacidad (lista con H3). **Firma de Servicios:** un eje P2 vertical recorre la
    columna izquierda y crece con el scroll (`animation-timeline: scroll()` sobre `scaleY`); cada
    subcapacidad entra como una capa de plano que se superpone a la anterior (`animation-timeline:
    view()` con `transform` y `clip-path`). Sin soporte o con reduced-motion: todo visible y quieto;
  - recursos propios frente a aliados (dos columnas);
  - normas como `Chip`; capacidad; modelos de contrato;
  - proyectos: hasta 4 `Tarjeta` de `deServicio()` y "Ver los N proyectos" al explorador filtrado
    (solo si hay más de 4);
  - sectores derivados (`sectoresDe`) como enlaces;
  - FAQ con `<details>`;
  - contacto de la línea: `Boton` a `contacto` (el buzón llega con D7).
- [ ] `Sectores.astro`: los 6 sectores con su `Ilustracion`, nombre (enlace), intro y "N proyectos".
- [ ] `Sector.astro`: `Encabezado` nivel 1 con P1 y la `Ilustracion` del sector en grande.
  **Firma de Sectores:** escenario a todo el ancho de la ventana con retícula de fondo; las tres capas
  de la ilustración (estructura, ejes, cotas) se desplazan a velocidades distintas con el scroll
  (`animation-timeline: view()` sobre `translateY`, ≤ 40 px de recorrido). Sin soporte o con
  reduced-motion: capas quietas. Luego, intro, servicios aplicados (`serviciosDe`, enlaces, más `serviciosTipicos` si
  existe), todos los proyectos de `deSector()` en `Tarjeta`, clientes del sector (`clientesDe`, lista
  de texto) y llamada a contacto.
- [ ] Pruebas:
  - (foco 1) ninguna página de servicio o sector, ni sus índices, enlaza a las 2 discretas; los
    conteos de los índices suman solo visibles (minería: 3, no 4);
  - montaje mecánico muestra 4 tarjetas, "Ver los N proyectos" con `?servicio=montaje-mecanico` y los
    chips ASME, API 650 y AWS;
  - un servicio sin `faq` ni `capacidad` no muestra esos encabezados;
  - (foco 4) en `/en/services/mechanical-installation/` los enlaces internos son EN y el filtro usa
    `?servicio=mechanical-installation`;
  - `presupuesto`: servicios y sectores sin JS de React;
  - (foco 5) con reduced-motion, las capas de `/sectores/mineria/` y las subcapacidades de
    `/servicios/montaje-mecanico/` están en su posición final (`transform: none`, visibles).
- [ ] Commit: "F2: páginas de servicio y sector".

### Tarea 8: Verificación de la fase y cierre

**Archivos:** modificar `tests/pantallas.spec.ts`, `CLAUDE.md`.

- [ ] Agregar a la matriz de `pantallas.spec.ts`: `/proyectos/`, `/en/projects/`,
  `/proyectos/planta-columbus/`, `/proyectos/torre-grua-maceo/`, `/servicios/`,
  `/servicios/montaje-mecanico/`, `/sectores/`, `/sectores/mineria/`. Revisar las capturas de 360,
  1366 y 2560 px: impacto equivalente en móvil y en pantalla grande (guía §5), cada sección con su
  acento y su firma, y ninguna foto estirada.
- [ ] `npm run check`, `npm run build`, `npm test` y `npm run presupuesto` en verde.
- [ ] Lighthouse móvil sobre `/proyectos/`, `/proyectos/planta-columbus/` y
  `/servicios/montaje-mecanico/`: ≥ 95 en las 4 categorías, LCP < 2,0 s, CLS < 0,05; anotar en el
  commit.
- [ ] `npm run build:lanzamiento` sigue fallando con la lista de bloqueantes; anotar el número.
- [ ] Revisión de código de la rama (superpowers:requesting-code-review) y corrección de lo que salga.
- [ ] Registrar en `CLAUDE.md` la "Etapa 6 (fecha): F2 · Proyectos" con los resultados, y el siguiente
  paso: `docs/plan-f3.md` (F3 · Institucional; requiere D2).
- [ ] Commit: "Etapa 6: F2 · Proyectos"; merge fast-forward a `main` y borrar la rama.
