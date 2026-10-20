<?php
// Envío de formularios (F4, especificación §5, D7). Valida con las mismas reglas que la isla (config.json,
// generado al compilar), filtra el spam, genera el radicado y envía al buzón de la función. Responde JSON
// a la isla y una página simple al formulario sin JavaScript. No guarda datos en el servidor.
// Prueba local: HL_FORM_PRUEBA=1 php -S localhost:8080 -t dist  (escribe los correos en el temporal).

declare(strict_types=1);
date_default_timezone_set('America/Bogota');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

$json = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
$lang = ($_POST['lang'] ?? '') === 'en' ? 'en' : 'es';

function responder(int $codigo, array $datos): never {
  global $json, $lang;
  http_response_code($codigo);
  if ($json) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
  }
  header('Content-Type: text/html; charset=utf-8');
  $es = $lang === 'es';
  $volver = $es ? '/contacto/' : '/en/contact/';
  $titulo = $datos['ok'] ? ($es ? 'Solicitud recibida' : 'Request received') : ($es ? 'No se pudo enviar' : 'Could not send');
  $cuerpo = $datos['ok']
    ? ($es ? 'Su radicado es' : 'Your reference number is') . ' <b>' . htmlspecialchars($datos['radicado']) . '</b>.'
    : htmlspecialchars($datos['error']) . ' ' . ($es ? 'Vuelva atrás y revise los datos.' : 'Go back and check your details.');
  echo "<!doctype html><html lang=\"$lang\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
    . "<title>$titulo · Grupo HL</title><body style=\"font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem\">"
    . "<h1>$titulo</h1><p>$cuerpo</p><p><a href=\"$volver\">" . ($es ? 'Volver' : 'Back') . '</a></p></body></html>';
  exit;
}
function falla(string $es, string $en, array $campos = [], int $codigo = 422): never {
  global $lang;
  responder($codigo, ['ok' => false, 'error' => $lang === 'es' ? $es : $en, 'campos' => $campos]);
}
/** Texto de una línea: sin controles ni saltos (evita inyección de cabeceras) y acotado. */
function utf8(mixed $v): string {
  $v = is_string($v) ? $v : '';
  return mb_check_encoding($v, 'UTF-8') ? $v : mb_convert_encoding($v, 'UTF-8', 'Windows-1252');
}
function linea(mixed $v, int $max = 200): string {
  return mb_substr(trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', utf8($v)) ?? ''), 0, $max);
}
function radicado(string $prefijo): string {
  return $prefijo . '-' . date('Ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') falla('Método no permitido.', 'Method not allowed.', [], 405);

$config = json_decode((string) @file_get_contents(__DIR__ . '/config.json'), true);
if (!is_array($config)) falla('El formulario no está disponible.', 'The form is unavailable.', [], 503);

$intencion = $_POST['intencion'] ?? '';
$def = is_string($intencion) ? ($config['formularios'][$intencion] ?? null) : null;
if (!$def) falla('Motivo no válido.', 'Invalid reason.');
$etico = $intencion === 'etico';
$prefijo = $etico ? 'BE' : 'HL';

// Spam: campo trampa lleno o envío en menos de 3 s. Se responde como si fuera un éxito para no dar pistas.
$t = (int) ($_POST['t'] ?? 0);
if (linea($_POST['sitio_web'] ?? '') !== '' || ($t > 0 && time() - $t < 3)) responder(200, ['ok' => true, 'radicado' => radicado($prefijo)]);

// Límite por IP: 5 envíos cada 10 minutos (archivo temporal con la huella de la IP, no la IP).
$huella = sys_get_temp_dir() . '/hl-form-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$recientes = array_filter(array_map('intval', explode(',', (string) @file_get_contents($huella))), fn ($x) => $x > time() - 600);
if (count($recientes) >= 5) falla('Demasiados envíos seguidos. Intente en unos minutos.', 'Too many submissions. Try again in a few minutes.', [], 429);

if (($_POST['ley'] ?? '') !== 'si') falla('Falta la autorización de tratamiento de datos.', 'Data processing authorization is missing.', ['ley']);
$anonimo = $etico && ($_POST['anonimo'] ?? '') === 'si';

$valores = [];
$malos = [];
$adjunto = null;
foreach ($def['campos'] as $c) {
  $id = $c['id'];
  $requerido = !$c['opcional'] && !($anonimo && $c['identifica']);
  if ($anonimo && $c['identifica']) continue;
  if ($c['tipo'] === 'file') {
    $f = $_FILES[$id] ?? null;
    $ok = $f && $f['error'] === UPLOAD_ERR_OK && $f['size'] <= $config['cvMax'] && is_uploaded_file($f['tmp_name'])
      && file_get_contents($f['tmp_name'], false, null, 0, 5) === '%PDF-';
    if ($ok) $adjunto = ['nombre' => preg_replace('/[^\w.-]+/u', '_', linea($f['name'], 80)) ?: 'hoja-de-vida.pdf', 'ruta' => $f['tmp_name']];
    elseif ($requerido) $malos[] = $id;
    continue;
  }
  $v = linea($_POST[$id] ?? '');
  if ($v === '' && $requerido) $malos[] = $id;
  elseif ($v !== '' && $c['tipo'] === 'email' && !filter_var($v, FILTER_VALIDATE_EMAIL)) $malos[] = $id;
  $valores[$id] = ['label' => $c['label'], 'valor' => $v];
}
// Postulación a una vacante del tablero (Vacantes.tsx): va de primera en el correo y en el asunto.
$vacante = $intencion === 'empleo' ? linea($_POST['vacante'] ?? '', 160) : '';
if ($vacante !== '') $valores = ['vacante' => ['label' => 'Vacante', 'valor' => $vacante]] + $valores;
$mensaje = trim(str_replace("\0", '', utf8($_POST['mensaje'] ?? '')));
$largo = mb_strlen($mensaje);
if ($largo < $config['mensaje']['min'] || $largo > $config['mensaje']['max']) $malos[] = 'mensaje';
if ($malos) falla('Revise los campos marcados.', 'Check the highlighted fields.', $malos);

$rad = radicado($prefijo);
$buzon = $config['buzones'][$intencion];
$correo = $valores['correo']['valor'] ?? '';
$quien = $anonimo ? 'Anónimo' : ($valores['empresa']['valor'] ?? $valores['nombre']['valor'] ?? '');

$texto = "Radicado: $rad\nFormulario: {$def['codigo']} · {$def['nombre']}\nFecha: " . date('Y-m-d H:i') . "\nIdioma: $lang\n";
if ($anonimo) $texto .= "Identidad: reporte anónimo\n";
foreach ($valores as $x) $texto .= "{$x['label']}: " . ($x['valor'] !== '' ? $x['valor'] : '—') . "\n";
$texto .= "\nMensaje:\n$mensaje\n\nAutorización Ley 1581: sí\n";

function enviar(string $para, string $asunto, string $texto, ?string $responder = null, ?array $adjunto = null): bool {
  $cab = ['From: Grupo HL <no-reply@hlingenieros.com>', 'MIME-Version: 1.0'];
  if ($responder) $cab[] = "Reply-To: $responder";
  if ($adjunto) {
    $limite = 'hl-' . bin2hex(random_bytes(8));
    $cab[] = "Content-Type: multipart/mixed; boundary=\"$limite\"";
    $cuerpo = "--$limite\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($texto))
      . "--$limite\r\nContent-Type: application/pdf; name=\"{$adjunto['nombre']}\"\r\nContent-Transfer-Encoding: base64\r\n"
      . "Content-Disposition: attachment; filename=\"{$adjunto['nombre']}\"\r\n\r\n" . chunk_split(base64_encode((string) file_get_contents($adjunto['ruta']))) . "--$limite--";
  } else {
    $cab[] = 'Content-Type: text/plain; charset=UTF-8';
    $cab[] = 'Content-Transfer-Encoding: base64';
    $cuerpo = chunk_split(base64_encode($texto));
  }
  $asunto = mb_encode_mimeheader($asunto, 'UTF-8');
  if (getenv('HL_FORM_PRUEBA')) {
    return (bool) file_put_contents(sys_get_temp_dir() . '/hl-correo-' . microtime(true) . '.eml', "To: $para\r\nSubject: $asunto\r\n" . implode("\r\n", $cab) . "\r\n\r\n$cuerpo");
  }
  return mail($para, $asunto, $cuerpo, implode("\r\n", $cab));
}

$asunto = "[{$def['codigo']} {$def['nombre']}] $rad" . ($vacante !== '' ? ' · ' . strtok($vacante, ' ') : '') . ($quien !== '' ? " · $quien" : '');
if (!enviar($buzon, $asunto, $texto, $correo !== '' && !$anonimo ? $correo : null, $adjunto)) {
  falla('No se pudo enviar. Intente de nuevo más tarde.', 'Could not send. Please try again later.', [], 500);
}
@file_put_contents($huella, implode(',', [...$recientes, time()]));

// Acuse al remitente: solo el radicado, nunca el contenido (protege los reportes éticos).
if ($correo !== '' && !$anonimo) {
  $acuse = $lang === 'es'
    ? "Recibimos su solicitud en HL Ingenieros S.A.\n\nRadicado: $rad\n\nConsérvelo para cualquier consulta. Este es un mensaje automático; no lo responda."
    : "We received your request at HL Ingenieros S.A.\n\nReference: $rad\n\nKeep it for any follow-up. This is an automatic message; please do not reply.";
  enviar($correo, ($lang === 'es' ? 'Radicado ' : 'Reference ') . $rad . ' · Grupo HL', $acuse);
}

responder(200, ['ok' => true, 'radicado' => $rad]);
