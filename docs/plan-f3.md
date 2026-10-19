# Plan F3 · Institucional

> **Para agentes:** sub-skill requerida: superpowers:executing-plans (o subagent-driven-development).
> Los pasos usan casillas (`- [ ]`). Convención del proyecto: plan sin código completo; cada paso dice
> qué hacer y cómo verificarlo.

**Objetivo:** el sitio completo en español: fuente sin repintado (LCP), Inicio y Nosotros con la
dirección visual aprobada el 2026-10-19, y HSE, Noticias, Acreedores y legales tras sus maquetas.

**Arquitectura:** las dos páginas nuevas entran por el enrutador único `[...ruta].astro` como
plantillas (`src/plantillas/Inicio.astro`, `Nosotros.astro`), igual que las de F2, y leen el contenido
de `cargar()` (`src/lib/datos.ts`). Las piezas de cada página viven en `src/components/inicio/` y
`src/components/nosotros/`. Las dos animaciones grandes son **scripts propios sin librerías**: el gemelo
digital (canvas) y la tira de negativos (scroll). Su lógica pura (geometría, proyección, avance,
tratamiento por época) va en `src/lib/` para probarla sin navegador; los scripts en `src/scripts/` solo
la conectan al DOM. Todo el contenido está en el HTML: sin JS o con reduced-motion se ve completo y
quieto.

**Herramientas:** Astro 7.3, Preact (sin islas nuevas: no hace falta hidratar nada en F3), Tailwind 4
con los tokens, Playwright Test, `fonttools` (Python, solo para F3.0, en `design/`). Sin GSAP, sin
three.js, sin Motion.

**Diseño que se implementa:** [guia-visual.md](guia-visual.md) v1.4: **§12 completa y §13** (Inicio,
Nosotros, tira de negativos, comportamiento común), §2.2 (monograma y reglas), §2.3 (lema), §7 (botón de
trazo, barra inmersa), §8 (mosaico de cabecera, archivo histórico, pictogramas), §9 (firmas y bucles
permitidos). [especificacion.md](especificacion.md) v1.2 (§3 menú y prevalencia, §5 Proyectos y Sectores): §2 (D2), §4 (historia, testimonios, sitio),
§5 (Inicio, Nosotros), §6 (presupuesto), §7 (F3 y F3.0). Maquetas de referencia en
[design/maquetas/](../design/maquetas/): fijan composición y movimiento; los valores salen de los tokens.

## Estado (2026-10-19, rama `f3`)

| Tarea | Estado | Commit |
|---|---|---|
| 1 · Fuente y LCP (F3.0) | ✅ cerrada | `771bcda` |
| 2 · Marca con el monograma | ✅ | `e49e467` |
| 3 · Datos del inicio | ✅ | `1903d5d` |
| 4 · Hero, barra inmersa, botón de trazo | ✅ | `92e05e7` |
| 5 · Gemelo digital | ✅ | `495008b` |
| 6 · Franja de sectores y HL en cifras | ✅ | `223cde0` |
| 7 · Maquetas del resto del inicio | ✅ aprobadas (guía §12.1-4, `design/maquetas/inicio-resto.html`) | — |
| 7b · Maquetas de Proyectos y Sectores | ✅ aprobadas (guía §13, `design/maquetas/{sectores,explorador}.html`) | — |
| 8a · Menú con submenú de Proyectos | ✅ | `7d807f7` |
| 8 · Resto del inicio (sectores con prevalencia) | ✅ (cierra F3.1) | (este) |
| **8b · Página de Sectores** | **siguiente** | — |
| 8c · Explorador con mapa vivo | pendiente | — |
| 9-11 · Nosotros (F3.2) | ✅ cerrada | `bda87aa`, `2a177e0`, `aba255a` |
| 12-13 · F3.3 (maquetas → páginas) | pendiente | — |
| 14 · Cierre de la fase | pendiente | — |

Se hizo F3.2 antes de la puerta de la Tarea 7 para que Juan David aprobara maquetas una sola vez. El
registro detallado (decisiones tomadas, pruebas por tarea) está en `.superpowers/sdd/plan-f3/progress.md`
(local, no versionado); las decisiones con efecto visible están resumidas en `CLAUDE.md`.

## Restricciones globales

- **No inventar datos.** Lo que falta no se muestra: queda en `/pendientes/`. Las décadas de la
  historia son el dato real; un pie de foto solo si es verificable.
- **Testimonios y empresas asociadas:** en lanzamiento solo los `autorizado` / `aprobada`; si no hay
  ninguno, la sección se oculta sin hueco y **no bloquea** `build:lanzamiento`. En desarrollo se ven con
  marca "sin autorizar" / "por confirmar".
- **Cifras escritas en el HTML** con su valor real (58, 7, 4, 3…); la animación parte de ahí. La edad
  se calcula con `edad()`, nunca se escribe.
- **Solo tokens:** colores, tamaños, pesos, anchos y curvas de `design/tokens.css`
  (`tests/menores.spec.ts` lo vigila). El hero del inicio usa los primitivos `--hl-*` porque es grafito
  en los dos temas (guía §12.1). Si se agrega un token de color, correr `python design/contraste.py`.
- **Movimiento:** solo `transform`, `opacity`, `clip-path` (y `filter` en la tira, guía §12.3). Bucles
  solo en el gemelo, la cinta P3 y el punto de "Hablar con HL", y se detienen fuera de pantalla y con
  la pestaña oculta. `prefers-reduced-motion`: estado final, sin bucles.
