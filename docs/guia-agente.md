# Guía del agente "Hablar con HL" (D3)

21-oct-2026 · Rev. 0 · Para Juan David (Transformación Digital HL). Paso a paso para dejar el agente de
Copilot Studio configurado, alimentado y conectado al sitio, con Zoho SalesIQ solo para lo comercial.
El código de la conexión (pasos 4 y 5) va en una etapa aparte; esta guía dice qué se hace y en qué orden.

> **Ojo antes de empezar (punto 2.0):** un agente publicado **sin autenticación** no puede consultar
> SharePoint directamente, porque esa fuente busca con la cuenta del usuario que conversa. La biblioteca
> sigue siendo el lugar donde se suben los documentos, pero llegan al agente como **archivos sincronizados
> o cargados**, no como fuente "SharePoint" en vivo. Ver 2.0 y 3.3.

---

## 1. Reparto de responsabilidades

| Intención del visitante | Quién atiende | Salida |
|---|---|---|
| Quiénes somos, historia, grupo, valores | Agente | Respuesta + enlace a `/nosotros` |
| Proyectos, servicios, sectores, países | Agente | Respuesta + enlace a la ficha o página |
| HSE, certificaciones, políticas, brochures, directorio | Agente | Respuesta + documento de la biblioteca |
| Vacantes y hojas de vida | Agente | `/trabaje-con-nosotros` (tablero y formulario) |
| Proveedores | Agente | `/proveedores` |
| Acreedores (Ley 1116) | Agente | `/acreedores` |
| **Cotización, venta, prospecto, "quiero hablar con alguien"** | **SalesIQ** (asesor) | Paso a SalesIQ; fuera de horario, formulario de cotización de `/contacto` |
| Denuncia o tema ético | Nadie conversa del caso | Solo el enlace a `/buzon-etico` |

Reglas fijas del agente:
- Responde solo con el sitio y la biblioteca, y **siempre cita la fuente** (página o documento).
- **No cotiza, no da precios, no compromete plazos** ni habla de disponibilidad de equipos o personal.
- **No pide datos personales.** El registro de prospectos queda en un solo sitio: Zoho.
- Lleva a páginas del sitio (tarjetas con enlace) en vez de copiar textos largos.
- Responde en el idioma del visitante (ES o EN).
- Buzón ético: no pregunta detalles ni opina; da el enlace y recuerda que es confidencial y permite anónimo.

---

## 2. Biblioteca "Documentación Pública" en SharePoint

### 2.0 Cómo llega al agente
- **Opción A (recomendada):** conocimiento por **archivos sincronizados desde SharePoint** (Copilot Studio →
  Conocimiento → Agregar → *Archivos* / *SharePoint (sincronizar archivos)*, según la versión). Los archivos
  se copian e indexan en el entorno y se resincronizan periódicamente. **Verificar** en el entorno de HL que
  esta opción funcione con el agente en "Sin autenticación" (paso 3.6).
- **Opción B (respaldo):** cargar los PDF a mano en Conocimiento → *Cargar archivo* cada vez que cambie
  algo. Funciona sin autenticación con certeza; el costo es la disciplina de actualizar.
- **Descartado:** fuente "SharePoint" en vivo (exige que el visitante inicie sesión con cuenta de HL).

### 2.1 Crear el sitio
1. SharePoint → **Crear sitio** → *Sitio de comunicación* (no de equipo: no crea grupo de M365 ni Teams).
2. Nombre: `Documentación Pública HL`. Dirección sugerida: `/sites/documentacion-publica`.
3. Idioma: español. Propietarios: tú. Miembros: la otra persona que va a subir contenido.

### 2.2 Crear la biblioteca y las carpetas
1. En el sitio: **Nuevo → Biblioteca de documentos** → `Documentos públicos`.
2. Carpetas: `Certificaciones`, `Portafolio`, `Brochures`, `Formularios`, `Políticas`, `Directorio`.
3. Configuración de la biblioteca → **Control de versiones**: solo versiones principales, conservar 50.
   Sin aprobación de contenido por ahora (son 1-2 personas). Si se suman más, activar *Requerir aprobación*:
   el agente solo debe ver lo publicado.

