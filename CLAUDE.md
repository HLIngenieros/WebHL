# WebHL — Rediseño del sitio corporativo de Grupo HL

Reconstrucción de **hlingenieros.com**, el sitio de Grupo HL / HL Ingenieros S.A. (contratista
colombiano de construcción, montaje electromecánico y fabricación, fundado en 1968 por Guillermo
Londoño). Es un proyecto **no urgente** que se avanza de forma ocasional. Responsable: Juan David
Urbina (Transformación Digital HL).

## Documentos base (fuente de verdad)

- [docs/Diagnóstico integral – hlingenieros.com.pdf](docs/) (29-sep-2026, 18 págs.): auditoría del sitio actual.
- [docs/Nuevo Sitio Grupo HL.html](docs/) (06-oct-2026, Rev. 0, "Para discusión"): propuesta completa.
  Es en sí un prototipo de la identidad (láminas L-01 a L-10, explorador de proyectos, chat y
  formulario simulados). Sirve como referencia de diseño, no es el sitio final.

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
**Astro + islas React + Tailwind + CMS headless**. HTML estático por defecto; React solo en el
explorador de proyectos, el agente de chat y los formularios. Colecciones tipadas: Proyecto,
Servicio, Sector, Sede, Certificación. i18n nativo (`/en/` espejo con hreflang). View Transitions.
Meta: Lighthouse ≥ 90 en móvil. Descartadas: HTML+Tailwind a mano (no escala) y React SPA (mal SEO).
Alternativa si se prefiere React puro: Next.js.

### Identidad: "concreto, acero y plano"
Lenguaje de plano técnico: retícula de 12 columnas sobre módulo de 8 px, ejes con burbuja, cotas,
rótulos de plano, línea estructural.

| Token | Color | Uso |
|---|---|---|
| Azul HL | `#0B509E` | Único azul de marca (se retiran `#1e73be` y `#001b74`) |
| Grafito | `#14181C` | Texto, estructura, líneas |
| Concreto | `#E7EAEB` | Fondo base |
| Acero | `#8A949B` | Secundarios y divisiones |
| Señalización | `#F2B42A` | Acento: cotas, HSE, cifras clave |

Tipografía: **una sola familia, Archivo** (variable, eje `wdth`), en tres anchos: expandida para
títulos, normal para texto, condensada para datos/cotas. Modo oscuro definido en la propuesta.
Logo: pasar a SVG (positivo, negativo, monocromo). Fotografía real de obra, con pie (proyecto y año).

Movimiento: Trazo (SVG que se dibuja), Izaje (bloques suben con desaceleración), Cota (cifras
animadas pero **ya escritas en el HTML**), transición de vista. GSAP + ScrollTrigger, Motion, Lenis.
Respetar `prefers-reduced-motion`; nunca preloader; zoom permitido (WCAG 1.4.4).

### Arquitectura de información
- Menú comercial: Inicio · Proyectos (explorador por sector/servicio/país + mapa) · Sectores ·
  Servicios · HSE · Nosotros · Contacto.
- Servicios (de 9 a 7 líneas en 3 grupos):
  - A · Gestión: EPC / Llave en mano; Gerencia de proyectos (PMC/EPCM, ECOHL).
  - B · Construcción y montaje: Obras civiles industriales; Montaje mecánico y tubería; Montaje
    eléctrico e instrumentación.
  - C · Fabricación y mantenimiento: Fabricación metalmecánica; Mantenimiento y paradas de planta.
- Pie (fuera del menú): Trabaja con nosotros, Proveedores, Buzón ético, Información para acreedores
  (Ley 1116), Política de datos y Términos. ERP/BI/correo/campus salen al portal interno.
- URLs nuevas: `/proyectos/[slug]`, `/sectores/[sector]`, `/servicios/[servicio]`, `/nosotros`,
  `/hse`, `/contacto`, `/acreedores`, `/legal/terminos`, `/en/...`.
- Migración: las ~95 URLs actuales → 301 a su equivalente, o 410 (`/error-404/`, `/tag/...`).

Plantilla de servicio: alcance por subcapacidad, recursos propios vs. aliados, normas (NSR-10, RETIE,
ASME, API 650, AWS), capacidad, 2-4 proyectos de ese servicio, sectores, modelos de contrato, FAQ,
contacto de la línea.

Ficha de proyecto: cliente y dueño final, rol de HL (contratista/subcontratista/consorcio), país y
ciudad, años de ejecución, servicio, 3-4 cifras destacadas, reto o resultado (plazo, HSE), galería
de 5+ fotos con pie.

### Contacto, agente y correo
- Un solo botón "Hablar con HL" reemplaza las dos burbujas (Zoho SalesIQ + WhatsApp): asistente IA
  24 h (responde con contenido del CMS y cita la fuente; no cotiza ni compromete plazos), asesor en
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
1. Arreglos rápidos en el sitio actual (sem. 1): Términos, Ley 1581, sacar intranet, LinkedIn a
   `/company/hl-ingenieros-sa`, 58 años, quitar meta de ventas, permitir zoom.
2. Decisiones de marca → 3. Recolección de contenido → 4. Arquitectura y redacción ES/EN →
5. Identidad visual (aprobada sem. 6) → 6. Construcción e integraciones (staging sem. 11) →
7. Migración, QA y lanzamiento (sem. 16): 301, GA4, Search Console, línea base antes y después.

## Decisiones pendientes (D1-D8)

| # | Decisión | Estado |
|---|---|---|
| D1 | ¿Sitio del grupo o de HL Ingenieros? Qué empresas se muestran (en EN aparecen Megacranes y Aktino, no en ES) | Pendiente |
| D2 | Lema único. Candidatos: A "Construcción y montaje industrial desde 1968." · B "Obra civil, montaje y fabricación con un solo responsable." · C "Plantas completas para la industria de Latinoamérica." | Pendiente |
| D3 | Agente: bot nativo de Zoho SalesIQ o agente propio con IA que entrega a Zoho | Pendiente |
| D4 | CMS: Sanity, Decap o Payload | Pendiente |
| D5 | Hosting: Vercel/Netlify o Azure Static Web Apps (tenant M365); Power Automate premium o Graph | Pendiente |
| D6 | Casos sensibles: Odebrecht (Patio de Carbón), Minera Panamá (cerrada desde 2023); nombres actuales de clientes (Zijin Mining, thyssenkrupp Polysius, OHLA) | Pendiente |
| D7 | Buzones comerciales por sede/función | Pendiente |
| D8 | Equipo de ejecución: interno, proveedor o mixto | Pendiente |

## Insumos que debe aportar HL (pendientes)
Manual de marca / logos vectoriales; proyectos 2020-2026 (cliente, año, alcance, cifras); año de los
16 casos y aclaración de cifras de Columbus (web: 42 meses, 8.300 t estructura, 18.600 t equipos vs.
PDF ECOHL: 18 meses, 12.000 t, 10.500 t); certificaciones vigentes en PDF; indicadores HSE de 3 años;
fotos recientes de obra; lista vigente de empresas del grupo; acceso a Zoho PageSense y Search Console.

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
- Un commit al final de cada etapa, con aprobación. Ramas con fast-forward a `main` y borrar la rama.
- No usar prettier.
- El repo se gestiona con GitHub Desktop.
- `desktop.ini` (OneDrive) está ignorado en git.
