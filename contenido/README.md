# Contenido extraído del sitio actual

Inventario de hlingenieros.com tomado el **2026-10-14**: el HTML de las 85 páginas del sitemap, la API de
WordPress (fechas y 291 medios públicos) y el PDF "Portafolio ECOHL". El texto se copia tal cual; los
comentarios van marcados como **Nota**.

| Archivo | Qué tiene |
|---|---|
| [proyectos.md](proyectos.md) | Las 16 fichas de proyecto con cifras, fotos disponibles, faltantes y notas |
| [institucional.md](institucional.md) | Textos del resto del sitio y del PDF de ECOHL, ordenados según la jerarquía nueva |
| [inventario.csv](inventario.csv) | 101 URLs (85 páginas + 16 etiquetas): idioma, tipo, palabras propias, fechas, sección de destino y acción (301 o 410) |
| [medios.csv](medios.csv) | 144 archivos útiles: fotos de proyecto, certificaciones, logos, testimonios, PDF |

**Desde F1 (2026-10-15)** este contenido vive en el sitio como colecciones (`src/content/`) y los medios en
`src/assets/`. Esta carpeta queda como archivo de la extracción. La lista viva de lo que falta es la
página `/pendientes/` (`npm run dev`), generada al compilar; la lista de abajo es la original.

## Hallazgos

- **Hay poco contenido real.** Fuera de las fichas, solo Grupo HL (~900 palabras) y la página de
  Gestión Integral (~900) tienen texto propio. Las 9 páginas de servicio tienen entre 50 y 100 palabras
  cada una.
- **El sitio no tiene blog** (la API reporta 0 entradas). La sección 7 (Noticias) arranca sin contenido.
- **Las cifras de las fichas coinciden entre ES y EN.** Ninguna ficha tiene año ni rol de HL. 6 fichas
  no tienen fotos y 3 no tienen cantidades de obra.
- **Las galerías de fotos están rotas.** Las fichas muestran el código de la galería como texto, pero las
  fotos existen en la biblioteca de medios: 51 fotos de 10 proyectos, a 1200×800 y sin pie de foto.
- **Los contadores sí tienen valor en el código:** más de 4.000.000 HH al año, más de 530 proyectos,
  desde 1968.
- **Columbus: probablemente no hay contradicción.** El PDF de ECOHL habla de *fabricación* (12.000 t de
  estructura y 10.500 t de equipos en 18 meses) y la ficha web, del proyecto completo (42 meses). Falta
  confirmarlo.
- **Certificaciones:** el texto solo menciona SST, pero hay sellos SGS ISO 9001, 14001 y 45001 subidos
  en 2025.
- **Empresas del grupo:** la lista cambia por idioma. En español aparece HL Rental; en inglés aparecen
  Megacranes y Aktino. **Aclarado (20-oct):** Megacranes y Aktino ya salieron del grupo; HL Panamá y HL
  Rental siguen, con protagonismo muy reducido; HL Infraestructura es la que ejecuta las obras y tendrá el
  protagonismo (falta su información).
- **Presencia:** la portada nombra 7 países, pero no hay fichas de Costa Rica ni de Bolivia.
- **Datos que no se deben reutilizar:** correos personales en Contacto, el celular personal en el PDF
  de ECOHL y la meta de ventas en la visión.

## Datos que hay que pedir a HL

1. Año (inicio y fin) y rol de HL en los 16 proyectos; cantidades de Impala, Chipirón y Chevron.
2. Fotos de Continental Gold, Termonorte, Chevron, Impala, Chipirón y Unilever, y pies de foto para las 51
   existentes (o fotos nuevas en mejor resolución).
3. Confirmar Columbus (fabricación vs. proyecto), las cantidades duplicadas de Molienda OHL y el silo
   de Chimborazo (¿de crudo o de cemento?).
4. Años de las 5 etapas de la historia, para la línea del tiempo.
5. Certificados vigentes en PDF y lista única de valores (hoy hay una de 5 y otra de 6).
6. Lista vigente de empresas del grupo (D1) y nombres de los 19 logos de clientes. **HL Infraestructura**
   (la consigue Juan David): desde cuándo existe, qué hace, con qué personal y equipos, y qué proyectos ejecutó.
7. Proyectos 2020-2026 y casos de Costa Rica y Bolivia, si existen.
8. Si los 4 testimonios siguen vigentes y autorizados.

### Contacto, vacantes y agente (F4, 20-oct · en espera)

Todo figura también en `/pendientes/` (sale de `confirmar` en `src/content/sitio.yaml`) y bloquea
`npm run build:lanzamiento`.

| # | Pendiente | Quién | Bloquea |
|---|---|---|---|
| 9 | Buzones por función (D7): confirmar o crear `cotizaciones@`, `proveedores@`, `talento@` y `buzonetico@` como buzones compartidos de M365 | TI | Envío de formularios |
| 10 | Remitente `no-reply@hlingenieros.com` autorizado en SPF/DKIM del dominio y prueba de `mail()` en el hosting | TI | Que los correos no caigan en spam |
| 11 | Acceso al hosting (FTP/SFTP o panel): publicar el sitio y permitir que Power Automate escriba `/api/vacantes.json` | TI | Lanzamiento y vacantes |
| 12 | Lista "Vacantes" en SharePoint (campos en `docs/plan-f4.md` §F4.7) y flujo de Power Automate que la publica | Talento Humano + Transformación Digital | Vacantes en vivo |
| 13 | Número de WhatsApp comercial al que deriva el agente (¿uno por país?) | Comercial | Derivación a WhatsApp |
| 14 | Capacidad de mensajes de Copilot Studio para visitantes anónimos del sitio (D3) | TI | Conectar el agente |
| 15 | Construir y publicar el agente en Copilot Studio (canal web sin autenticación, Direct Line) | Transformación Digital | Conectar el agente |
| 16 | ¿El celular +507 6781 0368 de Panamá es institucional o personal? | Panamá | Publicar ese teléfono |