### 2.3 Columnas (ayudan al agente y a ti)
| Columna | Tipo | Uso |
|---|---|---|
| `Área` | Opción (Comercial, HSE, Calidad, Compras, Talento Humano, Jurídica, Comunicaciones) | Quién responde por el documento |
| `Idioma` | Opción (ES, EN, ES/EN) | Para que el agente entregue el que corresponde |
| `Vigente hasta` | Fecha (opcional) | Certificaciones y políticas: revisar antes de que venza |
| `Descripción` | Texto de una línea | Qué es, en palabras simples; el agente la aprovecha |

Vista sugerida: "Por vencer" (filtro `Vigente hasta` ≤ hoy + 30 días).

### 2.4 Reglas para lo que se sube
- **Solo lo que puede ver cualquier persona en internet.** Nada de tarifas, borradores, datos de nómina,
  contratos ni correos personales (el directorio va con **buzones por función**, D7).
- PDF con texto seleccionable (no escaneados), nombre claro: `HL-Certificado-ISO-9001-2026.pdf`.
- Un documento por tema; si hay versión nueva, se **reemplaza** el archivo (no se deja el viejo al lado).
- Lo mismo que esté en el sitio (p. ej. la política SGI de `/hse`) debe decir lo mismo en la biblioteca.

### 2.5 Contenido inicial (lo que ya hay)
| Carpeta | Primeros archivos |
|---|---|
| Certificaciones | ISO 9001, 14001, 45001 vigentes (pendiente de HL: PDF) |
| Portafolio | PDF de ECOHL (`contenido/`), brochure corporativo cuando exista |
| Brochures | Uno por línea de servicio, si existen |
| Formularios | Inscripción de proveedores en PDF (si Compras lo usa además del formulario web) |
| Políticas | Política SGI, Política de tratamiento de datos (M-TI-001), Código de ética |
| Directorio | Sedes y buzones por función (una hoja) |

---

## 3. Configurar el agente en Copilot Studio

### 3.1 Datos generales
- Nombre: `Asistente HL` · Descripción: "Asistente público del sitio del Grupo HL".
- Idiomas: español (principal) e inglés (secundario).
- Modelo: el generativo por defecto del entorno; **orquestación generativa activada**.
- En *Configuración → IA generativa*: activar "usar solo el conocimiento agregado"; **desactivar el
  conocimiento general del modelo y la búsqueda web abierta** (que no invente ni responda de fuera).
- Moderación de contenido: **Alta**.

### 3.2 Instrucciones (copiar y pegar)

```
Eres el Asistente HL, el asistente público del sitio web del Grupo HL (antes HL Ingenieros; razón social
HL Ingenieros S.A.), contratista colombiano de construcción, montaje electromecánico y fabricación para la
industria, fundado en 1968.

Tono: amable, claro y breve. Trata de "usted" en español. Responde en el idioma en que te escriben
(español o inglés de EE. UU.). Máximo 3 a 5 frases por respuesta; si hay más, lleva al enlace.

Fuentes: responde SOLO con el conocimiento agregado (el sitio del Grupo HL y la Documentación Pública).
Cita siempre la fuente: la página del sitio o el nombre del documento. Si no está en las fuentes, dilo con
franqueza y ofrece la página de Contacto. Nunca inventes cifras, clientes, fechas ni certificaciones.

Límites:
- No cotizas, no das precios ni rangos, no comprometes plazos ni disponibilidad.
- No pides ni guardas datos personales (nombre, correo, teléfono, cédula).
- No opinas sobre clientes, competidores, procesos judiciales ni temas de la Ley 1116 más allá de lo
  publicado en la página de Acreedores.
- No das asesoría legal, técnica de ingeniería ni de seguridad para un caso particular.

Derivación según intención:
- Cotización, compra, propuesta comercial, "quiero hablar con un asesor" o "con una persona": usa el tema
  "Pasar a asesor". No intentes resolverlo tú.
- Proveedores: lleva a /proveedores (en inglés /en/suppliers/).
- Empleo u hojas de vida: lleva a /trabaje-con-nosotros (en inglés /en/careers/).
- Acreedores: lleva a /acreedores (en inglés /en/creditors/).
- Denuncias, fraude, acoso, conflicto de interés o cualquier tema ético: usa el tema "Buzón ético". No
  preguntes detalles del caso ni des opinión.

Formato: texto simple, sin tablas. Cuando lleves a una página, da el enlace completo del sitio.
```

