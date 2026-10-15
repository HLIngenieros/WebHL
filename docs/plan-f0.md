# Plan F0 · Base

> **Para agentes:** sub-skill requerida: superpowers:executing-plans (o subagent-driven-development).
> Los pasos usan casillas (`- [ ]`). Convención del proyecto: plan sin código completo; cada paso dice
> qué hacer y cómo verificarlo.

**Objetivo:** dejar un esqueleto navegable del sitio, en ES/EN, con la identidad aplicada, la
navegación fluida y los componentes base, listo para recibir el contenido en F1.

**Arquitectura:** proyecto Astro en la raíz del repo. Los estilos importan
[../design/tokens.css](../design/tokens.css), que sigue siendo la única fuente de valores, y Tailwind
v4 los expone como utilidades. Una tabla de rutas empareja cada página ES con su par EN; una ruta
comodín genera páginas provisionales para todo el mapa hasta que cada fase las reemplace.

**Herramientas:** Astro 7.3, Tailwind 4.3 (`@tailwindcss/vite`), Archivo variable autoalojada,
Playwright Test y axe-core para pruebas, Lighthouse por `npx`. React **no** entra en F0 (se agrega en
F2 con el explorador).

**Especificación:** [especificacion.md](especificacion.md) §3 y §6; guía visual §4, §5, §7, §9 y §10.

## Restricciones globales

- Colores, tamaños, espacios y curvas **solo por tokens**. Se desactiva la paleta por defecto de
  Tailwind para que no se pueda escribir un color a mano.
- Radio 0, sin sombras, foco visible con `--focus-ring`.
- JS ≤ 30 KB gz por página. Lighthouse ≥ 95 en móvil en las 4 categorías.
- Solo se anima `transform`, `opacity` y `clip-path`; nada hace esperar; se respeta reduced-motion.
- Zoom permitido: nunca `maximum-scale` ni `user-scalable=no`.
- Sin desplazamiento horizontal en 360, 390, 768, 1024, 1366, 1920 y 2560 px.
- Un H1 por página, `lang` correcto y `hreflang` entre pares.
- Sin servicios de terceros en tiempo de ejecución (ni fuentes, ni scripts externos).
- No usar prettier. Pocos archivos.

**Decisión técnica de F0:** las URLs llevan barra final (`/nosotros/`, `/en/about/`), con
`trailingSlash: 'always'` y salida en carpetas (`nosotros/index.html`). Es lo que Apache sirve sin
reglas extra y coincide con el formato de las URLs actuales de WordPress, lo que simplifica las 301.

## Estructura de archivos

```
package.json · astro.config.mjs · tsconfig.json · playwright.config.ts
src/
  styles/global.css        tokens + Tailwind @theme + base tipográfica + animaciones
  i18n/rutas.ts            tabla de rutas ES/EN y helpers
  i18n/ui.ts               textos de interfaz ES/EN
  layouts/Base.astro       <html>, <head>, barra, pie, botón de contacto, transiciones
  components/Barra.astro   barra superior + menú móvil + selector de idioma + tema
  components/Pie.astro     rótulo de pie + enlaces legales
  components/Contacto.astro  botón "Hablar con HL" (en F0 enlaza a /contacto/)
  components/ui/*.astro    Boton, Chip, Nota, Encabezado (con Cota), Rotulo, Cifras, Campo, Tabla
  scripts/revela.ts        respaldo de animaciones de entrada (~1 KB)
  pages/[...ruta].astro    páginas provisionales del mapa (ES y EN)
  pages/404.astro          bilingüe
  pages/muestra.astro      catálogo de componentes (noindex; se elimina en F6)
public/fonts/              Archivo variable woff2, subconjunto latino
tests/                     *.spec.ts de Playwright + presupuesto.mjs
```

## Interfaces compartidas

- `type Lang = 'es' | 'en'`
- `RUTAS: Record<ClaveRuta, { es: string; en: string }>` con las 14 claves del mapa: `inicio`,
  `nosotros`, `proyectos`, `servicios`, `sectores`, `hse`, `noticias`, `contacto`, `trabaje`,
  `proveedores`, `buzon`, `acreedores`, `datos`, `terminos`. Los valores llevan barra final.