- **Presupuesto:** JS ≤ 30 KB gz por página (inicio y nosotros incluidos); Lighthouse móvil ≥ 95 en las
  4 categorías; LCP < 2,0 s; CLS < 0,05. El H1 es el LCP del inicio.
- **Fotos ≤ 800 px**; la ampliación de la tira ≤ 560 px.
- **Rutas y idiomas:** ES completo; EN usa el texto ES donde falte (como en F2), con `lang` correcto.
- Regla del proyecto: si algo nuevo no encaja en la guía, primero se ajusta la guía.

## Foco de revisión

Lo que ninguna prueba "feliz" cubre y más puede fallarle a una persona:

1. **Volver al inicio con el router** (View Transitions): el gemelo y la barra inmersa se reinician sin
   duplicar bucles ni oyentes → Tareas 4 y 5.
2. **Sin JS o con reduced-motion**, Inicio y Nosotros muestran todo el contenido (los 6 hitos con foto,
   las cifras finales, los 4 valores… ) y nada queda oculto u opaco → Tareas 5, 6, 10 y 11.
3. **360 px**: el H1 expandido del inicio y el año gigante de la tira no desbordan ni causan scroll
   horizontal → Tareas 4, 11 y 14.
4. **Modo oscuro** forzado (`data-theme="dark"`): las secciones claras de Nosotros, las fichas de
   cifras y el botón de trazo conservan contraste y no quedan grafito sobre grafito → Tareas 6, 10 y 14.
5. **Lanzamiento con secciones vacías:** sin testimonios autorizados ni asociadas aprobadas, Nosotros
   no deja hueco, la numeración se recalcula y `build:lanzamiento` no falla por ellas → Tareas 9 y 10.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `design/fuente.py` | F3.0: reduce Archivo a los rangos usados y calcula las métricas de las fuentes de respaldo |
| `public/fonts/archivo-var-latin.woff2` | La fuente reducida (reemplaza la actual) |
| `src/styles/global.css`, `design/tokens.css` | `@font-face` de respaldo y familias con respaldo |
| `src/assets/marca/` | Monograma (ya existe) |
| `public/favicon.svg` | Monograma color |
| `src/components/Marca.astro` | Marca provisional: monograma + "HL INGENIEROS" (+ "Desde 1968") |
| `src/components/Barra.astro` | Prop `inmersa` (solo inicio) y paso a barra normal al salir del hero |
| `src/components/ui/BotonTrazo.astro` | Botón de trazo (guía §7) |
| `src/lib/inicio.ts` | `cifrasInicio()` y datos de la franja |
| `src/lib/gemelo.ts` | Geometría y proyección del gemelo (puro) |
| `src/scripts/gemelo.ts` | Canvas, bucle, cursor, pausa |
| `src/components/inicio/{Hero,FranjaSectores,FichasCifras}.astro` | Bloques del inicio |
| `src/plantillas/Inicio.astro` | Página de inicio |
| `src/lib/nosotros.ts` | `hitos()`, `tratamiento()`, `avance()`, `publicables()` |
| `src/scripts/tira.ts` | Tira de negativos (scroll → transformaciones) |
| `src/scripts/testimonios.ts` | Selector con avance automático |
| `src/components/nosotros/*.astro` | Mosaico, Tira, MisionVision, Valores, Presencia, Testimonios, Asociadas, Cierre |
| `src/plantillas/Nosotros.astro` | Página Nosotros |
| `tests/inicio.spec.ts`, `tests/nosotros.spec.ts` | Pruebas de las dos páginas (puras y de navegador) |

## Interfaces compartidas

```ts
// src/lib/inicio.ts
type CifraInicio = { clave: 'trayectoria' | 'presencia' | 'sedes' | 'calidad'; valor: number; etiqueta: string };
export function cifrasInicio(d: { fundacion: number; paises: string[]; sedes: number; certificaciones: number }, lang: Lang, hoy?: Date): CifraInicio[];

// src/lib/gemelo.ts
export type Disciplina = 'civil' | 'mecanico' | 'electrico' | 'fabricacion' | 'mantenimiento';
export const DISCIPLINAS: Disciplina[]; // en este orden; 'mantenimiento' resalta toda la planta
export type Segmento = [x1: number, y1: number, z1: number, x2: number, y2: number, z2: number, grupo: Disciplina | 'grua' | 'suelo'];
export function planta(): Segmento[];
export function proyectar(p: [number, number, number], vista: { giro: number; inclinacion: number; ancho: number; alto: number }): [number, number];
export function recortar(s: Segmento, nivel: number): Segmento | null; // corte del levantamiento por niveles

// src/lib/nosotros.ts
export type Hito = { id: string; anio: number; decada: string; titulo: string; texto: string; foto?: ImageMetadata; pie?: string; hoy: boolean };
// HistoriaData = el `data` de la colección historia tras la Tarea 9 (orden, anio, decada, foto?, pie?, es/en)
export function hitos(historia: Entrada<HistoriaData>[], lang: Lang, hoy?: Date): Hito[]; // + "Hoy" al final
export function tratamiento(anio: number, hoy?: Date): { gris: number; sepia: number; contraste: number }; // 1968 → {1, .35, 1.12}; año actual → {0, 0, 1}
export function avance(progreso: number, anios: number[]): { anio: number; indice: number; local: number }; // progreso 0..1 del scroll
export function publicables<T extends { autorizado?: boolean; aprobada?: boolean }>(xs: T[], modo: 'desarrollo' | 'lanzamiento'): T[];
```

