# Plan F1 · Contenido

> **Para agentes:** sub-skill requerida: superpowers:executing-plans (o subagent-driven-development).
> Los pasos usan casillas (`- [ ]`). Convención del proyecto: plan sin código completo; cada paso dice
> qué hacer y cómo verificarlo.

**Objetivo:** que todos los datos del sitio vivan dentro del proyecto como colecciones de Astro
validadas al compilar (22 fichas, 7 servicios, 6 sectores, sedes, hitos, testimonios,
certificaciones, textos largos), con las fotos optimizadas y un listado de pendientes que sirva de
solicitud de insumos.

**Arquitectura:** las colecciones van en `src/content/` (convención de Astro); `contenido/` queda como
archivo de la extracción y fuente de `inventario.csv` para F6. Cada entidad es un YAML con los datos
una sola vez y los textos en bloques `es:` / `en:`; las etiquetas cortas (cifras, cantidades, pies de
foto) usan el tipo en línea `{ es, en }`. Los textos largos son Markdown, un archivo por idioma. Las
relaciones se validan con `reference()` y las listas derivadas (proyectos de un servicio o sector) se
calculan con funciones puras en `src/lib/contenido.ts`, probables sin Astro. La validación tiene dos
modos: el esquema es tolerante y `auditar()` lista lo que falta; con `--mode lanzamiento` lo
obligatorio hace fallar la compilación.

**Herramientas:** Astro 7.3 (content layer: loaders `glob` y `file`, `astro:assets` con sharp, ya
instalado), YAML, Playwright Test. Sin dependencias nuevas salvo que sharp falte.

**Especificación:** [especificacion.md](especificacion.md) §3, §4 y §7 (F1); guía visual §6 (material
que falta). Fuentes: [../contenido/proyectos.md](../contenido/proyectos.md),
[../contenido/institucional.md](../contenido/institucional.md),
[../contenido/medios.csv](../contenido/medios.csv).

## Restricciones globales

- **No inventar datos.** Cifras, años, roles, capacidades, clientes y normas salen de `contenido/` o de
  la especificación. Lo que no esté queda vacío y aparece en pendientes. La redacción en español puede
  mejorar la forma (ortografía, mayúsculas, orden), no agregar hechos.
- Las cifras se escriben una vez, como número (`9470000`, no `"9’470.000"`); el formato lo da el idioma.
- **El inglés se traduce en F5.** En F1 solo se llenan los slugs EN y los textos `es`; `en` queda vacío
  y cuenta como pendiente de tipo `traduccion`.
- Nunca reutilizar correos ni celulares personales, ni la meta de ventas de la visión
  (`contenido/README.md`, hallazgos).
- Casos sensibles (D6): Odebrecht (Patio de Carbón) y Minera Panamá con `visibilidad: discreta`. El
  cliente se escribe con el nombre de la época; el nombre actual (Zijin, thyssenkrupp Polysius, OHLA)
  queda como pendiente de confirmar.
- Slugs en minúscula, sin tildes, por el nombre del proyecto (no del cliente), ES y EN traducidos.
- Las páginas nuevas de apoyo (`/pendientes/`) llevan `noindex` y se eliminan en F6 como `/muestra/`.
- Todo lo de F0 sigue vigente: tokens, JS ≤ 30 KB gz, sin terceros, sin prettier, pocos archivos.
- Trabajar en la rama `f1-contenido`; al cerrar, merge fast-forward a `main` y borrar la rama.

## Estructura de archivos

```
src/content.config.ts          esquemas de las 9 colecciones
src/content/
  proyectos/<slug-es>.yaml     22 fichas
  servicios/<slug-es>.yaml     7 líneas
  sectores/<slug-es>.yaml      6 sectores
  sedes.yaml · certificaciones.yaml · historia.yaml · testimonios.yaml · sitio.yaml   (loader file)
  paginas/<pagina>.<lang>.md   nosotros, hse, datos, terminos, acreedores (solo es en F1)
src/assets/
  proyectos/<slug-es>/1.jpg…   51 fotos originales (Astro genera AVIF/WebP al compilar)
  clientes/ · testimonios/ · certificaciones/ · grupo/
src/lib/contenido.ts           funciones puras: textos, números, relaciones, auditoría
src/components/ui/Foto.astro   imagen responsiva AVIF/WebP con dimensiones fijas
src/pages/pendientes.astro     listado de pendientes (noindex; se elimina en F6)
tests/contenido.spec.ts        pruebas de funciones puras, de la página de pendientes y de Foto
```

