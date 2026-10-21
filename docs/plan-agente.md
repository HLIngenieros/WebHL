# Plan · Agente propio "Hablar con HL" (D3, Rev. 1)

21-oct-2026 · Tamaño **L** (método austero). Lo que arma Juan David está en [guia-agente.md](guia-agente.md).
Aquí está lo que se programa en el repo. Sin código en este archivo: tareas, contratos y verificación.

## Decisiones de partida
- Sale Copilot Studio. Agente propio: panel (Preact) → `agente.php` (hosting) → flujo 4 de Power Automate
  (disparador HTTP + "Ejecutar un prompt") → JSON. El modelo se puede cambiar en el flujo sin tocar el sitio.
- Documentos: biblioteca de SharePoint → flujos 1-3 → `documentos.php` → `/documentos/<carpeta>/*.pdf` y
  `/api/documentos.json`. La página los lee al abrirse (patrón de Vacantes): no se recompila.
- Buzón ético **sin IA**: `agente.php` lo detecta antes de llamar al modelo.
- SalesIQ solo para lo comercial, cargado cuando la intención es `comercial`.
- Página nueva **Documentos** (`/documentos`, `/en/documents`) en el pie. HSE enlaza a las certificaciones.
- Sin conversaciones guardadas. Claves en `hl-privado/config.php`, fuera de la carpeta pública.

## Contratos

**`POST /api/agente.php`** (navegador → hosting), JSON:
`{ pregunta: string ≤ 500, idioma: 'es'|'en', pagina: string, historial: [{de:'yo'|'hl', texto}] ≤ 6 }`
Respuesta: `{ estado: 'ok'|'etico'|'limite'|'sin_servicio', respuesta?, intencion?, fuentes?: [{titulo,url}], tarjetas?: [...] }`.
Las URL de `fuentes` pasan por una lista blanca (rutas del sitio y URL del catálogo); el resto se descarta.