`Barra.astro` recibe `inmersa?: boolean`; `Base.astro` la pasa con una prop nueva `barra?: 'normal' |
'inmersa'`. `BotonTrazo.astro`: props `href`, `texto`.

---

## F3.0 · Fuente y LCP

### Tarea 1: Archivo reducida y respaldo con métricas ajustadas

**Archivos:** crear `design/fuente.py`; modificar `public/fonts/archivo-var-latin.woff2`,
`src/styles/global.css`, `design/tokens.css` (`--f`), `tests/estilos.spec.ts`.

- [ ] Línea base: Lighthouse móvil (como en F2) de `/proyectos/` y `/proyectos/planta-columbus/`;
  anotar LCP y tamaño de la fuente (88 KB).
- [ ] `pip install fonttools brotli` y `design/fuente.py <origen.woff2>`:
  - instancia los ejes al rango que usan los tokens y las maquetas: `wght` 300–900, `wdth` 72–125
    (`fontTools.varLib.instancer`, rangos, no instancias fijas);
  - conserva el subconjunto latino actual (mismo `unicode-range`);
  - escribe `public/fonts/archivo-var-latin.woff2` y imprime su tamaño;
  - calcula y imprime dos bloques `@font-face` de respaldo sobre `local("Arial")`:
    **"Archivo respaldo"** (métricas de `wdth` 100, peso 400) y **"Archivo respaldo ancho"** (`wdth`
    122, peso 850), con `size-adjust` (ancho medio de Archivo frente a Arial), `ascent-override`,
    `descent-override` y `line-gap-override` (de la tabla `hhea`/`OS/2` de la instancia).
  - Origen: el woff2 de `@fontsource-variable/archivo` 5.3 (el actual sirve como origen).
- [ ] Pegar los dos `@font-face` en `global.css`. `--f` pasa a `"Archivo", "Archivo respaldo",
  "Arial Narrow", system-ui, sans-serif`; las voces expandidas (H1, H2, cifras: las clases que usan
  `--wdth-display`/`--wdth-title`/`--wdth-stat`) usan una familia con "Archivo respaldo ancho" en
  segundo lugar. Nuevo token `--f-ancha` para eso.
- [ ] Pruebas en `tests/estilos.spec.ts`:
  - `public/fonts/archivo-var-latin.woff2` pesa ≤ 60 KB (si la reducción no llega, anotar el valor
    real y fijar la prueba ahí: lo que resuelve el LCP es el respaldo);
  - la hoja servida contiene `font-family: "Archivo respaldo"` con `size-adjust` y la "ancho";
  - en `/proyectos/planta-columbus/`, el `h1` computa una `font-family` que incluye "Archivo respaldo
    ancho" y el `p` del cuerpo "Archivo respaldo";
  - con la petición de la fuente bloqueada (`page.route` → abort), la altura del `h1` de la ficha
    difiere ≤ 4 % de la altura con la fuente (el respaldo no mueve el texto).
- [ ] `npm test` en verde. Lighthouse otra vez: LCP del explorador y la ficha < 2,0 s, CLS 0; anotar
  antes/después en el commit. Si no baja de 2,0 s, probar `font-display: optional` solo para la cara
  expandida y anotar el resultado antes de decidir (preguntar a Juan David si cambia lo que se ve).
- [ ] Commit: "F3.0: fuente reducida y respaldo con métricas (LCP)". Cierra F3.0.

---

## F3.1 · Inicio

### Tarea 2: Marca provisional con el monograma

**Archivos:** crear `src/components/Marca.astro`; modificar `src/components/Barra.astro`,
`src/components/Pie.astro` (si muestra el logo), `public/favicon.svg`, `src/styles/global.css`;
ampliar `tests/barra.spec.ts`.

- [ ] `Marca.astro` (props `variante: 'color' | 'calado'`, `lema?: boolean`): el SVG del monograma en
  línea (leído de `src/assets/marca/*.svg` con `?raw`), con `aria-hidden`, + "HL INGENIEROS" (expandida
  115 %/800, `--fs-marca-nombre`) y, si `lema`, "Desde 1968" en voz de datos. Espacio libre = altura del
  monograma; monograma ≥ 24 px. Reemplaza `.logo-hl`/`.logo-nombre` en la barra (el enlace conserva
  `aria-label="HL Ingenieros, inicio"`). La versión calada toma `currentColor`.
- [ ] `public/favicon.svg` = `monograma-hl.svg` (sin el comentario).
- [ ] 404: el monograma ocupa el lugar de una burbuja de eje (guía §2.2, momento de marca).
- [ ] Pruebas: la barra tiene un `svg` con `viewBox` del monograma dentro de `a.logo`; el texto "HL
  INGENIEROS" está; ya no existe `.logo-hl`; `favicon.svg` contiene `#0B509E` y un `path` (no `<text>`).
- [ ] Commit: "F3.1: marca provisional con el monograma".

### Tarea 3: Datos del inicio

**Archivos:** modificar `src/content.config.ts` (sitio), `src/content/sitio.yaml`, `src/lib/contenido.ts`
(auditar); crear `src/lib/inicio.ts`; crear `tests/inicio.spec.ts`.

