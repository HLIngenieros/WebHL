# Guía visual base · Grupo HL

Versión 1.5 · 2026-10-19

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
2. **Un color de marca, un acento por sección.** Azul HL para identidad y acción; amarillo de
   señalización para medir y advertir; cada sección suma su propio acento (§3.5), que la demarca sin
   reemplazar al azul.
3. **Una familia, tres voces.** Archivo expandida, normal y condensada. Nada más.
4. **Ángulos rectos.** Sin esquinas redondeadas, sin sombras difusas, sin degradados decorativos.
   Bordes de 1 px y planos de color.
5. **Movimiento con oficio.** Corto, con propósito y siempre prescindible.

**Se rescata** del sitio actual: el logotipo HL y el azul como ancla; del manual de HL Infraestructura
(2024, [manualmarcaold.pdf](manualmarcaold.pdf)), el monograma vectorial y sus reglas de uso (§2.2).
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

### 2.1 Arquitectura de marca · D1 decidido en parte

Hoy conviven Grupo HL, HL Ingenieros, HL Ingenieros S.A. y ECOHL sin jerarquía. D1 (cambio del 20-oct): el
sitio es del **Grupo HL**, con el mismo logo; HL Ingenieros es el nombre anterior del grupo, que aún usan
los clientes antiguos. Falta definir qué empresas del grupo se muestran.

- Nombre visible en cabecera, títulos, asistente y remitente de correos: **Grupo HL** (marca provisional,
  §2.2: monograma + "GRUPO HL").
- El nombre anterior se menciona con discreción: "Grupo HL, antes HL Ingenieros" en Nosotros y en las
  descripciones para buscadores. Hitos históricos y citas textuales conservan "HL Ingenieros".
- Razón social y menciones legales (pie, Acreedores, acuse del radicado, Política de datos): **HL
  Ingenieros S.A.** con NIT. La autorización Ley 1581 nombra al Grupo HL con sus tres sociedades, como la
  Política de datos (por validar con jurídica).
- ECOHL y demás empresas se presentan como líneas o empresas del grupo, nunca como marca paralela en
  la cabecera.

### 2.2 Logotipo · monograma resuelto, logotipo completo pendiente

**Monograma HL (vectorial).** Se extrajo del manual de marca de HL Infraestructura (2024), que comparte
el símbolo con HL Ingenieros. Vive en `src/assets/marca/`:

| Archivo | Versión | Uso |
|---|---|---|
| `monograma-hl.svg` | Color: círculo `#0B509E`, letras blancas | Fondos claros, favicon |
| `monograma-hl-calado.svg` | Una tinta (`currentColor`), letras caladas: se ve el fondo | Fondos oscuros (blanco), franja P3 (grafito), monocromo, modo oscuro |

El azul del vector original (`#0054A1`) es el de HL Infraestructura; HL Ingenieros usa `#0A509E`
(medido en su logo), que es nuestro `--hl-azul` `#0B509E`. Los datos de color escritos en el manual
tienen errores (CMYK repetidos, un blanco rotulado `#FF6633`): no se toman como referencia.

**Logotipo completo** ("ingenieros s.a."): solo existe en PNG; el manual no lo trae y no se puede
reconstruir (le faltan la "g" y la "o"). Hasta tener el vector, la **marca provisional** es el monograma
+ "HL INGENIEROS" en Archivo 115 %/800 (`--fs-marca-nombre`), con "Desde 1968" en voz de datos debajo.
Reemplaza en todo el sitio al cuadro "HL" de la propuesta.

**Reglas** (del manual, llevadas a pantalla):

- Siempre en SVG. **Espacio libre** alrededor igual a la altura del monograma.
- **Tamaño mínimo:** monograma 24 px; conjunto monograma + nombre 120 px de ancho.
- No deformar, no rotar, no cambiar colores (salvo la versión calada en una tinta), no poner sobre
  fondos de poco contraste ni sobre fotos: solo sobre un plano de color.
- **El monograma es una burbuja de eje.** Comparte su forma con P2 (§6) y puede ocupar el lugar de una
  burbuja en momentos de marca, a lo sumo uno por página: el hito "Hoy" de la línea del tiempo y la
  página 404.

### 2.3 Lema · decidido (D2, 2026-10-19)

**"Construimos la industria con gente que cumple, desde 1968."** Parte del candidato A, ampliado para
que sea integral (no solo montaje) y humano (la gente). Comunica trayectoria, fiabilidad y calidad.
EN (propuesta, se cierra en F5): **"Building industry with people who deliver, since 1968."**

