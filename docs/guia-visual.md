# Guía visual · Grupo HL

Versión 2.0 · 2026-11-12 (Plan R)

Cómo se ve y cómo se mueve el sitio del Grupo HL. Es la referencia obligatoria durante el desarrollo:
si un componente nuevo no encaja en estas reglas, primero se ajusta la guía y luego el código.

- **Origen:** acta GHL-WEB-001 de la reunión de inicio con el área comercial (10-nov-2026), su anexo
  "Parámetros de diseño" y la maqueta aprobada [design/maquetas/rediseno.html](../design/maquetas/rediseno.html)
  (12-nov). Plan y decisiones: [plan-r.md](plan-r.md). La v1.5 (Archivo, acentos por sección, radio 0)
  queda en el historial de git.
- **Valores:** [design/tokens.css](../design/tokens.css) es la única fuente de verdad. Esta guía nombra
  tokens y no repite valores salvo como referencia.
- **Contraste:** `python design/contraste.py` cada vez que cambia un color; debe terminar en OK.

---

## 1. Concepto: plano técnico en azul corporativo

El sitio se ve como la documentación de una obra bien hecha, en el azul del manual de marca. Del oficio
de HL salen la cota, el eje con burbuja, el rótulo y el trazo; se usan para **presentar datos**, nunca
como adorno.

**Principios**

1. **Cada página lleva exactamente lo que define el acta** (§10). Nada de bloques, datos ni gráficas
   que no estén ahí.
2. **La evidencia manda.** Cifras de obra, años, toneladas y horas hombre antes que adjetivos.
3. **Un azul que hace casi todo; un naranja puntual.** La escala azul resuelve fondos, texto, acción y
   bandas oscuras; el naranja marca un dato, una cota o un punto activo (≤ 5 % de la pantalla).
4. **Dinamismo en el movimiento, no en el contenido.** Las secciones se distinguen por su firma de
   movimiento (§8), no por color.
5. **Claro para leer, oscuro para impactar.** Azul noche solo en el hero, el pie y las bandas clave; el
   resto, en claro.

**No hacer**

- Gráficas de plano, retículas o dibujos encima del video del Home: ahí va solo el título.
- Texto naranja sobre blanco (2,9:1): sobre claro, el naranja es relleno con texto tinta, o marca.
- Un segundo azul "para variar", degradados decorativos o sombras de color.
- Contadores que arrancan en 0 en el HTML; preloader; texto dentro de imágenes.
- Fotos de banco de imágenes.

---

## 2. Marca

### 2.1 Arquitectura de marca (D1)

El sitio es del **Grupo HL**. Nombre visible en cabecera, títulos, asistente y remitente: **grupo HL**.
"Antes HL Ingenieros" va con discreción en Quiénes somos y en las descripciones para buscadores. Razón
social y menciones legales: **HL Ingenieros S.A.**; la autorización Ley 1581 nombra al Grupo HL con sus
sociedades (por validar con Jurídica). La arquitectura definitiva sigue pendiente en el acta (Gerencia).

### 2.2 Logotipo

**Monograma HL** (`src/assets/marca/`), ahora en **`--azul-600`** con letras blancas. Junto a él, el
nombre "grupo **HL**" en Poppins (500 "grupo", 700 "HL", `--fs-marca-nombre`). Versiones:

| Fondo | Monograma | Nombre |
|---|---|---|
| Claro | Círculo azul 600, letras blancas | Tinta |
| Azul noche (cabecera sobre video, bandas) | Círculo azul 600 con aro blanco de 2 px | Blanco |
| Pie (azul 950) | Círculo blanco, letras azul 950 | Blanco |

Siempre en SVG; espacio libre igual a la altura del monograma; mínimo 24 px. El logotipo completo
("ingenieros s.a.") sigue pendiente en vector.

### 2.3 Lema (D2)

**"Construimos la industria con gente que cumple, desde 1968."** EN: **"Building industry with people
who deliver, since 1968."** En el Home es el H1 sobre el video, en dos niveles: "Construimos / la
industria" (Poppins 700, `--fs-lema`) y "con gente que cumple, desde 1968." (Poppins 500,
`--fs-lema-datos`; "desde 1968." en blanco con subrayado naranja). En textos corridos va en una línea.