- `ruta(clave: ClaveRuta, lang: Lang): string`
- `langDe(pathname: string): Lang`: `en` si empieza por `/en/`.
- `par(pathname: string): string`: la URL equivalente en el otro idioma. Si no tiene par, devuelve el
  inicio del otro idioma.
- `MENU: ClaveRuta[]` (las 7 del menú, en orden) y `PIE: ClaveRuta[]`.
- `t(lang: Lang, clave: ClaveUI): string`
- `Base.astro` props: `{ titulo: string; descripcion: string; lang: Lang; alterno?: string;
  noindex?: boolean }`. `alterno` permite que las páginas dinámicas de F1/F2 (fichas, noticias)
  declaren su par; si falta, se usa `par()`.

## Foco de revisión

Fallos que la especificación implica y que más pueden afectar al visitante. Cada uno tiene su prueba
en la tarea indicada.

1. **Cambio de idioma en una página sin par** (404, una noticia sin traducción): debe llevar al inicio
   del otro idioma, nunca a un 404 → Tarea 3.
2. **JavaScript desactivado o fallido:** el contenido es visible (nada queda en opacidad 0) y la
   navegación del menú móvil sigue funcionando → Tareas 4 y 6.
3. **El menú no cabe** a 1024 px, a 1366 px con zoom del 200 % o con texto grande: debe pasar al menú
   móvil antes de desbordarse, nunca cortar ni crear scroll horizontal → Tareas 4 y 8.
4. **Atrás/adelante con transiciones:** los scripts (menú, animaciones) se reinician, el menú móvil
   queda cerrado tras navegar y el scroll se restaura → Tarea 6.
5. **Tema oscuro:** sin destello del tema equivocado al cargar, la elección persiste, y si el
   navegador bloquea `localStorage` no se rompe nada → Tarea 4.

---

### Tarea 1: Andamio del proyecto

**Archivos:** crear `package.json`, `astro.config.mjs`, `tsconfig.json`, `playwright.config.ts`;
modificar `.gitignore` (agregar `node_modules/`, `dist/`, `.astro/`, `test-results/`,
`playwright-report/`).

- [ ] Inicializar con `npm create astro@latest` (plantilla mínima, TypeScript estricto) en una carpeta
  temporal y mover los archivos a la raíz. No sobrescribir `README.md` ni `.gitignore`: combinarlos.
- [ ] Instalar `tailwindcss @tailwindcss/vite` y, como desarrollo, `@playwright/test @axe-core/playwright`.
  Ejecutar `npx playwright install chromium`.
- [ ] En `astro.config.mjs`: `site: 'https://hlingenieros.com'`, `trailingSlash: 'always'`,
  `build.format: 'directory'`, `i18n` con `locales: ['es','en']`, `defaultLocale: 'es'`,
  `routing.prefixDefaultLocale: false`. Agregar Tailwind como plugin de Vite.
- [ ] Scripts de npm: `dev`, `build`, `preview`, `check` (`astro check`), `test` (Playwright contra
  `astro preview` levantado por `webServer` en `playwright.config.ts`, puerto 4321).
- [ ] Prueba `tests/humo.spec.ts`: `/` responde 200 y tiene `<html lang="es">`.
- [ ] Verificar: `npm run build` sin errores y `npm test` en verde.
- [ ] Commit: "F0: andamio Astro + Tailwind + Playwright".

### Tarea 2: Estilos base y fuente

**Archivos:** crear `src/styles/global.css` y `public/fonts/archivo-var-latin.woff2`.

- [ ] `global.css` importa `../../design/tokens.css` y luego Tailwind. Con `@theme inline`:
  - `--color-*: initial`, y luego los colores mapeados a los roles (`--color-bg: var(--bg)`, `paper`,
    `ink`, `muted`, `line`, `line-soft`, `accent`, `accent-ink`, `accent-soft`, `signal`,
    `signal-ink`, `signal-soft`, `bad`, `good` y sus `-soft`);
  - espaciado `--spacing-s1…s7` desde `--s1…--s7`;
  - `--radius-*: initial`.
- [ ] Clases de voz (guía §4.2): `.voz-display`, `.voz-titulo`, `.voz-subtitulo`, `.voz-datos`
  (mayúsculas, `--ls-data`). Se aplican con `font-stretch` desde los tokens `--wdth-*`.