Es el H1 del inicio, compuesto en dos voces (§12): "Construimos" (expandida 900) / "la industria"
(expandida 300) / "con gente que cumple, desde **1968**" (voz de datos; solo el año en señal). En
metadatos y textos corridos va en una línea. El candidato B sobrevive como idea ("un solo
responsable") en los textos de Nosotros, no como lema.

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
- Para distinguir categorías **dentro** de una sección (sectores, servicios) se usan los grupos A/B/C
  con ejes con burbuja, no colores nuevos. El color distingue secciones, no categorías (§3.5).

### 3.3 Modo oscuro

Definido completo en `tokens.css`: se activa por `prefers-color-scheme` y se puede forzar con
`data-theme="dark"` o `data-theme="light"` en `<html>`. El azul se aclara a `#62A0EC` y la
señalización vuelve a `#F2B42A`. **Los dos bloques oscuros de `tokens.css` deben mantenerse
idénticos.** El logo usa su versión negativa.

### 3.5 Acentos de sección

Cada sección tiene un acento que la demarca: tiñe su pod (§6), el indicador del menú, las cotas, las
láminas de foto (§8), los filtros activos y el pod de las tarjetas que enlazan a ella. El azul HL
sigue siendo la marca: logo, botón primario, foco y enlaces de texto corrido no cambian.

| Sección | Acento | Claro | Oscuro | Contraste mínimo (claro / oscuro) | Carácter |
|---|---|---|---|---|---|
| Inicio, Nosotros, Contacto y pie | Azul HL | `#0B509E` | `#62A0EC` | (los de `--accent`) | Origen |
| Proyectos | Ámbar | `#8A5A00` | `#F2B42A` | 4,82 / 7,11 | Señal de obra |
| Servicios | Cian | `#006B80` | `#4FC3D9` | 4,79 / 6,93 | Plano |
| Sectores | Violeta | `#5B3FA0` | `#A894E0` | 5,93 / 5,97 | Industria |
| HSE y calidad | Verde | `#1F6F3A` | `#5CC27D` | 4,91 / 6,97 | Seguridad |
| Noticias | Óxido | `#B13F12` | `#F08A5D` | 4,84 / 6,27 | Actualidad |

El mínimo es el peor de los cuatro pares que verifica `contraste.py` para cada sección (acento sobre
fondo y papel, `--sec-ink` sobre el acento y acento sobre `--sec-soft`). Los primitivos se llaman
`--sec-<sección>`, `--sec-<sección>-soft` y `--sec-<sección>-ink`.

- **Tokens:** cada página declara su sección en `<html data-seccion="…">` y `tokens.css` define para
  ella `--sec` (acento como texto y línea), `--sec-soft` (fondo de chip y filtro activo) y
  `--sec-ink` (texto sobre `--sec`), con su versión oscura. Sin sección, `--sec` es `--accent`. Los
  componentes usan `--sec`, nunca el valor.
- **Contraste:** `contraste.py` verifica cada acento como texto sobre `--bg` y `--paper`, `--sec-ink`
  sobre `--sec` y `--sec` sobre `--sec-soft`, en claro y oscuro.
- Proporción: el acento de sección ocupa a lo sumo lo que ocupaba el azul (≈ 15 %); nunca es fondo de
  áreas grandes salvo la lámina de foto y el pod P3.
- El verde de HSE y el óxido de Noticias se parecen a `--good` y `--bad`: por eso un estado **siempre**
  va como chip con texto (§7), nunca solo como color.
- **Continuidad con el manual de marca.** Los secundarios del manual de HL Infraestructura (verde
  `#339966`, naranja `#FF6633`, cian `#3399CC`) son los mismos tonos que los acentos de HSE, Noticias y
  Servicios; los nuestros son más oscuros para cumplir AA. No se cambian.

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
- Los componentes también usan tokens: `--fs-marca`, `--fs-marca-nombre`, `--fs-boton` / `--fw-boton`,
  `--fs-cta`, `--fs-chip`, `--fs-cota` y `--wdth-stat`. Crecen en pantallas de 2200 px o más. Una prueba
  (`tests/menores.spec.ts`) impide escribir tamaños, pesos o anchos tipográficos a mano.

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
- **Breakpoints:** 520 · 640 · 760 · 900 · 960 · 1100 (menú completo) · 1600 · 2200 px (enfoque móvil
  primero). Desde 1600 px `--wrap` pasa a 1360 px y desde 2200 px a 1600 px; títulos, cifras y texto
  crecen con ellos (valores en `tokens.css`).
- **Igual de impactante en cualquier pantalla.** Cada formato se diseña, no solo se apila:
  - **Móvil:** menú a pantalla completa con animación; "Hablar con HL" en una barra inferior al alcance
    del pulgar; filtros del explorador en hoja inferior; el rótulo de plano pasa a 2 columnas y las
    tablas a tarjetas. Ilustraciones y cifras conservan su presencia, no se esconden.
  - **Pantallas grandes (≥ 1440 px):** hero, mapa y escenarios de ilustración a todo el ancho; el texto
    sigue dentro de `--wrap`; los tamaños de display crecen con `clamp()` hasta 2560 px.
  - Los componentes se adaptan al espacio que ocupan (container queries), no solo al ancho de la ventana.
  - Matriz de prueba: 360, 390, 768, 1024, 1366, 1920 y 2560 px, y móvil en horizontal.
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
| **Lámina de foto** | Foto en monocromo teñida con `--sec` (multiplicar) y un trazo de plano blanco encima que se dibuja al entrar; al pasar el cursor o tocar, la foto vuelve a color | Foto protagonista: cabecera de ficha, tarjetas, portadas (§8) |

**Pods de sección.** Tres formas, cada una con un papel fijo, todas en `--sec`:

| Pod | Construcción | Papel | Frecuencia |
|---|---|---|---|
| **P1 · Rótulo** | Celda de cajetín: barra de 6 px en `--sec`, código de lámina y nombre de la sección, borde `--ink` 1.5 px | Identifica la página: encima del H1, en todas | Una por página; también en tarjetas que enlazan a otra sección |
| **P2 · Burbuja de eje** | Círculo con letra en `--sec`, nombre y línea; el eje punteado baja por el borde y acompaña el scroll | Estructura el contenido: grupos A/B/C, subsecciones de ficha, hitos | Las que pida la estructura |
| **P3 · Señal** | Franja de rayas a 135° en `--sec` + bloque de color con el nombre en `--sec-ink` + código | Llama la atención: indicadores HSE, "Adjudicado", franja de contacto | A lo sumo una por pantalla |

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

**Botón de trazo** (solo la acción principal de un hero; hoy, "Ver proyectos" del inicio). Bloque de
60 px de alto: etiqueta en expandida 115 %/750 y una celda cuadrada con la flecha, separada por una
línea de 1 px. Entrada, una vez: el contorno `--accent` se dibuja por los cuatro lados (Trazo), el
bloque se llena de `--accent` de izquierda a derecha y aparecen la etiqueta y la flecha (≈ 1,6 s en
total, sin bloquear: el enlace funciona desde el primer instante). Hover y foco: un barrido de
`--signal` cubre el bloque, el texto pasa a `--ink`, la flecha sale por la derecha y entra por la
izquierda, y aparecen dos marcas de registro en esquinas opuestas. Sin amarillo antes del hover.

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
Navegación en voz de datos `--muted`, con hover a `--ink` y borde `--line`. Cinco entradas (Nosotros ·
Proyectos ▾ · HSE y calidad · Noticias · Contacto) más ES/EN; el submenú de Proyectos está en §13.1.

**Variante inmersa (solo el inicio).** Sin fondo, dentro del marco de lámina del hero, sobre grafito.
Marca provisional con el monograma calado en blanco; menú en voz normal con el número de cada sección
en voz de datos `--hl-senal` como superíndice (01 Nosotros … 05 Contacto) y subrayado de señal que se
mide al pasar; ES/EN; "Hablar con HL" con borde de señal y un punto que titila (único bucle permitido
además del hero). Debajo, una cota de 1 px que se mide al cargar. Al salir del hero con el scroll, la
barra pasa a la variante normal pegajosa. En móvil: marca + botón de menú, con el mismo trato inmerso.

### Rótulo de pie

Bloque final de cada página (20-oct, maqueta B de `design/maquetas/pie.html`, sin el lema): cierra el sitio
en grafito con la retícula azul, como lo abre el héroe del inicio, igual en los dos temas (primitivos
`--hl-*`; para los acentos de sección sobre grafito, `--hl-cian`, `--hl-violeta` y `--hl-oxido`). Arriba,
una planta en línea estructural (torre precalentadora, horno, silos, banda, grúa) que se traza al llegar
sobre la línea de terreno, con sus ejes y una cota; en móvil se recorta a la torre, el horno y los silos.
Debajo: monograma, rótulo de plano (razón social, teléfono, correo y las 4 sedes de `sedes.yaml`, en
celdas con borde claro), navegación con número y acento de sección como el menú, enlaces "Con HL", y una
base con ©, trayectoria 1968 — hoy, las ISO y LinkedIn. El NIT sigue pendiente.

### Botón de contacto único ("Hablar con HL")

Reemplaza las dos burbujas actuales (Zoho y WhatsApp). Es un solo botón, cuadrado, en `--accent`, que
abre el panel del agente (20-oct: sin asesor en vivo; el agente deriva a WhatsApp, correo o teléfono
como tarjetas de acción dentro de la conversación). Los mensajes del asistente usan
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
- Proporciones: 3:2 (ficha), 4:3 (tarjeta), 4:5 (galería).
- **Nunca grandes ni a sangre.** Las fotos actuales miden 1200 px y muchas son de celular: ninguna se
  muestra a más de 800 px CSS de ancho. En pantallas grandes el espacio sobrante lo ocupan la
  retícula, la ilustración y los datos, no la foto estirada.
- **Lámina de foto** (§6) para la foto protagonista; el tinte usa el acento de la sección. Es el único
  tratamiento de color permitido: sin otros duotonos, semitonos ni filtros.
- **Hoja de contactos** para galerías: fotos pequeñas a color (≤ 480 px), recorte vertical 4:5,
  marcas de corte en dos esquinas, número y pie en voz de datos. Al pulsar, se abre en un visor a lo
  sumo de 800 px, con el pie completo.
- **Mientras no hay foto:** placeholder rayado (líneas a 135° `--line-soft` cada 9 px sobre
  `--paper`) con la etiqueta de datos "Foto pendiente · Proyecto · Año", o una línea estructural.
  No se rellena con bancos de imágenes.
- La misma foto no puede ilustrar más de un servicio o proyecto (hoy la PTAR Salitre sale en 12
  páginas).
- **Mosaico de cabecera** (solo la cabecera de Nosotros): 6 fotos de obra 4:5 en tres columnas
  desfasadas, cada una en lámina (teñida con `--sec`, vuelve a color al pasar), con marco interior de
  1 px y código "HL-0n · Lugar". Las columnas se desplazan a velocidades distintas con el scroll
  (paralaje leve). Es una hoja de contactos en lámina: no reemplaza la regla de galerías a color.
- **Archivo histórico** (solo la línea del tiempo de Nosotros): las fotos de época son la única
  excepción al "sin filtros". Van en la **tira de negativos** (§12): los cuadros futuros en negativo,
  el del hito actual se revela de negativo a positivo al llegar, y el color **crece con los años**
  (1960s en blanco y negro con tono de papel, hoy a todo color). Se permite grano de película para
  disimular la baja resolución; ampliación máxima 560 px. Pie con lugar o persona solo si el dato es
  verificable (el de los 80 lleva "Hernando Londoño" porque viene en la foto original).

### Iconografía · pictogramas de plano

No se usa un set externo. Los íconos de interfaz (navegación, contacto, descargas, estados): trazo de
1.5 px, terminaciones rectas, grilla de 24 px, `currentColor`, sin rellenos. Los **pictogramas de
contenido** (hoy, los 5 valores de Nosotros) se dibujan en grilla de 64 px con trazo de 1.6 px en
`--sec` y un detalle en `--signal`, como un plano: ventana (Transparencia), anillos entrelazados
(Compromiso), calendario con chulo (Cumplimiento), escalones que suben (Desarrollo), casco
(Seguridad). Se trazan al entrar, en secuencia, y de nuevo al pasar el cursor. Los sellos de
certificación son imágenes con su `alt` y su texto equivalente en HTML.

---

## 9. Movimiento

Las animaciones imitan gestos de obra y de oficina técnica. **Nunca bloquean el contenido, nunca
hay preloader**, y todo el contenido existe en el HTML aunque el JavaScript falle.

| Gesto | Qué hace | Curva | Duración | Dónde |
|---|---|---|---|---|
| **Trazo** | El SVG se dibuja como un plano: cada trazo se revela de izquierda a derecha (`clip-path`), escalonado (con `non-scaling-stroke`, `stroke-dashoffset` dejaba trazos a medias en dibujos grandes) | `--ease-plano` | `--t-trazo` 1.4 s, escalonado con retraso | Ilustraciones de línea estructural al entrar en pantalla |
| **Izaje** | Bloques y tarjetas suben a su sitio y frenan, como una carga izada | `--ease-izaje` | `--t-izaje` .6 s, escalonado (total ≤ .6 s) | Rejillas de tarjetas, listas de proyectos |
| **Cota** | La línea de cota se mide (`scaleX` de 0 a 1) y la cifra cuenta hasta su valor | `--ease-plano` | `--t-cota` 1.2 s | Divisores de sección, cifras destacadas |
| **Transición de vista** | La página nueva entra por barrido lateral (`clip-path`) sin pantallazo en blanco; barra superior y botón de contacto quedan fijos | `--ease-barrido` | `--t-vista` .5 s | Navegación entre páginas (View Transitions de Astro) |
| **Aparece** | Opacidad de 0 a 1 y desplazamiento de 6 px; solo CSS, arranca con el primer pintado (no espera al JS) | `--ease-izaje` | `--t-aparece` .5 s / `--t-rapido` .2 s (hover, filtros, menú) | Texto del hero, mensajes del chat |

**Firma por sección.** Además de los gestos comunes, cada sección tiene uno propio:

| Sección | Firma |
|---|---|
| Proyectos | En el mapa, los puntos caen como estacas de topografía; al filtrar, las tarjetas se reacomodan (FLIP). En la ficha, la lámina se traza y las cifras se miden con su cota |
| Servicios | Un eje vertical (P2) recorre la página con el scroll; cada subcapacidad entra como una capa de plano que se superpone a la anterior |
| Sectores | Escenario: la ilustración del sector a todo el ancho, en capas (estructura, ejes, cotas) con paralaje leve al hacer scroll |
| Inicio | **Gemelo digital**: una planta en 3D de alambre (canvas propio, sin librerías) se levanta por niveles al cargar, gira despacio, sigue al cursor y resalta en señal una disciplina a la vez (obra civil, montaje mecánico, montaje eléctrico, fabricación, mantenimiento) con una sola etiqueta discreta (§12) |
| Nosotros | **Tira de negativos**: la sección se fija y, al bajar, el año corre con dígitos rodantes, una cota amarilla se estira sobre la regla 1968 → hoy, las burbujas de los hitos se encienden y la película corre de lado; el cuadro del hito se revela de negativo a positivo (§8, §12) |
| HSE y calidad | Los indicadores en franjas P3 que bajan como una barrera de obra; las Reglas de Oro se encienden en secuencia |
| Noticias | La fecha como sello de recibido de plano; los adjudicados con franja P3 |

Los efectos ligados al scroll usan `animation-timeline: view()` / `scroll()` en CSS; sin soporte, se
ve el estado final. No suman JavaScript. Única excepción: la tira de negativos de Nosotros (§12.3).

**Reglas**

- Cada animación se dispara **una vez**, al entrar en pantalla. Nada en bucle, salvo el hero del
  inicio (giro lento y disciplina resaltada del gemelo digital), la estructura 3D de la política en HSE
  (§12.5), la cinta de la franja P3 y el punto de "Hablar con HL". Todo bucle se detiene fuera de pantalla y con la pestaña oculta.
- `prefers-reduced-motion: reduce` pone todas las duraciones en 0 (ya resuelto en `tokens.css`) y
  muestra el estado final.
- Las cifras animadas parten del **valor real ya escrito**: Google y los lectores de pantalla ven 58,
  no 0.
- **Ninguna animación hace esperar:** el contenido es legible desde el primer instante.
- **Solo se anima `transform`, `opacity` y `clip-path`** (60 fps en un Android de gama media); nunca
  propiedades que recalculan la página (`width`, `top`, `height`…).
- **Navegación casi instantánea:** precarga al pasar el cursor o al entrar el enlace en pantalla
  (Astro prefetch) y Speculation Rules en Chromium.
- **Desplazamiento nativo.** Sin Lenis ni scroll suave por librería.
- Herramientas: las entradas (Izaje, Aparece, Cota) usan un IntersectionObserver de ~1 KB: se disparan
  una vez, con la duración y la curva de los tokens. `animation-timeline: view()` se reserva para efectos
  que deben seguir al scroll. Motion solo en el explorador de proyectos; GSAP solo si una secuencia lo
  exige, cargado en esa página.

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
| Empresas asociadas que se muestran | D1 | §2.1, Nosotros |
| Lema en inglés | F5 | §2.3 |
| Logotipo completo vectorial ("ingenieros s.a.") | Insumo HL: AI/SVG/PDF | §2.2, cabecera, pie |
| Fotografía actual de obra | Insumo HL: fotos en alta resolución | §8 |
| Fotos de archivo histórico en alta resolución (una por década) y una foto actual para "Hoy" | Insumo HL | §8, §12 |
| Sellos de certificación vigentes | Insumo HL: certificaciones en PDF | Página HSE |

---

## 12. Inicio y Nosotros

Decididos con maquetas el 2026-10-19: [inicio.html](../design/maquetas/inicio.html),
[nosotros.html](../design/maquetas/nosotros.html) y
[nosotros-linea-del-tiempo.html](../design/maquetas/nosotros-linea-del-tiempo.html). Las maquetas fijan
**composición, jerarquía y movimiento**; los valores salen de los tokens (donde la maqueta escribe un
número a mano, manda el token más cercano). Principio que guió las rondas: **menos es más**: cada bloque
tiene una idea visual, no tres.

### 12.1 Inicio

Acento azul (`data-seccion` sin valor). Orden:

1. **Hero · lámina viva** (≈ 100 svh, mín. 600 px; fondo `--hl-grafito` en los dos temas):
   - **Marco de lámina:** borde de 1 px acero a `--s3` del borde, con zonas A–H arriba y 1–4 a la
     izquierda en voz de datos (solo esos dos lados). Retícula de fondo.
   - **Barra inmersa** (§7) dentro del marco.
   - **Bloque de texto centrado en vertical** en el espacio bajo la barra, a la izquierda (≈ 56 % del
     ancho): H1 con el lema (§2.3) en blanco y gris, y debajo el **botón de trazo** "Ver proyectos"
     (§7). **Nada más:** sin subtítulo, sin cifras, sin rótulo, sin segundo botón, sin datos de un
     proyecto concreto.
   - **Gemelo digital** a la derecha (≈ 62 % del ancho, detrás del texto si se cruzan): planta genérica
     (nave de molienda, torre, silos, banda, postes eléctricos, grúa, losa de cimentación), no una obra
     concreta. Al cargar se levanta por niveles con una línea de corte de señal punteada; luego gira
     despacio y sigue al cursor (inclinación y giro). Cada ~2,8 s resalta en `--hl-senal` las piezas de
     una disciplina con una sola etiqueta en voz de datos: Obra civil → Montaje mecánico → Montaje
     eléctrico → Fabricación → Mantenimiento (toda la planta). Trazos azul claro al 55 %, grúa en señal,
     suelo en acero al 15 %.
   - Indicador "Bajar" centrado abajo (línea con una marca que baja).
2. **Franja P3 · sectores:** 40 px en `--hl-senal`, bordes grafito; bloque de rayas a cada extremo
   (fijo, con borde) y entre ellos un carril propio por donde corre la cinta con los 6 sectores en voz
   de datos, separados por rombos dibujados. El texto nunca pasa por debajo de las rayas.
3. **HL en cifras · fichas de plano** (4 en fila; 2 en móvil): cada ficha es una celda de cajetín con
   burbuja A–D, nombre en voz de datos y código L-02.n; cifra en expandida 900 que cuenta hasta su
   valor (escrito en el HTML); una línea de texto; un dibujo de plano propio que se traza al entrar y
   otra vez al pasar; pie en voz de datos. Hover: la ficha se vuelve `--accent`, el dibujo pasa a
   blanco y señal y aparecen marcas de registro. Cifras y dibujos:
   - A · Trayectoria: años desde 1968 (calculados) · cota 1968 → año actual con marcas por década.
   - B · Presencia: 7 países · siete estacas de topografía con su código (CO, PA, CR, DO, GT, BO, EC;
     la lista sale del texto "Ejecutamos los proyectos de forma diferente" del inicio actual,
     `contenido/institucional.md` §1).
   - C · Sedes: 4 · cuatro ejes con burbuja (Bogotá, El Rosal, Panamá, R. Dominicana).
   - D · Calidad: 3 normas ISO · tres sellos (9001, 14001, 45001).
4. **Resto del inicio** (aprobado el 2026-10-19 con [inicio-resto.html](../design/maquetas/inicio-resto.html)).
   Cada bloque toma el acento de la sección a la que lleva y abre con P1 (L-03…L-06) + H2 en dos pesos
   ("Obras que / hablan por nosotros") + enlace "Ver…" con flecha que avanza al pasar.
   - **Proyectos destacados** (ámbar): los de `destacados()` (hoy Columbus, Progreso, PTAR Salitre,
     Buriticá; nunca discretas). Disposición editorial: el primero en grande (lámina alta, 7 col.) y los
     otros tres en fichas horizontales (foto 160 px + cuerpo, 5 col.), compartiendo bordes bajo una
     línea `--ink`. Cada ficha: código P-xx · sector · país, título, cliente · ciudad, su primera cifra
     en grande. Sin foto: plano de respaldo (retícula + línea estructural). Sin año (las fichas no lo
     tienen). Enlace "Ver los N proyectos" (N = todas las del explorador).
   - **Servicios** (cian): "Un solo responsable, / de principio a fin". Los 3 grupos A/B/C en columnas
     con burbuja de eje y nombre del grupo; cada línea es una fila con su código (A-01…) y flecha; al
     pasar, un barrido de `--sec-soft` llena la fila.
   - **Sectores** (violeta): "Industria / que conocemos por dentro". Rejilla de 4 columnas con
     prevalencia (§13, [sectores.html](../design/maquetas/sectores.html) §3): Cemento y Minería en celdas
     de 2 columnas (código S-0n, "Sector principal", ilustración grande, nombre en expandida 900, una
     línea de texto y el número de proyectos en grande); los otros cuatro en celdas pequeñas (dibujo de
     84 px, código y conteo, nombre). Número real de proyectos visibles (`deSector().length`). Al pasar,
     la celda se llena de `--sec`, el dibujo pasa a blanco y se traza otra vez.
   - **Franja HSE** (verde, sobre grafito): rayas P3 a la izquierda, "Seguridad / que se mide" y tres
     indicadores en grande que bajan como una barrera al entrar: −64 % frecuencia y −72 % severidad
     (8 años, programa de cultura de seguridad, PDF ECOHL) y 0 incidentes en Chuchupa A y B (Chevron).
     Bloque final verde "HSE y calidad →".
   - **Últimas noticias**: no se renderiza con menos de 3 (especificación §3); con contenido, la firma
     de Noticias (§9).
   - **Clientes** (azul): "Confían / en nosotros". Los logos de `sitio.clientes` (sin First Quantum, D6)
     en dos cintas que corren en sentidos contrarios, con fundido en los bordes; en gris, a color al
     pasar; se detienen con hover, foco o movimiento reducido. `alt` = nombre del cliente.

### 12.2 Nosotros

Acento azul. Ritmo vertical más apretado que el general: secciones a `--s6`/`--s7` reducido (las
maquetas usan 76 px), sin bloques de solo texto: cada sección lleva su pieza visual.

| # | Sección | Pieza visual | Contenido |
|---|---|---|---|
| 0 | Cabecera | **Mosaico de cabecera** (§8) a la derecha | H1 "Gente que cumple / desde 1968" (900 / 300) y los dos párrafos de "Quiénes somos" |
| 1 | Línea del tiempo | **Tira de negativos** (12.3) | 5 hitos de `historia` con sus fotos de archivo + "Hoy" (foto actual; provisional: Planta Columbus) |
| 2 | Misión y visión | **Lámina** con la foto del equipo sobre el plano (`src/assets/generales/mejor-gente.jpg`) y trazo blanco del plano; misión en grande (300 / 900 en `--accent`); cota "Visión"; visión con sus dos promesas subrayadas en `--signal-soft` | **4 indicadores** que cuentan y miden su cota: 1 día antes (Cemex Caracolito), 3 días antes (cargador de barcos de Cerrejón), −64 % frecuencia y −72 % severidad (HSE, PDF ECOHL) |
| 3 | Valores | Cinco **ejes con burbuja** A–E con **pictograma** (§8); el eje se pinta y la burbuja se llena al pasar; en táctil se encienden en secuencia al entrar | Nombre en voz de datos grande + una frase tomada de "Quiénes somos" (siempre visible, más tenue) |
| 4 | Presencia (fondo grafito) | **Siete estacas** de topografía en señal, de alturas distintas, que caen escalonadas; nombre del país inclinado arriba y código abajo | "Ejecutamos los proyectos de forma diferente" (texto del inicio actual) |
| 5 | Soy parte de HL | Selector de nombres (izquierda) · **lámina** del retrato (centro) con años en la casa en grande si la cita los da · cita (derecha); avanza solo cada 9 s con barra de progreso, se detiene al elegir | 4 testimonios, en fragmento; **solo los `autorizado`** |
| 6 | Empresas asociadas | Rejilla de celdas con código E-0n y área; logo en gris que toma color al pasar; barra `--accent` que se mide | Las que fije D1; descripción solo si existe |

**Secciones sin contenido publicable** (hoy: testimonios, ninguno autorizado; empresas, pendientes de
D1): se **ocultan** sin dejar hueco (la numeración y la alternancia claro/grafito se recalculan) y
quedan en `/pendientes/`; no bloquean `build:lanzamiento`, igual que Noticias con menos de 3 entradas.
En desarrollo se ven con una marca "sin autorizar" / "por confirmar" para poder probarlas. Los
fragmentos de cita y los años en la casa los propone el constructor, marcados "confirmar" en el
contenido, y los valida HL junto con la autorización.
| 7 | Cierre | Dos bloques a todo el ancho (`--accent` y grafito) con foto de fondo en luminosidad al 30 % que crece al pasar, y barrido de señal | "Trabaje con nosotros" (candidatos) y "Conozca nuestros proyectos" |

### 12.3 Tira de negativos

- **Escenario fijo** (`position: sticky`, 100 svh, fondo grafito) dentro de una sección alta (≈ 6
  pantallas de scroll para 6 hitos). El avance se toma del scroll; **no** hay modo de arrastre.
- **Con JavaScript propio, en todos los navegadores** (es la firma de Nosotros; no se acepta la lista
  estática en Firefox o Safari). Es la excepción a "los efectos ligados al scroll son CSS" de §9: un
  oyente de scroll pasivo que solo lee la posición y un único `requestAnimationFrame` que escribe
  `transform`, `opacity` y `filter`; nada de medir el DOM por cuadro. El paralaje del mosaico de
  cabecera sí va en CSS (`animation-timeline`), sin JS.
- **Año** en expandida 900 enorme, con dígitos rodantes (cada dígito es una columna 0–9 que se
  desplaza). Corre de forma continua de 1968 al año actual.
- **Hito actual:** "0n/06 · Etapa" + chip con la **década** (dato real: "Década de los 60" … "Desde el
  2000", "Presente"), título en expandida y texto. Cambia con un fundido corto al cruzar cada hito.
- **Regla** inferior 1968 → hoy: marcas por año y por década, burbujas numeradas en la posición de
  cada hito (pasadas en azul claro, actual llena en señal; "Hoy" puede ser el monograma, §2.2), cota
  de señal que se estira hasta el año en curso y un cursor con el año.
- **Película** a la derecha: cuadros 3:2 con perforaciones y código de borde en señal ("HL ▸ 03A ·
  80"); corre de lado para centrar el hito. Encima, el **cuadro ampliado** (≤ 560 px) que se revela al
  llegar (negativo → positivo en ≈ 1 s) con una cota y "Lugar o persona · cuadro 0nA" / década debajo.
  Tratamiento por época (§8).
- Los hitos se ubican en su década (1968, 1970, 1980, 1990, 2000, hoy); si llegan años exactos, se
  usan sin cambiar el diseño.

### 12.5 HSE, Noticias, Acreedores y legales

Decididos con maquetas el 2026-10-19 (dos rondas): [hse.html](../design/maquetas/hse.html) y
[noticias-legales.html](../design/maquetas/noticias-legales.html). Criterio de la segunda ronda (pedido de
Juan David): **movimiento en cada bloque** (entrada y hover), tarjetas en vez de párrafos y diagramas
donde hay mucho texto.

**HSE y calidad** (acento verde, `/hse/`):
1. **Cabecera:** P1 L-05, H1 "Seguridad / que se mide" (líneas que suben), entrada y chips ISO; lámina
   verde con la foto del equipo (`generales/mejor-gente.jpg`) que entra con barrido y se acerca, ejes
   punteados, cota en señal que se mide y cruz de seguridad que gira al entrar y al pasar; la foto sigue
   levemente al cursor.
2. **Indicadores** sobre grafito con rayas P3 en `--hl-verde`: −64 %, −72 %, +1 M HH sin incidentes
   (premio Chevron) y 0 incidentes ambientales en Chipirón (PDF ECOHL). Bajan como barrera, las cifras
   cuentan y la celda se ilumina al pasar. Nota de indicadores de 3 años pendientes.
3. **Certificaciones:** tarjetas con norma, ámbito, código SGS, sello (gira al entrar) y enlace al PDF;
   se inclinan en 3D con el cursor con un brillo verde. BPI aparte, punteada, "por confirmar".
4. **Política de gestión integral:** estructura 3D de alambre en canvas propio (como el gemelo): cimiento
   = valores y requisitos legales; 4 columnas = clientes, gente, comunidades, grupo; cubierta = sistema de
   gestión integral. Se levanta por niveles, gira despacio, resalta una columna a la vez (verde) y la lista
   de la derecha despliega su texto; pasar sobre una columna o un botón la elige; se arrastra para girar.
   Bucle permitido (§9): se detiene fuera de pantalla, con la pestaña oculta y con movimiento reducido.
5. **10 Reglas de Oro** en tarjetas: número, pictograma propio y título corto (aprobados para esta
   versión); caen como señales (rotateX) en secuencia, dibujan el pictograma y miden una cota verde; al
   pasar, enfocar o tocar giran (rotateY) y muestran la regla completa sobre verde.
6. **PIENSA®:** eje de 3 pasos (planificación, tema, herramienta) que se mide con un pulso en señal; la
   persona en el centro con pictograma.
7. **Prácticas:** 4 tarjetas que se levantan, se llenan de `--sec-soft` y redibujan su pictograma.
8. **Cierre** verde con rayas que corren al pasar y "Hablar con HL".

**Noticias** (acento óxido; siempre en el menú; sin entradas, el índice muestra un sello y "pronto publicaremos"; el bloque del inicio solo con 3 o más):
- Índice: H1 en dos líneas que suben; filtros (Todas · Noticias · Adjudicados) con una marca que corre y
  tarjetas que se reacomodan (FLIP); tarjetas con lámina óxido (a color al pasar), inclinación 3D, título
  subrayado que se mide, "Leer →" que entra; **sello de recibido** con la fecha que se estampa al entrar y
  otra vez al pasar; **adjudicados** con franja P3 que sube y cuyas rayas corren al pasar. La primera
  tarjeta va en grande.
- Entrada: barra de lectura (cota óxido arriba), cabecera con lámina en paralaje y sello, texto a 66
  caracteres (17,5 px), cita que se revela, proyecto relacionado y compartir con barrido.

**Acreedores** (azul): convocatorias como documentos sobre una línea de tiempo que se mide; esquina
doblada que se abre al pasar, flecha de descarga que rebota, estado (vigente/anterior) en chip; aviso de
que los accesos internos salen del sitio.

**Legales** (datos y términos, azul, una plantilla): cajetín del documento con PDF, aviso de revisión
jurídica, índice fijo que se llena con lo leído y marca la sección actual, secciones que se encienden al
llegar, enlace a cada sección al pasar por su título; texto a 68 caracteres.

### 12.4 Comportamiento común (Inicio y Nosotros)

- **Sin JavaScript o con `prefers-reduced-motion`:** todo el contenido está en el HTML. El gemelo se
  dibuja completo y quieto; la tira de negativos se muestra como lista de 6 hitos (foto revelada,
  década, título, texto) sin fijar el escenario; las cifras se ven en su valor final.
- **Móvil:** el gemelo va debajo del título, más bajo; la tira de negativos apila año, cuadro, texto y
  regla en la misma pantalla fija, con menos recorrido de scroll; mosaico a 2 columnas sin paralaje;
  valores, estacas e indicadores en columna o en 2 columnas.
- **Rendimiento:** el H1 es el LCP del inicio (el canvas no). El gemelo y la tira son JS propio
  pequeño (sin librerías), cargado después del primer pintado, que se pausa fuera de pantalla.
- **Accesibilidad:** canvas y dibujos con `aria-hidden`; cifras y textos reales en el HTML; el
  selector de testimonios es un grupo de botones con `aria-pressed`; el avance automático se detiene
  con foco o hover.

---

## 13. Proyectos y Sectores

Decidido con maquetas el 2026-10-19: [sectores.html](../design/maquetas/sectores.html) y
[explorador.html](../design/maquetas/explorador.html). Origen: una apreciación externa: los filtros del
explorador y las páginas de Servicios y Sectores eran redundantes en el menú. **Cemento y Minería son
los sectores principales** y van primero y más grandes donde aparezcan los sectores.

### 13.1 Submenú de Proyectos

- "Proyectos" es un enlace (al explorador) y a su lado va un **botón ▾** (`aria-expanded`,
  `aria-controls`). Se abre con clic o teclado; se cierra con Esc, clic fuera o al salir el foco. **No se
  abre al pasar el cursor.** Abierto: el botón y "Proyectos" en `--sec` de Proyectos (ámbar) y una cota
  de 2 px que se mide bajo la entrada.
- **Panel** a todo el ancho bajo la barra, fondo `--paper`, línea superior `--ink`; entra con barrido
  (`clip-path`, `--t-izaje`). Dos columnas (8 + 4):
  - **Sectores:** Cemento y Minería en dos celdas con la ilustración sobre retícula, nombre en
    expandida 850 y una línea en voz de datos violeta (n proyectos · cifra de su obra mayor). Al pasar, la
    celda se llena de violeta y el dibujo pasa a blanco y se traza. Debajo, los otros cuatro en una línea
    con su conteo, separados por rombos violeta.
  - **Servicios:** lista simple por grupo (burbuja A/B/C y nombre del grupo en voz de datos), sin dibujos
    ni cifras.
  - Pie: "Ver los N proyectos en el explorador →" (ámbar) y "Todos los sectores →" (violeta).
- **Sin fotos en el panel** (está en todas las páginas): solo las ilustraciones de línea.
- **Móvil** (menú inmerso): Proyectos lleva un botón ± que despliega dentro del menú Cemento y Minería
  (dos recuadros con borde violeta), los otros cuatro como etiquetas y la lista de servicios.

### 13.2 Explorador

- **Filtros** bajo el encabezado, en filas con su rótulo en voz de datos:
  - **Sector en placas:** columnas 2-2-1-1-1-1; Cemento y Minería con su dibujo. Placa elegida: se llena
    de `--sec` (ámbar) de abajo arriba; el dibujo pasa a blanco con ejes en señal.
  - **Servicio** en tres grupos (burbuja A/B/C) con chips; **País** en chips bajo el mapa.
  - Cada opción muestra cuántas obras quedarían con los demás filtros; las que dejarían 0 se apagan.
  - **Estado:** el total en expandida 900 (`--sec`) con una cota que se mide al cambiar; la URL del
    estado (`/proyectos/?sector=cemento`) y "Quitar filtros".
- **Escena:** mapa (7 col., fijo al hacer scroll, alto de la ventana menos la barra) y lista (5 col.).
- **Mapa vivo** (SVG propio, sin teselas ni librerías):
  - retícula de meridianos y paralelos cada 5° con sus rótulos; países con obra en `--sec-soft`, el
    elegido con borde `--sec`; sedes como cuadros `--ink`; escala gráfica en km.
  - **Acercar y desplazar:** botones +, − y encuadre; Ctrl/⌘ + rueda (la rueda sola muestra la pista y
    no atrapa el scroll); arrastrar con el mouse; pellizcar con dos dedos (un dedo desplaza la página).
    Acercamiento máximo ≈ 6×. Transiciones del encuadre de .65 s (`--ease-plano`).
  - **Grupos:** los puntos a menos de 34 px en pantalla se juntan en un círculo `--ink` con borde `--sec`
    y el número; al acercar se separan. Con mucho acercamiento aparece el nombre de la ciudad.
  - Clic en un **grupo:** encuadra sus obras. Clic en un **punto:** ventana (foto en lámina, código,
    sector, título, cliente · ciudad, "Ver ficha →") que entra con barrido. Clic en un **país con obra:**
    filtra y lo encuadra. Al filtrar, el mapa encuadra lo que queda.
  - Los puntos caen como estacas al aparecer y se encogen al salir (firma de Proyectos, §9).
  - Pasar por una tarjeta resalta su punto (anillo que late) y pasar por un punto resalta sus tarjetas.
  - Las fichas sin coordenadas salen en la lista con "Sin ubicación" y no en el mapa; la leyenda dice
    cuántas son.
- **Pod de línea** sobre la lista: con un sector elegido, recuadro con barra violeta (código S-0n,
  nombre, introducción, "Ver el sector →"); con un servicio, el mismo en cian. Entra con barrido.
- **Lista:** tarjetas horizontales (lámina de 120 px + cuerpo) que se reacomodan con FLIP.
- **Móvil:** el mapa va arriba (cuadrado, no fijo); las placas se desplazan de lado.

### 13.3 Página de Sectores

- Encabezado con P1 (L-04) y H1 en dos pesos ("Industria que / conocemos por dentro").
- **Escenarios** para Cemento y Minería, uno tras otro, alternando el lado de la foto (7 + 5 y 5 + 7):
  - lámina violeta con la foto del sector y la ilustración en sus tres capas (ejes, estructura, cotas)
    con paralaje distinto al hacer scroll (firma de Sectores, §9); código y "Sector principal" arriba,
    pie con la obra de la foto;
  - cuerpo: código y nombre, H2 en expandida 900, introducción, dos cifras (proyectos y la cifra de su
    obra mayor), 3 obras en filas (título, cliente · ciudad, cifra en ámbar; barrido `--sec-soft` al
    pasar) y los enlaces "Conocer el sector →" y "Ver los N proyectos →" (al explorador filtrado).
- **Otros sectores:** índice en filas sin cajas (código, nombre, una línea, conteo); al pasar, la fila se
  llena de violeta y aparece su dibujo a la derecha.
- Solo obras publicables (sin discretas, D6).

---

## Registro de cambios

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-13 | Primera versión a partir de la propuesta Rev. 0. Ajustes de contraste (`--signal`, `--bad`, `--good`) y nuevos tokens `--signal-ink` y `--steel`. |
| 1.1 | 2026-10-15 | Movimiento más corto y fluido (`--t-vista` .5 s, `--t-izaje` .6 s, `--t-aparece` .5 s, `--t-rapido` .2 s), reglas de rendimiento y diseño por formato de pantalla (§5). |
| 1.3 | 2026-10-19 | Inicio y Nosotros (§12), decididos con maquetas en `design/maquetas/`: lema D2 (§2.3), monograma vectorial y reglas del manual de marca (§2.2), barra inmersa y botón de trazo (§7), mosaico de cabecera y archivo histórico (§8), pictogramas de plano (§8), firmas de Inicio (gemelo digital) y Nosotros (tira de negativos) (§9). |
| 1.5 | 2026-10-19 | HSE, Noticias, Acreedores y legales (§12.5), con movimiento en cada bloque; bucle permitido para la estructura 3D de HSE (§9). |
| 1.4 | 2026-10-19 | Proyectos y Sectores (§13): menú con submenú en Proyectos (Sectores y Servicios), prevalencia de Cemento y Minería, explorador con mapa vivo y pod de línea, página de Sectores con escenarios; bloque de sectores del inicio con prevalencia (§12.1). |
| 1.2 | 2026-10-15 | Ampliación controlada para dar personalidad a cada sección: acentos de sección (§3.5), pods P1/P2/P3 y lámina de foto (§6), fotos nunca mayores de 800 px con lámina y hoja de contactos (§8), firma de movimiento por sección (§9). Decidido con maquetas sobre fotos reales. |
