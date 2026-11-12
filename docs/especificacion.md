# Especificación del sitio nuevo del Grupo HL

Versión 2.0 · 2026-11-12 · Aprobada por secciones con Juan David Urbina (1.1: D2, Inicio, Nosotros y F3;
1.2: menú con submenú en Proyectos, prevalencia de Cemento y Minería, explorador con mapa vivo; **2.0:
Plan R, orden de contenido del acta GHL-WEB-001 del área comercial, ver [plan-r.md](plan-r.md)**).
Complementa a [guia-visual.md](guia-visual.md) (identidad), [../design/tokens.css](../design/tokens.css)
(valores) y [../contenido/](../contenido/) (contenido extraído). Si algo aquí contradice la propuesta
Rev. 0, manda este documento.

## 1. Objetivo y contexto

Reemplazar el WordPress de hlingenieros.com por un sitio estático, rápido y bilingüe de **HL Ingenieros
S.A.** que muestre su experiencia con datos verificables.

- **Público:** amplio e institucional (clientes, candidatos, proveedores, acreedores, comunidad), sin
  descuidar al cliente que evalúa contratistas ni al que precalifica proveedores.
- **Situación:** el proyecto aún no está lanzado oficialmente. Se construye con discreción y en local
  para tener casi todo listo cuando se apruebe. El WordPress queda congelado y no se piden insumos a las
  áreas: se trabaja con lo extraído y lo faltante queda marcado.
- **Lanzamiento:** uno solo, completo, en español e inglés.

**Éxito:**
- Un visitante llega en 2 clics a un proyecto comparable al suyo y a cómo contactar.
- Ninguna URL actual queda rota (301 o 410).
- Se cumple el presupuesto de rendimiento (§6) en móvil.
- El sitio se ve igual de impactante en un celular de 360 px y en una pantalla de 2560 px.

## 2. Decisiones que fijan el diseño

| # | Decisión |
|---|---|
| D1 | **Cambio 20-oct:** el sitio es del **Grupo HL** (mismo logo; HL Ingenieros es el nombre anterior, que aún usan los clientes antiguos). La razón social y las menciones legales siguen como HL Ingenieros S.A. Las empresas del grupo (por definir cuáles) van en Nosotros. |
| D4 | **Sin CMS.** El contenido vive en el repo como colecciones de Astro; no se agregan servicios de terceros ni credenciales. |
| D5 | Hosting actual (Apache + PHP 8.3). Despliegue manual: compilar y subir `dist/`. |
| D2 | Lema: **"Construimos la industria con gente que cumple, desde 1968."** (EN cerrado en F5, 20-oct: "Building industry with people who deliver, since 1968."). Guía §2.3. |
| D6 | Los casos sensibles se publican con `visibilidad: discreta`. |
| — | Stack: Astro + Tailwind (con los tokens) + islas Preact solo donde haga falta. |

D3 y D7 se decidieron el 20-oct (ver Formularios y Hablar con HL). Siguen abiertas D8 (equipo; por ahora,
interno) y, de D1, qué empresas asociadas se muestran.

## 3. Arquitectura de información

**Menú de 6 pestañas** (Plan R, acta del 10-nov): Quiénes somos · Proyectos · Servicios · Gestión
integral · Noticias · Contacto · ES/EN. Sin submenú ni botón de cotizar. El logo lleva al Home y "Hablar
con HL" sigue flotante. **Cada página lleva exactamente el contenido que define el acta** (guía §10).