**`agente.php` → flujo 4**: encabezado `X-HL-Clave`; cuerpo `{idioma, pagina, historial, contexto, documentos, pregunta}`
(todos texto; historial como "Visitante: …\nAsistente: …"). El flujo responde el texto del prompt: JSON
`{respuesta, intencion, fuentes}`. Se toleran cercas ```json y texto alrededor.

**`POST /api/documentos.php`** (flujos 1-3): encabezado `X-HL-Clave`; `accion` = `guardar` | `borrar` | `inicio` | `fin`.
`guardar`: `{lote, id, archivo, carpeta, idioma, area, vigenteHasta, descripcion, datosClave, modificado, contenido(base64)}`.
Carpetas válidas: `Certificaciones`, `Portafolio`, `Brochures`, `Formularios`, `Politicas`, `Directorio`.

**`/api/documentos.json`**: arreglo `{ id, carpeta, nombre, archivo, url, idioma, area, vigenteHasta, descripcion, datosClave, bytes, actualizado }`.

**`config.php`** (fuera de `public_html`): `clave_documentos`, `agente_url`, `clave_agente`, `tope_diario`.
Ruta: `dirname($_SERVER['DOCUMENT_ROOT']) . '/hl-privado/config.php'`; en local, la variable `HL_CONFIG`.

## Tareas

| # | Tarea | Resultado | Verificación | Estado |
|---|---|---|---|---|
| AG.0 | **Puerta de maquetas** (agrupadas): panel conectado (pensando, respuesta con fuentes, comercial con y sin asesor, ético, sin servicio, límite) y página Documentos; claro/oscuro y móvil | Aprobación | Capturas | Pendiente |
| AG.1 | Conocimiento al compilar: `/api/conocimiento.json` con fragmentos por idioma `{url, titulo, tipo, texto}` desde colecciones y páginas (sin testimonios sin autorizar, `/pendientes/` ni `/muestra/`; fichas discretas marcadas). `.htaccess` niega su acceso web | Archivo en `dist/api/` | `check` + prueba de forma (fragmentos ES/EN, URL válidas) | Pendiente |
| AG.2 | `public/api/documentos.php`: clave con `hash_equals`, solo POST JSON, acciones, PDF real (`%PDF`, ≤ 15 MB), nombre seguro (slug), carpeta válida, escritura atómica con bloqueo de `documentos.json`, `lote` para `fin`; modo prueba | Endpoint | `php -S` portátil + pruebas Playwright de API (clave mala, no PDF, carpeta mala, guardar/borrar/fin) | Pendiente |
| AG.3 | `public/api/agente.php`: validación, límite por IP (como `enviar.php`) y `tope_diario`, filtro ético por palabras clave ES/EN (sin IA), recuperación por términos sin tildes (≤ 12.000 caracteres de contexto + catálogo), llamada al flujo (30 s, un reintento), JSON robusto, lista blanca de URL, tarjetas por intención, sin registro de conversaciones; modo prueba con respuestas simuladas | Endpoint | Pruebas de API con el modo prueba; una prueba real con el flujo 4 cuando exista | Pendiente |
| AG.4 | `Agente.tsx` conectado: hilo real, indicador "pensando", fuentes, tarjetas por intención, error y límite con los contactos actuales; quitar "Vista previa"; sigue cargándose al primer clic; JS ≤ 30 KB gz | Panel | `tests/` del agente + `humo.spec.ts` + `npm run presupuesto` | Pendiente |
| AG.5 | SalesIQ: `widgetcode` en `sitio.yaml`; el script se carga solo con intención comercial; se oculta su botón; abre el chat con departamento Comercial y la pregunta; sin asesor → formulario de cotización. Confirmar la API JS de SalesIQ (disponibilidad, departamento, pregunta) en su documentación | Paso a asesor | Prueba manual con la cuenta real (en horario y fuera) | Pendiente (`widgetcode`) |
| AG.6 | Página Documentos ES/EN: isla que lee `documentos.json` (muestra en desarrollo, como Vacantes), agrupada por carpeta, vigencia y descarga; en el pie; HSE enlaza a Certificaciones; rutas emparejadas, sitemap, `inventario.csv` sin cambios | Página | Playwright + `humo.spec.ts` | Pendiente |
| AG.7 | Configuración y textos: rutas de API en `sitio.yaml` → `config.json`; `/pendientes/` (quitar Copilot Studio; agregar flujos 1-4, `config.php`, créditos de IA, "Cualquiera" permitido, `widgetcode`); política de datos ES/EN (agente con Azure OpenAI, sin conversaciones guardadas, cookies de SalesIQ) | Textos | `check` + `build:lanzamiento` (cuenta de bloqueantes) | Pendiente |
| AG.8 | Cierre: suite completa, `presupuesto`, Lighthouse una vez (Contacto y Documentos), revisión enfocada en `documentos.php` y `agente.php` (claves, subida de archivos, inyección de prompt, lista blanca), CLAUDE.md y guía si algo cambió | Commit | — | Pendiente |

**Orden:** AG.0 → AG.1 → AG.2 → AG.3 → AG.4 → AG.6 → AG.7 → AG.5 (cuando llegue `widgetcode`) → AG.8.
AG.1-AG.4 no dependen de Juan David: se prueban con el modo prueba y, cuando exista el flujo 4, con una llamada real desde la vista previa local (`HL_CONFIG`).

## Riesgos
- **Créditos de IA** (guía §12.1): sin créditos, el flujo 4 falla y el panel queda en "sin servicio". `tope_diario` limita el gasto.
- **Latencia** de Power Automate (3-8 s): el panel muestra "pensando" y el PHP corta a los 30 s.
- **"Cualquiera" bloqueado** en el tenant (guía §12.3): pasar a token de Entra ID en `agente.php`.
- **Hosting** sin confirmar (D5): límites de `post_max_size` y `max_execution_time` del PHP; se verifican al desplegar.
