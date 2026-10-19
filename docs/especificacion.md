# Especificación del sitio nuevo de HL Ingenieros

Versión 1.1 · 2026-10-19 · Aprobada por secciones con Juan David Urbina (1.1: D2, Inicio, Nosotros y F3).
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
| D1 | El sitio es de HL Ingenieros S.A. Las empresas asociadas (por definir) van en Nosotros. |
| D4 | **Sin CMS.** El contenido vive en el repo como colecciones de Astro; no se agregan servicios de terceros ni credenciales. |
| D5 | Hosting actual (Apache + PHP 8.3). Despliegue manual: compilar y subir `dist/`. |
| D2 | Lema: **"Construimos la industria con gente que cumple, desde 1968."** (EN propuesto: "Building industry with people who deliver, since 1968."; se cierra en F5). Guía §2.3. |
| D6 | Los casos sensibles se publican con `visibilidad: discreta`. |
| — | Stack: Astro + Tailwind (con los tokens) + islas Preact solo donde haga falta. |

Siguen abiertas D3 (asistente; antes de F4), D7 (buzones; antes de F4), D8 (equipo; por ahora,
interno) y, de D1, qué empresas asociadas se muestran.

## 3. Arquitectura de información

**Menú plano, sin submenús:** Nosotros · Proyectos · Servicios · Sectores · HSE y calidad · Noticias ·
Contacto · ES/EN. El logo lleva al inicio y el botón "Hablar con HL" está siempre visible (en móvil, en
una barra inferior).

| ES | EN | Contenido |
|---|---|---|
| `/` | `/en/` | Inicio |
| `/nosotros` | `/en/about` | Historia y línea del tiempo, visión, misión y valores, testimonios, empresas asociadas |
| `/proyectos` | `/en/projects` | Explorador (servicio · sector · país) y mapa de presencia |
| `/proyectos/[slug]` | `/en/projects/[slug]` | ~22 fichas: 16 actuales + 6 del PDF de ECOHL |
| `/servicios` | `/en/services` | Índice en 3 grupos |
| `/servicios/[s]` | `/en/services/[s]` | 7 líneas (abajo) |
| `/sectores` | `/en/sectors` | Índice |
| `/sectores/[s]` | `/en/sectors/[s]` | 6 sectores (abajo) |
| `/hse` | `/en/hse` | HSE y calidad: política SGI, ISO 9001/14001/45001, Reglas de Oro, PIENSA®, prácticas, indicadores |
| `/noticias`, `/noticias/[slug]` | `/en/news/...` | Noticias y proyectos adjudicados; se oculta si hay menos de 3 entradas |
| `/contacto` | `/en/contact` | Sedes, formulario de cotización, asistente, redes |
| `/trabaje-con-nosotros` | `/en/careers` | Pie · formulario |
| `/proveedores` | `/en/suppliers` | Pie · formulario |
| `/buzon-etico` | `/en/ethics-line` | Pie · canal confidencial, sin IA, permite anónimo |
| `/acreedores` | `/en/creditors` | Pie · avisos Ley 1116 |
| `/legal/datos` | `/en/legal/privacy` | Pie · política de tratamiento de datos (Ley 1581) |
| `/legal/terminos` | `/en/legal/terms` | Pie |

**Servicios** (de 9 a 7):

| Grupo | ES | EN |
|---|---|---|
| A · Gestión | `epc-llave-en-mano` (absorbe Ingeniería y diseños) | `epc-turnkey` |
| A · Gestión | `gerencia-de-proyectos` (PMC/EPCM, ECOHL; absorbe Asistencia en la ejecución) | `project-management` |
| B · Construcción y montaje | `obras-civiles` | `civil-works` |
| B · Construcción y montaje | `montaje-mecanico` (y tubería) | `mechanical-installation` |
| B · Construcción y montaje | `montaje-electrico` (e instrumentación) | `electrical-installation` |
| C · Fabricación y mantenimiento | `fabricacion` (metalmecánica) | `fabrication` |
| C · Fabricación y mantenimiento | `mantenimiento` (y paradas de planta) | `maintenance-shutdowns` |

**Sectores:** `cemento` (cement), `mineria` (mining), `agua-y-energia` (water-energy), `petroleo-y-gas`
(oil-gas), `infraestructura` (infrastructure), `industria` (industrial: alimentos, consumo, manufactura).

**Además:** página 404, `sitemap.xml`, `robots.txt` y `.htaccess` con las 301/410 de
[inventario.csv](../contenido/inventario.csv). Son ~50 páginas por idioma. Los slugs en inglés van
traducidos; cada página conoce su par para el selector de idioma y `hreflang`.