- [ ] Base: `body` con `--bg`/`--ink`, `--fs-body`, interlineado 1.6; títulos con `text-wrap:
  balance`; `tabular-nums` en `.cifra`; `:focus-visible` con `--focus-ring`; `.wrap` con `--wrap` y
  `--gutter`.
- [ ] Fuente: descargar Archivo variable (ejes `wght` y `wdth`) de Google Fonts o fontsource, reducir
  al subconjunto latino con `pyftsubset` (fonttools) y guardar en `public/fonts/`. Declarar
  `@font-face` con `font-display: swap`, `font-stretch: 62% 125%` y `unicode-range`. Meta: ≤ 90 KB.
- [ ] Prueba `tests/estilos.spec.ts`:
  - `document.fonts.check('16px Archivo')` es verdadero tras la carga;
  - el color de fondo de `body` es `rgb(231, 234, 235)` en claro y `rgb(14, 17, 19)` con
    `emulateMedia({ colorScheme: 'dark' })`;
  - no hay peticiones a dominios externos.
- [ ] Verificar: `python design/contraste.py` sigue en OK y `npm test` en verde.
- [ ] Commit: "F0: estilos base, tokens en Tailwind y fuente autoalojada".

### Tarea 3: Rutas bilingües, layout y páginas provisionales

**Archivos:** crear `src/i18n/rutas.ts`, `src/i18n/ui.ts`, `src/layouts/Base.astro`,
`src/pages/[...ruta].astro`, `src/pages/404.astro`; borrar `src/pages/index.astro` de la plantilla.

- [ ] `rutas.ts` con la tabla y los helpers de "Interfaces compartidas". Slugs según la
  especificación §3, con barra final.
- [ ] `ui.ts`: textos del menú, del pie, de "Hablar con HL", "Saltar al contenido", "Menú", "Cerrar",
  "Cambiar tema" y "En construcción", en ES y EN.
- [ ] `Base.astro`:
  - `<html lang>` y viewport sin bloqueo de zoom;
  - `<title>` y description;
  - canonical, `hreflang` es, en y `x-default` (→ ES), con `alterno ?? par()`;
  - `noindex` opcional;
  - preload de la fuente;
  - enlace "Saltar al contenido" y `<main id="contenido">`.
- [ ] `[...ruta].astro`: `getStaticPaths` recorre `RUTAS` y genera ES y EN de cada clave. La página
  provisional usa `Base` con H1 = nombre de la sección y una nota "En construcción" (componente `Nota`
  en la Tarea 7; aquí, un párrafo).
- [ ] `404.astro`: un H1 bilingüe y enlaces a ambos inicios; `noindex`.
- [ ] Prueba `tests/rutas.spec.ts`:
  - las 28 URLs responden 200;
  - el `lang` es correcto;
  - hay exactamente un H1;
  - el `hreflang` es apunta a la URL ES y el en a su par (por ejemplo, `/nosotros/` ↔ `/en/about/`);
  - el viewport no contiene `maximum-scale` ni `user-scalable`.
- [ ] Prueba (foco 1): en `/404.html`, `par()` lleva al inicio del otro idioma. Prueba unitaria de
  `par()` dentro del mismo spec, importando `rutas.ts`: una ruta desconocida da `/en/` o `/`.
- [ ] Commit: "F0: rutas ES/EN emparejadas, layout base y páginas provisionales".

### Tarea 4: Barra superior, menú móvil, idioma y tema

**Archivos:** crear `src/components/Barra.astro`; modificar `Base.astro` (incluirla con
`transition:persist`).

- [ ] Escritorio: logo provisional (texto "HL Ingenieros" en voz de título hasta tener el vectorial),
  los 7 enlaces de `MENU` en voz de datos, `aria-current="page"` en la sección activa (también en sus
  subpáginas), el selector ES/EN (enlace a `par()`, con `hreflang` y `lang`) y el botón de tema.
- [ ] Punto de corte: el menú de escritorio solo se muestra si cabe. Medir el ancho real en la prueba;
  empezar con `min-width: 1100px` y ajustarlo. Por debajo, botón "Menú".