### 2.4 Voz y tono

- **Concreta:** cifra antes que adjetivo ("1.100 m de banda costa afuera en 7 meses").
- **Técnica sin jerga vacía:** normas, equipos y alcances reales.
- **Fechada:** todo caso lleva año; los años de la empresa se calculan desde 1968.
- **Sin superlativos** ni metas internas. Tratamiento de **usted** en ES; inglés de EE. UU. profesional.

| Español | English |
|---|---|
| Montaje mecánico y tubería | Mechanical & piping installation |
| Obras civiles industriales | Industrial civil works |
| Montaje eléctrico e instrumentación | Electrical & instrumentation installation |
| Gestión integral | Integrated management |
| Seguridad (HSE) | Safety |
| Trayectoria / Proyectos | Track record / Projects |
| Formaleta deslizante | Slipform construction |

---

## 3. Color

### 3.1 Paleta

| Token | Valor | Uso |
|---|---|---|
| `--azul-600` ★ | `#003399` | Corporativo: enlaces, botón principal, cifras, menú activo |
| `--azul-900` | `#071A40` | Noche: hero, cabecera fija, bandas oscuras |
| `--azul-950` | `#040F26` | Pie; fondo del modo oscuro |
| `--azul-50` | `#EEF2FB` | Niebla: secciones alternas, chips |
| `--azul-100`…`800` | escala | Estados, bordes y apoyos; no se inventan azules fuera de la escala |
| `--hl-naranja` | `#FF6633` | Acento puntual: cota, punto activo, una cifra clave. Relleno o sobre azul oscuro |
| `--hl-trazo` | `#8FB0F0` | Líneas y antetítulos sobre azul noche |
| `--hl-cian` | `#3399CC` | Ilustración técnica y gráficos (no texto) |
| `--hl-tinta` | `#14181C` | Texto principal; texto sobre relleno naranja en los dos temas |
| `--muted` | `#56606A` | Texto secundario |

### 3.2 Roles

Los componentes usan roles, no primitivos: `--bg` (blanco), `--paper` (niebla), `--ink`, `--muted`,
`--line`, `--accent` (azul 600), `--accent-ink`, `--accent-soft`, `--signal` (naranja para marcas sobre
claro, `#E2541F`), `--signal-ink` (naranja como texto sobre claro, `#B23C0E`), `--signal-soft`,
`--bad`, `--good`. Sobre azul noche se usan los primitivos (`--hl-concreto`, `--hl-acero`,
`--hl-trazo`, `--hl-naranja`), iguales en los dos temas.

### 3.3 Modo oscuro

Se mantiene (R-4). Fondo `--azul-950`, superficies `--azul-900`, texto `#E9EEF8`, acento `--hl-trazo`
con texto azul 950 encima, naranja puro para marcas y texto. Sigue la preferencia del sistema y el
botón de tema.

### 3.4 Contraste verificado

`contraste.py` comprueba 28 pares en los dos temas (texto ≥ 4,5:1; marcas y foco ≥ 3:1). Mínimos
relevantes: azul 600 sobre blanco 10,9:1; naranja sobre azul noche 5,9:1; tinta sobre naranja 6,1:1;
naranja de marca sobre blanco 3,8:1 (solo marcas).

### 3.5 Acentos de sección: retirados

Las variables `--sec*` y `[data-seccion]` resuelven todas al azul y se eliminan en R1. Lo que antes
distinguía el color, ahora lo distingue el movimiento (§8).

---

## 4. Tipografía

| Voz | Familia | Uso |
|---|---|---|
| Títulos (`--f-ancha`) | **Poppins** 500 · 600 · 700 | H1, H2, H3, menú, botones, cifras |
| Texto (`--f`) | **Open Sans** 400 · 600 | Párrafos, fichas, formularios |
| Datos (`--f-mono`) | **IBM Plex Mono** 500, MAYÚSCULAS, +12 % | Códigos (P-03, L-02), cotas, antetítulos, rótulos de tabla |

