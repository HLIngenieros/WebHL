# Guía visual base · Grupo HL

Versión 1.0 · 2026-10-13 · Etapa 1

Esta guía define cómo se ve y cómo se mueve el nuevo sitio de Grupo HL. Es la referencia obligatoria
durante el desarrollo: si un componente nuevo no encaja en estas reglas, primero se ajusta la guía y
luego el código.

- **Valores:** [design/tokens.css](../design/tokens.css) es la única fuente de verdad. Esta guía nombra
  tokens (`--accent`, `--s4`…) y no repite valores salvo como referencia.
- **Contraste:** [design/contraste.py](../design/contraste.py) verifica los pares de color. Se corre
  cada vez que cambia un color: `python design/contraste.py`.
- **Origen:** propuesta "Nuevo Sitio Grupo HL" (L-04 Identidad, L-07 Movimiento) y diagnóstico del
  29-sep-2026, ambos en `docs/`.

---

## 1. Concepto: concreto, acero y plano

El sitio se ve como la documentación técnica de una obra bien hecha. El lenguaje sale del oficio de
HL: retícula estructural, ejes con burbuja, cotas, rótulos de plano y trazo de dibujo técnico. La
seriedad la dan la precisión y las cifras reales, no el adorno.

**Principios**

1. **La evidencia manda.** Cifras de obra, años, toneladas, horas-hombre. Los elementos gráficos
   existen para presentar datos, no para decorar.
2. **Un color de marca, un acento.** Azul HL para identidad y acción; amarillo de señalización solo
   para medir y advertir.
3. **Una familia, tres voces.** Archivo expandida, normal y condensada. Nada más.
4. **Ángulos rectos.** Sin esquinas redondeadas, sin sombras difusas, sin degradados decorativos.
   Bordes de 1 px y planos de color.
5. **Movimiento con oficio.** Corto, con propósito y siempre prescindible.

**Se rescata** del sitio actual: el logotipo HL y el azul como ancla.
**Se retira:** el azul por defecto de WordPress `#1e73be`, el marino `#001b74`, Lato, Roboto,
Roboto Condensed, Open Sans, el preloader, el slider a pantalla completa, los PNG como banners y el
recurso de demostración de The7 que hoy aparece como logo en el pie.

**No hacer**

- Fotos de banco de imágenes ni renders genéricos de "ingenieros sonriendo".
- Íconos de colores, ilustraciones 3D o estilo "startup".
- Un segundo azul "para variar", ni usar el amarillo como fondo de grandes áreas.
- Contadores que arrancan en 0 en el HTML.
- Texto dentro de imágenes (certificaciones, cifras, sellos).

---

## 2. Marca

### 2.1 Arquitectura de marca · pendiente (D1)

Hoy conviven Grupo HL, HL Ingenieros, HL Ingenieros S.A. y ECOHL sin jerarquía. Hasta decidir D1
(¿sitio del grupo o de HL Ingenieros?) se trabaja con estas reglas provisionales:

- Nombre visible en cabecera y títulos: **Grupo HL**.
- Razón social (pie, legales, responsable de datos): **HL Ingenieros S.A.** con NIT.
- ECOHL y demás empresas se presentan como líneas o empresas del grupo, nunca como marca paralela en
  la cabecera.

### 2.2 Logotipo · pendiente de insumo

Solo existe en PNG (325×60, `logo-azul-hl-s.png`). Se necesita el original vectorial (AI, SVG o PDF)
para producir:

| Versión | Uso |
|---|---|
| Positiva (azul HL sobre claro) | Uso principal |
| Negativa (blanco sobre azul HL o grafito) | Pie, fondos oscuros, modo oscuro |
| Monocroma grafito | Documentos, impresión a una tinta |
| Isotipo "HL" | Favicon, avatar de chat, espacios pequeños |

Reglas: siempre en SVG; área de resguardo mínima igual a la altura de la "H"; tamaño mínimo de 24 px
de alto en pantalla; no deformar, no cambiar colores, no poner sobre fotos sin un plano de color
detrás. Mientras llega el vector, el **marcador provisional** es el cuadro de la propuesta: "HL" en
Archivo 125 %/900 blanco sobre un cuadrado `--accent` de 30 px.

### 2.3 Lema · pendiente (D2)

Uno solo para todo el sitio, en ES y EN. Candidatos:

- A · "Construcción y montaje industrial desde 1968."
- B · "Obra civil, montaje y fabricación con un solo responsable."
- C · "Plantas completas para la industria de Latinoamérica."

Se retiran los cuatro lemas actuales ("Construcción y obras civiles en Latinoamérica", "Vemos una
tierra llena de oportunidades", "Ejecutamos los proyectos de forma diferente", "Mejor gente, mejores
soluciones").

### 2.4 Voz y tono

- **Concreta:** cifra antes que adjetivo. "1.100 m de banda costa afuera en 7 meses", no "amplia
  experiencia en proyectos de gran escala".
- **Técnica sin jerga vacía:** nombrar normas (NSR-10, RETIE, ASME, API 650, AWS), equipos y
  alcances reales.
- **Fechada:** todo caso lleva año; toda cifra de la empresa se calcula (años desde 1968) o lleva
  fecha de corte.
- **Sin superlativos** ("los mejores", "líderes") ni lemas internos (metas de ventas, backlog).
- Tratamiento de **usted** en ES; inglés profesional, no traducción literal.

**Glosario ES → EN obligatorio**

| Español | English |
|---|---|
| Montaje mecánico / eléctrico | Mechanical / Electrical installation (o erection) |
| Fabricación metalmecánica | Fabrication |
| Seguridad (HSE) | Safety |
| Trayectoria / Proyectos | Track record / Projects |
| Formaleta deslizante | Slipform construction |
| Asistencia en la ejecución | Owner's team support / Technical staffing |
| Aliados, especialidades | Partners, disciplines |

---

## 3. Color

### 3.1 Paleta de marca

| Nombre | Primitivo | Valor | Papel |
|---|---|---|---|
| Azul HL | `--hl-azul` | `#0B509E` | Identidad y acción. El único azul. |
| Grafito | `--hl-grafito` | `#14181C` | Texto, estructura, líneas fuertes |
| Concreto | `--hl-concreto` | `#E7EAEB` | Fondo base |
| Acero | `--hl-acero` | `#8A949B` | Líneas secundarias e ilustración |
| Señalización | `--hl-senal` | `#F2B42A` | Cotas, HSE, cifras clave |

Los primitivos son de referencia (logo, documentos, impresos). **En el código se usan siempre los
roles**, que cambian con el tema.

### 3.2 Roles

| Rol | Uso | Nunca |
|---|---|---|
| `--bg` | Fondo de página | — |
| `--paper` | Paneles, tarjetas, campos, chat | Fondo de página completa |
| `--ink` | Texto principal, bordes estructurales, botón invertido | — |
| `--muted` | Texto secundario, rótulos de datos, leyendas | Texto largo principal |
| `--steel` | Líneas de ilustración, divisores decorativos | **Texto** (no alcanza contraste) |
| `--line` / `--line-soft` | Bordes de paneles / divisores internos | Bordes de campos de formulario |
| `--accent` | Enlaces, botón primario, ejes, código de lámina, foco | Grandes fondos; segundo azul |
| `--accent-ink` | Texto sobre `--accent` | — |
| `--accent-soft` | Fondo de chip y selección de acento | Texto |
| `--signal` | Cotas, marcas, barras de medida, divisores HSE | **Texto** en modo claro |
| `--signal-ink` | Señalización cuando es texto (pendiente, "por verificar", cifras HSE) | Fondos |
| `--signal-soft` | Fondo de chip "alto" | — |
| `--bad` / `--bad-soft` | Estado crítico, error de formulario, buzón ético | Decoración, énfasis de marca |
| `--good` / `--good-soft` | Estado correcto, paso completado | Decoración |
| `--grid` | Retícula de fondo | — |

**Reglas**

- Proporción aproximada: 80 % neutros (concreto, papel, grafito), 15 % azul, 5 % señalización y
  estados.
- El amarillo **mide y advierte**; no es un segundo color de marca.
- Rojo y verde son **solo estados**. No se usan para sectores ni categorías.
- Para distinguir categorías (sectores, servicios) se usan los grupos A/B/C con ejes con burbuja,
  no colores nuevos.

### 3.3 Modo oscuro

Definido completo en `tokens.css`: se activa por `prefers-color-scheme` y se puede forzar con
`data-theme="dark"` o `data-theme="light"` en `<html>`. El azul se aclara a `#62A0EC` y la
señalización vuelve a `#F2B42A`. **Los dos bloques oscuros de `tokens.css` deben mantenerse
idénticos.** El logo usa su versión negativa.

### 3.4 Contraste verificado

Resultado de `design/contraste.py` (WCAG 2.2: 4,5:1 texto normal, 3:1 elementos no textuales):

| Par | Uso | Mín. | Claro | Oscuro |
|---|---|---|---|---|
| ink / bg | Texto principal | 4,5 | 14,75 | 15,51 |
| ink / paper | Texto en paneles | 4,5 | 16,62 | 14,47 |
| muted / bg | Texto secundario | 4,5 | 5,30 | 7,03 |
| muted / paper | Texto secundario en paneles | 4,5 | 5,97 | 6,56 |
| accent / bg | Enlaces | 4,5 | 6,54 | 7,00 |
| accent / paper | Enlaces en paneles | 4,5 | 7,37 | 6,53 |
| accent-ink / accent | Botón primario | 4,5 | 7,91 | 6,91 |
| bg / ink | Botón o filtro activo | 4,5 | 14,75 | 15,51 |
| signal-ink / bg | Señalización como texto | 4,5 | 5,29 | 10,23 |
| signal-ink / paper | Ídem en paneles | 4,5 | 5,96 | 9,55 |
| accent / accent-soft | Chip de acento | 4,5 | 6,03 | 5,65 |
| signal-ink / signal-soft | Chip alto | 4,5 | 5,21 | 7,11 |
| bad / bad-soft | Chip crítico | 4,5 | 4,57 | 5,50 |
| good / good-soft | Chip correcto | 4,5 | 4,62 | 6,52 |
| bad / bg | Mensaje de error | 4,5 | 4,94 | 6,84 |
| signal / bg | Cotas y marcas | 3,0 | 3,09 | 10,23 |
| accent / bg | Anillo de foco | 3,0 | 6,54 | 7,00 |
| ink / bg | Borde inferior de campos | 3,0 | 14,75 | 15,51 |

**Ajustes respecto a la propuesta** (para cumplir los mínimos): `--signal` claro `#B97E00 → #B27900`;
nuevo `--signal-ink` claro `#805700`; `--bad` claro `#AE4128 → #AC4028`; `--good` claro
`#2C7550 → #2B714E`; nuevo `--steel` (`#8A949B` claro, `#5E6870` oscuro). Los cambios no se notan a
la vista.

---

## 4. Tipografía

### 4.1 Familia

**Archivo** (variable, ejes `wght` 100–900 y `wdth` 62–125). Reemplaza a las cuatro familias actuales:
de cuatro peticiones a una. En producción se **autoaloja** (sin Google Fonts en tiempo de ejecución),
subconjunto latino, `font-display: swap`, con precarga del archivo principal. Respaldo:
`"Arial Narrow", system-ui, sans-serif`.

### 4.2 Tres voces

| Voz | Ancho | Peso | Uso |
|---|---|---|---|
| **Expandida** | `--wdth-display` 122 % · `--wdth-title` 115 % · `--wdth-subtitle` 108 % | 750–850 | Titulares, títulos de sección y tarjeta, cifras grandes |
| **Normal** | `--wdth-text` 100 % | 400 (600 para énfasis) | Texto corrido, botones, campos |
| **Condensada (datos)** | `--wdth-data` 72 % | 600 | Rótulos, cotas, etiquetas, chips, encabezados de tabla, navegación. **Siempre en mayúsculas** con `--ls-data` (.07em) |

La voz de datos es la firma del sistema: es como se escriben las cotas en un plano.

### 4.3 Escala

| Elemento | Tamaño | Ancho / peso | Interlineado | Extra |
|---|---|---|---|---|
| H1 (uno por página) | `--fs-h1` 36→68 px | 122 % / 850 | `--lh-display` .98 | tracking -.015em; `<em>` en `--accent`, sin cursiva |
| H2 título de sección | `--fs-h2` 28→44 px | 115 % / 800 | 1.05 | tracking -.01em |
| H3 | `--fs-h3` 21 px | 108 % / 750 | 1.05 | — |
| H4 título de tarjeta | 24 px | 115 % / 800 | 1.1 | — |
| Cifra destacada | `--fs-stat` 26→40 px | 125 % / 800 | 1 | cifras tabulares, sin cortar línea |
| Entrada (lead) | `--fs-lead` 17 px | 100 % / 400 | 1.6 | `--muted`; máx. 62ch |
| Cuerpo | `--fs-body` 16 px | 100 % / 400 | 1.6 | máx. `--measure` 70ch |
| Secundario | `--fs-sm` 14.5 px | 100 % / 400 | 1.5 | tarjetas, tablas |
| Pequeño | `--fs-xs` 13 px | 100 % / 400 | 1.45 | leyendas, pies de foto |
| Datos | `--fs-data` 12.5 px (11–13) | 72 % / 600 | 1.4 | mayúsculas, `--ls-data` |

**Reglas**

- `text-wrap: balance` en títulos.
- Cifras siempre con `font-variant-numeric: tabular-nums`.
- Formato numérico ES: punto de miles y coma decimal (9.470.000 HH · 9,47 M). EN: coma de miles y
  punto decimal.
- Unidades con espacio fino o normal: "5.250 t/día", "105 m", "26.000 m³".
- Nunca más de un H1 por página; jerarquía sin saltos (H2 → H3).

---

## 5. Retícula y espaciado

- **Módulo de 8 px.** Escala: `--s1` 4 · `--s2` 8 · `--s3` 16 · `--s4` 24 · `--s5` 40 · `--s6` 64 ·
  `--s7` 104. No usar valores fuera de la escala salvo ajustes ópticos de 1–2 px.
- **Contenedor:** `--wrap` 1180 px máximo, con márgenes laterales `--gutter` (16→40 px). A 375 px de
  ancho queda un margen de 16 px y nunca hay desplazamiento horizontal.
- **Retícula de 12 columnas** con separación `--s3`. Combinaciones habituales: 7+5, 6+6, 4×3, 12.
  Bajo 900 px todo pasa a una columna.
- **Ritmo vertical:** secciones separadas por `--s7`; encabezado de sección a contenido `--s5`;
  dentro de tarjetas `--s3`/`--s4`.
- **Breakpoints:** 520 · 640 · 760 · 900 · 960 px (enfoque móvil primero).
- **Retícula de fondo:** líneas `--grid` cada `--grid-cell` (24 px; 16 px en piezas pequeñas). Solo
  en la portada (hero) y escenarios de ilustración, nunca detrás de texto largo.

---

## 6. Elementos gráficos

Todos se dibujan en **SVG en línea** con colores por token (`stroke: var(--accent)`, etc.) para que
respondan al modo oscuro. Terminaciones rectas (`stroke-linecap: square`).

| Elemento | Construcción | Uso |
|---|---|---|
| **Ejes con burbuja** | Línea vertical punteada (`--accent`, 1 px, guion 2/4) que termina en un círculo de `--paper` con borde `--accent` y letra o número en `--accent` 700 | Marcar los grupos de servicio A/B/C, navegación interna, secciones numeradas |
| **Cota** | Línea horizontal `--signal` de 1 px con topes verticales en los extremos y marcas oblicuas a 45°; texto de datos encima | Divisor bajo los títulos de sección; rangos ("1968 → 2026"); duraciones |
| **Rótulo de plano** | Rejilla de celdas con borde `--ink` (1.5 px exterior, 1 px interior); cada celda lleva etiqueta de datos en `--muted` y valor en 600 | Ficha técnica de proyecto (cliente, año, sector, HH), pie de página, documentos descargables |
| **Línea estructural** | Dibujo de trazo (cerchas, naves, grúas, tanques) en `--ink` con grosores `--stroke-thin` / `--stroke-mid` / `--stroke-heavy`; ejes en `--accent` punteado; cotas en `--signal` | Ilustración mientras llega la fotografía nueva; estados vacíos |
| **Código de lámina** | Etiqueta de datos en `--accent` con borde de 1 px `--accent` (p. ej. "L-01", "P-07") | Numerar secciones o fichas, como un plano |

**Encabezado de sección (patrón):** código de lámina a la izquierda + H2 + entrada en `--muted` +
cota que se mide al entrar en pantalla.

---

## 7. Componentes base

Reglas comunes: `--radius` 0, bordes `--border` 1 px, sin sombras (salvo `inset` para marcar el
elemento activo), foco visible `--focus-ring` con 2 px de separación.

### Botones

| Variante | Aspecto | Uso |
|---|---|---|
| **Primario** | Fondo `--accent`, texto `--accent-ink`, borde `--accent`; hover con brillo +8 % | Una acción principal por vista: "Solicitar cotización", "Enviar" |
| **Secundario** | Fondo transparente, borde y texto `--ink`; hover invierte (fondo `--ink`, texto `--bg`) | Acciones secundarias |
| **Pequeño (datos)** | Voz de datos 12.5 px, padding 5/9 | Filtros, acciones dentro de tarjetas |

Texto normal 14 px / 550, padding 7/12 px, área táctil mínima de 44 px en móvil.

### Chips de estado

Voz de datos 11.5 px, borde de 1 px en `currentColor`, cuadrado de 6 px a la izquierda.
Variantes: `crit` (`--bad` sobre `--bad-soft`), `high` (`--signal-ink` sobre `--signal-soft`),
`ok` (`--good` sobre `--good-soft`), `acc` (`--accent` sobre `--accent-soft`), `med` (`--muted`,
sin fondo). El estado nunca se comunica solo con color: el chip siempre lleva texto.

### Filtros y pestañas

Botones de datos con borde `--line` sobre `--paper`; activo invertido (`--ink` / `--bg`) con
`aria-pressed` o `aria-selected`. Pueden llevar un conteo en `--muted`.

### Campos de formulario

- Etiqueta en voz de datos `--muted` **siempre visible** (no se usa el placeholder como etiqueta).
- Campo: fondo `--bg`, borde `--line` y **borde inferior `--ink` de 1.5 px** (línea de escritura).
- Foco: borde `--accent` + anillo de 1 px `--accent`.
- Error: borde y mensaje en `--bad`, mensaje debajo del campo, enlazado con `aria-describedby`.
- **Casilla de autorización de datos (Ley 1581) obligatoria** en todo formulario, con enlace a la
  política. `accent-color: var(--accent)`.

### Paneles y tarjetas

Fondo `--paper`, borde `--line`, padding `--s4`. La tarjeta de proyecto tiene una imagen arriba (o
el placeholder rayado), un cuerpo con H4, una cifra destacada en `--accent` y una rejilla
clave/valor (etiqueta de datos + valor 600). Los conjuntos de tarjetas se dibujan **compartiendo
bordes** (rejilla con borde superior `--ink`), no como tarjetas flotantes separadas.

### Cifras destacadas (stats)

Fila entre dos líneas `--line`, celdas separadas por `--line-soft`. La cifra va en expandida 125 % /
800 y la etiqueta en voz de datos. **El valor final está escrito en el HTML**; la animación de cota
es solo presentación. En móvil se muestran en 2 columnas.

### Tablas

Encabezado en voz de datos `--muted`; filas con divisor `--line-soft`; borde superior `--ink`.
Contenedor con desplazamiento horizontal propio en móvil, nunca de la página.

### Nota

Borde izquierdo de 3 px `--signal`, fondo `--paper`, texto `--muted` con `strong` en `--ink`. Para
aclaraciones, supuestos y avisos no críticos.

### Barra superior

Pegajosa, de `--bar-h` (52 px), fondo `--bg` al 90 % con desenfoque, línea inferior `--line`.
Navegación en voz de datos `--muted`, con hover a `--ink` y borde `--line`.

### Rótulo de pie

Bloque final de cada página con estructura de rótulo de plano: razón social, NIT, sede, contacto y
año, en celdas con borde `--ink`.

### Botón de contacto único ("Hablar con HL")

Reemplaza las dos burbujas actuales (Zoho y WhatsApp). Es un solo botón, cuadrado, en `--accent`, que
abre el panel con los tres caminos (asistente, asesor y WhatsApp). Los mensajes del asistente usan
`--bg` con borde `--line`, y los del usuario usan `--ink` con texto `--bg`.

---

## 8. Fotografía e iconografía

### Fotografía

- **Obra real y actual de HL.** Personas con EPP completo, escala de los equipos (persona junto a un
  molino o un tanque), procesos (izaje, soldadura, vaciado) y antes/después.
- Luz natural, encuadres técnicos y horizonte recto. Sin filtros de color ni duotonos de marca.
- **Cada foto lleva pie** con el proyecto y el año, y `alt` descriptivo.
- Formatos AVIF/WebP generados en el build, con `srcset` responsive. Carga diferida salvo la primera
  imagen visible.
- Proporciones: 16:9 (hero, galería), 4:3 (tarjeta), 3:2 (ficha).
- **Mientras no hay foto:** placeholder rayado (líneas a 135° `--line-soft` cada 9 px sobre
  `--paper`) con la etiqueta de datos "Foto pendiente · Proyecto · Año", o una línea estructural.
  No se rellena con bancos de imágenes.
- La misma foto no puede ilustrar más de un servicio o proyecto (hoy la PTAR Salitre sale en 12
  páginas).

### Iconografía · pendiente de definir

La propuesta no define un set de íconos. Criterio para elegirlo o dibujarlo: trazo lineal de 1.5 px
y terminaciones rectas, en grilla de 24 px, monocromo en `currentColor`, sin rellenos ni esquinas
redondeadas marcadas. Uso mínimo: navegación, contacto, descargas y estados. Los sellos de
certificación son imágenes con su `alt` y su texto equivalente en HTML.

---

## 9. Movimiento

Las animaciones imitan gestos de obra y de oficina técnica. **Nunca bloquean el contenido, nunca
hay preloader**, y todo el contenido existe en el HTML aunque el JavaScript falle.

| Gesto | Qué hace | Curva | Duración | Dónde |
|---|---|---|---|---|
| **Trazo** | El SVG se dibuja como un plano (`stroke-dashoffset` de 1 a 0) | `--ease-plano` | `--t-trazo` 1.4 s, escalonado con retraso | Ilustraciones de línea estructural al entrar en pantalla |
| **Izaje** | Bloques y tarjetas suben a su sitio y frenan, como una carga izada | `--ease-izaje` | `--t-izaje` .9 s, escalonado | Rejillas de tarjetas, listas de proyectos |
| **Cota** | La línea de cota se mide (`scaleX` de 0 a 1) y la cifra cuenta hasta su valor | `--ease-plano` | `--t-cota` 1.2 s | Divisores de sección, cifras destacadas |
| **Transición de vista** | La página nueva entra por barrido lateral (`clip-path`) sin pantallazo en blanco | `--ease-barrido` | `--t-vista` 1.1 s | Navegación entre páginas (View Transitions API) |
| **Aparece** | Opacidad de 0 a 1 y desplazamiento de 6 px | `ease` | `--t-aparece` .8 s / `--t-rapido` .35 s | Texto del hero, mensajes del chat |

**Reglas**

- Cada animación se dispara **una vez**, al entrar en pantalla. Nada en bucle, salvo un detalle
  mínimo del hero (el gancho de la grúa).
- `prefers-reduced-motion: reduce` pone todas las duraciones en 0 (ya resuelto en `tokens.css`) y
  muestra el estado final.
- Las cifras animadas parten del **valor real ya escrito**: Google y los lectores de pantalla ven 58,
  no 0.
- Herramientas previstas: CSS para lo simple, GSAP + ScrollTrigger para secuencias, Motion en islas
  React y View Transitions de Astro. Lenis (scroll suave) es opcional y se descarta si afecta la
  accesibilidad.

---

## 10. Accesibilidad (mínimos no negociables)

- WCAG 2.2 AA: contraste verificado (§3.4); no se introduce un color nuevo sin pasar el script.
- **Zoom permitido:** nunca `user-scalable=0` ni `maximum-scale=1` (WCAG 1.4.4).
- Foco visible en todo elemento interactivo (`:focus-visible` con `--focus-ring`).
- Un H1 por página y jerarquía de títulos correcta.
- `alt` en todas las imágenes con contenido; logos de clientes con el nombre del cliente.
- Nada de información solo en imágenes ni solo en color.
- Botones y enlaces con nombre accesible (nada de botones que se lean como "").
- Áreas táctiles de al menos 44×44 px en móvil.
- Navegable con teclado: menú, filtros, chat y formularios.
- `lang` correcto en cada versión (`es` / `en`) y `hreflang` entre equivalentes.

---

## 11. Pendientes que completan esta guía

| Pendiente | Depende de | Afecta |
|---|---|---|
| Arquitectura de marca definitiva | D1 | §2.1, cabecera, pie |
| Lema único (ES y EN) | D2 | §2.3, hero, metadatos |
| Logotipo vectorial y sus versiones | Insumo HL: manual de marca / AI-SVG | §2.2, favicon, pie |
| Fotografía actual de obra | Insumo HL: fotos en alta resolución | §8 |
| Set de íconos | Decisión en la etapa de construcción | §8 |
| Sellos de certificación vigentes | Insumo HL: certificaciones en PDF | Página HSE |

---

## Registro de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-13 | Primera versión a partir de la propuesta Rev. 0. Ajustes de contraste (`--signal`, `--bad`, `--good`) y nuevos tokens `--signal-ink` y `--steel`. |