- [ ] Esquema `sitio`: `lema: texto`; `paises: z.array(z.string().length(2))`. En `sitio.yaml`: el lema
  ES de la guía §2.3 y EN propuesto; `paises: [CO, PA, CR, DO, GT, BO, EC]` (fuente:
  `contenido/institucional.md` §1, comentario en el YAML) y quitar de `confirmar` la duda de los 7
  países. Agregar a `PAISES` (`src/i18n/ui.ts`) CR y BO si faltan; `auditar` falla si un código de
  `paises` no tiene nombre.
- [ ] `cifrasInicio()` (interfaz arriba): trayectoria = `edad(fundacion, hoy)`, presencia =
  `paises.length`, sedes = número de sedes, calidad = número de certificaciones ISO. Etiquetas por idioma
  en `src/i18n/ui.ts`.
- [ ] Pruebas puras: con fundación 1968 y `hoy` 2026-10-19 → `[58, 7, 4, 3]` en ese orden de claves;
  con `hoy` 2027-01-01 → trayectoria 59; `auditar` con un país `XX` en `paises` lanza error.
- [ ] Commit: "F3.1: datos del inicio (lema, países, cifras)".

### Tarea 4: Hero, barra inmersa y botón de trazo

**Archivos:** crear `src/plantillas/Inicio.astro`, `src/components/inicio/Hero.astro`,
`src/components/ui/BotonTrazo.astro`; modificar `src/pages/[...ruta].astro` (inicio deja de ser
provisional), `src/layouts/Base.astro` (prop `barra`), `src/components/Barra.astro`; ampliar
`tests/inicio.spec.ts`, `tests/barra.spec.ts`.

- [ ] `Hero.astro` según guía §12.1-1: marco de lámina con zonas A–H y 1–4 (voz de datos, `aria-hidden`),
  retícula, bloque de texto centrado en vertical bajo la barra, `h1` con el lema en tres `span`
  ("Construimos" · "la industria" · "con gente que cumple, desde <b>1968</b>"; el año del lema es texto,
  no se calcula), `BotonTrazo` a `proyectos`, contenedor del canvas (Tarea 5) e indicador "Bajar". Las
  líneas del H1 suben con Izaje en CSS (solo `transform`), legibles desde el primer pintado.
- [ ] `BotonTrazo.astro` según guía §7 (cuatro trazos, llenado, etiqueta y flecha, barrido de señal,
  flecha que da la vuelta, marcas de registro). Solo CSS; el enlace funciona desde el inicio; con
  reduced-motion se ve lleno y quieto. Foco visible igual que el hover.
- [ ] Barra inmersa (guía §7): con `inmersa`, la barra va dentro del hero, sin fondo, monograma calado
  blanco, números de sección en superíndice, "Hablar con HL" con borde de señal y punto que titila, cota
  inferior que se mide. Un `IntersectionObserver` sobre el hero quita la clase `inmersa` al salir (barra
  normal pegajosa) y la devuelve al volver. Se registra en `astro:page-load` y se desconecta en
  `astro:before-swap` (foco 1). Móvil: marca + menú.
- [ ] Metadatos del inicio: `<title>` "HL Ingenieros" y `description` = el lema en una línea (guía §2.3).
- [ ] Pruebas:
  - `/` tiene un solo `h1` con el lema completo en su texto; `/en/` el lema EN; la `meta description`
    de `/` es el lema;
  - el `h1` no tiene texto de subtítulo, cifras ni segundo botón en el hero (`.hero a` = solo
    "Ver proyectos" y los de la barra);
  - en `/` la barra tiene `inmersa` arriba y la pierde tras `scrollTo(0, 2000)`; en `/nosotros/`
    nunca la tiene;
  - (foco 1) ir a `/nosotros/` y volver con el menú: `inmersa` está otra vez y hay un solo observador
    (contador en `window.__barraObs` o equivalente);
  - (foco 3) a 360 px, `document.documentElement.scrollWidth <= 360`;
  - botón de trazo: `href` correcto; con reduced-motion su fondo computado es `--accent`.
- [ ] Commit: "F3.1: hero, barra inmersa y botón de trazo".

### Tarea 5: Gemelo digital

**Archivos:** crear `src/lib/gemelo.ts`, `src/scripts/gemelo.ts`; modificar
`src/components/inicio/Hero.astro`; ampliar `tests/inicio.spec.ts`.

- [ ] `gemelo.ts` (lib, puro): `planta()` porta la geometría de `design/maquetas/inicio.html`
  (nave, losas, torre, silos, banda, postes y cable, grúa, suelo) con el grupo de cada segmento;
  `proyectar()` con la perspectiva de la maqueta; `recortar()` para el levantamiento por niveles
  (devuelve el tramo bajo `nivel` o `null`).
- [ ] `scripts/gemelo.ts`: canvas con `devicePixelRatio`; levantamiento por niveles (≈ 2 s) con línea
  de corte punteada en señal; giro lento + seguimiento del cursor (suavizado); cada 2,8 s la siguiente
  disciplina en señal con una etiqueta en voz de datos (texto de `src/i18n/ui.ts`); colores de la
  guía §12.1. **Pausa** (no dibuja) con el hero fuera de pantalla o `document.hidden`; con
  reduced-motion dibuja una vez la planta completa, sin giro ni resaltado. Se carga después del primer
  pintado (`requestIdleCallback` o `load`), se reinicia en `astro:page-load` y libera el bucle en
  `astro:before-swap`. Canvas `aria-hidden`. Expone `data-estado` = `quieto` | `animando` | `pausa` en el
  contenedor.
