# Plan R · Rediseño comercial (identidad y orden del contenido)

Origen: acta GHL-WEB-001 de la reunión de inicio con el área comercial (10-nov-2026) y su anexo navegable
`grupo-hl-propuesta-web.zip` (parámetros de diseño y maquetas del Home, las 6 pestañas y 4 complementarias).
Decisiones de Juan David del 12-nov. Va **antes de F6**. Tamaño L: suite completa, presupuesto y Lighthouse solo al cierre.

**Principio rector:** cada página lleva **exactamente** lo que define el acta (tabla siguiente), nada más. Lo
que hoy tenemos y el acta no pide, sale. El dinamismo, las animaciones especializadas y la fluidez se conservan
en cómo se presenta ese contenido, no agregando bloques ni gráficas decorativas.

## Contenido por página (acta, "Ajustes acordados en la revisión del tablero")

| Página | Contenido |
|---|---|
| 1 · Home | Video de fondo con el texto (solo el título; sin gráficas de plano), cifras relevantes y sección de clientes |
| 2 · Quiénes somos | Slogan, línea del tiempo, misión, visión y valores, presencia por países (sin direcciones) |
| 3 · Proyectos | Solo minería, cemento y otros proyectos; mapa, filtros y ficha 3.1 (datos generales, fotos, cantidades) |
| 4 · Servicios | Mecánico, civil, eléctrico e instrumentación; 3 proyectos por servicio que filtran hacia la ficha |
| 5 · Gestión integral | Certificados, indicadores de seguridad, política SGI, Reglas de Oro, PIENSA®, herramientas |
| 6 · Noticias | Blog con adjudicaciones, iniciativas y eventos |
| 7 · Contacto | Solo formularios: cotizar, proveedores, buzón ético, trabaja con HL (sin sedes) |
| Pie (todas) | Oficina principal, teléfono, redes, sellos ISO y enlaces complementarios |
| Complementarias | Términos y condiciones, tratamiento de datos, vacantes, acreedores y documentos públicos |

## Decisiones (12-nov)

| # | Tema | Decisión |
|---|---|---|
| R-1 | Tipografía | **Poppins** 600/700 (títulos, menú, botones, cifras) + **Open Sans** 400/600 (texto) + **IBM Plex Mono** 500 reducida a mayúsculas, cifras y signos (códigos, cotas, antetítulos). Alojadas en el servidor, `font-display: swap` y respaldos con métricas ajustadas (`design/fuente.py`). Si el presupuesto no da, Plex Mono sale primero. Se elige Poppins y no Raleway porque es la del anexo que ya vio el comité |
| R-2 | Color | Escala azul `#003399` (50 `#EEF2FB` … 950 `#040F26`), naranja `#FF6633` solo como relleno o sobre azul oscuro (≤ 5 % de la pantalla), cian `#3399CC` para ilustración, tinta `#14181C`, gris `#56606A`. **Se retiran los acentos por sección**: las secciones se distinguen por su firma de movimiento y su pod |
| R-3 | Formas | Radios de 4 (botones y campos), 6 (tarjetas) y 22 px (chips); la tarjeta sube 4 px y gana sombra al pasar el cursor; íconos con trazo de 1,8 px. Bandas oscuras (azul 900 con retícula de 48 px) solo en el hero y en las bandas clave; el resto en claro |
| R-4 | Modo oscuro | Se mantiene; se recalcula el contraste con `contraste.py` |
| R-5 | Servicios | **3 especialidades, en este orden:** Montaje mecánico (y tubería) · Obras civiles · Montaje eléctrico e instrumentación. Se conservan los slugs `montaje-mecanico`, `obras-civiles` y `montaje-electrico`. EPC, Gerencia, Fabricación y Mantenimiento salen con 301: EPC → `/servicios/` ("proyecto completo" va en la intro y en el formulario), Gerencia/ECOHL → `/nosotros/`, Fabricación y Mantenimiento → `/servicios/montaje-mecanico/` |
| R-6 | Sectores | Las 6 páginas salen con 301 al explorador filtrado. El filtro de sector queda en **Minería · Cemento · Otros proyectos** |
| R-7 | Quiénes somos | Sin testimonios ni empresas asociadas (los datos se quedan en el repo) |
| R-8 | Formularios | Adjuntos solo en PDF de hasta 5 MB, validados en el PHP (tipo real, tamaño, cantidad) y enviados como adjunto del correo sin guardarlos en disco |
| R-9 | Rutas | Se conservan `/nosotros`, `/proyectos`, `/servicios`, `/noticias` y `/contacto`. `/hse` → **`/gestion-integral`** (EN `/en/integrated-management`) con 301. `/proveedores`, `/trabaje-con-nosotros` y `/buzon-etico` siguen como URL, pero muestran la plantilla de Contacto con su pestaña abierta (funciona sin JS y cada una tiene su título). Nueva `/vacantes` (EN `/en/jobs`). `/acreedores` y `/documentos`: una sola plantilla con dos pestañas, igual que Contacto |
| R-10 | Pendientes del acta | Arquitectura de marca, lema, plataforma, inglés y casos sensibles siguen con D1, D2, D4 y D6 mientras el comité decide. El compromiso 10 del acta (arreglos en el WordPress) no es de este proyecto |