Noticias no se define en F1: no hay entradas que migrar (el sitio no tiene blog). Su colección se crea en
F3 con la primera entrada, para no compilar con una colección vacía.

## Interfaces compartidas

En `src/lib/contenido.ts` (sin importar `astro:content` salvo tipos, para poder probarlo desde
Playwright como se hizo con `rutas.ts`):

- `type Texto = { es: string; en?: string }` y `txt(t: Texto | undefined, lang: Lang): string | undefined`
  (devuelve `t[lang] ?? t.es`; el respaldo solo ocurre en desarrollo, porque en lanzamiento `en` es
  obligatorio).
- `numero(valor: number, lang: Lang): string`: `Intl.NumberFormat` con `es-CO` / `en-US` y
  `useGrouping: 'always'` (`5250` → `5.250` / `5,250`).
- `edad(fundacion: number, hoy = new Date()): number`.
- `periodo(p: { inicio?: number; fin?: number }): string | undefined`: `"2015–2018"`, `"2015"` o nada.
- Relaciones (reciben y devuelven entradas `{ id, data }`; nunca incluyen discretas):
  `deServicio(proyectos, id)`, `deSector(proyectos, id)`, `destacados(proyectos)`. Orden: destacados
  primero, luego `fin` descendente, sin año al final.
- `paraExplorador(proyectos)`: todas, discretas al final.
- `type Pendiente = { coleccion: string; id: string; campo: string; tipo: 'insumo' | 'traduccion' |
  'confirmar' | 'aviso'; bloquea: boolean; detalle?: string }`.
- `auditar(datos: Datos, opciones: { modo: 'desarrollo' | 'lanzamiento'; hoy?: Date }): Pendiente[]`.
  `Datos` agrupa las colecciones por nombre. En `lanzamiento`, si hay alguno con `bloquea`, lanza un
  `Error` cuyo mensaje lista todos.

Campos de cada colección (esquema tolerante; "oblig." = bloquea en lanzamiento):

- **proyectos:** `slug {es, en}` oblig., `cliente` oblig., `duenoFinal?`, `rol? {tipo:
  'contratista'|'subcontratista'|'consorcio', nombre?}` oblig., `pais?` (ISO-2) oblig., `ciudad?`
  oblig., `region?`, `coordenadas? [lat, lon]` (nivel ciudad), `inicio?`/`fin?` oblig., `meses?`,
  `hh?`, `sector: reference('sectores')`, `servicios: reference('servicios')[]` (≥ 1),
  `cifras: {valor, unidad, etiqueta: Texto}[]` (3-4 oblig.), `cantidades: {valor?, unidad?, concepto:
  Texto}[]`, `fotos: {archivo: image(), pie?: Texto}[]` (sin fotos = aviso; pie oblig. si hay foto),
  `visibilidad: 'destacado'|'normal'|'discreta'`, `fuente: 'web'|'ecohl'`, `confirmar?: string[]`
  (dudas de `proyectos.md`, cada una bloquea), `es`/`en? {titulo, resumen, descripcion, reto?}`.
- **servicios:** `grupo: 'A'|'B'|'C'`, `orden`, `slug {es, en}`, `buzon?` (D7) oblig., `normas:
  string[]`, `es`/`en? {nombre, resumen, alcance: {subcapacidad, texto}[], propios?, aliados?,
  capacidad?, contratos?: string[], faq?: {p, r}[]}`.
- **sectores:** `orden`, `slug {es, en}`, `es`/`en? {nombre, intro, serviciosTipicos?}`.
- **sedes:** `nombre`, `ciudad`, `pais`, `direccion`, `telefono?`, `horario?`, `buzon?` oblig.,
  `coordenadas`.
- **certificaciones:** `norma`, `ente`, `vence?` oblig., `sello?: image()`, `pdf?` oblig.; vencida =
  aviso al compilar y bloquea en lanzamiento.
