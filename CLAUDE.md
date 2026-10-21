# WebHL — Rediseño del sitio corporativo de Grupo HL

Reconstrucción de **hlingenieros.com**, el sitio del **Grupo HL** (HL Ingenieros es su nombre anterior y la razón social es HL Ingenieros S.A.; contratista
colombiano de construcción, montaje electromecánico y fabricación, fundado en 1968 por Guillermo
Londoño). Es un proyecto **no urgente** que se avanza de forma ocasional y **aún no está lanzado oficialmente**:
se adelanta con discreción mientras se aprueba su priorización, para tener mucho hecho cuando se
apruebe. Por eso el WordPress actual **queda congelado** (sin arreglos rápidos), todo se prueba en
**local** (sin sitio de pruebas publicado) y no se piden insumos a las áreas todavía: se trabaja con lo
que hay y lo faltante queda marcado. Responsable: Juan David
Urbina (Transformación Digital HL).

## Documentos base (fuente de verdad)

- [docs/Diagnóstico integral – hlingenieros.com.pdf](docs/) (29-sep-2026, 18 págs.): auditoría del sitio actual.
- [docs/Nuevo Sitio Grupo HL.html](docs/) (06-oct-2026, Rev. 0, "Para discusión"): propuesta completa.
  Es en sí un prototipo de la identidad (láminas L-01 a L-10, explorador de proyectos, chat y
  formulario simulados). Sirve como referencia de diseño, no es el sitio final.

- **[docs/especificacion.md](docs/especificacion.md) (15-oct, v1.0): diseño aprobado del sitio nuevo**
  (arquitectura, modelo de contenido, plantillas, rendimiento y fases F0-F6). Manda sobre la propuesta.

Antes de proponer algo, verificar que no contradiga estos dos documentos; si se decide algo distinto,
actualizar la sección "Decisiones" de este archivo.

## Diagnóstico en una línea

Sitio congelado en 2019-2020 (WordPress 7.1 + tema The7 + WPBakery + Slider Revolution, ~95 URLs:
~50 ES, ~45 EN, 16 /tag/ vacías). Veredicto: **reconstruir desde cero, no reformar**.

Problemas clave: prehome inútil en `/` (inicio real en `/inicio/`); 4 nombres de marca sin jerarquía
(Grupo HL, HL Ingenieros, HL Ingenieros S.A., ECOHL) y 4 lemas; "52 años" desactualizado (son 58);
cero casos después de enero 2020 y fichas sin año; 9 servicios clonados (~680 palabras propias en
total); sin H1, contadores en 0 en el HTML, sin GA4/Search Console, zoom bloqueado; riesgo legal
(Términos en 404, formularios sin autorización Ley 1581, accesos a ERP/BI/correo publicados junto a
avisos Ley 1116, meta interna de ventas en la visión); inglés a medias con sectores en 404.

Lo que vale rescatar: página Grupo HL (historia, valores, testimonios), **las 16 fichas de proyecto
con cantidades de obra** (11 sólidas), el PDF de ECOHL (casos e indicadores HSE), 10 Reglas de Oro
HSE / PIENSA®, logotipo HL y el azul como ancla.

## Propuesta (resumen)

### Stack recomendado (Opción C)
**Astro + islas Preact (API de React) + Tailwind, sin CMS** (contenido en el repo, ver D4). HTML estático por defecto; Preact solo en el
explorador de proyectos, el agente de chat y los formularios. Colecciones tipadas: Proyecto,
Servicio, Sector, Sede, Certificación. i18n nativo (`/en/` espejo con hreflang). View Transitions.
**Presupuesto de rendimiento (15-oct):** Lighthouse ≥ 95 en móvil en las 4 categorías, LCP < 2,0 s
(4G), CLS < 0,05, INP < 200 ms, JS ≤ 30 KB gz por página (explorador ≤ 100 KB), Archivo variable
reducido y alojado en el servidor, imágenes AVIF/WebP responsivas, mapa de presencia en SVG propio,
caché y compresión en `.htaccess`. Igual de impactante en móvil y en pantallas grandes (guía §5 y §9).
Se mide al cerrar cada fase y en un Android de gama media real. Descartadas: HTML+Tailwind a mano (no escala) y React SPA (mal SEO).
Alternativa si se prefiere React puro: Next.js.