## Fases

| Fase | Tareas | Verificación |
|---|---|---|
| **R0 · Maquetas y documentos** ✔ 12-nov | R0.1 Maqueta del Home `design/maquetas/rediseno.html` con fotos reales: menú, video de fondo con el título, cifras relevantes, clientes y pie, en claro y oscuro (**puerta**). R0.2 Con la maqueta aprobada: `tokens.css` nuevo, `contraste.py` en OK, guía visual v2.0 (identidad, componentes y movimiento) y especificación v2.0 (mapa del sitio y plantillas) | Aprobación de Juan David |
| **R1 · Identidad** ✔ 12-nov | Fuentes reducidas (`fuente.py`) y alojadas; tokens aplicados en `global.css` y en los componentes; se quitan `--sec-*` y `[data-seccion]` de color (los pods quedan en azul y naranja); fotos en duotono sobre oscuro y a color en las fichas; radios, sombras y estados | `check`, humo, presupuesto |
| **R2 · Armazón** ✔ 12-nov | Menú de 6 pestañas sin panel (`PanelProyectos` sale) con ES/EN; menú móvil; pie del acta (oficina principal, teléfono, redes, sellos ISO, enlaces complementarios); transición de barrido (View Transitions); "Hablar con HL" se mantiene flotante | `check` + pruebas de navegación |
| **R3 · Home y Quiénes somos** (✔ 12-nov) | Home: video de fondo con el título (MP4 + WebM ≤ 6 MB, póster como LCP, solo en escritorio, botón de pausa), cifras relevantes con contador (valor final en el HTML) y clientes. Sale todo lo demás del inicio actual. Quiénes somos: slogan, línea del tiempo, misión, visión y valores, presencia por países sin direcciones. **Home hecho:** hero con póster provisional de Columbus (acercamiento lento y pausa; el video entra solo al poner `video:` en `sitio.yaml`, pendiente bloqueante), cifras calculadas (años, países, HH del proyecto visible con más horas, primer indicador con signo de HSE) y clientes; fuera franja de sectores, destacados, servicios, sectores, HSE, noticias y el gemelo digital. La barra deja de ser transparente a los 40 px. Ajustes (12-nov): cifras en tarjetas blancas con borde sobre banda niebla e íconos de trazo; H2 en Poppins 700 (todo el sitio) con barra naranja en el Home. **Quiénes somos hecho (12-nov):** H1 = lema; tira de negativos; misión y visión (con sus indicadores) y valores con H2 visible y barra naranja (clase global `.h2-barra`; fuera pods y numeración); presencia en un mapa propio estático que llega hasta Bolivia (`src/lib/mapa-presencia.ts`, `node design/mapa.mjs <geojson> --presencia`) con pulso que recorre los 7 países y se fija al elegir uno. Fuera mosaico, testimonios, asociadas y cierre (y sus textos). De paso: la tira mostraba 2026 con el hito anterior al final del scroll (el hito ahora sale del año redondeado) | `check` + pruebas de la página |
| **R4 · Proyectos y Servicios** ✔ 12-nov | Colección de servicios reducida a 3 y fichas reasignadas; sectores a 3 categorías de filtro y fuera sus páginas; explorador con mapa, filtros y ficha 3.1 (datos generales, fotos, cantidades); página de cada servicio: sus 3 proyectos que llevan a la ficha | `check` + explorador, ficha y servicio |
| **R5 · Gestión integral y demás** ✔ 12-nov | Gestión integral con sus 6 bloques. Noticias: blog con adjudicaciones, iniciativas y eventos. Contacto: solo los 4 formularios, sin sedes, con adjuntos (`enviar.php`). Complementarias: términos, datos, vacantes (`Vacantes.tsx` sin cambios: el flujo sigue congelado), acreedores y documentos públicos | `check` + formularios (PHP con `HL_PHP`) |
| **R6 · Cierre** | Inglés de todo lo nuevo; `inventario.csv`, `.htaccess` y `sitemap` con los 301 (servicios, sectores, `/hse`); revisión de código enfocada en `enviar.php` (adjuntos); CLAUDE.md, memoria y bitácora | Suite completa, `npm run presupuesto`, Lighthouse móvil una vez (Home, explorador, Gestión integral, Contacto) |

