# Insumos: la información difusa del Grupo HL

Aquí entra todo lo que llega suelto (PDF de trabajo, Word, Excel, fotos, presentaciones, correos guardados) y sale
convertido en dos cosas: **contenido del sitio** (`src/content/`, que el agente aprende al compilar) y **PDF
aprobados** en `public/documentos/<carpeta>/` (página Documentos). Sin SharePoint ni flujos (D3, Rev. 2).

## Cómo funciona

1. **Juan David sube los archivos** con la página de carga local (`/carga/` en `npm run dev`; plan AG.9) o los
   deja a mano en `insumos/entrada/`. Esa carpeta **no se sube a git**: puede traer información interna.
2. **Claude los lee y los registra** en la tabla de abajo (y en `insumos/entrada/estado.json` cuando exista la
   página de carga): qué es, qué dato sirve, a dónde va y qué falta.
3. **Lo útil se convierte:**
   - **Al sitio:** datos de proyectos, cifras, certificaciones, empresas del grupo, textos → `src/content/`
     (revisado y en ES/EN). Cada cambio cierra pendientes de `/pendientes/`.
   - **A PDF:** las piezas de `design/documentos.mjs` (portafolio, brochures, políticas, directorio) se regeneran con
     `node design/documentos.mjs` en `documentos-web/<carpeta>/` (borrador, con su `LEEME.md`). Un original que ya es
     un PDF oficial (un certificado de SGS) se copia tal cual.
4. **Juan David revisa** `documentos-web/`; lo que apruebe pasa a `public/documentos/<carpeta>/` y a la colección de
   documentos (plan AG.11).
5. Se compila y se despliega: la página Documentos lo muestra y el agente lo cita.

**Reglas:** nada con datos personales, tarifas, contratos, nómina ni información confidencial sale a la web; una
versión vieja se marca como tal y no reemplaza a la vigente; una cifra que se contradice se deja en pendientes
hasta que alguien de HL la confirme.

## Inventario

Estado: **Usado** (ya está en el sitio o en un PDF) · **Pendiente** (falta un dato o un original) · **Descartado**
(no se publica).

### Lo que ya está en el proyecto (revisión del 21-oct-2026)

| Origen | Qué es | Destino | Estado |
|---|---|---|---|
| `src/content/proyectos/` (22 fichas) | Proyectos con cliente, lugar, servicios, cifras y fotos | `Portafolio/HL-Portafolio-de-proyectos` (20; las 2 discretas no van, D6) | Usado · cifras de Columbus y proyectos 2020-2026 pendientes |
| `src/assets/proyectos/` (51 fotos de 10 proyectos) | Fotos de obra de 2020, ≤ 800 px | Portafolio (primera foto de cada ficha) | Usado · faltan fotos recientes y de 12 proyectos |
| `src/content/servicios/` (7) | Líneas con alcance, normas y aliados | `Brochures/HL-Lineas-de-servicio` y brochure corporativo | Usado |
| `src/content/sectores/` (6) | Sectores con su introducción | Brochure corporativo | Usado |
| `src/content/paginas/nosotros.*.md` | Quiénes somos, misión, visión, valores | Brochure corporativo | Usado · la lista de valores está por unificar |
| `src/content/paginas/hse.*.md` | Política SGI, Reglas de Oro, PIENSA®, prácticas, indicadores | `Politicas/HL-Politica-de-gestion-integral` y `Politicas/HL-Reglas-de-Oro-HSE` | Usado · indicadores HSE de 3 años pendientes |
| `src/content/sedes.yaml` | 4 sedes con dirección y teléfono | `Directorio/HL-Sedes-y-contacto` | Usado · dirección y celular de Panamá por confirmar |
| `src/content/certificaciones.yaml` + `src/assets/certificaciones/` | Sellos SGS (ISO 9001, 14001, 45001) y BPI de Icontec | Sellos en brochure y política | Usado · **los certificados en PDF faltan** (Calidad/SGS) |
| `public/documentos/politica-datos-M-TI-001-act-2.pdf` | Política oficial de tratamiento de datos | `Politicas/HL-Politica-de-tratamiento-de-datos-M-TI-001` (copia tal cual) | Usado |
| `public/documentos/acreedores-*.pdf` (3) | Convocatorias Ley 1116 | Se quedan en la página Acreedores (no son de la biblioteca) | Descartado para la biblioteca |
| `src/assets/grupo/` (5 logos) | ECOHL, HL Infraestructura, HL Ingenieros, HL Panamá, HL Rental | — | Pendiente · D1: qué empresas se muestran y la información de HL Infraestructura |
| `src/assets/clientes/` (18 logos) | Logos de clientes | — (en el sitio, no en PDF) | Pendiente · confirmar cuáles se mantienen |
| `src/content/testimonios.yaml` (4) | Testimonios | — | Pendiente · falta la autorización de cada uno |
| `contenido/institucional.md` | Texto extraído del PDF "Portafolio ECOHL" | Ya repartido en el sitio | Pendiente · el PDF original de ECOHL no está en el proyecto |
| `src/content/sitio.yaml` (cifras) | +530 proyectos y +4.000.000 HH al año (de 2020) | No se usan en los PDF | Pendiente · actualizar |
| `docs/manualmarcaold.pdf` | Manual de marca de HL Infraestructura | Referencia interna (monograma) | Descartado para la web |
| `docs/Diagnóstico…pdf`, `docs/Nuevo Sitio…html` | Documentos del proyecto | Internos | Descartado para la web |

### Lo que entre por `insumos/entrada/`

| Archivo | Qué es | Dato útil | Destino | Estado |
|---|---|---|---|---|
| *(vacío)* | | | | |