- **historia:** `orden`, `anio?` oblig., `es`/`en? {titulo, texto}`.
- **testimonios:** `nombre`, `cargo: Texto`, `foto?: image()`, `autorizado: boolean`, `cita: Texto`.
  Sin autorizar = aviso (no se publica, no bloquea).
- **sitio** (una entrada `hl`): `fundacion: 1968`, `cifras: {valor, prefijo?, unidad?, etiqueta:
  Texto}[]`, `redes: {red, url}[]`, `asociadas?: {nombre, logo?: image()}[]` (D1) oblig., `clientes:
  {nombre?, logo: image()}[]`.
- **paginas:** Markdown con `pagina: 'nosotros'|'hse'|'datos'|'terminos'|'acreedores'`, `lang`,
  `titulo`, `descripcion`, `revisionJuridica?: boolean` (las legales bloquean sin ella).

## Foco de revisión

Fallos que la especificación implica y que más pueden afectar al visitante. Cada uno tiene su prueba
en la tarea indicada.

1. **Una ficha discreta se cuela** en la lista de un servicio o sector, en los destacados o en los
   logos de clientes: nunca debe pasar; sí aparece al final del explorador → Tarea 1.
2. **Faltan datos** (sin año, sin fotos, sin `en`): las funciones devuelven `undefined` o la lista
   vacía sin romper, y el faltante aparece en pendientes; en modo lanzamiento la compilación falla con
   la lista completa, no con el primer error → Tarea 1.
3. **Cifras distintas o mal formateadas entre idiomas:** el mismo número se muestra `5.250` en ES y
   `5,250` en EN, también con 4 dígitos y con decimales → Tarea 1.
4. **Un slug mal escrito o repetido** (servicio inexistente en una ficha, dos fichas con el mismo
   slug ES o EN): la compilación falla con un mensaje que nombra el archivo → Tareas 1 y 4.
5. **Fotos que mueven la página o pesan de más:** toda foto sale con `width`/`height`, AVIF y WebP, y
   ninguna variante supera 200 KB → Tarea 3.

---

### Tarea 1: Esquemas, funciones puras y página de pendientes

**Archivos:** crear `src/content.config.ts`, `src/lib/contenido.ts`, `src/pages/pendientes.astro`,
`tests/contenido.spec.ts`; modificar `src/i18n/ui.ts` (países ISO-2 y unidades: `t`, `m3`, `m2`,
`m`, `u`, `tpd`, `tpa`, `hh`, `meses`, con su texto ES/EN), `package.json` (script
`build:lanzamiento` = `astro build --mode lanzamiento`).

- [ ] Crear la rama `f1-contenido`.
- [ ] `content.config.ts` con las 9 colecciones y los campos de "Interfaces compartidas". YAML con
  `glob` para proyectos, servicios, sectores y páginas; `file` para las de un solo archivo. Si `image()`
  no funciona con el loader `file` en Astro 7.3, pasar esas colecciones a `glob` (un YAML por entrada)
  y anotarlo aquí.
- [ ] `contenido.ts` con las funciones de "Interfaces compartidas". `auditar()` revisa además: slugs
  ES o EN repetidos entre proyectos (bloquea), `cifras` fuera de 3-4, `confirmar` no vacío y
  certificaciones vencidas respecto de `hoy`.
- [ ] `pendientes.astro` (`noindex`, ES): carga las colecciones, llama a `auditar()` con
  `modo: import.meta.env.MODE === 'lanzamiento' ? 'lanzamiento' : 'desarrollo'` y muestra:
  - un resumen con el conteo por colección (`data-conteo="proyectos"`, etc.);
  - una tabla por tipo (insumo, confirmar, traducción, aviso) con colección, entrada, campo y detalle,
    usando `Tabla` y `Chip`;
  - estilos de impresión limpios (es la futura solicitud de insumos).
  En desarrollo, además, un `console.warn` por cada aviso de certificación vencida.