- [ ] Pruebas puras: cada disciplina de `DISCIPLINAS` (menos `mantenimiento`) tiene ≥ 1 segmento en
  `planta()`; hay segmentos `grua` y `suelo`; `recortar` de un segmento vertical 0→90 a nivel 45
  devuelve 0→45, y a nivel −1 devuelve `null`; `proyectar` del origen con giro 0 cae en el centro
  horizontal.
- [ ] Pruebas de navegador: `canvas[aria-hidden="true"]` existe; tras 3 s `data-estado="animando"`;
  `scrollTo` fuera del hero → `pausa`; con reduced-motion → `quieto`; (foco 1) ir y volver con el router
  → un solo bucle (contador `window.__gemeloBucles === 1`).
- [ ] `npm run presupuesto`: inicio ≤ 30 KB gz (anotar).
- [ ] Commit: "F3.1: gemelo digital".

### Tarea 6: Franja de sectores y HL en cifras

**Archivos:** crear `src/components/inicio/{FranjaSectores,FichasCifras}.astro`; modificar
`src/plantillas/Inicio.astro`; ampliar `tests/inicio.spec.ts`.

- [ ] `FranjaSectores.astro` según guía §12.1-2: rayas fijas a cada lado con borde, carril propio con la
  cinta (los 6 sectores en voz de datos, enlazados a su página, separados por rombos dibujados con
  CSS). La lista accesible aparece una vez; la copia que cierra el bucle va con `aria-hidden` e
  `inert`. Con reduced-motion o hover/foco dentro, la cinta se detiene.
- [ ] `FichasCifras.astro` según guía §12.1-3 con `cifrasInicio()`: cuatro celdas (burbuja A–D, nombre,
  L-02.n, cifra que cuenta desde su valor escrito, texto, dibujo SVG que se traza al entrar y al pasar,
  pie). Dibujos: cota 1968 → año actual; 7 estacas con los códigos de `paises`; 4 ejes con las sedes;
  3 sellos ISO. Hover/foco: celda en `--accent`, dibujo blanco y señal, marcas de registro. 2 columnas
  bajo 760 px. Los textos de las fichas en `src/i18n/ui.ts`.
- [ ] Pruebas:
  - la franja enlaza a los 6 sectores y solo una copia es accesible;
  - (foco 2) con JS desactivado, las cifras dicen 58, 7, 4 y 3 (año 2026), y los dibujos son visibles;
  - las estacas llevan CO, PA, CR, DO, GT, BO, EC;
  - (foco 4) con `data-theme="dark"`, el texto de las fichas contrasta (axe sin violaciones de
    `color-contrast` en `/`);
  - axe sin violaciones en `/` y `/en/`.
- [ ] Commit: "F3.1: franja de sectores y HL en cifras".

### Tarea 7: Maquetas del resto del inicio · puerta de aprobación

**Archivos:** maquetas en el acompañante visual (`.superpowers/`); al aprobarse, copiar a
`design/maquetas/inicio-resto.html` y agregar a la guía §12.1-4 lo decidido.

- [ ] Maquetas, con el lenguaje de §12 y fotos reales, de: 3-4 proyectos destacados (`destacados()`,
  nunca discretas), los 3 grupos de servicio, los sectores, la franja HSE con indicadores (−64 % / −72 %
  del PDF ECOHL), últimas noticias (oculto si no hay) y logos de clientes (sin First Quantum, D6).
- [ ] **Se detiene aquí hasta que Juan David apruebe.** Registrar lo aprobado en la guía (§12.1-4) y,
  si cambia algo de la especificación §5, también allí.
- [ ] Commit: "F3.1: maquetas aprobadas del resto del inicio".

### Tarea 8a: Menú con submenú de Proyectos

**Archivos:** `src/i18n/rutas.ts` (`MENU` de 5 entradas; `NAVEGACION` de 7 para el pie), `src/i18n/ui.ts`,
`src/components/Barra.astro` (panel y menú móvil), nuevo `src/components/PanelProyectos.astro`,
`src/components/Pie.astro`, `src/lib/contenido.ts` (función pura para el panel), `tests/barra.spec.ts`.
Diseño: guía §7 y §13.1, `design/maquetas/sectores.html` §1.

- [ ] `MENU` = nosotros, proyectos, hse, noticias, contacto; el pie sigue con los 13 enlaces (agrega
  servicios y sectores a su propia lista).
- [ ] Datos del panel, calculados al compilar con una función pura: sectores por `orden` con su número
  de proyectos visibles (`deSector`) y la cifra de la obra mayor de Cemento y Minería; servicios por grupo.
  Prueba unitaria.
- [ ] Botón ▾ junto a "Proyectos" (`aria-expanded`, `aria-controls`); el panel abre con clic/Enter/Espacio,
  cierra con Esc (devuelve el foco al botón), clic fuera, salida del foco y `astro:before-swap`. Sin JS, el
  botón no se muestra y "Proyectos" sigue siendo un enlace. Script en la barra, sin isla.
- [ ] En `/servicios/…` y `/sectores/…`, "Proyectos" queda marcado (`aria-current="true"`).
- [ ] Menú móvil: Proyectos con botón ± que despliega sectores y servicios; inmersa del inicio incluida.
- [ ] Pruebas: 5 entradas en 1366 px sin desborde; panel por teclado (abre, Esc, foco); clic fuera
  cierra; los 6 sectores y 7 servicios enlazan a su página; Cemento y Minería primero; sin JS no hay botón;
  móvil despliega; pie con 13 enlaces. `npm run check`.