| ES | EN | Contenido (acta) |
|---|---|---|
| `/` | `/en/` | Video de fondo con el título, cifras relevantes y clientes |
| `/nosotros` | `/en/about` | Quiénes somos: slogan, línea del tiempo, misión, visión y valores, presencia por países (sin direcciones) |
| `/proyectos` | `/en/projects` | Minería, cemento y otros proyectos: mapa, filtros (sector · especialidad · país) |
| `/proyectos/[slug]` | `/en/projects/[slug]` | Ficha 3.1: datos generales, fotos, cantidades (~22 fichas) |
| `/servicios` | `/en/services` | Las 3 especialidades con 3 proyectos cada una |
| `/servicios/[s]` | `/en/services/[s]` | Especialidad y sus 3 proyectos, que llevan a la ficha |
| `/gestion-integral` | `/en/integrated-management` | Certificados, indicadores de seguridad, política SGI, Reglas de Oro, PIENSA®, herramientas |
| `/noticias`, `/noticias/[slug]` | `/en/news/...` | Blog con adjudicaciones, iniciativas y eventos |
| `/contacto` | `/en/contact` | Solo formularios en pestañas: cotizar, proveedores, buzón ético, trabaja con HL (sin sedes) |
| `/proveedores`, `/trabaje-con-nosotros`, `/buzon-etico` | `/en/suppliers`, `/en/careers`, `/en/ethics-line` | Plantilla de Contacto con esa pestaña abierta |
| `/vacantes` | `/en/jobs` | Complementaria: tablero de vacantes |
| `/acreedores`, `/documentos` | `/en/creditors`, `/en/documents` | Complementaria: una plantilla con dos pestañas |
| `/legal/datos` | `/en/legal/privacy` | Complementaria: tratamiento de datos (Ley 1581) |
| `/legal/terminos` | `/en/legal/terms` | Complementaria: términos y condiciones |

**Servicios** (de 7 a 3 especialidades, en este orden):

| ES | EN | Absorbe (301) |
|---|---|---|
| `montaje-mecanico` (y tubería) | `mechanical-installation` | `fabricacion`, `mantenimiento` |
| `obras-civiles` | `civil-works` | — |
| `montaje-electrico` (e instrumentación) | `electrical-installation` | — |

`epc-llave-en-mano` → `/servicios/` y `gerencia-de-proyectos` → `/nosotros/`, con 301.

**Sectores:** ya no tienen página. Quedan como 3 categorías de filtro: **Minería · Cemento · Otros
proyectos**. Las 6 páginas actuales y su índice salen con 301 al explorador filtrado. `/hse` → `/gestion-integral` con 301.

**Además:** página 404, `sitemap.xml`, `robots.txt` y `.htaccess` con las 301/410 de
[inventario.csv](../contenido/inventario.csv). Los slugs en inglés van
traducidos; cada página conoce su par para el selector de idioma y `hreflang`.

## 4. Modelo de contenido

Las colecciones de Astro se validan con esquema al compilar.

- **Dos idiomas.** Los datos (cifras, fechas, referencias) se escriben una vez y los textos van en
  bloques `es:` / `en:` dentro del mismo archivo. Así ninguna cifra puede quedar distinta entre idiomas.
  Las noticias y las páginas de texto largo (Nosotros, HSE, legales) llevan un archivo por idioma.

| Colección | Unidad | Campos |
|---|---|---|
| proyectos | proyecto | slug es/en, cliente, dueño final, rol de HL (contratista, subcontratista o consorcio + nombre), país, ciudad, coordenadas, año de inicio y fin, meses, HH, sector, servicios[], cifras destacadas (3-4: valor, unidad, etiqueta), cantidades[], fotos[] (archivo, pie), `visibilidad` (destacado, normal o discreta); textos: título, resumen, descripción, reto o resultado |
| servicios | especialidad (3) | orden, slug es/en, 3 proyectos (referencias, en orden); textos: nombre, resumen corto |
| sectores | categoría de filtro (3: minería, cemento, otros) | orden; textos: nombre. Sin página propia |
| noticias | noticia × idioma | fecha, tipo (noticia o adjudicado), proyecto relacionado, par en el otro idioma, cuerpo |
| sedes | sede | nombre, ciudad, país, dirección, teléfono, horario, buzón, coordenadas |
| certificaciones | certificado | norma, ente, vence, PDF (aviso al compilar si está vencido) |
| historia | hito | año (de la década si no hay exacto), década, foto (archivo), pie verificable (opcional); textos: título, texto. "Hoy" no se guarda: se arma con el año actual |
| testimonios | persona | nombre, cargo, foto, `autorizado`, años en la casa (opcional, solo si la cita lo dice); textos: cita completa y fragmento (palabras textuales, omisiones con "[…]") |
| sitio | único | año de fundación (la edad se calcula), lema, países con obra (7, con código), cifras de portada, redes, empresas asociadas (logo, área, descripción opcional) |

**Reglas**
- **Relaciones derivadas.** Una página de servicio o de sector no tiene su propia lista de proyectos:
  la obtiene de los proyectos que la mencionan. Las fichas discretas nunca aparecen en esas listas, ni en
  la portada, ni en los destacados, ni en los logos de clientes. Sí tienen ficha propia, aparecen al
  final del explorador y se indexan.
