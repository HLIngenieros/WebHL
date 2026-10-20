# Plan F5 · Inglés

Fase L (método austero). Ejecución nativa. Sin puerta de maquetas (no hay decisión visual). Decisiones del
20-oct: inglés de EE. UU.; legales traducidos completos con cláusula de prevalencia del español; D2 cerrado
en EN: **"Building industry with people who deliver, since 1968."**

## Inventario (20-oct)

- **Interfaz: completa.** `src/i18n/ui.ts` (tipado contra `es`), formularios, agente, vacantes, rutas y
  slugs EN con su par y `hreflang` vienen de F0-F4.
- **Contenido: 51 entradas** marcadas por `auditar()` (PND-3 en `/pendientes/`), ~9.000 palabras ES:
  22 proyectos (bloque `en` + `etiqueta`/`concepto` de cifras y cantidades), 7 servicios, 6 sectores,
  4 sedes, 1 certificación (`bpi`), 5 hitos, `sitio.yaml` y 5 páginas sin su `.en.md`.
- Fuera de la auditoría: 4 testimonios (sin autorizar; se traducen igual) y pies de foto (hoy ninguno).

## Criterios de traducción

- Glosario de CLAUDE.md: Fabrication, Safety, Mechanical/Electrical Installation, Track record/Projects,
  Slipform construction, Owner's team support, Partners/disciplines. Nombres de servicio y sector = los de
  sus slugs EN (EPC / Turnkey, Project Management, Civil Works…).
- No se traducen: nombres de clientes, de plantas propias (Columbus, Chuchupa), normas (NSR-10, RETIE),
  PIENSA®, nombres de empresa. Sí se traduce el nombre descriptivo de la obra ("Digestores de la PTAR
  Bello" → "Bello WWTP Digesters").
- Cifras y unidades las formatea `contenido.ts` (no se escriben en el texto); en el texto libre, formato
  EN (5,250 t/day). Mismo registro institucional, frases cortas, voz activa; sin agregar datos.
- Legales: traducción íntegra + aviso "In case of discrepancy, the Spanish version prevails"; siguen
  pendientes de revisión jurídica.

| # | Tarea | Entrega | Estado |
|---|---|---|---|
| F5.1 | Catálogos: sectores, servicios (incl. FAQ), sedes, certificaciones, historia, `sitio.yaml` (lema D2 EN, cifras), testimonios | Bloques `en` | Hecho |
| F5.2 | 22 proyectos: `en` (título, resumen, descripción, reto) y etiquetas de cifras y cantidades | Bloques `en` | Hecho |
| F5.3 | `nosotros.en.md` y `hse.en.md` | Páginas EN | Hecho |
| F5.4 | `datos.en.md`, `terminos.en.md`, `acreedores.en.md` con cláusula de prevalencia | Páginas EN | Hecho |
| F5.5 | Repaso en `/en/`: títulos y descripciones meta, restos en español en `dist/en/` (búsqueda única), títulos largos a 360 px | Correcciones | Hecho |
| F5.6 | Cierre: PND-3 en 0, suite, presupuesto, Lighthouse del inicio EN, D2 en CLAUDE.md y especificación | Commit y registro | Hecho |

Pruebas nuevas: ninguna; `auditar()` ya bloquea `build:lanzamiento` si falta un bloque `en`.

## Cierre (2026-10-20)

- 51 entradas traducidas (PND-3 en 0) y 4 testimonios; 5 páginas `.en.md`. En la Política de datos EN las
  tablas del PDF (aplanadas en el ES) van como listas por titular: encargados, finalidades y datos.
- Aviso "Courtesy translation" (`prevalece` en `ui.ts`) en las legales EN y en Acreedores.
- Corregidos de paso: 8 textos truncados por comas en YAML en línea (5 conceptos, 2 etiquetas de resultado
  reescritas y un compromiso de la política HSE); H1 con `hyphens: auto` (el de Montaje eléctrico
  desbordaba 17 px a 360 px en ES y 7 px en EN).
- Cierre: 451 pruebas (2 ajustadas: 10 páginas y `no-reply@` permitido), presupuesto OK (inicio 11,9 KB gz),
  Lighthouse móvil de `/en/` 95/100/100/100 (LCP 2,1 s, CLS 0,013, TBT 150 ms; una medición, se revisa en
  F6). 149 bloqueantes (+3: revisión jurídica de las legales EN).