| Estilo | Fuente · peso · tamaño / interlínea |
|---|---|
| Lema (Home) | Poppins 700 · `--fs-lema` / 1,02 · −2 % |
| H1 de página | Poppins 700 · `--fs-h1` / 1,1 |
| H2 de sección | Poppins 600 · `--fs-h2` / 1,2 |
| H3 de tarjeta | Poppins 600 · `--fs-h3` / 1,3 |
| Cifra | Poppins 700 · `--fs-stat` / 1 · tabular |
| Texto | Open Sans 400 · `--fs-body` / 1,6 |
| Texto pequeño | Open Sans 400 · `--fs-sm` / 1,5 |
| Dato / código | Plex Mono 500 · `--fs-data` · `--ls-data` · MAYÚS |

Alojadas en el servidor y reducidas a los glifos de ES/EN (Plex Mono solo mayúsculas, cifras y signos),
`font-display: swap`, respaldos del sistema con métricas ajustadas (`design/fuente.py`). Si el
presupuesto de rendimiento no da, Plex Mono sale primero y los datos pasan a Open Sans 600 en mayúsculas.

---

## 5. Retícula, espaciado y formas

- **Retícula:** 12 columnas, contenedor `--wrap` (1200 px; 1360 y 1600 en pantallas grandes),
  márgenes `--gutter` (32 px; 20 en móvil), medianil 24 px.
- **Espaciado:** módulo 8 px (`--s1`…`--s7`). Secciones con 80–96 px arriba y abajo en escritorio, 56 en
  móvil.
- **Bandas oscuras:** azul 900 con retícula de plano cada 48 px (`--grid-cell`), nunca sobre el video.
- **Radios:** `--radius` 4 px (botones, campos), `--r-card` 6 px (tarjetas, logos, paneles),
  `--r-chip` 22 px (chips y filtros).
- **Bordes:** 1 px `--line`. Trazos técnicos de 1,2–1,6 px.
- **Sombras:** solo neutras y con propósito: `--sombra-card` cuando la tarjeta se eleva al pasar el
  cursor y `--sombra-panel` en el panel que sube. Sin sombras de color.
- **Íconos:** trazo de 1,8 px (`--stroke-icono`), sin relleno, 24 px, esquinas redondeadas, `currentColor`.

---

## 6. Elementos gráficos

Se usan **dentro de las secciones de contenido** para presentar datos, en SVG en línea con tokens.
Nunca sobre el video del Home.

| Elemento | Uso |
|---|---|
| **Cota** | Línea `--accent` (sobre claro) o `--hl-naranja` (sobre noche) con topes; se mide al entrar. Encima de cada cifra, en cantidades de obra y en la línea del tiempo |
| **Eje con burbuja** | Hitos de la línea del tiempo; puntos del mapa de presencia |
| **Código** | Plex Mono en `--accent` (P-01, L-02): numera fichas y antetítulos |
| **Rótulo** | Tabla de datos generales de la ficha 3.1 (etiqueta en datos, valor en texto) |

---

## 7. Componentes

- **Cabecera:** logo, menú de 6 pestañas (Quiénes somos · Proyectos · Servicios · Gestión integral ·
  Noticias · Contacto) y ES/EN. Sobre el video del Home es transparente; al bajar, o en las demás
  páginas, es azul 900. La pestaña activa y el hover se marcan con una línea naranja de 2 px que se mide
  de izquierda a derecha. Sin botón de cotizar. En móvil: logo + botón "Menú" (panel con barrido).
- **Botones:** primario `--accent` con texto `--accent-ink`; sobre azul noche, relleno naranja con
  `--hl-tinta` o borde blanco. Poppins 600, radio 4 px, flecha que avanza 5 px al pasar el cursor.
- **Chips y filtros:** radio 22 px, fondo `--paper`; activo en `--accent` con `--accent-ink`.
- **Tarjeta de proyecto:** foto 3:2 a color con código en una placa azul noche, título, cliente y la
  cifra destacada; sube 4 px y gana `--sombra-card` al pasar el cursor; la foto se acerca un 5 %.
