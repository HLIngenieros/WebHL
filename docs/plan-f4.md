# Plan F4 · Contacto

Fase L (método austero). Ejecución nativa. Decisiones: D3 y D7 (20-oct) en
[especificacion.md](especificacion.md). Una sola puerta de maquetas (F4.1).

| # | Tarea | Entrega | Estado |
|---|---|---|---|
| F4.1 | **Puerta de maquetas** (agrupadas): formulario por pasos con su movimiento, en claro/oscuro y móvil; panel del agente con conversación de muestra y tarjetas de derivación (WhatsApp, correo, teléfono) | Aprobación | Hecho |
| F4.2 | `src/content/` o `src/lib/`: configuración de buzones por función (pendientes marcados) y campos por intención | Datos tipados | Hecho |
| F4.3 | Isla `Formulario.tsx`: pasos, campos según intención y país, validación en vivo, Ley 1581, campo trampa, mejora progresiva (sin JS envía igual) | 4 formularios en `/contacto`, `/proveedores`, `/trabaje-con-nosotros`, `/buzon-etico` | Hecho |
| F4.4 | `public/api/enviar.php`: valida, rechaza spam, genera radicado, envía al buzón, responde JSON o redirige; buzón ético aparte y sin registro comercial | Envío de punta a punta con PHP portátil (`php -S`) | Hecho |
| F4.5 | Isla del agente "Hablar con HL": panel, conversación de muestra marcada, tarjetas de derivación; sin conexión. Hidrata al abrir (no en la carga) | Interfaz completa | Hecho |
| F4.6 | Cierre: suite completa, presupuesto (formulario ≤ 30 KB gz), Lighthouse de `/contacto`, revisión enfocada en PHP y formularios | Commit y registro en CLAUDE.md | Hecho |

Pruebas nuevas solo de riesgo: envío sin JS, autorización obligatoria, campo trampa, radicado, foco y
`aria-describedby` en errores, reduced-motion.

## Cierre (2026-10-20)

- Formulario: isla `Formulario.tsx` (client:load) con estilos en `formulario.css`; sin JS es un formulario
  completo. Definiciones en `src/lib/formularios.ts`, que también alimentan `/api/config.json`, de donde
  lee el PHP (una sola fuente). Teléfono opcional.
- `public/api/enviar.php`: trampa y envío en menos de 3 s responden como éxito sin enviar; 5 envíos por IP
  cada 10 min; PDF por firma `%PDF-`; acuse al remitente solo con el radicado (`HL-`/`BE-AAAAMMDD-XXXXXX`).
  Probado con PHP 8.3 portátil y `HL_FORM_PRUEBA=1` (10 casos).
- Agente: `Agente.tsx` se carga con `import()` al primer clic (escucha en captura, antes que el
  enrutador de Astro); botón y panel con `transition:persist`. WhatsApp queda "por confirmar".
- Cierre: 449 pruebas, presupuesto OK (inicio 11,9 KB gz con el agente diferido), Lighthouse móvil de
  `/contacto` 98/100/·/100 (LCP 2,0 s, CLS 0,001; Buenas prácticas 78 solo por HTTP local). 194 bloqueantes.
- Revisión enfocada en PHP y formularios: autorrevisión (sin subagente).

## F4.7 · Vacantes en Trabaje con nosotros (2026-10-20, maqueta aprobada)

Tablero `Vacantes.tsx` (client:load) sobre el formulario F-03: conteo en tablero de aeropuerto, filtros
por área y sede con reacomodo, orden de trabajo por vacante (aviso "Nueva" ≤ 7 días, barra de cierre en
señal ≤ 7 días), detalle desplegable, enlace directo `?vacante=V-14` y "Postularme", que entrega la
vacante al formulario (evento `hl:postular`) y al PHP (campo `vacante`, primero en el correo y en el asunto).

**Fuente (decidido 20-oct):** lista "Vacantes" de SharePoint que mantiene Talento Humano. Un flujo de Power
Automate (al crear o modificar un elemento) escribe `/api/vacantes.json` en el hosting por FTP/SFTP
(conector estándar; acceso pendiente). La página lo lee al abrirse: no se recompila el sitio.
`--mode lanzamiento` no genera ese archivo, así subir `dist/` no pisa las vacantes reales; en desarrollo
sale de `src/lib/vacantes-muestra.json`.

Contrato del archivo (un arreglo; la página descarta las vencidas y las incompletas, y ordena por fecha):

| Campo | Ejemplo | Columna de SharePoint |
|---|---|---|
| `id` | `V-14` | Código |
| `titulo` | Residente de obra civil | Cargo |
| `area` | Obra · Ingeniería · HSE · Administración | Área (elección) |
| `sede`, `pais` | El Rosal, Colombia | Sede, País |
| `modalidad`, `contrato` | En obra · Planta · Oficina; Obra o labor · Término fijo · Indefinido | (elección) |
| `publicada`, `cierre` | `2026-10-18`, `2026-11-08` (AAAA-MM-DD) | Fechas |
| `resumen` | Texto corto | Descripción |
| `requisitos` | `["…", "…"]` | Requisitos (una línea por requisito) |

Solo se publican los elementos con estado "Abierta".