- [ ] Menú móvil a pantalla completa con `<dialog>`:
  - se abre con un barrido `clip-path` de `--t-rapido` a `--t-aparece`;
  - Esc cierra y el foco vuelve al botón;
  - enlaces grandes (área ≥ 44 px), idioma y tema dentro;
  - se cierra en `astro:before-swap`.
  - **Sin JS** el botón "Menú" es un enlace a `#navegacion-pie` (el pie lista las mismas secciones).
- [ ] Tema: un script en línea en `<head>`, antes de pintar, lee `localStorage` dentro de `try/catch`
  y fija `data-theme`; el botón alterna y guarda. Sin elección guardada, manda `prefers-color-scheme`.
- [ ] Prueba `tests/barra.spec.ts`:
  - a 1366 px se ven los 7 enlaces y no hay desbordamiento;
  - a 1024 px y a 390 px aparece "Menú", abre el diálogo, Esc lo cierra y el foco vuelve;
  - el selector de idioma en `/nosotros/` lleva a `/en/about/`;
  - `aria-current` está en la sección correcta.
- [ ] Prueba (foco 3): el zoom del 200 % a 1366 px equivale a un viewport de 683 px; ahí se usa el
  menú móvil y `scrollWidth <= innerWidth`.
- [ ] Prueba (foco 2): con `javaScriptEnabled: false` el enlace "Menú" lleva a `#navegacion-pie`.
- [ ] Prueba (foco 5):
  - tras elegir oscuro y recargar, `data-theme="dark"` está puesto antes del primer pintado (leer el
    atributo en `domcontentloaded`);
  - con `localStorage` bloqueado (`addInitScript` que lanza error al acceder) la página carga sin
    errores en consola.
- [ ] Commit: "F0: barra superior, menú móvil, idioma y tema".

### Tarea 5: Pie y botón "Hablar con HL"

**Archivos:** crear `src/components/Pie.astro` y `src/components/Contacto.astro`; modificar
`Base.astro`.

- [ ] Pie:
  - rótulo de plano (guía §6 y §7) con razón social, sede principal, contacto y año calculado;
  - `nav#navegacion-pie` con `MENU` + `PIE`;
  - el texto legal lleva el año actual calculado al compilar.

  Los datos que no están confirmados (NIT, teléfono) quedan marcados como pendientes en un comentario y
  se toman de `contenido/institucional.md`.
- [ ] "Hablar con HL" (guía §7, botón de contacto único): fijo abajo a la derecha en escritorio y como
  barra inferior a todo el ancho en móvil (< 760 px). En F0 es un enlace a `ruta('contacto', lang)`;
  el panel con WhatsApp, Zoho y el asistente llega en F4. Usa `transition:persist`.
- [ ] El `body` reserva el alto de la barra inferior en móvil para que no tape el pie.
- [ ] Prueba `tests/pie.spec.ts`:
  - el pie tiene las 13 secciones enlazadas en ambos idiomas;
  - el año es el actual;
  - a 390 px el botón mide ≥ 44 px de alto y el último enlace del pie queda visible tras hacer scroll
    al final (no está tapado).
- [ ] Commit: "F0: pie con rótulo y botón Hablar con HL".

### Tarea 6: Transiciones, precarga y animaciones de entrada

**Archivos:** modificar `astro.config.mjs`, `Base.astro`, `global.css`; crear `src/scripts/revela.ts`.

- [ ] `<ClientRouter />` en `Base.astro`. La transición del `main` es un barrido `clip-path` con
  `--ease-barrido` y `--t-vista`; la barra y el botón de contacto quedan fijos.
- [ ] Precarga: `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }`, y `viewport` en los
  enlaces del menú móvil. Activar el prerender con Speculation Rules si Astro 7 lo ofrece (consultar la
  documentación de `prefetch` / `clientPrerender`). Si sigue siendo experimental, dejarlo apagado y
  anotarlo.
- [ ] Entradas:
  - utilidades `.aparece` e `.izaje` con `animation-timeline: view()` dentro de
    `@supports (animation-timeline: view())`;
  - fuera de `@supports`, `revela.ts` usa IntersectionObserver y agrega `.visible`;
  - el estado inicial oculto solo se aplica bajo la clase `html.js` (puesta por el script en línea),
    así que sin JS todo es visible;
  - el escalonado se hace con `--i` por elemento, con un total ≤ `--t-izaje`.