- [ ] Pruebas puras en `tests/contenido.spec.ts` con proyectos de ejemplo escritos en el spec:
  - (foco 1) con un destacado, un normal y una discreta del mismo servicio y sector, `deServicio`,
    `deSector` y `destacados` no incluyen la discreta y `paraExplorador` la pone de última;
  - orden: destacados primero, luego `fin` descendente, sin año al final;
  - (foco 2) un proyecto sin `inicio`, `fin`, fotos ni `en`: `periodo` da `undefined`, `txt(…, 'en')`
    devuelve el texto ES, y `auditar` lo reporta (año e idioma como bloqueantes, fotos como aviso);
  - (foco 2) en `lanzamiento` `auditar` lanza un error que menciona **todos** los bloqueantes;
    sin bloqueantes, no lanza;
  - (foco 3) `numero(5250)` → `5.250` / `5,250`; `numero(9470000)`; `numero(2.5)` → `2,5` / `2.5`;
  - (foco 4) dos proyectos con el mismo `slug.en` dan un pendiente bloqueante;
  - `edad(1968, new Date('2026-10-15'))` es 58 y `edad(1968, new Date('2027-01-01'))` es 59;
  - una certificación con `vence` anterior a `hoy` da un aviso que bloquea en lanzamiento.
- [ ] Prueba de página: `/pendientes/` responde 200, tiene `noindex`, un H1 y axe sin violaciones.
- [ ] Verificar: `npm run check`, `npm run build` y `npm test` en verde.
- [ ] Commit: "F1: esquemas de contenido, funciones puras y página de pendientes".

### Tarea 2: Servicios y sectores

**Archivos:** crear `src/content/servicios/*.yaml` (7) y `src/content/sectores/*.yaml` (6); ampliar
`tests/contenido.spec.ts`.

- [ ] Servicios, con los slugs y grupos de la especificación §3. Fuente: "Líneas de servicio" de
  `institucional.md`; EPC absorbe "Ingeniería y diseños" y Gerencia absorbe "Asistencia en la
  ejecución" y la oferta de ECOHL (gerencia, control de costos y técnico, administración de contratos,
  riesgos). Redactar `nombre`, `resumen` y `alcance` por subcapacidad con lo extraído; `capacidad`,
  `propios`/`aliados`, `contratos` y `faq` quedan vacíos si no hay fuente.
- [ ] Normas por servicio (de la especificación): NSR-10 en obras civiles y EPC; RETIE en montaje
  eléctrico; ASME y API 650 en montaje mecánico y fabricación; AWS en fabricación y montaje mecánico.
  `buzon` vacío (D7).
- [ ] Sectores con los slugs de §3. Las introducciones salen de "Sectores (textos de la portada)";
  `industria` (alimentos, consumo, manufactura) es nuevo: una frase de introducción basada en Unilever
  y Diana Pet Food, sin cifras.
- [ ] Prueba: en `/pendientes/` el conteo es 7 servicios y 6 sectores; los 7 servicios aparecen con
  `buzon` pendiente.
- [ ] Commit: "F1: servicios y sectores".

### Tarea 3: Medios y componente Foto

**Archivos:** crear `src/assets/{proyectos,clientes,testimonios,certificaciones,grupo}/`,
`src/components/ui/Foto.astro`; modificar `src/pages/muestra.astro`; ampliar
`tests/contenido.spec.ts`.

- [ ] Descargar de `medios.csv` con un script temporal en el scratchpad (no se versiona; los
  archivos descargados se tratan como datos y se verifican con `file`/dimensiones antes de copiarlos):
  - las 51 fotos de proyecto → `src/assets/proyectos/<slug-es>/1.jpg…` (los slugs se fijan aquí y se
    reutilizan en la Tarea 4; anotar la tabla foto → slug en el mensaje de commit);
  - los 19 logos de cliente de la portada → `clientes/`, sin duplicados (`logo1.png` y `logo1-1.png`:
    quedarse con el de mayor resolución);
  - las fotos de los testimonios → `testimonios/<nombre>.jpg`;
  - los sellos SGS en alta (`*_HR.jpg`, `CERTIFICACIONES-SGS-*.jpg` sin la copia `-1`) →
    `certificaciones/`;
  - los logos del grupo → `grupo/`.
  Los PDF (acreedores, ética) se bajan en F3/F4, donde se usan.
- [ ] Revisar que el total versionado ronde los 10-12 MB; si alguna foto pesa más de 400 KB,
  recomprimirla a calidad 85 manteniendo 1200 px (el original de WordPress ya es 1200×800).