**Cierre de R1 (12-nov):** `design/fuente.py` reduce Poppins 500/600/700, Open Sans variable 400-600 y Plex Mono 500
(solo mayúsculas, cifras y signos) desde Fontsource 5.2.6: 52 KB en total (Archivo pesaba 73). Respaldos con métricas
(Arial, Arial Bold, Consolas). Fuera los anchos (`font-stretch`, `--wdth-*`), los acentos (`--sec*`, `[data-seccion]` de
color; queda solo como gancho de prueba en la barra) y los alias viejos (`--hl-grafito` → `--azul-900`, `--hl-concreto` →
`--azul-50`, `--hl-acero` → `--noche-tenue`, `--hl-senal`/`--hl-verde` → `--hl-naranja`, los demás → `--hl-trazo`);
`--f-ancha` pasa a `--f-titulo`. Datos (`.voz-datos`, chips, tablas, mapa) en Plex Mono. Pods: franja y rayas naranjas,
texto azul. Láminas a color; `.duotono` (azul 900 → blanco, con trazo) sobre oscuro (mosaico de Nosotros). Tarjetas
separadas con radio 6, suben 4 px con sombra y la foto se acerca 5 %. Radios en botones, campos, chips, mapa y ventanas.
Archivo queda en `design/` solo para el generador de PDF (`documentos.mjs`), cuya identidad se actualiza aparte.
Verificación: `check` 0 errores, estilos + humo 15/15, presupuesto OK (inicio 11,9 KB gz). La suite completa se corre
en R6.

**Cierre de R2 (12-nov):** cabecera azul noche en los dos temas (transparente solo sobre el hero del inicio), 6
pestañas con línea naranja de 2 px en la activa y al pasar, `ES · EN` y tema; fuera `PanelProyectos` y el "Hablar con
HL" de la barra (el flotante queda siempre). Menú móvil con `popover` nativo y barrido: abre sin JavaScript, así que el
pie ya no lleva navegación de respaldo. Pie del acta: marca, oficina principal (de `sedes.yaml`) y teléfono, 5 enlaces
complementarios, sellos ISO (texto hasta tener las imágenes oficiales) y LinkedIn. Provisionales hasta R5: "Gestión
integral" apunta a `/hse/` y "Vacantes" a Trabaje con nosotros. Favicon en `#003399`. El barrido entre páginas ya
existía (`Base.astro`). Verificación: `check` 0 errores; barra, pie, movimiento y humo 33/33.

**Cierre de R4 (12-nov):** servicios = 3 especialidades (`orden`, `slug`, `proyectos` con 3 referencias, `nombre`,
`resumen`); fuera EPC, Gerencia, Fabricación y Mantenimiento y los campos de alcance, normas, FAQ y grupos. Sectores =
Minería · Cemento · Otros proyectos (`otros`/`other`; agua y energía, petróleo y gas, infraestructura e industria pasan a
`otros`), sin página. Fichas reasignadas: Fabricación y Mantenimiento → montaje mecánico; Gerencia y EPC se quitan;
Chuchupa queda sin especialidad (pendiente por confirmar). `auditar()` exige que los 3 proyectos de cada especialidad
existan, no sean discretos y la mencionen; la cifra de la ficha pasa de "3-4" a "una para la tarjeta". **Propuesta de los
3 proyectos (en `/pendientes/`):** mecánico = Columbus, Cementos Progreso, PTAR Salitre; civil = Columbus, Chimborazo,
Diana Pet Food; eléctrico = Puerto Bolívar, Buriticá, Charlotte. Ficha 3.1: datos generales (rótulo + descripción;
el sector lleva al explorador filtrado), fotos y cantidades medidas con cota (`Cifras`); fuera cifras, reto,
relacionados y llamada. En el explorador la ficha sube como panel (`<dialog>` con el `<article>` de la página ya
compilada, descargado al pasar por la tarjeta): Escape, el botón o el fondo cierran y el foco vuelve; la URL cambia con
`replaceState` porque el `ClientRouter` maneja el historial (Atrás sale del explorador); con Ctrl o sin JS se abre la
página. Fuera grupos A-B-C y pods de línea. Servicios: selector de especialidad con radios (sin JS, flechas) y cascada de
sus 3 tarjetas; la página de la especialidad muestra sus 3 y el enlace al explorador filtrado. En Contacto, el sector
del formulario ya no repite "Otros proyectos" junto a "Otro". Pruebas: de paso se pusieron al día las de R1-R3 que
seguían en `proyectos.spec.ts` (sección en la pestaña del menú, selector de idioma, variantes hasta 2400 px).
Verificación: `check` 0 errores; proyectos, contenido, humo y pantallas 238/238. Los 301 de servicios y sectores van en R6.

