<?php
// Documentos públicos (D3, plan AG.2, guía del agente §5-§7). Recibe de Power Automate los PDF de la
// biblioteca "Documentos públicos" de SharePoint, los guarda en /documentos/<carpeta>/ y mantiene el
// catálogo /api/documentos.json, que leen la página Documentos y agente.php. Solo acepta llamadas con la
// clave CLAVE_DOCUMENTOS del .env privado (fuera de public_html). Nunca toca los PDF de la raíz de
// /documentos/ (Acreedores, política de datos), que vienen con el sitio.
// Prueba local: HL_ENV=<ruta del .env> php -S localhost:8080 -t dist

declare(strict_types=1);
date_default_timezone_set('America/Bogota');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

/** Carpeta de la biblioteca → carpeta pública. El orden es el de la página. */
const CARPETAS = ['certificaciones', 'portafolio', 'brochures', 'formularios', 'politicas', 'directorio'];
const MAX_BYTES = 15 * 1024 * 1024;

function salir(int $codigo, array $datos): never {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function falla(int $codigo, string $error): never { salir($codigo, ['ok' => false, 'error' => $error]); }

/** .env privado: HL_ENV, o hl-privado/.env junto a public_html, o privado/.env del repo (local). */
function entorno(): array {
  $raiz = dirname((string) ($_SERVER['DOCUMENT_ROOT'] ?? __DIR__ . '/..'));
  foreach ([getenv('HL_ENV') ?: '', "$raiz/hl-privado/.env", "$raiz/privado/.env"] as $ruta) {
    if ($ruta !== '' && is_file($ruta)) {
      $v = parse_ini_file($ruta, false, INI_SCANNER_RAW);
      if (is_array($v)) return $v + ['_ruta' => $ruta];
    }
  }
  return [];
}

/** Texto de una línea, sin controles, acotado. */
function linea(mixed $v, int $max): string {
  $s = is_scalar($v) ? (string) $v : '';
  $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';
  return mb_substr(trim(preg_replace('/\s+/u', ' ', $s) ?? ''), 0, $max);
}
function sinTildes(string $s): string {
  return strtr($s, ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
    'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ü' => 'U', 'Ñ' => 'N']);
}
function slug(string $s): string {
  $s = strtolower(sinTildes($s));
  $s = trim(preg_replace('/[^a-z0-9]+/', '-', $s) ?? '', '-');
  return substr($s, 0, 80) ?: 'documento';
}
/** Escribe un archivo de una vez (temporal + rename) para que nadie lea uno a medias. */
function escribir(string $ruta, string $datos): void {
  $tmp = $ruta . '.' . bin2hex(random_bytes(4)) . '.tmp';
  if (file_put_contents($tmp, $datos) === false || !rename($tmp, $ruta)) { @unlink($tmp); falla(500, 'No se pudo escribir en el servidor.'); }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') falla(405, 'Solo POST.');
$env = entorno();
$clave = (string) ($env['CLAVE_DOCUMENTOS'] ?? '');
if (strlen($clave) < 32) falla(503, 'Falta la configuración privada.');
if (!hash_equals($clave, (string) ($_SERVER['HTTP_X_HL_CLAVE'] ?? ''))) falla(401, 'Clave inválida.');
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > MAX_BYTES * 1.4 + 65536) falla(413, 'El archivo supera 15 MB.');

$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p)) falla(400, 'El cuerpo no es JSON.');
$accion = (string) ($p['accion'] ?? '');

$docroot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__)), '/\\');
$base = "$docroot/documentos";
$catalogo = __DIR__ . '/documentos.json';

// Un solo cambio a la vez: el bloqueo vive junto al .env, fuera de la carpeta pública.
$bloqueo = fopen(dirname((string) $env['_ruta']) . '/documentos.lock', 'c');
if (!$bloqueo || !flock($bloqueo, LOCK_EX)) falla(503, 'Servidor ocupado; reintente.');

$docs = is_file($catalogo) ? (json_decode((string) file_get_contents($catalogo), true) ?: []) : [];
$porId = [];
foreach ($docs as $d) if (isset($d['id'])) $porId[(string) $d['id']] = $d;

/** Borra un PDF solo si está dentro de una carpeta administrada (nunca la raíz de /documentos/). */
function quitar(string $base, string $url): void {
  if (!preg_match('#^/documentos/(' . implode('|', CARPETAS) . ')/[a-z0-9-]+\.pdf$#', $url)) return;
  @unlink($base . substr($url, strlen('/documentos')));
}