- [ ] Commit: "F3: menú con submenú de Proyectos".

### Tarea 8: Resto del inicio

**Archivos:** `src/components/inicio/{Destacados,ServiciosInicio,SectoresInicio,FranjaHse,Clientes}.astro`,
`src/plantillas/Inicio.astro`, `tests/inicio.spec.ts`. Diseño: guía §12.1-4 y
`design/maquetas/inicio-resto.html`. Reutilizar de F2 `destacados()`, `tarjetas()`, `deSector()` e
`Ilustracion`. Mínimo:

- [ ] Destacados con `Tarjeta` de F2 (`tarjetas(destacados(...))`): (foco) ninguna discreta.
- [ ] Sectores con prevalencia (guía §12.1, maqueta `sectores.html` §3): Cemento y Minería en celdas de 2
  columnas; los otros cuatro pequeños. La franja P3 del hero también pone Cemento y Minería primero.
- [ ] Logos de clientes de `sitio.clientes` con `alt` = nombre.
- [ ] Noticias: el bloque no se renderiza si no hay noticias.
- [ ] `presupuesto` ≤ 30 KB; axe sin violaciones; Lighthouse móvil de `/` ≥ 95, LCP < 2,0 s.
- [ ] Commit: "F3.1 · Inicio" (cierra F3.1).

### Tarea 8b: Página de Sectores

**Archivos:** `src/plantillas/Sectores.astro`, `src/content/sectores/*.yaml` (foto y obra de la lámina
de Cemento y Minería, si hace falta un campo `lamina`), `tests/proyectos.spec.ts` (o uno nuevo).
Diseño: guía §13.3, `design/maquetas/sectores.html` §2.

- [ ] Escenarios de Cemento y Minería (lámina con `Foto` ≤ 800 px, `Ilustracion` en tres capas con
  paralaje por `animation-timeline: view()`, cifras, 3 obras sin discretas, enlaces al sector y al
  explorador filtrado `?sector=`).
- [ ] Índice en filas de los otros cuatro. Sin JS y con reduced-motion se ve completo y quieto.
- [ ] Pruebas: orden Cemento → Minería → resto; ninguna discreta; enlaces; 360 px sin desborde; axe.
- [ ] Commit: "F3: página de Sectores".

### Tarea 8c: Explorador con mapa vivo

**Archivos:** `src/components/{Explorador,Mapa}.tsx`, `src/lib/mapa.ts` (agrupación y encuadre, puros),
`src/plantillas/Proyectos.astro`, `tests/proyectos.spec.ts`. Diseño: guía §13.2,
`design/maquetas/explorador.html`.

- [ ] Funciones puras con prueba unitaria: agrupar puntos por distancia en pantalla, encuadre de un
  conjunto de puntos o de un país, límites de acercamiento.
- [ ] Mapa: viewBox animado, botones, Ctrl + rueda (con pista), arrastre, pellizco; retícula, escala,
  grupos, rótulos de ciudad, ventana de la obra; los puntos siguen a los filtros; clic en país filtra y
  encuadra; resaltado cruzado tarjeta ↔ punto.
- [ ] Filtros en placas (Cemento y Minería anchas), servicios por grupo, países bajo el mapa, conteos,
  total con cota, URL (`?sector=&servicio=&pais=`; se lee al cargar), pod de línea con enlace.
- [ ] Sin JS: la lista completa en el HTML, como hoy. Teclado: placas, chips, botones del mapa y puntos
  enfocables (los puntos con `aria-label`); Esc cierra la ventana.
- [ ] Presupuesto: explorador ≤ 100 KB gz (hoy 31,8); Lighthouse móvil ≥ 95; INP < 200 ms.
- [ ] Commit: "F3: explorador con mapa vivo".

---

## F3.2 · Nosotros

### Tarea 9: Contenido de Nosotros

**Archivos:** modificar `src/content.config.ts` (historia, testimonios, sitio.asociadas, paginas),
`src/content/{historia,testimonios,sitio}.yaml`, `src/content/paginas/nosotros.es.md`,
`src/lib/contenido.ts` (auditar); crear `src/lib/nosotros.ts`; crear `tests/nosotros.spec.ts`.

- [ ] Esquemas (especificación §4): `historia` + `decada: texto` ("Década de los 60"…, "Desde el 2000"),
  `foto: image().optional()`, `pie: texto.optional()`; `anio` pasa a obligatorio (1968, 1970, 1980,
  1990, 2000). `testimonios` + `fragmento: texto.optional()`, `anios: z.number().optional()`.
  `sitio.asociadas[]` + `area: texto`, `descripcion: texto.optional()`, `aprobada: z.boolean()`.
  `paginas` (solo nosotros) acepta opcionales: `foto` (imagen de la misión), `indicadores[]` (`valor`,
  `unidad`, `etiqueta`, `fuente`), `valores[]` (`nombre`, `frase`, `icono`:
  `ventana|anillos|calendario|escalones|casco`).
