# WebHL — Rediseño del sitio corporativo de Grupo HL

Reconstrucción de **hlingenieros.com**, el sitio de Grupo HL / HL Ingenieros S.A. (contratista
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
**Astro + islas React + Tailwind, sin CMS** (contenido en el repo, ver D4). HTML estático por defecto; React solo en el
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
(grafito, concreto, acero). Una familia, Archivo, en tres voces: expandida, normal y condensada (los
datos van en mayúsculas). Radio 0 y sin sombras. Modo claro y oscuro. Movimiento: Trazo, Izaje, Cota y
Transición de vista; sin preloader, cifras escritas en el HTML, respeta reduced-motion y permite zoom.

### Arquitectura de información (aprobada 15-oct)
- **Público:** amplio e institucional (clientes, candidatos, proveedores, acreedores, comunidad), sin
  descuidar al cliente que evalúa contratistas ni al que precalifica proveedores.
- **Lanzamiento único, completo y bilingüe** (ES y EN desde el día 1). Las fases son de construcción en
  staging; el sitio actual sigue en línea hasta el cambio.
- **Menú plano, sin submenús:** Nosotros · Proyectos · Servicios · Sectores · HSE y calidad · Noticias ·
  Contacto · ES/EN; logo → inicio; botón fijo "Hablar con HL".
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
| `/proyectos`, `/proyectos/[slug]` | `/en/projects/...` | Explorador (servicio · sector · país) + mapa de presencia; ~22 fichas (16 + 6 del PDF ECOHL) |
| `/servicios`, `/servicios/[s]` | `/en/services/...` | 7 líneas: `epc-llave-en-mano` (epc-turnkey), `gerencia-de-proyectos` (project-management), `obras-civiles` (civil-works), `montaje-mecanico` (mechanical-installation), `montaje-electrico` (electrical-installation), `fabricacion` (fabrication), `mantenimiento` (maintenance-shutdowns) |
| `/sectores`, `/sectores/[s]` | `/en/sectors/...` | `cemento` (cement), `mineria` (mining), `agua-y-energia` (water-energy), `petroleo-y-gas` (oil-gas), `infraestructura` (infrastructure) |
| `/hse` | `/en/hse` | HSE y calidad |
| `/noticias`, `/noticias/[slug]` | `/en/news/...` | Incluye adjudicados; mínimo 3 entradas al lanzar o se oculta |
| `/contacto` | `/en/contact` | Sedes, formulario de cotización, asistente, redes |
| Pie: `/trabaje-con-nosotros`, `/proveedores`, `/buzon-etico`, `/acreedores`, `/legal/datos`, `/legal/terminos` | `/en/careers`, `/en/suppliers`, `/en/ethics-line`, `/en/creditors`, `/en/legal/privacy`, `/en/legal/terms` | Formularios por intención; ERP/BI/correo/campus salen al portal interno |

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
| D1 | ¿Sitio del grupo o de HL Ingenieros? Qué empresas se muestran (en EN aparecen Megacranes y Aktino, no en ES) | **Decidido (15-oct):** el sitio es de HL Ingenieros S.A. Falta definir qué empresas se muestran como asociadas (ECOHL…) |
| D2 | Lema único. Candidatos: A "Construcción y montaje industrial desde 1968." · B "Obra civil, montaje y fabricación con un solo responsable." · C "Plantas completas para la industria de Latinoamérica." | Pendiente |
| D3 | Agente: bot nativo de Zoho SalesIQ o agente propio con IA que entrega a Zoho | Pendiente |
| D4 | CMS: Sanity, Decap o Payload | **Decidido (15-oct): sin CMS.** Sin terceros ni credenciales nuevas: el contenido vive en el repo como colecciones de Astro (Markdown/JSON con esquema validado al compilar). Despliegue manual (compilar y subir `dist/`). Salida futura si otros deben editar: Decap CMS sobre los mismos archivos |
| D5 | Hosting: Vercel/Netlify o Azure Static Web Apps (tenant M365); Power Automate premium o Graph | **Hosting decidido (15-oct):** el actual (Apache + PHP 8.3, IP 107.180.21.17, al parecer GoDaddy; por confirmar), con despliegue estático que reemplaza a WordPress. Integración de correo: pendiente |
| D6 | Casos sensibles: Odebrecht (Patio de Carbón), Minera Panamá (cerrada desde 2023); nombres actuales de clientes (Zijin Mining, thyssenkrupp Polysius, OHLA) | **Decidido (15-oct):** se mantienen con `visibilidad: discreta`: ficha propia y visible en el explorador, pero fuera de portada, destacados, páginas de servicio/sector y logos de clientes; sí se indexa. Nombres actuales de clientes: pendiente |
| D7 | Buzones comerciales por sede/función | Pendiente |
| D8 | Equipo de ejecución: interno, proveedor o mixto | Pendiente |

## Insumos que debe aportar HL (pendientes)
Manual de marca / logos vectoriales; proyectos 2020-2026 (cliente, año, alcance, cifras); año de los
16 casos y confirmación de cifras de Columbus (web: 42 meses, 8.300 t estructura, 18.600 t equipos vs.
PDF ECOHL: 18 meses, 12.000 t, 10.500 t; el PDF habla de *fabricación*, así que probablemente son
alcances distintos); certificaciones vigentes en PDF; indicadores HSE de 3 años; fotos recientes de
obra; lista vigente de empresas del grupo; acceso a Zoho PageSense y Search Console. Lista detallada
en [contenido/README.md](contenido/README.md).

## Datos de referencia
- 58 años (desde 1968; calcular dinámicamente, nunca fijo), 7 países con obra, 4 sedes (Bogotá,
  El Rosal, Panamá, República Dominicana).
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
- Flujo: brainstorming → spec → plan → ejecución. Aprobar el diseño antes de implementar.
- Ahorrar tokens: procesos livianos, planes sin código completo.
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
  - **Siguiente paso:** escribir `docs/plan-f1.md` (F1 · Contenido, especificación §4 y §7) y ejecutarlo:
    colecciones con esquema, migración de `contenido/` (~22 fichas, 7 servicios, 6 sectores, sedes,
    historia, testimonios, certificaciones), descarga y optimización de las 51 fotos (~10 MB) y listado
    de pendientes generado al compilar.
- No usar prettier.
- Mantener pocos directorios y archivos: la información va primero, la estructura después.
- El repo se gestiona con GitHub Desktop.
- `desktop.ini` (OneDrive) está ignorado en git.