- **Cifra:** cota encima, número en `--accent` (Poppins 700, tabular), unidad en Poppins 600, línea en
  `--muted`. Si la cifra es una reducción, el signo va en naranja.
- **Campo de formulario:** etiqueta siempre visible; foco con anillo azul de 2 px (`--focus-ring`).
- **Pie (todas las páginas):** azul 950. Oficina principal y teléfono, enlaces complementarios
  (términos, datos, vacantes, acreedores, documentos públicos), sellos ISO y redes. Nada más.
- **"Hablar con HL":** se mantiene como botón flotante que abre el agente.

---

## 8. Movimiento

Nunca bloquea el contenido, nunca hay preloader, y todo existe en el HTML aunque el JavaScript falle.
Solo se anima `transform`, `opacity` y `clip-path`; cada animación se dispara una vez al entrar en
pantalla; `prefers-reduced-motion` pone las duraciones en 0 y muestra el estado final.

| Gesto | Qué hace | Curva | Duración |
|---|---|---|---|
| **Izaje de texto** | Cada línea sube desde una máscara | `--ease-izaje` | .9 s, +.12 s por línea |
| **Izaje de panel** | El panel se descubre de abajo hacia arriba (ficha, agente) | `--ease-izaje` | `--t-izaje` |
| **Cota** | La línea se mide de izquierda a derecha | `--ease-plano` | `--t-cota` |
| **Contador** | De 0 al valor al entrar (el valor final ya está en el HTML) | ease-out cúbica | `--t-contador` |
| **Trazo** | Un dibujo de línea se dibuja solo (solo en contenido, nunca en el hero) | `--ease-plano` | `--t-trazo` |
| **Cinta continua** | Desplazamiento lineal; se pausa al pasar el cursor y se detiene con movimiento reducido | lineal | 46–52 s |
| **Pulso de mapa** | Anillo que late en el punto activo | `--ease-izaje` | 2,4 s, en bucle mientras está a la vista |
| **Barrido entre páginas** | La página entrante se descubre de derecha a izquierda (View Transitions) | `--ease-barrido` | `--t-vista` |
| **Escalonado** | Listas y grillas entran en cascada | `--ease-izaje` | `--t-escalon` por elemento, máx. 6 |

**Firma por página** (sobre el contenido del acta, sin agregar contenido):

| Página | Firma |
|---|---|
| Home | Video de fondo en bucle con botón de pausa (póster en móvil y con movimiento reducido); el lema se iza; las cifras se miden y cuentan; dos cintas de logos en sentidos opuestos |
| Quiénes somos | Línea del tiempo como tira de negativos: el año corre con dígitos rodantes y el hito se revela; recorrido automático con pausa. Mapa de presencia con pulso en el país activo |
| Proyectos | En el mapa, los puntos caen como estacas de topografía; al filtrar, las tarjetas se reacomodan (FLIP); la ficha 3.1 sube como panel y las cantidades se miden con su cota |
| Servicios | Al elegir una especialidad, sus 3 proyectos entran en cascada |
| Gestión integral | La estructura 3D de la política; las Reglas de Oro se encienden en secuencia; las letras de PIENSA® responden al elegirlas; los indicadores cuentan |
| Noticias | Al filtrar por categoría, las notas entran en cascada |
| Contacto | Formularios por hojas animados (isla actual) |

Bucles permitidos: el video del Home, las cintas de logos, el pulso del mapa, la estructura 3D de
Gestión integral y el punto de "Hablar con HL". Todo bucle se detiene fuera de pantalla y con la
pestaña oculta.

---

## 9. Video, fotografía e iconos

- **Video del Home:** 20–30 s en bucle, sin sonido, 1920 × 1080, MP4 H.264 + WebM, máx. 6 MB, con
  póster AVIF (que es el LCP). Capa `--velo-video` (azul casi negro, más densa del lado del título) para
  que el texto se lea. Botón visible de pausa. En móvil y con movimiento reducido se muestra el póster.
  Se carga después del evento `load`. Mientras no haya video, el póster con un acercamiento lento.