**R5 · Gestión integral (12-nov):** `/hse/` pasa a `/gestion-integral/` (EN `/en/integrated-management/`; la clave
interna sigue siendo `hse`; el 301 va en R6). Cabecera con H1 del anexo ("Calidad, seguridad y ambiente bajo un solo
sistema") e índice de chips a los 6 bloques, en el orden del acta: certificados, indicadores, política SGI (estructura
3D), Reglas de Oro, PIENSA® y herramientas tecnológicas de gestión (nuevo: Procore, Libra, Zoho CRM, Opus y
Microsoft 365, del anexo, en texto; por confirmar con TI en `/pendientes/`). Fuera la lámina con foto, las prácticas
(observadores, pare y asegure, pasaportes, reuniones de liderazgo; quedan en `contenido/institucional.md`), el cierre y
el pod de PIENSA; H2 con `.h2-barra`. Verificación: `check` 0 errores; HSE, humo, contacto y documentos 31/31.

**R5 · Contacto (12-nov):** la plantilla `Solicitud` muestra las 4 pestañas del acta, en su orden (cotizar · proveedores ·
buzón ético · trabaja con HL): son enlaces a `/contacto`, `/proveedores`, `/buzon-etico` y `/trabaje-con-nosotros` (sin JS
funcionan y cada una conserva su título; el menú marca Contacto en las 4). Fuera sedes y redes de la cabecera (queda el
buzón de destino) y la hoja "Motivo" del formulario. Códigos renumerados al orden: ético F-03, empleo F-04. Adjuntos (R-8):
un PDF opcional de hasta 5 MB en cotizar ("Pliego o alcance"), proveedores ("Presentación de la empresa") y buzón ético
("Soporte"); la hoja de vida sigue obligatoria. `enviar.php` rechaza archivos de más, varios en un campo y adjuntos que no
son PDF real o pasan de 5 MB (antes un adjunto opcional inválido se ignoraba); `public/api/.user.ini` sube los límites
de PHP (6 MB por archivo, 8 MB por envío; negado por `.htaccess`). El servicio del formulario suma "Proyecto completo (EPC /
llave en mano)" (R-5). El tablero de vacantes sigue en Trabaje con nosotros hasta crear `/vacantes`. Verificación: `check`
0 errores; contacto, PHP (con `HL_PHP`, 2 pruebas nuevas de adjuntos), humo y barra 35/35.

**R5 · Complementarias (12-nov):** nueva `/vacantes` (EN `/en/jobs`): la plantilla `Solicitud` con `vacantes` muestra el
tablero (`Vacantes.tsx` sin cambios; el flujo sigue congelado) y debajo el formulario F-04, así "Postularme" sigue
entregando la vacante; sin pestañas. Trabaje con nosotros queda como pestaña de Contacto, solo con el formulario y un
enlace "Ver vacantes abiertas". El pie apunta a `/vacantes`. Las pestañas-enlace pasan a `components/Pestanas.astro`
(Contacto, 4; Acreedores · Documentos públicos, 2, con `pestanasPublicas()` en `lib/documentos.ts`). Términos y Datos
ya tenían la identidad nueva (Términos sigue pendiente de jurídica). Verificación: `check` 0 errores; contacto, humo,
documentos, pie y rutas 56/56.

**R5 · Noticias (12-nov):** tipos del acta en la colección (`adjudicacion · iniciativa · evento`, antes `noticia · adjudicado`) y
filtros con esos cuatro (todas y los tres tipos). Tarjeta con la identidad R: foto a color que se acerca, tarjeta con radio que se eleva,
sello y franja naranja en las adjudicaciones; la entrada usa la capa oscura del Home (`--velo-video`) en vez del tinte. 3 entradas
de **muestra** ES/EN (`muestra: true`, chip "Muestra"): `auditar()` las marca como bloqueantes del lanzamiento y salen en
`/pendientes/`. Corregida la marca de los filtros en móvil (dos filas: ahora sigue la fila y la altura del botón). Verificación:
`check` 0 errores; HSE (con noticias), contenido, humo y rutas 90/90.

## Riesgos

- **Rendimiento:** pasamos de 1 familia a 3 y se suma el video. El LCP del Home lo pone el póster (AVIF, sin precarga del video) y el video se carga después del evento `load`, solo en escritorio y sin `prefers-reduced-motion`. Presupuesto vigente: LCP < 2,0 s y JS ≤ 30 KB gz.
- **Adjuntos en el PHP:** validación del tipo real (`finfo`), tope de tamaño y de cantidad, sin escritura en el servidor; correo MIME armado a mano.
- **Fotos:** no hay fotos recientes en alta resolución ni video de obra. Se trabaja con las actuales (≤ 800 px) y póster de muestra, y quedan marcadas en `/pendientes/`.