- **Validación en dos modos.** En desarrollo, lo faltante (año, rol, fotos) solo genera advertencias y
  un listado de pendientes. El modo lanzamiento exige todos los campos obligatorios. Ese listado será la
  solicitud de insumos cuando se apruebe el proyecto.
- **Material que falta.** Las fotos se reemplazan con ilustraciones de línea estructural (guía §6). Un
  testimonio sin `autorizado` no se publica.

## 5. Plantillas

Cada plantilla lleva solo el contenido del acta (guía §10); movimiento según guía §8.

- **Home** (maqueta aprobada `design/maquetas/rediseno.html`): video de fondo con el H1 del lema (sin
  gráficas encima, capa `--velo-video`, pausa); cifras relevantes (años calculados, 7 países, 9.470.000
  HH de Columbus, −64 % de accidentes), escritas en el HTML; clientes en dos cintas de logos.
- **Quiénes somos:** slogan; línea del tiempo (tira de negativos); misión, visión y valores; presencia
  por países en el mapa propio, sin direcciones.
- **Proyectos:** la lista completa se escribe en el HTML. Una isla Preact agrega los filtros (sector:
  Minería · Cemento · Otros; especialidad: las 3; país), con el estado en la URL, y el mapa vivo sobre el
  SVG propio. Sin JavaScript la lista funciona igual.
- **Ficha 3.1:** a) datos generales (cliente, rol de HL, ubicación, años de ejecución, duración, sector,
  especialidades), b) fotos con pie, c) cantidades de obra.
- **Servicios / servicio:** la especialidad y sus 3 proyectos, que llevan a su ficha.
- **Gestión integral:** certificados (ISO 9001, 14001, 45001, SGS, con número y PDF), indicadores de
  seguridad, política SGI, Reglas de Oro, PIENSA® y herramientas tecnológicas de gestión.
- **Noticias:** blog filtrable por adjudicaciones, iniciativas y eventos.
- **Contacto:** los 4 formularios en pestañas, sin sedes.
- **Complementarias:** plantilla de texto (términos, datos); vacantes (tablero); acreedores y documentos
  públicos (pestañas).
- **Formularios** (cotización, proveedores, trabaje con nosotros, buzón ético):
  - **dinámicos y animados (20-oct):** isla Preact por pasos (intención → datos → mensaje → autorización),
    campos que cambian según intención y país, validación en vivo y firma de movimiento propia; sin JS
    sigue siendo un formulario HTML que envía (mejora progresiva). Envía a un script PHP en el mismo hosting;
  - el script valida, exige la autorización de la Ley 1581, filtra el spam con un campo oculto, genera
    un radicado y envía al buzón de la función;
  - Power Automate toma los correos con el disparador estándar "Cuando llega un correo nuevo" (no
    premium);
  - el buzón ético va a su propio buzón, fuera de ese flujo;
  - **adjuntos (R-8):** cotización, proveedores y hoja de vida aceptan PDF de hasta 5 MB, validados en el
    PHP (tipo real, tamaño, cantidad) y enviados como adjunto del correo, sin guardarlos en disco.
- **Hablar con HL (D3, 20-oct):** sin asesores en vivo. Un solo agente IA que conversa y, según lo
  aprendido en la conversación, deriva a WhatsApp, a un correo por función o a un teléfono. Agente propio
  (`agente.php` → modelo de IA directo), según [plan-agente.md](plan-agente.md) Rev. 2.
- **Vacantes (20-oct):** Trabaje con nosotros muestra las vacantes abiertas, leídas al abrir la página de
  `/api/vacantes.json`, que publica Power Automate desde una lista de SharePoint de Talento Humano
  (contrato en [plan-f4.md](plan-f4.md)). "Postularme" lleva la vacante al formulario F-04.
- **Buzones (D7, 20-oct):** direcciones por función en un solo archivo de configuración, marcadas como
  pendientes en `/pendientes/` hasta confirmarlas.

## 6. Rendimiento, movimiento y pantallas

Las reglas detalladas están en la guía visual §5 y §9. Lo esencial:

| Métrica (móvil, 4G) | Meta |
|---|---|
| Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO) | ≥ 95 |
| LCP / CLS / INP | < 2,0 s / < 0,05 / < 200 ms |
| JavaScript por página | ≤ 30 KB gz (explorador ≤ 100 KB) |