- [ ] Contenido:
  - `historia.yaml`: década, foto (`../assets/historia/n-….jpg`) y, en el de los 80, pie "Hernando
    Londoño". Quitar el `insumo` de año del `auditar` (la década es el dato) y agregar un aviso no
    bloqueante "fotos de archivo en alta resolución".
  - `testimonios.yaml`: `fragmento` propuesto por cita (palabras textuales, omisiones con "[…]",
    base: los de `design/maquetas/nosotros.html`), `anios` 28 (Triana) y 15 (León, "más de"; el
    componente muestra "+15"), y `confirmar: ["fragmento y años: validar con la autorización"]`.
  - `sitio.yaml` → `asociadas`: ECOHL (con la descripción de `contenido/institucional.md`), HL
    Infraestructura, HL Panamá, HL Rental, Megacranes y Aktino, cada una `aprobada: false` y su
    logo de `src/assets/grupo/`.
  - `nosotros.es.md`: `foto: ../../assets/generales/mejor-gente.jpg`; `indicadores` (1 día · Cemex
    Caracolito; 3 días · cargador de barcos de Cerrejón; −64 % frecuencia y −72 % severidad · PDF ECOHL;
    verificar los cuatro contra las fichas y `contenido/`); `valores` con las 5 frases de guía §12.2
    (lista actual; la duda de las dos listas sigue en `confirmar`). Sección nueva "Presencia" con el
    texto "Ejecutamos los proyectos de forma diferente" (de `contenido/institucional.md` §1).
- [ ] `auditar`: asociadas sin aprobar y testimonios sin autorizar = `aviso`, **no bloquean**; quitar el
  bloqueante `asociadas` (D1) si hay al menos una entrada.
- [ ] `src/lib/nosotros.ts` (interfaz arriba).
- [ ] Pruebas puras:
  - `hitos()` devuelve 6, el último con `hoy: true` y `anio` = año de `hoy`, en orden;
  - `tratamiento(1968)` = `{ gris: 1, sepia: 0.35, contraste: 1.12 }`; `tratamiento(año actual)` =
    `{ 0, 0, 1 }`; 1997 queda en medio;
  - `avance(0, años)` → índice 0, año 1968; `avance(1, años)` → último índice y año actual; un
    progreso entre dos hitos da `local` entre 0 y 1;
  - (foco 5) `publicables([...4 sin autorizar], 'lanzamiento')` = `[]`; en `desarrollo` devuelve los 4;
  - (foco 5) `auditar` en modo lanzamiento con testimonios y asociadas sin aprobar **no** lanza por
    ellos (solo avisos).
- [ ] Commit: "F3.2: contenido de Nosotros".

### Tarea 10: Página Nosotros

**Archivos:** crear `src/plantillas/Nosotros.astro`, `src/components/nosotros/{Mosaico,MisionVision,
Valores,Presencia,Testimonios,Asociadas,Cierre}.astro`, `src/scripts/testimonios.ts`; modificar
`src/pages/[...ruta].astro`; ampliar `tests/nosotros.spec.ts`.

- [ ] Secciones según guía §12.2 en el orden de la tabla (la Tira es la Tarea 11: dejar su lugar). Cada
  sección recibe su número en tiempo de compilación según las que se muestran (foco 5); la alternancia
  claro/grafito sigue a la lista real.
  - Mosaico: 6 fotos de `src/assets/proyectos/` (las de la maqueta, ninguna discreta) con `Foto.astro`
    en lámina; paralaje de columnas con `animation-timeline: view()` (sin JS); 2 columnas sin paralaje
    en móvil.
  - Misión y visión: lámina con `foto` y trazo blanco (Trazo con `clip-path`, guía §9); indicadores con
    Cota y cifra escrita.
  - Valores: pictogramas SVG en línea (guía §8), Trazo escalonado y al pasar; frase siempre visible.
  - Presencia: estacas con los `paises` de `sitio` (nombre de `PAISES`).
  - Testimonios: `publicables()`; selector de botones con `aria-pressed`, lámina del retrato, años si
    hay, fragmento; `testimonios.ts` avanza cada 9 s con barra de progreso, se detiene con hover, foco o
    clic, y no corre con reduced-motion. En desarrollo, chip "sin autorizar".
  - Asociadas: `publicables()`; celdas E-0n con logo en gris → color, descripción solo si existe. En
    desarrollo, chip "por confirmar".
  - Cierre: dos enlaces (`trabaje`, `proyectos`) con foto de fondo y barrido.
- [ ] Pruebas:
  - un solo `h1` ("Gente que cumple…"); misión y visión con su texto de `nosotros.es.md`;
  - 4 indicadores con su valor escrito; 5 valores con su pictograma (`svg[aria-hidden]`) y frase;
  - 7 estacas con los nombres de país;
  - en desarrollo (build normal) hay 4 testimonios con chip "sin autorizar"; clic en el tercero →
    `aria-pressed="true"` y su fragmento visible; con reduced-motion no avanza en 10 s;
  - (foco 5) compilando con `--mode lanzamiento` *solo para esta prueba* no es posible (otros
    bloqueantes): probar `Nosotros` con un `publicables` vacío vía la función pura y una prueba de
    plantilla que renderice sin testimonios ni asociadas (Astro container API, `experimental_AstroContainer`)
    y verifique que no hay `section` vacía y que los números de sección son consecutivos;
  - (foco 4) axe sin violaciones en `/nosotros/` con tema claro y con `data-theme="dark"`;
  - (foco 3) a 360 px sin scroll horizontal.
- [ ] Commit: "F3.2: página Nosotros".

### Tarea 11: Tira de negativos