### 3.3 Conocimiento
| Fuente | Antes del lanzamiento | Después del lanzamiento |
|---|---|---|
| Sitio del Grupo HL | **Archivos generados al compilar** (un `.md` por idioma con todas las páginas y su URL; se suben en Conocimiento → Cargar archivo). Se generan en la etapa de código | **Sitio web público** `https://www.hlingenieros.com/` (requiere que Bing lo haya indexado; dar unos días tras el lanzamiento y enviar el sitemap a Bing Webmaster Tools). Se retiran los archivos compilados |
| Documentación Pública | Archivos sincronizados desde la biblioteca (2.0 A) o cargados a mano (2.0 B) | Igual |

Al agregar cada fuente, escribir una **descripción** precisa (la orquestación la usa para elegir):
- Sitio: "Contenido público del Grupo HL: empresa, proyectos con cifras, servicios, sectores, HSE, sedes,
  vacantes, proveedores y acreedores."
- Biblioteca: "Documentos públicos descargables: certificaciones ISO, políticas, brochures, portafolio,
  formularios y directorio de buzones."

### 3.4 Temas (topics)
Mantener los del sistema (Saludo, Despedida, Escalar, Sin coincidencias, Error) y ajustar:

| Tema | Disparador (descripción para la orquestación) | Qué hace |
|---|---|---|
| **Pasar a asesor** | El visitante quiere cotizar, comprar, recibir una propuesta, ser contactado por ventas o hablar con una persona | Mensaje corto ("Le comunico con el equipo comercial") + **evento** `hl.salesiq` con la pregunta original y el idioma (ver 5). No hace nada más |
| **Buzón ético** | Denuncia, fraude, soborno, acoso, conflicto de interés, represalias | Mensaje fijo: "Para su tranquilidad, este tema se atiende solo por el Buzón ético, que es confidencial y permite reportes anónimos." + tarjeta con enlace a `/buzon-etico` (o `/en/ethics-line/`) |
| **Escalar** (sistema) | Redirigir a **Pasar a asesor** | — |
| **Sin coincidencias** (sistema) | — | "No encuentro eso en lo publicado por HL." + tarjeta a Contacto |

Tarjetas: **Adaptive Card** sencilla (título, una línea, botón `Action.OpenUrl`). La interfaz del sitio
las dibuja con su propio estilo (no usa Web Chat).

### 3.5 Seguridad y canal
1. *Configuración → Seguridad → Autenticación*: **Sin autenticación**.
2. *Seguridad → Seguridad web*: no hace falta secreto si se usa el **punto de conexión de token** (3.5.4).
3. *Canales*: publicar en **Sitio web personalizado / Aplicación móvil** (Direct Line).
4. Copiar el **Token Endpoint** (Canales → Aplicación móvil). Es una URL pública que entrega un token de
   Direct Line de corta duración; el navegador lo pide al abrir el panel. No hay secreto en el sitio.
5. Publicar el agente (botón **Publicar**) después de cada cambio de instrucciones, temas o conocimiento.

### 3.6 Pruebas en el panel de Copilot Studio (antes de conectar)
Probar en ES y EN y anotar fallas:
- "¿Cuántos años tiene HL?" → 58 (o la cifra del año), con fuente `/nosotros`.
- "Proyectos de cemento en Colombia" → lista corta + enlace al explorador o fichas.
- "¿Tienen ISO 45001?" → sí/no según la biblioteca, con el documento citado (**prueba de 2.0 A**).
- "¿Cuánto cuesta un montaje de 500 t?" → no da cifra, dispara **Pasar a asesor**.
- "Quiero denunciar a un supervisor" → **Buzón ético**, sin preguntas.
- "¿Quién ganó el partido ayer?" → no responde de fuera.
- "Mi correo es x@y.com, llámenme" → no lo guarda; pasa a asesor.

### 3.7 Pendientes con TI (bloquean la publicación)
- **Capacidad de mensajes** (Copilot Credits) para visitantes anónimos: las licencias de M365 Copilot no
  cubren usuarios externos; se necesita paquete de capacidad o pago por uso en el entorno.
- Entorno de Power Platform donde vive el agente (producción, no el predeterminado de pruebas).
- Si 2.0 A no funciona sin autenticación, quedarse con 2.0 B.

---

## 4. Conexión con el sitio (etapa de código)

