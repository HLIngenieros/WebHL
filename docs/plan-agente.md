# Plan · Agente propio "Hablar con HL" (D3, Rev. 2)

21-oct-2026 · Tamaño **L** (método austero). Guía de lo que hace Juan David: [guia-agente.md](guia-agente.md).
Aquí está lo que se programa en el repo: tareas, contratos y verificación, sin código.

## Decisiones (Rev. 2, 21-oct tarde: simplificación)
- **Sin Power Automate, sin SharePoint, sin Copilot Studio.** `agente.php` llama directo al modelo de IA.
  Proveedor configurable en `privado/.env` (`PROVEEDOR`): **Claude API en desarrollo**; producción la decide
  Gerencia (Claude en Microsoft Foundry o Azure OpenAI; comparativo: https://claude.ai/artifact/KiawaMKCaj4UDX8bMUrQSJ).
- **Documentos en el repo:** PDF aprobados en `public/documentos/<carpeta>/` y sus datos en una colección; la página
  Documentos se arma al compilar y el agente los conoce por el HTML compilado. Cambiar un documento = compilar y desplegar.
- **Información difusa:** entra por una **página de carga solo local** (`npm run dev`), cae en `insumos/entrada/` y
  Claude la procesa en una sesión (inventario en `insumos/README.md`).
- Se mantienen: filtro ético sin IA, límites por IP y por día, búsqueda en el conocimiento, lista blanca de fuentes,
  SalesIQ diferido solo para lo comercial, sin conversaciones guardadas.
- Retirado el 21-oct: flujos 1-4, `documentos.php` y sus pruebas, biblioteca "Conocimiento Web HL", claves
  `CLAVE_DOCUMENTOS`/`CLAVE_AGENTE`/`AGENTE_URL`, túnel. Quedan en el historial de git (commits `90b72a7` a `ec70f1f`).

## Contratos vigentes

**`POST /api/agente.php`** (navegador → hosting), JSON:
`{ pregunta: string ≤ 500, idioma: 'es'|'en', pagina: string, historial: [{de:'yo'|'hl', texto}] ≤ 6 }`
Respuesta: `{ estado: 'ok'|'etico'|'limite'|'sin_servicio', respuesta?, intencion?, fuentes?: [{titulo,url,tipo}] }`.

**Al modelo** (AG.10): instrucción de sistema = guía §6 (fija, con caché); mensaje de usuario con `IDIOMA`,
`PAGINA`, `HISTORIAL`, `CONTEXTO` (≤ 9.000 caracteres del conocimiento) y `DOCUMENTOS` (catálogo); salida JSON
`{respuesta, intencion, fuentes}` (con salida estructurada si el proveedor la tiene; si no, el PHP ya tolera texto alrededor).

**`privado/.env`** (en el hosting `hl-privado/.env`): `PROVEEDOR`, `ANTHROPIC_API_KEY` (o la clave del proveedor
elegido), `TOPE_DIARIO`; para AG.10 se suma `MODELO`. Lectura propia en el PHP (admite comentarios `#`).

## Tareas

| # | Tarea | Resultado | Verificación | Estado |
|---|---|---|---|---|
| AG.0 | Puerta de maquetas: panel conectado y página Documentos | `design/maquetas/agente-documentos.html` | Aprobada | Hecho (21-oct) |
| AG.1 | Conocimiento al compilar (`src/lib/conocimiento.mjs` → `dist/api/conocimiento.json`, negado por `.htaccess`) | 763 fragmentos de 100 páginas | `api-php.spec.ts` | Hecho |
| AG.2 | `documentos.php` (recibía los flujos) | — | — | **Retirado** (21-oct, Rev. 2) |
| AG.3 | `agente.php`: validación, límites, filtro ético, búsqueda, lista blanca | Endpoint | `api-php.spec.ts` (modo prueba) | Hecho; la llamada al modelo pasa a AG.10 |
| AG.4 | Panel conectado (`Agente.tsx`, 4,2 KB gz) | Panel | `documentos.spec.ts`, `contacto.spec.ts` | Hecho |
| AG.5 | SalesIQ diferido (`salesiq.ts`) | Paso a asesor | Prueba manual con la cuenta real | Código listo; falta `widgetcode` |
| AG.6 | Página Documentos (P-06) y enlace desde HSE | Página | Lighthouse 98 | Hecho; pasa a datos del repo en AG.11 |
| AG.7 | Pendientes y textos | `/pendientes/` | `build:lanzamiento` | Hecho; actualizado en Rev. 2 |
| AG.8 | Cierre Rev. 1 | 466 pruebas | — | Hecho |
| **AG.9** | **Página de carga local** (ver abajo) | `/carga/` solo en `npm run dev` | Prueba de subida y listado | Hecho (21-oct): `src/lib/carga.mjs` + `carga.astro`; no existe en `dist/` |
| **AG.10** | **`agente.php` → modelo directo** (ver abajo) | Respuestas reales en local | `api-php.spec.ts` (simulado) + prueba real con la clave | Pendiente (falta la clave) |
| **AG.11** | **Documentos desde el repo** (ver abajo) | Página estática + catálogo al compilar | `documentos.spec.ts` | Pendiente |
| AG.12 | Cierre Rev. 2: suite, presupuesto, Lighthouse de Documentos, revisión enfocada en la carga y en `agente.php` | Commit | — | Pendiente |

### AG.9 · Página de carga local
- **Solo desarrollo:** un middleware de Vite en `astro.config.mjs` (`configureServer`, activo solo en `astro dev`)
  atiende `POST /__carga` y `GET /__carga`. Nada de esto existe en `dist/` ni en el hosting.
- **Página** `/carga/`: arrastrar o elegir archivos (imágenes, PDF, Excel, Word, PowerPoint, texto; ≤ 50 MB c/u),
  nota opcional por archivo ("de Calidad, certificado 2026"), lista de lo subido con su **estado**: recibido ·
  revisado · publicado · descartado. Con `noindex`, fuera del sitemap y del conocimiento (`EXCLUIR` en
  `conocimiento.mjs`), sin enlaces desde el sitio; en `--mode lanzamiento` no se genera.
- **Guarda en** `insumos/entrada/AAAA-MM-DD/<nombre-seguro>` (ignorado por git) y lleva el estado en
  `insumos/entrada/estado.json` (`archivo, nota, subido, estado, destino`). Claude actualiza el estado al procesar.
- **Seguridad:** el servidor de desarrollo escucha solo en el equipo local; el middleware rechaza rutas con `..`,
  extensiones fuera de la lista y tamaños mayores; nunca ejecuta lo subido.
- **Maqueta:** una sola, rápida (lenguaje del sitio: rótulo P1, tabla tipo plano, zona de arrastre con cota),
  con puerta de aprobación antes de construir.

### AG.10 · `agente.php` → modelo directo
- `PROVEEDOR=anthropic`: Messages API de Anthropic; `MODELO` en el `.env` (decisión de Juan David: el comparativo
  sugiere Claude Haiku 5.5 para costo; Claude Sonnet 5.5 si la calidad no alcanza). Instrucción de sistema fija con
  caché de prompt; salida estructurada JSON; `max_tokens` acotado; timeout 30 s.
- **Cómo llamar:** el SDK oficial de PHP si el hosting permite Composer; si no, HTTP con cURL (decidir con Juan David
  en la sesión; documentar la razón).
- Preparar `PROVEEDOR=foundry` (Claude en Microsoft Foundry: misma API, otro punto de conexión y credencial) y dejar
  `azure-openai` como opción documentada.
- Quitar del PHP lo del flujo 4 (`AGENTE_URL`, `CLAVE_AGENTE`). Modo prueba (`HL_AGENTE_PRUEBA=1`) sin cambios.

### AG.11 · Documentos desde el repo
- Colección `documentos` (`src/content/documentos.yaml`: carpeta, título ES/EN, archivo, idioma, emisor, código,
  vigencia, descripción, datos clave) y PDF en `public/documentos/<carpeta>/`.
- La página Documentos pasa a HTML estático (sin `fetch`): se quitan `src/pages/api/[documentos].json.ts`,
  `src/lib/documentos-muestra.json` y la carga en `Documentos.tsx` (filtros y búsqueda siguen en la isla).
- `dist/api/documentos.json` se genera al compilar desde la colección (también en lanzamiento) para `agente.php`.
- `design/documentos.mjs`: lo aprobado se copia a `public/documentos/<carpeta>/` y se registra en la colección.
- Los 13 PDF de `documentos-web/` (21-oct) son el primer contenido, cuando Juan David los apruebe.

## Riesgos
- **Proveedor y datos:** la decisión de producción es de Gerencia/TI; hasta entonces, desarrollo con Claude API y tope bajo.
- **Costo:** `TOPE_DIARIO`, límite por IP y 20 preguntas por conversación.
- **Hosting** sin confirmar (D5): cURL saliente, `max_execution_time`, PHP 8.3; se verifica al desplegar.