function guardarCatalogo(string $catalogo, array $porId): int {
  $docs = array_values($porId);
  usort($docs, fn($a, $b) => [array_search($a['carpeta'], CARPETAS), $a['titulo']] <=> [array_search($b['carpeta'], CARPETAS), $b['titulo']]);
  escribir($catalogo, json_encode($docs, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
  return count($docs);
}

$ahora = date('YmdHis');

switch ($accion) {
  case 'guardar':
    $id = (string) ($p['id'] ?? '');
    if (!preg_match('/^\d{1,10}$/', $id)) falla(422, 'Falta el ID del archivo.');
    $carpeta = slug(linea($p['carpeta'] ?? '', 40));
    if (!in_array($carpeta, CARPETAS, true)) falla(422, 'El archivo no está en una de las 6 carpetas.');
    $archivo = linea($p['archivo'] ?? '', 160);
    if (!preg_match('/\.pdf$/i', $archivo)) falla(422, 'Solo se publican PDF.');
    $pdf = base64_decode((string) ($p['contenido'] ?? ''), true);
    if ($pdf === false || $pdf === '') falla(422, 'No llegó el contenido del archivo.');
    if (strlen($pdf) > MAX_BYTES) falla(413, 'El archivo supera 15 MB.');
    if (!str_starts_with($pdf, '%PDF-')) falla(422, 'El archivo no es un PDF válido.');

    $nombre = slug(preg_replace('/\.pdf$/i', '', $archivo) ?? '');
    $url = "/documentos/$carpeta/$nombre.pdf";
    foreach ($porId as $otro) if ($otro['url'] === $url && (string) $otro['id'] !== $id) { $url = "/documentos/$carpeta/$nombre-$id.pdf"; break; }
    if (isset($porId[$id]) && $porId[$id]['url'] !== $url) quitar($base, $porId[$id]['url']);

    if (!is_dir("$base/$carpeta") && !mkdir("$base/$carpeta", 0755, true)) falla(500, 'No se pudo crear la carpeta.');
    escribir($base . substr($url, strlen('/documentos')), $pdf);

    $idioma = strtoupper(linea($p['idioma'] ?? '', 5));
    $vig = linea($p['vigenteHasta'] ?? '', 40);
    $mod = linea($p['modificado'] ?? '', 40);
    $porId[$id] = [
      'id' => $id,
      'carpeta' => $carpeta,
      'titulo' => linea($p['titulo'] ?? '', 120) ?: linea(str_replace(['-', '_'], ' ', preg_replace('/\.pdf$/i', '', $archivo) ?? ''), 120),
      'archivo' => $archivo,
      'url' => $url,
      'idioma' => in_array($idioma, ['ES', 'EN', 'ES/EN'], true) ? $idioma : 'ES',
      'area' => linea($p['area'] ?? '', 40),
      'emisor' => linea($p['emisor'] ?? '', 60),
      'codigo' => linea($p['codigo'] ?? '', 40),
      'vigenteHasta' => $vig !== '' && strtotime($vig) ? date('Y-m-d', (int) strtotime($vig)) : '',
      'descripcion' => linea($p['descripcion'] ?? '', 200),
      'datosClave' => linea($p['datosClave'] ?? '', 600),
      'bytes' => strlen($pdf),
      'actualizado' => $mod !== '' && strtotime($mod) ? date('Y-m-d', (int) strtotime($mod)) : date('Y-m-d'),
      'lote' => linea($p['lote'] ?? '', 20),
      'recibido' => $ahora,
    ];
    salir(200, ['ok' => true, 'accion' => 'guardar', 'id' => $id, 'url' => $url, 'total' => guardarCatalogo($catalogo, $porId)]);

  case 'borrar':
    $id = (string) ($p['id'] ?? '');
    if (isset($porId[$id])) { quitar($base, $porId[$id]['url']); unset($porId[$id]); }
    salir(200, ['ok' => true, 'accion' => 'borrar', 'id' => $id, 'total' => guardarCatalogo($catalogo, $porId)]);

  case 'inicio':
    salir(200, ['ok' => true, 'accion' => 'inicio', 'total' => count($porId)]);

  case 'fin':
    // El lote es la hora de inicio (yyyyMMddHHmmss, UTC en Power Automate). Sobra lo que no llegó en el lote
    // y tampoco se recibió después de que empezó (lo que publique el flujo 1 mientras tanto se queda).
    $lote = linea($p['lote'] ?? '', 20);
    if (!preg_match('/^\d{14}$/', $lote)) falla(422, 'Lote inválido.');
    $inicio = (int) (DateTime::createFromFormat('YmdHis', $lote, new DateTimeZone('UTC'))?->getTimestamp() ?? 0);
    $quitados = 0;
    foreach ($porId as $id => $d) {
      $recibido = (int) (DateTime::createFromFormat('YmdHis', (string) $d['recibido'], new DateTimeZone('America/Bogota'))?->getTimestamp() ?? 0);
      if ($d['lote'] !== $lote && $recibido < $inicio) { quitar($base, $d['url']); unset($porId[$id]); $quitados++; }
    }
    // PDF huérfanos en las carpetas administradas (por ejemplo, de un borrado que falló).
    $vivos = array_column($porId, 'url');
    foreach (CARPETAS as $c) foreach (glob("$base/$c/*.pdf") ?: [] as $f) {
      if (!in_array("/documentos/$c/" . basename($f), $vivos, true)) { @unlink($f); $quitados++; }
    }
    salir(200, ['ok' => true, 'accion' => 'fin', 'quitados' => $quitados, 'total' => guardarCatalogo($catalogo, $porId)]);

  default:
    falla(422, 'Acción desconocida.');
}