- **Identidad (guía v2.0):** azul `#003399` + naranja `#FF6633`; las secciones se distinguen por su
  firma de movimiento, no por color. Video del Home ≤ 6 MB con póster como LCP, sin precarga.
- **Recursos:** Poppins, Open Sans e IBM Plex Mono reducidas y alojadas en el servidor. Imágenes
  AVIF/WebP responsivas con dimensiones fijas. Mapa en SVG propio, sin terceros. Compresión y caché en
  `.htaccess` (un año para recursos con hash; HTML sin caché).
- **Navegación cómoda:** precarga al pasar el cursor o al ver el enlace, Speculation Rules y transición
  de vista de ~0,5 s con la barra y el botón de contacto fijos. Desplazamiento nativo.
- **Movimiento:** solo `transform`, `opacity` y `clip-path`. Nada hace esperar. CSS primero; Motion solo
  en el explorador; GSAP solo si una secuencia lo exige. Se respeta reduced-motion.
- **Pantallas:** se diseña cada formato. Matriz de prueba: 360, 390, 768, 1024, 1366, 1920 y 2560 px, y
  móvil en horizontal.

## 7. Fases de construcción

Todo se prueba en local (`npm run dev` y vista previa de la compilación). Cada fase cierra con su
commit, Lighthouse y capturas en la matriz de pantallas (Playwright).

| Fase | Alcance | Resultado |
|---|---|---|
| F0 · Base | Proyecto Astro con los tokens; barra superior, menú móvil, pie, transiciones y precarga; rutas ES/EN emparejadas; fuente; componentes base (guía §7); 404 | Esqueleto navegable con la identidad |
| F1 · Contenido | Colecciones y esquemas; migración de `contenido/` (22 fichas, 7 servicios, 6 sectores, sedes, hitos, testimonios, certificaciones); descarga y optimización de fotos; listado de pendientes | Todos los datos dentro del sitio |
| F2 · Proyectos | Ficha, explorador, mapa SVG, páginas de servicio y sector con relaciones | El corazón del sitio |
| F3 · Institucional | Por subpartes, cada una con su commit: **F3.0** fuente y LCP · **F3.1** Inicio (primero lo aprobado; el resto tras aprobar sus maquetas) · **F3.2** Nosotros · **F3.3** HSE y calidad, Noticias (oculta si falta contenido), Acreedores y legales | Sitio completo en español |
| F4 · Contacto | 4 formularios + PHP + radicado; Hablar con HL | Contacto de punta a punta (probado con `php -S` de un PHP portátil; hoy no hay PHP instalado) |
| F5 · Inglés | Traducción con el glosario, pares de páginas y `hreflang` | Sitio bilingüe |
| Plan R · Rediseño comercial | R0-R6 de [plan-r.md](plan-r.md): identidad, armazón, Home y Quiénes somos, Proyectos y Servicios, Gestión integral y demás, cierre | Sitio con la identidad y el orden del acta |
| F6 · Lanzamiento | En espera de la aprobación oficial: acceso al hosting, `.htaccess` 301/410, sitemap, GA4 y Search Console, control de calidad final, respaldo de WordPress, cambio y seguimiento por 2 semanas. Recompilar y publicar después de cada 1 de enero (el año del pie se fija al compilar) | Producción |

**En paralelo:** redacción en español durante F1-F3 a partir de lo extraído; el inglés se traduce sobre
textos ya cerrados. Las decisiones abiertas tienen fecha límite: D3 y D7 antes de F4.

**F3.0 · Fuente y LCP.** El LCP del explorador (2,3 s) y de la ficha (2,0 s) pasa de la meta porque el
texto se repinta al llegar Archivo (88 KB, `swap`). Se resuelve en dos frentes: reducir el archivo a los
rangos de peso y ancho que usan los tokens, y una fuente de respaldo con métricas ajustadas
(`size-adjust`, `ascent-override`…) para que el cambio no mueva el texto. Se mide antes y después.

## 8. Fuera de alcance

- Arreglos en el WordPress actual (queda congelado).
- Un CMS o un panel de edición. Si más adelante otras personas deben editar, se evalúa Decap sobre los
  mismos archivos.
- Sitio de pruebas publicado.
- Portal interno (ERP, BI, correo, campus).