La interfaz ya existe: [src/components/Agente.tsx](../src/components/Agente.tsx) (panel, mensajes,
tarjetas de derivación, carga al primer clic). Hoy responde con un guion de muestra. Cambios:

1. **Configuración:** el Token Endpoint va en `sitio.yaml` (→ `/api/config.json`), no en el código.
2. **Conexión:** Direct Line por REST + WebSocket con `fetch` y `WebSocket` nativos (sin
   `botframework-webchat` ni `directlinejs`: pesan cientos de KB y rompen el presupuesto de 30 KB gz).
   Flujo: pedir token → `POST /conversations` → abrir `streamUrl` → enviar `POST /activities` → pintar
   cada actividad `message` del agente.
3. **Tarjetas:** traducir las Adaptive Cards simples (título, texto, `Action.OpenUrl`) a las tarjetas
   `ag-derivar` que ya hay. Lo que no se reconozca, como texto.
4. **Eventos:** la actividad `event` con nombre `hl.salesiq` dispara el paso a SalesIQ (5).
5. **Idioma:** enviar `locale` (`es-CO` / `en-US`) en cada actividad.
6. **Fallas:** si no hay token o se cae la conexión, el panel muestra las tarjetas actuales (WhatsApp,
   correo, teléfono, formularios). Nunca un panel vacío.
7. **Fuentes:** las citas del agente se muestran como el "Fuente: …" actual.
8. Quitar "Vista previa · sin conectar" y la nota de respuestas de muestra.
9. Generar al compilar los archivos de conocimiento de 3.3 (`dist/conocimiento/sitio-es.md` y `-en.md`,
   fuera del sitemap y con `noindex`).

---

## 5. Paso a Zoho SalesIQ (etapa de código)

Copilot Studio no tiene traspaso nativo a Zoho; el paso lo hace la interfaz del sitio:

1. En SalesIQ: crear (o usar) el **widget del sitio**, un **departamento "Comercial"**, horario de oficina
   (L-V, hora de Colombia) y los asesores. Desactivar el Zobot y el botón flotante propio de SalesIQ: el
   único botón es "Hablar con HL".
2. Al recibir `hl.salesiq`, la interfaz **carga el script de SalesIQ en ese momento** (no en la carga de la
   página: protege el presupuesto de rendimiento y la privacidad).
3. Consulta si hay asesores conectados (API JavaScript de SalesIQ; confirmar el método exacto en su
   documentación al implementar).
   - **Con asesor:** abre el chat de SalesIQ con el departamento Comercial y le pasa como primera pregunta
     lo que el visitante escribió al agente, más idioma y página de origen. El panel del agente se cierra.
   - **Sin asesor (fuera de horario):** el agente lo dice con franqueza y muestra la tarjeta del
     **formulario de cotización** (`/contacto` · `/en/contact/`), que entrega radicado y llega al buzón
     comercial (D7). Como alternativas, WhatsApp y teléfono.
4. SalesIQ pide los datos del prospecto y su autorización (Ley 1581) dentro de su propio chat; queda
   registrado en Zoho. Verificar que el aviso de privacidad de SalesIQ enlace a `/legal/datos`.
5. Cookies: SalesIQ pone cookies propias solo cuando se carga; mencionarlo en la política de datos.

---

## 6. Orden de trabajo y estado

| # | Paso | Quién | Estado |
|---|---|---|---|
| 1 | Crear sitio y biblioteca (2.1-2.3) | Juan David | Pendiente |
| 2 | Subir contenido inicial (2.5) | Juan David | Pendiente (faltan PDF de HL) |
| 3 | Instrucciones, configuración y temas (3.1, 3.2, 3.4) | Juan David | Pendiente |
| 4 | Conocimiento: biblioteca (2.0 A o B) | Juan David | Pendiente |
| 5 | Capacidad para anónimos y entorno (3.7) | TI | Pendiente |
| 6 | Archivos de conocimiento del sitio + conexión Direct Line (4) | Etapa de código | Pendiente |
| 7 | Configurar SalesIQ (5.1) y paso a SalesIQ (5.2-5.5) | Juan David + etapa de código | Pendiente |
| 8 | Pruebas (3.6) y publicación | Juan David | Pendiente |
| 9 | Tras el lanzamiento: cambiar a sitio web público como fuente (3.3) | Juan David | F6 |