### Identidad: "concreto, acero y plano"
**La referencia obligatoria es [docs/guia-visual.md](docs/guia-visual.md); los valores viven en
[design/tokens.css](design/tokens.css).** No escribir colores, tamaños ni curvas a mano: usar tokens.
Si se cambia un color, correr `python design/contraste.py`, que debe terminar en OK.

En resumen: lenguaje de plano técnico (retícula de 12 columnas, módulo de 8 px, ejes con burbuja,
cotas, rótulo de plano, línea estructural). Un azul (`#0B509E`), un acento de señalización, neutros
(grafito, concreto, acero) y, desde la v1.2, **un acento por sección** (Proyectos ámbar, Servicios cian,
Sectores violeta, HSE verde, Noticias óxido; el resto azul) con pods P1 Rótulo, P2 Burbuja de eje y P3
Señal. Fotos nunca mayores de 800 px: lámina teñida con el acento (protagonista) y hoja de contactos
(galerías). Cada sección tiene su firma de movimiento (guía §9). Una familia, Archivo, en tres voces: expandida, normal y condensada (los
datos van en mayúsculas). Radio 0 y sin sombras. Modo claro y oscuro. Movimiento: Trazo, Izaje, Cota y
Transición de vista; sin preloader, cifras escritas en el HTML, respeta reduced-motion y permite zoom.

### Arquitectura de información (aprobada 15-oct)
- **Público:** amplio e institucional (clientes, candidatos, proveedores, acreedores, comunidad), sin
  descuidar al cliente que evalúa contratistas ni al que precalifica proveedores.
- **Lanzamiento único, completo y bilingüe** (ES y EN desde el día 1). Las fases son de construcción en
  staging; el sitio actual sigue en línea hasta el cambio.
- **Menú corto con un submenú (cambio 19-oct):** Nosotros · Proyectos ▾ · HSE y calidad · Noticias ·
  Contacto · ES/EN; logo → inicio; botón fijo "Hablar con HL". "Proyectos" lleva al explorador y el ▾
  abre un panel con Sectores y Servicios (eran redundantes con los filtros). Sus páginas siguen publicadas
  y se enlazan desde el panel, el pod de línea del explorador, el inicio, las fichas y el pie (guía §13).
- **Cemento y Minería tienen prevalencia** (sectores principales): primero y más grandes en el panel, la
  página de Sectores, el bloque del inicio y los filtros. Servicios, sin prevalencia.
- La jerarquía de Juan David (14-oct) es el mapa del sitio; se reparte entre menú y pie.
  [contenido/](contenido/) sigue ordenado según esa jerarquía.
- Servicios y Sectores tienen página propia y se cruzan con Proyectos: cada ficha enlaza a su
  servicio y sector, y cada página de servicio o sector lista sus proyectos.
- **HSE y calidad** (`/hse`) en primer nivel: política SGI, ISO 9001/14001/45001, Reglas de Oro,
  PIENSA®, prácticas e indicadores. Nosotros = historia + línea del tiempo, visión/misión/valores,
  testimonios y empresas asociadas, en una sola página.
- Slugs EN traducidos; cada página conoce su par para el selector de idioma y hreflang.

| ES | EN | Contenido |
|---|---|---|
| `/` | `/en/` | Inicio |
| `/nosotros` | `/en/about` | Una sola página |
| `/proyectos`, `/proyectos/[slug]` | `/en/projects/...` | Explorador (servicio · sector · país) + mapa vivo (acercar, grupos, filtros en la URL); ~22 fichas (16 + 6 del PDF ECOHL) |
| `/servicios`, `/servicios/[s]` | `/en/services/...` | 7 líneas: `epc-llave-en-mano` (epc-turnkey), `gerencia-de-proyectos` (project-management), `obras-civiles` (civil-works), `montaje-mecanico` (mechanical-installation), `montaje-electrico` (electrical-installation), `fabricacion` (fabrication), `mantenimiento` (maintenance-shutdowns) |
| `/sectores`, `/sectores/[s]` | `/en/sectors/...` | `cemento` (cement), `mineria` (mining), `agua-y-energia` (water-energy), `petroleo-y-gas` (oil-gas), `infraestructura` (infrastructure) |
| `/hse` | `/en/hse` | HSE y calidad |
| `/noticias`, `/noticias/[slug]` | `/en/news/...` | Incluye adjudicados; mínimo 3 entradas al lanzar o se oculta |
| `/contacto` | `/en/contact` | Sedes, formulario de cotización, asistente, redes |
| Pie: `/trabaje-con-nosotros`, `/proveedores`, `/buzon-etico`, `/acreedores`, `/documentos`, `/legal/datos`, `/legal/terminos` | `/en/careers`, `/en/suppliers`, `/en/ethics-line`, `/en/creditors`, `/en/documents`, `/en/legal/privacy`, `/en/legal/terms` | Formularios por intención; ERP/BI/correo/campus salen al portal interno |