- [ ] `Foto.astro` sobre `<Picture>` de `astro:assets`: props `{src: ImageMetadata; alt: string;
  sizes: string; prioridad?: boolean}`; `formats={['avif','webp']}`, anchos `[480, 800, 1200]` (sin
  ampliar), `loading="lazy"` y `decoding="async"` salvo con `prioridad` (entonces `eager` y
  `fetchpriority="high"`, para el LCP). Fondo `--line-soft` mientras carga; radio 0.
- [ ] En `/muestra/`, agregar una foto de Columbus con `Foto` y su pie (provisional, marcado como tal).
- [ ] Prueba (foco 5):
  - en `/muestra/` el `<picture>` tiene `source` AVIF y WebP, y el `<img>` tiene `width` y `height`;
  - recorrer `dist/_astro/*.{avif,webp}` y verificar que ninguno pasa de 200 KB;
  - sin peticiones externas (la prueba de F0 ya lo cubre: debe seguir en verde).
- [ ] Commit: "F1: medios descargados y componente Foto".

### Tarea 4: Proyectos

**Archivos:** crear `src/content/proyectos/*.yaml` (22); modificar
[../contenido/inventario.csv](../contenido/inventario.csv) (columna `seccion_destino` de las
fichas ES y EN con la URL nueva); ampliar `tests/contenido.spec.ts`.

- [ ] Las 16 fichas web desde `proyectos.md`:
  - `cliente` con el nombre limpio (sin "S.A.S" gritado; "UTE Chimborazo (Sacyr, Imasa, Polysius)");
  - `es.titulo` corto por el proyecto ("Planta Columbus"), `es.resumen` de una frase, `es.descripcion`
    con el texto original corregido;
  - sector por equivalencia: Cementero → `cemento`, Minería → `mineria`, Energía y Aguas →
    `agua-y-energia`, Petróleo & Gas → `petroleo-y-gas`, Infraestructura → `infraestructura`,
    Industrial → `industria`;
  - `servicios` según la descripción (por ejemplo, montaje de equipos → `montaje-mecanico`;
    eléctricos e instrumentación → `montaje-electrico`; deslizado y concreto → `obras-civiles`). Es una
    propuesta: agregar a `confirmar` "Validar servicios asignados" solo en las fichas dudosas;
  - `meses` y `hh` como números; `cantidades` una por línea, con `valor` y `unidad` cuando los tenga;
  - `cifras`: 3-4 elegidas de duración, HH y cantidades (las que mejor dimensionan la obra);
  - `coordenadas` de la ciudad (nivel ciudad, nunca de la planta);
  - cada **Nota** y **Falta** de `proyectos.md` que no sea un campo vacío pasa a `confirmar` (Columbus
    fabricación vs. proyecto, cantidades duplicadas de OHL, silo de crudo o de cemento, país de
    Odebrecht, nombre del consorcio de Columbus, nombres actuales D6).
- [ ] Las 6 fichas del PDF de ECOHL (`fuente: ecohl`): Cementos Diamante (líneas 1 y 2), Cemex
  Caracolito, Cerrejón cargador de buques, nueva planta Maceo, Chevron Chuchupa A y B, Ladrillera Santa
  Fe. Solo los datos del PDF; el resultado va en `es.reto` ("entrega 3 días antes"). Maceo: escribir
  "30 %" y dejar en `confirmar` la errata del original ("305").
- [ ] `visibilidad`: `discreta` en Odebrecht y Minera Panamá; `destacado` en Columbus, thyssenkrupp
  (Cementos Progreso), Continental Gold y PTAR Salitre (propuesta, en `confirmar` de Columbus:
  "Validar los 4 destacados"); el resto `normal`.
- [ ] Fotos: referenciar las de la Tarea 3; `pie` vacío (pendiente).
- [ ] Actualizar `inventario.csv`: para cada ficha actual, la URL nueva en ES o EN según su idioma.
- [ ] Prueba:
  - `/pendientes/` cuenta 22 proyectos;
  - las 2 discretas y los 4 destacados están en sus fichas (`data-visibilidad` en la tabla de resumen);
  - (foco 4) verificación manual una vez: cambiar un servicio de una ficha por `montaje-mecanicos`,
    `npm run build` debe fallar nombrando el archivo; revertir.
- [ ] Commit: "F1: 22 fichas de proyecto".

### Tarea 5: Institucional