- **Fotografía de obra:** real y reciente (2020 en adelante), personas con EPP, escala de los equipos.
  AVIF/WebP responsivas, hasta 2400 px de ancho cuando haya originales (hoy son de 1200 px y se muestran
  a su tamaño). Pie con proyecto y año; `alt` descriptivo.
- **Tratamiento:** sobre fondos oscuros, foto en duotono azul 900 → blanco; en fichas y tarjetas, a color
  natural.
- **Logos de clientes:** en placa blanca con borde, en gris; a color al pasar el cursor; `alt` con el
  nombre del cliente.
- **Sellos ISO:** imagen oficial del ente certificador con su texto equivalente en HTML.

---

## 10. Contenido por página (acta, exacto)

| Página | Contenido |
|---|---|
| 1 · Home | Video de fondo con el texto (solo el título), cifras relevantes y sección de clientes |
| 2 · Quiénes somos | Slogan, línea del tiempo, misión, visión y valores, presencia por países (sin direcciones) |
| 3 · Proyectos | Minería, cemento y otros proyectos; mapa, filtros y ficha 3.1 (datos generales, fotos, cantidades) |
| 4 · Servicios | Mecánico, civil, eléctrico e instrumentación; 3 proyectos por servicio que filtran hacia la ficha |
| 5 · Gestión integral | Certificados, indicadores de seguridad, política SGI, Reglas de Oro, PIENSA®, herramientas |
| 6 · Noticias | Blog con adjudicaciones, iniciativas y eventos |
| 7 · Contacto | Solo formularios: cotizar, proveedores, buzón ético, trabaja con HL (sin sedes) |
| Pie (todas) | Oficina principal, teléfono, redes, sellos ISO y enlaces complementarios |
| Complementarias | Términos y condiciones, tratamiento de datos, vacantes, acreedores y documentos públicos |

Las complementarias usan la plantilla de texto: H1, índice cuando el texto es largo y contenido.

---

## 11. Accesibilidad (mínimos no negociables)

- WCAG 2.2 AA; ningún color nuevo sin pasar `contraste.py`.
- Zoom permitido; foco visible (`--focus-ring`); un H1 por página.
- `alt` en imágenes con contenido; nada solo en imágenes ni solo en color.
- Botones y enlaces con nombre accesible; áreas táctiles ≥ 44 × 44 px.
- Navegable con teclado: menú, filtros, ficha (Escape cierra y devuelve el foco), chat y formularios.
- Todo lo que se mueve más de 5 s tiene pausa (video, cintas) o se detiene con movimiento reducido.
- `lang` y `hreflang` correctos entre ES y EN.

## 12. Rendimiento

Presupuesto vigente (CLAUDE.md): Lighthouse ≥ 95 en móvil, LCP < 2,0 s, CLS < 0,05, INP < 200 ms, JS ≤ 30
KB gz por página (explorador ≤ 100 KB). Tres familias reducidas y un video: el LCP del Home lo pone el
póster, el video no se precarga y las fuentes no bloquean el pintado.

## 13. Pendientes que completan esta guía

| Pendiente | Depende de |
|---|---|
| Video de obra para el Home | Comunicaciones / Operaciones |
| Fotos de obra recientes en alta resolución | Comunicaciones / Operaciones |
| Logotipo completo en vector y manual vigente | Comunicaciones |
| Sellos ISO oficiales y certificados en PDF | HSEQ |
| Arquitectura de marca y lema definitivos | Gerencia (acta, pendientes) |

## Registro de cambios

- **2.0 (2026-11-12):** identidad del comité comercial (azul `#003399` + naranja `#FF6633`, Poppins /
  Open Sans / IBM Plex Mono, radios y sombras neutras); se retiran los acentos por sección y las tres
  voces de Archivo; contenido por página atado al acta; hero del Home solo con título y video.
- 1.0–1.5 (2026-10-13 a 10-19): "concreto, acero y plano" con Archivo; ver historial de git.