**Archivos:** crear `src/components/nosotros/Tira.astro`, `src/scripts/tira.ts`; modificar
`src/plantillas/Nosotros.astro`; ampliar `tests/nosotros.spec.ts`.

- [ ] `Tira.astro` (guía §12.3): **HTML base = lista de 6 hitos** (década, título, texto, foto revelada
  con `Foto.astro` ≤ 560 px, pie si hay); es lo que ven sin JS y con reduced-motion (foco 2). Con
  `html.js` y sin reduced-motion, la misma marca se convierte en escenario fijo: año con dígitos
  rodantes (4 columnas 0–9, `aria-hidden`; el año real queda en texto para lectores), hito actual con
  chip de década, regla 1968 → hoy con burbujas (la de "Hoy" es el monograma, guía §2.2), cota y
  cursor, película con perforaciones y códigos de borde, cuadro ampliado que se revela.
- [ ] `tira.ts`: un oyente de scroll pasivo guarda la posición; un único `requestAnimationFrame` calcula
  `avance()` y escribe solo `transform`, `opacity` y `filter` (con `tratamiento()`); nada de medir el
  DOM por cuadro (medir al cargar y en `resize`). Revelado ≈ 1 s al cambiar de hito. Se reinicia en
  `astro:page-load` y libera en `astro:before-swap`. Altura de la sección ≈ 6 pantallas en escritorio,
  menos en móvil. Grano de película sutil sobre el cuadro ampliado (CSS, sin imagen pesada).
- [ ] Pruebas:
  - (foco 2) con JS desactivado: 6 hitos visibles con su foto y su década; ningún elemento con
    `opacity: 0`;
  - con reduced-motion: igual que sin JS (sin `position: sticky` en el escenario);
  - con JS: tras `scrollTo` al 55 % de la sección, el texto del hito es "El desarrollo" o "Alianzas
    para crecer" (según la década) y el año mostrado (texto accesible) está entre 1990 y 2000; al final,
    el hito es "Hoy" con el año actual;
  - funciona en `firefox` además de Chromium (proyecto de Playwright extra solo para este archivo, o
    `test.use({ browserName: 'firefox' })` en un `describe`);
  - (foco 3) a 360 px el año no desborda (`scrollWidth <= 360`).
- [ ] `presupuesto`: `/nosotros/` ≤ 30 KB gz (anotar).
- [ ] Commit: "F3.2 · Nosotros" (cierra F3.2).

---

## F3.3 · HSE, Noticias, Acreedores y legales

### Tarea 12: Maquetas · puerta de aprobación

- [ ] Maquetas (acompañante visual, fotos reales) de: HSE y calidad (política SGI, ISO, Reglas de Oro,
  PIENSA®, prácticas, indicadores; firma de la guía §9: franjas P3 que bajan y Reglas de Oro que se
  encienden), Noticias (índice y entrada; firma: sello de fecha, adjudicados con P3; se oculta con < 3),
  Acreedores (avisos Ley 1116) y legales (datos, términos; texto largo legible).
- [ ] **Se detiene aquí hasta que Juan David apruebe.** Registrar en la guía (nueva §12.5) y copiar a
  `design/maquetas/`.
- [ ] Commit: "F3.3: maquetas aprobadas".

### Tarea 13: Páginas de F3.3

Se detalla al aprobar la Tarea 12, con este mínimo:

- [ ] Plantillas en `src/plantillas/` y entrada en el enrutador; colección `noticias` (especificación §4)
  si llega contenido; si hay menos de 3 entradas, `/noticias/` no se genera y sale del menú y del pie.
- [ ] Legales y acreedores con `revisionJuridica` pendiente marcados en `/pendientes/`.
- [ ] Pruebas: menú sin "Noticias" con < 3 entradas; axe sin violaciones; 360 px sin scroll horizontal.
- [ ] Commit: "F3.3 · HSE, noticias, acreedores y legales" (cierra F3.3).

---

### Tarea 14: Cierre de la fase

**Archivos:** modificar `tests/pantallas.spec.ts`, `CLAUDE.md`.

- [ ] **LCP de Nosotros:** 3,2 s en Lighthouse móvil (medido el 2026-10-19 al cerrar la Tarea 8; ya estaba así antes). Revisar el elemento LCP (el párrafo de "Quiénes somos") y la carga de la cabecera con mosaico.
- [ ] Matriz de `pantallas.spec.ts` con `/`, `/en/`, `/nosotros/`, `/en/about/` y las de F3.3; revisar
  360, 1366 y 2560 px (impacto equivalente, guía §5) y modo oscuro.
- [ ] `npm run check`, `npm run build`, `npm test`, `npm run presupuesto` en verde.
- [ ] Lighthouse móvil de `/`, `/nosotros/`, `/hse/`: ≥ 95 en las 4, LCP < 2,0 s, CLS < 0,05; anotar.
- [ ] `npm run build:lanzamiento` sigue fallando solo por bloqueantes reales; anotar el número.
- [ ] Revisión de código de la rama (superpowers:requesting-code-review) y corrección.
- [ ] `CLAUDE.md`: registrar "Etapa 7 (fecha): F3 · Institucional" con resultados, D2 decidida en la
  tabla, insumos nuevos (logo completo vectorial, fotos de archivo en alta, foto de "Hoy", validación de
  fragmentos) y el siguiente paso (F4 · Contacto; requiere D3 y D7).
- [ ] Commit: "Etapa 7: F3 · Institucional"; merge fast-forward a `main` y borrar la rama.