**Archivos:** crear `src/content/{sedes,certificaciones,historia,testimonios,sitio}.yaml` y
`src/content/paginas/{nosotros,hse,datos,terminos,acreedores}.es.md`; ampliar
`tests/contenido.spec.ts`.

- [ ] `sedes.yaml`: las 4 sedes de "Contacto" (Bogotá, El Rosal, Panamá, República Dominicana) con
  dirección y teléfono fijo; ningún correo personal; `buzon` vacío (D7).
- [ ] `certificaciones.yaml`: ISO 9001, 14001 y 45001 (SGS) con su sello; más las que se vean en los
  sellos descargados (BPI Icontec, Iticcol) si son certificaciones de HL. `vence` y `pdf` vacíos.
- [ ] `historia.yaml`: fundación 1968 (Guillermo Londoño) y las 5 etapas ("La idea de servicio",
  "Iniciando la operación", "Hacia la especialización", "El desarrollo", "Alianzas para crecer") sin año
  salvo que el texto lo diga.
- [ ] `testimonios.yaml`: los 4 de "Soy parte de HL Ingenieros", `autorizado: false`.
- [ ] `sitio.yaml`: fundación 1968; cifras de portada del código actual (más de 530 proyectos, más de
  4.000.000 HH al año, 7 países, 4 sedes); redes de "Redes sociales"; `asociadas` vacío (D1); los 19
  logos de cliente, con `nombre` cuando se lea en el logo (abrir cada imagen) y vacío si no.
- [ ] Páginas en Markdown:
  - `nosotros.es.md`: "Quiénes somos", misión, visión **sin la meta de ventas**, valores (las dos
    listas actuales, con `confirmar` en el texto de pendientes: lista única de valores);
  - `hse.es.md`: política de gestión integral, Reglas de Oro, PIENSA®, observadores de comportamiento,
    pare y asegure, pasaportes, reuniones de liderazgo, y los indicadores del PDF de ECOHL (−64 %
    frecuencia, −72 % severidad);
  - `datos`, `terminos` y `acreedores`: lo que exista en "Tratamiento de datos y políticas" (si no hay
    texto, solo el frontmatter y un párrafo "Pendiente"); `revisionJuridica: false`.
- [ ] Prueba:
  - `/pendientes/` cuenta 4 sedes, ≥ 3 certificaciones, 6 hitos, 4 testimonios, 1 sitio y 5 páginas;
  - los 4 testimonios aparecen como aviso de autorización;
  - las 3 páginas legales aparecen como pendientes de revisión jurídica;
  - ningún YAML ni Markdown de `src/content/` contiene un correo que no sea de buzón por función (regex
    sobre los archivos: solo se permiten direcciones que empiecen por un rol, como `info@`,
    `buzonetico@`).
- [ ] Commit: "F1: sedes, certificaciones, historia, testimonios, sitio y páginas".

### Tarea 6: Verificación de la fase y cierre

**Archivos:** modificar `tests/pantallas.spec.ts` (agregar `/pendientes/`), `CLAUDE.md` (registro de
etapas y siguiente paso) y `contenido/README.md` (remitir a `/pendientes/` como lista viva de insumos).

- [ ] Revisar `/pendientes/` completo en el navegador (plugin de Playwright): que cada pendiente sea
  accionable para quien lo reciba y que no haya falsos positivos. Contrastar con la lista "Datos que hay
  que pedir a HL" de `contenido/README.md`: todo lo de esa lista debe aparecer.
- [ ] `npm run build:lanzamiento` debe **fallar** con la lista de bloqueantes (es lo esperado hoy);
  copiar el número de bloqueantes al mensaje de commit.
- [ ] `npm run check`, `npm run build`, `npm test` y `npm run presupuesto` en verde.
- [ ] Lighthouse móvil sobre `/muestra/` (ahora con foto): ≥ 95 en las 4 categorías; anotar en el
  commit.
- [ ] Registrar en `CLAUDE.md` la "Etapa 5 (fecha): F1 · Contenido" con conteos y pendientes, y el
  siguiente paso: `docs/plan-f2.md` (F2 · Proyectos).
- [ ] Commit: "Etapa 5: F1 · Contenido"; merge fast-forward a `main` y borrar la rama.