- [ ] Todos los scripts se inicializan en `astro:page-load` (no en `DOMContentLoaded`).
- [ ] Prueba `tests/movimiento.spec.ts`:
  - navegar de `/` a `/nosotros/` no recarga el documento (una marca en `window` persiste) y el nodo
    de la barra es el mismo;
  - con `reducedMotion: 'reduce'` la duración calculada de `.izaje` es `0s`.
- [ ] Prueba (foco 2): con JS desactivado, los elementos `.izaje` tienen opacidad 1.
- [ ] Prueba (foco 4):
  - abrir el menú móvil, navegar a una sección y volver con `goBack()`;
  - el menú queda cerrado y el scroll vuelve a su posición anterior;
  - en la página de regreso, los elementos `.izaje` terminan visibles.
- [ ] Commit: "F0: transiciones de vista, precarga y animaciones de entrada".

### Tarea 7: Componentes base y página de muestra

**Archivos:** crear `src/components/ui/{Boton,Chip,Nota,Encabezado,Rotulo,Cifras,Campo,Tabla}.astro`
y `src/pages/muestra.astro`; usar `Nota` en `[...ruta].astro`.

- [ ] Cada componente sigue la guía §7. Props mínimas:
  - `Boton {variante: 'primario'|'secundario'|'datos'; href?}`;
  - `Chip {tipo: 'crit'|'high'|'ok'|'acc'|'med'}`;
  - `Nota`;
  - `Encabezado {codigo: string; titulo: string; entrada?: string; nivel?: 1|2}`: código de lámina,
    título, entrada y cota que se mide al entrar en pantalla con `--t-cota`;
  - `Rotulo {celdas: {etiqueta: string; valor: string}[]}`: 2 columnas bajo 760 px;
  - `Cifras {items: {valor: string; etiqueta: string}[]}`: el valor va escrito en el HTML; 2 columnas
    en móvil;
  - `Campo {etiqueta; nombre; tipo?; requerido?; error?}`: con `aria-describedby` para el error;
  - `Tabla`: scroll horizontal propio, nunca de la página.

  Los componentes se adaptan con container queries donde cambien de forma.
- [ ] `muestra.astro` (`noindex`, ES): todos los componentes con datos reales de Columbus tomados de
  `contenido/proyectos.md`, en claro y oscuro.
- [ ] Usar la skill frontend-design para revisar la composición de la muestra. Ante conflicto, manda la
  guía visual.
- [ ] Prueba `tests/componentes.spec.ts`:
  - axe sin violaciones en `/muestra/` en claro y oscuro;
  - las cifras de Columbus están en el HTML con JS desactivado;
  - la tabla a 360 px no genera scroll horizontal de la página.
- [ ] Commit: "F0: componentes base y página de muestra".

### Tarea 8: Verificación de la fase y cierre

**Archivos:** crear `tests/pantallas.spec.ts` y `tests/presupuesto.mjs`; modificar `CLAUDE.md`
(registro de etapas) y `package.json` (script `presupuesto`).

- [ ] `pantallas.spec.ts`: para `/`, `/nosotros/`, `/en/about/`, `/muestra/` y `/404.html`, en las 7
  anchuras de la matriz y el móvil en horizontal (844×390):
  - `scrollWidth <= innerWidth`;
  - axe sin violaciones;
  - captura guardada en `test-results/` para revisión visual.
- [ ] `presupuesto.mjs`: recorre `dist/**/*.html`, suma el tamaño gzip de los `<script>` que carga
  cada página y falla si alguna pasa de 30 KB. También informa el peso de la fuente.
- [ ] Lighthouse móvil sobre `npm run preview` para `/` y `/muestra/`
  (`npx lighthouse http://localhost:4321/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo`).
  Meta ≥ 95 en las 4 categorías; anotar los resultados en el mensaje de commit.
- [ ] Revisión visual con el plugin de Playwright: recorrer las capturas en 360, 1366 y 2560 px y
  corregir lo que no se vea impactante o se vea desordenado.
- [ ] Registrar en `CLAUDE.md` la "Etapa 4 (fecha): F0 · Base" con los resultados de Lighthouse.
- [ ] Verificar: `npm run check`, `npm run build`, `npm test` y `npm run presupuesto` en verde.
- [ ] Commit: "Etapa 4: F0 · Base".