## 4. Modelo de contenido

Las colecciones de Astro se validan con esquema al compilar.

- **Dos idiomas.** Los datos (cifras, fechas, referencias) se escriben una vez y los textos van en
  bloques `es:` / `en:` dentro del mismo archivo. Así ninguna cifra puede quedar distinta entre idiomas.
  Las noticias y las páginas de texto largo (Nosotros, HSE, legales) llevan un archivo por idioma.

| Colección | Unidad | Campos |
|---|---|---|
| proyectos | proyecto | slug es/en, cliente, dueño final, rol de HL (contratista, subcontratista o consorcio + nombre), país, ciudad, coordenadas, año de inicio y fin, meses, HH, sector, servicios[], cifras destacadas (3-4: valor, unidad, etiqueta), cantidades[], fotos[] (archivo, pie), `visibilidad` (destacado, normal o discreta); textos: título, resumen, descripción, reto o resultado |
| servicios | línea | grupo, orden, slug es/en, buzón; textos: nombre, resumen, alcance por subcapacidad, recursos propios frente a aliados, normas, capacidad, modelos de contrato, FAQ |
| sectores | sector | slug es/en, orden; textos: nombre, introducción, servicios típicos |
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

- **Inicio** (guía §12.1):
  - hero con barra inmersa, H1 con el lema (D2), botón "Ver proyectos" y gemelo digital;
  - franja P3 de sectores;
  - "HL en cifras": años (calculados), 7 países, 4 sedes, 3 normas ISO, escritas en el HTML;
  - 3-4 proyectos destacados;
  - los 3 grupos de servicio y los sectores;
  - franja HSE con indicadores;
  - últimas noticias (si las hay);
  - logos de clientes.
  - Del cuarto punto en adelante se diseña con maquetas al empezar F3.1.
- **Nosotros** (guía §12.2): cabecera con mosaico, línea del tiempo en tira de negativos, misión y
  visión con indicadores, valores, presencia, testimonios autorizados, empresas asociadas y cierre.
- **Proyectos:** la lista completa se escribe en el HTML. Una isla React agrega los filtros (servicio,
  sector, país), el reacomodo animado y el mapa SVG propio; sin JavaScript la lista funciona igual. En
  móvil, los filtros van en una hoja inferior.
- **Ficha de proyecto:**
  - rótulo de plano con los datos y la foto principal en lámina (guía §8);
  - cifras destacadas, descripción, reto o resultado y cantidades;
  - galería en hoja de contactos, con pie;
  - enlaces a su servicio y su sector, y proyectos relacionados;
  - llamada a contacto.
- **Servicio:**
  - alcance por subcapacidad, recursos propios frente a aliados y normas (NSR-10, RETIE, ASME, API 650,
    AWS);
  - capacidad y modelos de contrato;
  - 2-4 proyectos y los sectores, derivados;
  - FAQ y contacto de la línea.
- **Sector:** introducción, servicios aplicados, proyectos y clientes del sector (derivados) y llamada a
  contacto.
- **HSE y calidad, Contacto:** texto más colecciones (certificaciones, sedes). HSE, Noticias,
  Acreedores y legales se diseñan con maquetas al empezar F3.3.
- **Formularios** (cotización, proveedores, trabaje con nosotros, buzón ético):
  - son HTML normal (sin React) que envía a un script PHP en el mismo hosting;
  - el script valida, exige la autorización de la Ley 1581, filtra el spam con un campo oculto, genera
    un radicado y envía al buzón de la función;
  - Power Automate toma los correos con el disparador estándar "Cuando llega un correo nuevo" (no
    premium);
  - el buzón ético va a su propio buzón, fuera de ese flujo.
- **Hablar con HL:** WhatsApp y asesor de Zoho en horario de oficina; el asistente IA queda sujeto a D3.

## 6. Rendimiento, movimiento y pantallas

Las reglas detalladas están en la guía visual §5 y §9. Lo esencial:

| Métrica (móvil, 4G) | Meta |
|---|---|
| Lighthouse (rendimiento, accesibilidad, buenas prácticas, SEO) | ≥ 95 |
| LCP / CLS / INP | < 2,0 s / < 0,05 / < 200 ms |
| JavaScript por página | ≤ 30 KB gz (explorador ≤ 100 KB) |

- **Identidad por sección:** cada sección tiene su acento, sus pods y su firma de movimiento (guía
  §3.5, §6 y §9). Las fotos nunca se muestran a más de 800 px de ancho.
- **Recursos:** Archivo en un solo archivo variable, reducido y alojado en el servidor. Imágenes
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