- Servicios (de 9 a 7 líneas en 3 grupos):
  - A · Gestión: EPC / Llave en mano (absorbe Ingeniería y diseños); Gerencia de proyectos (PMC/EPCM,
    ECOHL; absorbe Asistencia en la ejecución = Owner's team support).
  - B · Construcción y montaje: Obras civiles industriales; Montaje mecánico y tubería; Montaje
    eléctrico e instrumentación.
  - C · Fabricación y mantenimiento: Fabricación metalmecánica; Mantenimiento y paradas de planta.
- ~50 páginas por idioma + 404, `sitemap.xml`, `robots.txt` y `.htaccess` (301/410 según
  [contenido/inventario.csv](contenido/inventario.csv)).
- Plantillas, modelo de contenido y fases: ver [docs/especificacion.md](docs/especificacion.md).

Plantilla de servicio: alcance por subcapacidad, recursos propios vs. aliados, normas (NSR-10, RETIE,
ASME, API 650, AWS), capacidad, 2-4 proyectos de ese servicio, sectores, modelos de contrato, FAQ,
contacto de la línea.

Ficha de proyecto: cliente y dueño final, rol de HL (contratista/subcontratista/consorcio), país y
ciudad, años de ejecución, servicio, 3-4 cifras destacadas, reto o resultado (plazo, HSE), galería
de 5+ fotos con pie.

### Contacto, agente y correo
- Un solo botón "Hablar con HL" reemplaza las dos burbujas (Zoho SalesIQ + WhatsApp): asistente IA
  24 h (responde con contenido del sitio y cita la fuente; no cotiza ni compromete plazos), asesor en
  vivo por Zoho en horario de oficina, y WhatsApp.
- Formularios por intención (Cotización, Proveedores, Trabaja con nosotros, Buzón ético) y país,
  con casilla obligatoria Ley 1581, enrutados a **buzones por función** (no correos personales).
- Agente de correo en Power Automate: Recibe → Clasifica (IA) → Confirma (radicado) → Enruta (sede +
  responsable, aviso en Teams) → Registra (lista "Leads Web" en SharePoint → Power BI) → Sigue
  (recordatorio/escalamiento). El trigger HTTP es premium; alternativa: función serverless + Microsoft
  Graph.
- **Excepción: Buzón ético** no pasa por IA ni por el registro comercial; canal confidencial a
  buzonetico@, permite anónimo, declara no represalias y da radicado.

### Hoja de ruta (16 semanas estimadas)
1. ~~Arreglos rápidos en el sitio actual~~ (descartado 15-oct: el WordPress queda congelado; esos
   puntos se resuelven en el sitio nuevo).
2. Decisiones de marca → 3. Recolección de contenido → 4. Arquitectura y redacción ES/EN →
5. Identidad visual (aprobada sem. 6) → 6. Construcción e integraciones (staging sem. 11) →
7. Migración, QA y lanzamiento (sem. 16): 301, GA4, Search Console, línea base antes y después.

## Decisiones (D1-D8)

| # | Decisión | Estado |
|---|---|---|
| D1 | ¿Sitio del grupo o de HL Ingenieros? Qué empresas se muestran (en EN aparecen Megacranes y Aktino, no en ES) | **Cambiado (20-oct):** el sitio es del **Grupo HL** (mismo logo, "GRUPO HL"); "antes HL Ingenieros" con discreción en Nosotros y en buscadores; razón social y menciones legales siguen como HL Ingenieros S.A. (guía §2.1). Megacranes y Aktino ya salieron del grupo y no se incluyen (20-oct). HL Infraestructura ejecuta las obras y tendrá el protagonismo (en espera de su información: Juan David la consigue; propuesta: esquema del grupo en Nosotros, recursos propios en Servicios y "Ejecución" en las fichas); ECOHL como gerencia/EPCM; HL Panamá y HL Rental siguen, con protagonismo muy reducido |
| D2 | Lema único | **Decidido (19-oct):** "Construimos la industria con gente que cumple, desde 1968." (A ampliado: integral y humano). EN (cerrado en F5, 20-oct): "Building industry with people who deliver, since 1968." |
| D3 | Agente: bot nativo de Zoho SalesIQ o agente propio con IA que entrega a Zoho | **Cambiado (21-oct, [guía Rev. 3](docs/guia-agente.md), [plan Rev. 2](docs/plan-agente.md)):** **agente propio**, sin Copilot Studio, Power Automate ni SharePoint: panel → `agente.php` → modelo de IA directo (proveedor configurable en `privado/.env`; **en desarrollo, Claude Code local con la sesión de Juan David (`claude-code`, sin clave)**; producción la deciden Gerencia y TI: Claude en Microsoft Foundry o Azure OpenAI, ver [comparativo](https://claude.ai/artifact/KiawaMKCaj4UDX8bMUrQSJ)). Conocimiento: el HTML compilado del sitio + documentos del repo (página Documentos en el pie). **SalesIQ solo para lo comercial**, cargado por intención; sin asesor, formulario de cotización. Buzón ético sin IA (filtro previo en el PHP) |
| D4 | CMS: Sanity, Decap o Payload | **Decidido (15-oct): sin CMS.** Sin terceros ni credenciales nuevas: el contenido vive en el repo como colecciones de Astro (Markdown/JSON con esquema validado al compilar). Despliegue manual (compilar y subir `dist/`). Salida futura si otros deben editar: Decap CMS sobre los mismos archivos |
| D5 | Hosting: Vercel/Netlify o Azure Static Web Apps (tenant M365); Power Automate premium o Graph | **Hosting decidido (15-oct):** el actual (Apache + PHP 8.3, IP 107.180.21.17, al parecer GoDaddy; por confirmar), con despliegue estático que reemplaza a WordPress. Integración de correo: pendiente |
| D6 | Casos sensibles: Odebrecht (Patio de Carbón), Minera Panamá (cerrada desde 2023); nombres actuales de clientes (Zijin Mining, thyssenkrupp Polysius, OHLA) | **Decidido (15-oct):** se mantienen con `visibilidad: discreta`: ficha propia y visible en el explorador, pero fuera de portada, destacados, páginas de servicio/sector y logos de clientes; sí se indexa. Nombres actuales de clientes: pendiente |
| D7 | Buzones comerciales por sede/función | **En espera (20-oct):** por función (buzones compartidos de M365), en `sitio.yaml`; las 4 direcciones son propuesta y se confirman con TI más adelante (en `/pendientes/`) |
| D8 | Equipo de ejecución: interno, proveedor o mixto | Pendiente |

## Insumos que debe aportar HL (pendientes)
Logotipo completo vectorial de HL Ingenieros ("ingenieros s.a."; el monograma ya está en vector, sacado del
manual de HL Infraestructura en `docs/manualmarcaold.pdf`); fotos de archivo histórico en alta resolución
(una por década; las de `src/assets/historia/` son copias web de 2020) y una foto actual para "Hoy";
autorización de los 4 testimonios y validación de sus fragmentos; qué empresas asociadas se muestran (D1);
una sola lista de valores; proyectos 2020-2026 (cliente, año, alcance, cifras); año de los
16 casos y confirmación de cifras de Columbus (web: 42 meses, 8.300 t estructura, 18.600 t equipos vs.
PDF ECOHL: 18 meses, 12.000 t, 10.500 t; el PDF habla de *fabricación*, así que probablemente son
alcances distintos); certificaciones vigentes en PDF; indicadores HSE de 3 años; fotos recientes de
obra; lista vigente de empresas del grupo; acceso a Zoho PageSense y Search Console. **De F4 (en espera):**
buzones por función (D7), SPF/DKIM de `no-reply@`, acceso FTP/SFTP al hosting, lista "Vacantes" en SharePoint
con su flujo de Power Automate, número de WhatsApp. **De D3:** proveedor de IA de producción (Gerencia y TI),
clave de API para desarrollo, `widgetcode` de SalesIQ y certificados ISO en PDF. Lista detallada (con responsable) en [contenido/README.md](contenido/README.md).

## Datos de referencia
- 58 años (desde 1968; calcular dinámicamente, nunca fijo), 7 países con obra (CO, PA, CR, DO, GT, BO, EC,
  del texto "Ejecutamos los proyectos de forma diferente" del inicio actual), 4 sedes (Bogotá, El Rosal,
  Panamá, República Dominicana).
- 16 casos publicados; destacado: Planta Columbus (Cementos Argos, Cartagena), 9.470.000 HH, 5.250 t/día.
- Casos que solo están en el PDF de ECOHL y merecen ficha: Cementos Diamante (líneas 1 y 2), Cemex
  Caracolito (1 día antes), Cerrejón cargador de barcos (3 días antes), Maceo (30 % menos tiempo),
  Chevron Chuchupa A y B (0 incidentes), Ladrillera Santa Fe.
- HSE (PDF ECOHL): −64 % frecuencia, −72 % severidad, 394.200 h de gerencia.
- Glosario EN: Fabrication (no Constructions), Safety (no Security), Mechanical/Electrical
  Installation, Track record/Projects (no Trajectory), Slipform construction, Owner's team support,
  Partners/disciplines.
- Los puntos legales deben validarse con el área jurídica (no es asesoría legal).

## Convenciones de trabajo
- Responder en español.
- **Método austero (20-oct): el proceso se escala al tamaño de la tarea, no al revés.**
  | Tamaño | Ejemplos | Proceso | Verificación | Cierre |
  |---|---|---|---|---|
  | **S** (≤ 3 archivos, sin decisión nueva) | ajuste de estilo, texto, bug acotado | directo, sin plan ni brainstorming | `npm run check` + la prueba del archivo tocado si existe | se acumula al commit de la etapa |
  | **M** (un módulo o página) | un formulario, una plantilla | plan de 5-10 líneas en el chat (sin archivo); una maqueta solo si hay decisión visual | `check` + `npx playwright test <archivo>` + `tests/humo.spec.ts` | commit propio |
  | **L** (fase) | F4, F5 | spec breve → `docs/plan-fN.md` con tabla de tareas (sin código) → ejecución nativa | suite completa, `npm run presupuesto` y Lighthouse **una vez**, al cerrar | commit, merge y registro en este archivo |
  - **Leer lo mínimo:** `grep` antes de abrir; abrir solo el rango que hace falta; no releer lo que se acaba de
    editar ni lo que ya está en este archivo o en la guía.
  - **Sin vueltas:** si un arreglo falla dos veces, parar y diagnosticar la causa (no un tercer intento a
    ciegas); una medición por cambio, sin repetir para confirmar márgenes; las maquetas se presentan
    agrupadas y se construye solo lo aprobado; un desacuerdo de diseño se resuelve preguntando, no
    probando variantes.
  - **Revisión de código:** solo al cerrar una fase L y enfocada en el riesgo (formularios, seguridad, PHP),
    no en todo el diff.
  - **Documentar al cerrar, no durante:** CLAUDE.md, el plan y la memoria se actualizan una vez por etapa.
  - **Respuestas cortas:** resultado, lo que falta y la siguiente decisión; sin resúmenes de lo ya dicho.
- **Trabajo por etapas.** El alcance de cada etapa (fase, módulo o tarea) se define sobre la marcha,
  según avance el desarrollo. Al cerrar cada etapa se hace su commit. Si se trabajó en una rama, se
  hace merge fast-forward a `main` y se borra la rama. Registro de etapas:
  - Etapa 0 (2026-10-13): análisis de diagnóstico y propuesta, CLAUDE.md, init del repo → commit `34c9328`.
  - Etapa 1 (2026-10-13): guía visual base (`docs/guia-visual.md`), `design/tokens.css` y
    `design/contraste.py`.
  - Etapa 2 (2026-10-14): extracción del contenido del sitio actual en `contenido/` (16 fichas,
    textos institucionales, inventario de URLs con destino 301/410, medios, PDF de ECOHL).
  - Etapa 3 (2026-10-15): decisiones D1, D4, D5 y D6; especificación aprobada por secciones
    (`docs/especificacion.md`); guía visual v1.1 (movimiento, rendimiento, pantallas).
  - Etapa 4 (2026-10-15): F0 · Base ([docs/plan-f0.md](docs/plan-f0.md)). Astro 7.3 + Tailwind 4.3 con los
    tokens, rutas ES/EN emparejadas (barra final), barra y menú móvil, pie con rótulo, "Hablar con HL",
    transiciones y revelado, componentes base y `/muestra/` (se elimina en F6). 113 pruebas Playwright
    (`npm test`), `npm run presupuesto` (JS del inicio 5,3 KB gz) y Lighthouse móvil 100/100/100/100
    (LCP 1,7 s, CLS 0, TBT 0). Comandos: `npm run dev`, `npm run build`, `npm test`, `npm run check`.
    Cierre con los 8 menores de la revisión: tokens tipográficos de componentes, tema con estado
    (`aria-pressed`) y respaldo sin almacenamiento, foco sin sombra, breakpoints alineados, Aparece solo
    CSS, impresión y observador único (126 pruebas).
  - Etapa 5 (2026-10-15): F1 · Contenido ([docs/plan-f1.md](docs/plan-f1.md)). 9 colecciones en
    `src/content/` (YAML con textos `es`/`en`; el inglés queda para F5): 22 fichas (16 web + 6 ECOHL; 2
    discretas, 4 destacadas por validar), 7 servicios, 6 sectores, 4 sedes, 4 certificaciones, 5 hitos,
    4 testimonios sin autorizar, sitio y 5 páginas. Funciones puras en `src/lib/contenido.ts`
    (relaciones sin discretas, números por idioma, `auditar()`). 84 medios en `src/assets/` (51 fotos,
    18 logos de cliente sin First Quantum) y `Foto.astro` (AVIF/WebP). `/pendientes/` (se elimina en F6)
    es la solicitud de insumos: 195 bloqueantes; `npm run build:lanzamiento` falla hasta resolverlos.
    `inventario.csv` ya trae la URL nueva de las 32 fichas. Pruebas en el puerto 4322 (convive con
    `npm run dev`). 164 pruebas; Lighthouse móvil del inicio 100/100/100/100 (LCP 1,7 s).
  - Etapa 6 (2026-10-15): F2 · Proyectos ([docs/plan-f2.md](docs/plan-f2.md)) y guía visual v1.2
    (acentos y pods por sección, lámina de foto, hoja de contactos, firmas de movimiento; decidida con
    maquetas sobre fotos reales). `src/lib/datos.ts` carga el contenido y valida para todas las páginas;
    enrutador único `[...ruta].astro` con plantillas en `src/plantillas/` (ficha, explorador, servicios,
    sectores, ES/EN). Componentes `.tsx` en **Preact** (no React: el explorador pasó de 91,7 a 31,8 KB
    gz); solo el explorador hidrata. Mapa propio desde Natural Earth (`node design/mapa.mjs <geojson>`).
    Fotos a ≤ 800 px. 282 pruebas. Lighthouse móvil: explorador 98/100/100/100 (LCP 2,3 s), ficha
    99/100/100/100 (LCP 2,0 s), servicio 100 (1,7 s), sector 99 (1,8 s); CLS 0. 195 bloqueantes.
  - Cierre de F2: corregidos los menores de la revisión (cifras con 1 o 3 sin tramo vacío, tarjeta sin
    foto con ilustración decorativa, HH no repetida en la tarjeta, token `--trazo-foto`, claves sin uso).
    285 pruebas. Los códigos P-xx son la posición en el explorador: se renumeran al agregar fichas.
  - **Etapa 7 (2026-10-19): F3 · Institucional** ([docs/plan-f3.md](docs/plan-f3.md); guía visual v1.5,
    especificación v1.2). Fuente reducida y LCP (F3.0); Inicio completo (F3.1); Nosotros (F3.2); menú con
    submenú de Proyectos, prevalencia de Cemento y Minería, página de Sectores con escenarios y explorador con
    mapa vivo (§13); HSE con estructura 3D, Acreedores, legales (texto del M-TI-001) y Noticias siempre en el
    menú (F3.3). Inicio, Nosotros, HSE, Acreedores, legales y Noticias tienen archivo propio en `src/pages/`
    (el enrutador único carga el CSS de todas sus plantillas). Cierre: 446 pruebas, presupuesto OK,
    192 bloqueantes en `build:lanzamiento`. Lighthouse móvil: inicio 98 (LCP 1,98 s), HSE 98 (1,97 s),
    explorador 98 (1,96 s), acreedores y datos 99; **Nosotros 94 (LCP 2,95 s): pendiente para F6** (el resto
    es estilo y diseño de la página: ~940 ms con CPU simulada). Sin revisión de código con subagente (ahorro
    de tokens).
  - **Etapa 8 (2026-10-20): F4 · Contacto** ([docs/plan-f4.md](docs/plan-f4.md)). Método austero S/M/L.
    Formularios por hojas y animados (isla Preact, mejora progresiva) en Contacto, Proveedores, Trabaje con
    nosotros y Buzón ético (ES/EN); `public/api/enviar.php` con radicado, trampa, límite por IP y acuse;
    reglas y buzones en una sola fuente (`src/lib/formularios.ts` + `sitio.yaml` → `/api/config.json`).
    Agente "Hablar con HL" solo interfaz (guion de muestra, derivación a WhatsApp/correo/teléfono), cargado
    al primer clic. Cierre: 449 pruebas, presupuesto OK, Lighthouse móvil de Contacto 98 (LCP 2,0 s).
    194 bloqueantes (+2: buzones D7 y número de WhatsApp).
    **Ampliación (20-oct):** tablero de vacantes en Trabaje con nosotros (`Vacantes.tsx`), alimentado por una
    lista de SharePoint vía Power Automate → `/api/vacantes.json` (contrato en plan-f4 §F4.7); "Postularme"
    lleva la vacante al formulario y al correo. D3 pasa a Copilot Studio. 197 bloqueantes (+3: flujo de vacantes, SPF/DKIM y Copilot Studio). Contraste del botón y del chip "Nueva" corregido.
  - **Etapa 9 (2026-10-20): F5 · Inglés** ([docs/plan-f5.md](docs/plan-f5.md)). Inglés de EE. UU.; la interfaz ya
    era bilingüe: se tradujo el contenido (51 entradas + testimonios) y las 5 páginas `.en.md`; legales EN completas
    con aviso de prevalencia del español (`prevalece`). D2 cerrado en EN. De paso: 8 textos truncados por comas en
    YAML en línea y H1 con guiones automáticos. 451 pruebas, presupuesto OK, Lighthouse `/en/` 95 (LCP 2,1 s; se
    revisa en F6). 149 bloqueantes.
  - Etapa 10 (2026-10-21): guía del agente Rev. 1 ([docs/guia-agente.md](docs/guia-agente.md)): agente propio con
    Power Automate (4 flujos y prompt, clic por clic), biblioteca en sitio existente con permisos propios, claves,
    SalesIQ, costos y pruebas; plan de código en [docs/plan-agente.md](docs/plan-agente.md) (AG.0-AG.8).
  - **Etapa 11 (2026-10-21): agente propio y Documentos** ([docs/plan-agente.md](docs/plan-agente.md); maqueta
    `design/maquetas/agente-documentos.html`). Conocimiento sacado del HTML compilado (`src/lib/conocimiento.mjs` →
    `dist/api/conocimiento.json`, negado por `.htaccess`); `public/api/documentos.php` (recibe los flujos, PDF real,
    carpetas fijas, lote) y `public/api/agente.php` (filtro ético sin IA, límites por IP y por día, búsqueda por
    términos, lista blanca de fuentes, modo prueba `HL_AGENTE_PRUEBA=1`); panel conectado (`Agente.tsx`, 4,2 KB gz) y
    SalesIQ diferido (`salesiq.ts`, falta `widgetcode`); página Documentos (P-06, pie; muestra en desarrollo) y enlace
    desde HSE. Claves en `privado/.env` (ignorado); en el hosting, `hl-privado/.env`. 466 pruebas (con `HL_PHP`),
    presupuesto OK, Lighthouse móvil: Documentos 98 (LCP 1,97 s, CLS 0,001), Contacto 98. 156 bloqueantes.
  - **Etapa 12 (2026-10-21, tarde): simplificación del agente** ([plan Rev. 2](docs/plan-agente.md), [guía Rev. 3](docs/guia-agente.md)).
    Fuera Power Automate, SharePoint y Copilot Studio: `agente.php` llamará directo al modelo (Claude API en
    desarrollo; producción la deciden Gerencia y TI con el [comparativo](https://claude.ai/artifact/KiawaMKCaj4UDX8bMUrQSJ)),
    y los documentos vivirán en el repo. Retirados `documentos.php`, sus pruebas, las claves de los flujos y el túnel.
    Generador de PDF `design/documentos.mjs` (13 PDF ES/EN en `documentos-web/`, borrador) e inventario en
    [insumos/README.md](insumos/README.md). `design/local.ps1` sirve el sitio con PHP en el 8080 para probar el agente.
  - Etapa 13 (2026-10-21): AG.9 página de carga local (maqueta `design/maquetas/carga.html`). La integración
    `src/lib/carga.mjs` inyecta `/carga/` (`src/lib/carga.astro`) y el middleware `/__carga` **solo en `astro dev`**:
    nada llega a `dist/` (prueba en `humo.spec.ts`). Un archivo por petición en crudo → `insumos/entrada/AAAA-MM-DD/`
    con nombre seguro; registro en `insumos/entrada/estado.json` (`archivo, nota, bytes, subido, estado, destino,
    detalle`; estados recibido · revisado · publicado · descartado, los cambia Claude). Solo loopback y mismo origen.
  - Etapa 14 (2026-10-21): AG.10 parcial. Sin presupuesto para clave de API en pruebas, `agente.php` usa en
    desarrollo `PROVEEDOR=claude-code`: `claude.exe -p` (el de la extensión de VS Code, o `CLAUDE_CODE_EXE`) con la
    sesión de Claude de Juan David, aislado (sistema propio = constante `INSTRUCCIONES`, sin herramientas, ajustes,
    MCP ni sesión; desde el temporal: no ve ningún CLAUDE.md), solo para peticiones de 127.0.0.1, `MODELO=haiku`,
    `--effort low` (~5 s por respuesta). Probado con `design/local.ps1`: respuestas reales con fuentes en ES/EN.
    Fuera `AGENTE_URL`/`CLAVE_AGENTE`. **Nunca es la vía de producción.**
  - **Siguiente paso:** AG.11 (Documentos desde el repo); el proveedor de producción (`anthropic` con clave,
    `foundry` o `azure-openai`) se agrega cuando Gerencia y TI den la credencial. F6 después.
  - **Ojo agente:** al desplegar no borrar `/api/vacantes.json` (lo escribe el flujo de Vacantes de F4 en Power
    Automate; **congelado por decisión de Juan David, 21-oct**: no se toca hasta nuevo aviso). El sitio es `https://hlingenieros.com` sin www.
    `agente.php` aún usa `AGENTE_URL` (flujo retirado): hasta AG.10 responde "sin servicio" con la clave real.
    Las pruebas de PHP corren con `HL_PHP=C:/Users/jurbina/herramientas/php/php.exe npm test`.
  - **Información difusa (21-oct):** entra por la página de carga local (AG.9) o a mano en `insumos/entrada/`
    (ignorada en git) y se registra en [insumos/README.md](insumos/README.md); sale al sitio (`src/content/`) o en PDF
    con `node design/documentos.mjs` → `documentos-web/<carpeta>/` (borrador, ignorado); lo aprobado por Juan David
    pasa a `public/documentos/<carpeta>/`.
  - **Ojo F4 (contraste, 20-oct):** nada de texto ni marcas sobre `--signal` dentro de un fondo `--accent`
    (2,1:1 en claro, 1,5:1 en oscuro): sobre el azul va `--accent-ink`; un chip de aviso es `--signal-soft` +
    borde `--signal` + texto `--ink`. Las clases de un componente llevan prefijo propio (`fm-`, `vc-`, `ag-`):
    `.burbuja` global (P2) le cambiaba color y tamaño al ícono del botón.
  - **Ojo F4:** el PHP se prueba con un PHP portátil (`HL_FORM_PRUEBA=1 php -S 127.0.0.1:8080 -t dist`;
    escribe los correos en el temporal en vez de enviarlos). En el hosting, el remitente
    `no-reply@hlingenieros.com` debe quedar autorizado en SPF/DKIM o los correos caerán en spam.
  - **Decisiones de F3 con efecto visible:** sin precarga de fuente (primera visita: un instante con el
    respaldo); indicadores de la visión con reglas a ancho completo (mezclan días y %); logos de asociadas
    sobre placa blanca (modo oscuro); sedes con su ciudad real (Santo Domingo).
  - **Ojo en desarrollo:** tras cambiar integraciones o dependencias, reiniciar `npm run dev` (Astro 7
    admite un solo servidor de desarrollo y uno de vista previa a la vez; las pruebas usan la vista previa en
    el 4322: si queda otra abierta, `npx astro preview stop`). La vista previa escucha en `[::1]`. No usar
    clases `col-*` (Tailwind 4 las toma como `grid-column`). En YAML en línea (`{ … }`), un texto con comas
    va entre comillas. Las reglas de `global.css` están en capas de Tailwind: un estilo sin capa (el de un
    componente) les gana aunque sea menos específico. La colección `file()` se lee por id: el orden va en un
    campo `orden`. Correr `npm run check` en cada tarea.
- **Pruebas:** ver "Método austero". Pruebas nuevas solo para riesgos reales; capturas solo para decisiones
  visuales.
- No usar prettier.
- Mantener pocos directorios y archivos: la información va primero, la estructura después.
- El repo se gestiona con GitHub Desktop.
- `desktop.ini` (OneDrive) está ignorado en git.
