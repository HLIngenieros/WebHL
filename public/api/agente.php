<?php
// Agente "Hablar con HL" (D3, plan AG.3, guía del agente §9). Recibe la pregunta del panel, busca en el
// contenido del sitio (conocimiento.json, generado al compilar), en el catálogo de documentos y en las
// vacantes, y se la pasa al flujo 4 de Power Automate ("Ejecutar un prompt"). Devuelve la respuesta con
// su intención y solo las fuentes que el sitio publica. Los temas éticos se responden aquí, sin IA.
// No guarda conversaciones: solo cuenta preguntas por día (TOPE_DIARIO) y por IP.
// Prueba local: HL_ENV=<ruta del .env> HL_AGENTE_PRUEBA=1 php -S localhost:8080 -t dist (respuestas simuladas).

declare(strict_types=1);
date_default_timezone_set('America/Bogota');
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const SITIO = 'https://hlingenieros.com';
const CONTEXTO_MAX = 9000;   // caracteres de contenido del sitio por pregunta
const DOCUMENTOS_MAX = 3000; // caracteres del catálogo de documentos y vacantes
const POR_IP = 30;           // preguntas cada 10 minutos por IP

function salir(int $codigo, array $datos): never {
  http_response_code($codigo);
  echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

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

function linea(mixed $v, int $max): string {
  $s = is_scalar($v) ? (string) $v : '';
  $s = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $s) ?? '';
  return mb_substr(trim(preg_replace('/\s+/u', ' ', $s) ?? ''), 0, $max);
}

/** Minúsculas sin tildes, para comparar. */
function plano(string $s): string {
  return strtr(mb_strtolower($s), ['á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n']);
}

const VACIAS = ['que', 'qué', 'cual', 'cuales', 'como', 'cuando', 'donde', 'para', 'por', 'con', 'una', 'uno', 'unos', 'unas', 'los', 'las',
  'del', 'las', 'sus', 'son', 'tiene', 'tienen', 'hay', 'han', 'este', 'esta', 'estos', 'esas', 'ese', 'eso', 'mas', 'muy', 'pero', 'sobre',
  'hacen', 'hace', 'puede', 'pueden', 'quiero', 'saber', 'favor', 'gracias', 'hola', 'usted', 'ustedes', 'grupo',
  'hicieron', 'hacer', 'tienen', 'experiencia', 'trabajos', 'the', 'and', 'for', 'with', 'build', 'building', 'built', 'did', 'experience', 'what', 'which', 'how', 'when', 'where', 'does', 'have', 'has', 'are', 'you', 'your', 'can', 'about', 'please', 'group'];

/** Raíz tosca: sin la s del plural y recortada a 6 letras (sedes ≈ sede, certificado ≈ certificación). */
function raiz(string $w): string { return substr(strlen($w) > 3 && str_ends_with($w, 's') ? substr($w, 0, -1) : $w, 0, 6); }

/** Términos de búsqueda: palabras de 3+ letras sin vacías, en su raíz. */
function terminos(string $s): array {
  preg_match_all('/[a-z0-9]{3,}/', plano($s), $m);
  $t = array_filter($m[0], fn($w) => !in_array($w, VACIAS, true));
  return array_values(array_unique(array_map('raiz', $t)));
}

/** Respuesta fija de un estado (sin IA). */
function fijo(string $estado, string $lang, array $extra = []): never {
  salir(200, ['estado' => $estado, 'lang' => $lang] + $extra);
}

// ---------- Entrada ----------
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') salir(405, ['estado' => 'error', 'error' => 'Solo POST.']);
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) salir(413, ['estado' => 'error', 'error' => 'Mensaje demasiado largo.']);
$p = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($p)) salir(400, ['estado' => 'error', 'error' => 'El cuerpo no es JSON.']);

$lang = ($p['idioma'] ?? '') === 'en' ? 'en' : 'es';
$pregunta = linea($p['pregunta'] ?? '', 500);
if (mb_strlen($pregunta) < 2) salir(422, ['estado' => 'error', 'error' => $lang === 'es' ? 'Escriba su pregunta.' : 'Type your question.']);
$pagina = linea($p['pagina'] ?? '/', 120);
if (!preg_match('#^/[a-z0-9/_-]*$#', $pagina)) $pagina = '/';
$historial = [];
foreach (array_slice(is_array($p['historial'] ?? null) ? $p['historial'] : [], -6) as $h) {
  if (!is_array($h)) continue;
  $texto = linea($h['texto'] ?? '', 600);
  if ($texto !== '') $historial[] = [($h['de'] ?? '') === 'yo' ? 'yo' : 'hl', $texto];
}

// ---------- Buzón ético: se responde aquí, el mensaje nunca va al modelo ----------
$etico = '/\b(denunci|acoso|acosa|hostig|soborn|coima|fraude|corrupc|represali|extorsi|conflicto de interes|linea etica|buzon etico|reporte etico|abuso sexual|'
  . 'harass|brib|fraud|corrupt|retaliat|whistleblow|conflict of interest|ethics line|ethics report|misconduct|extortion)/';
if (preg_match($etico, plano($pregunta))) fijo('etico', $lang);

// ---------- Límites: por IP y por día ----------
$env = entorno();
$huella = sys_get_temp_dir() . '/hl-agente-' . hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . __FILE__);
$recientes = array_filter(array_map('intval', explode(',', (string) @file_get_contents($huella))), fn($x) => $x > time() - 600);
if (count($recientes) >= POR_IP) fijo('limite', $lang);
$recientes[] = time();
@file_put_contents($huella, implode(',', $recientes));

$tope = max(0, (int) ($env['TOPE_DIARIO'] ?? 400));
$privado = isset($env['_ruta']) ? dirname((string) $env['_ruta']) : sys_get_temp_dir();
$hoy = "$privado/agente-" . date('Ymd') . '.cnt';
if (!is_file($hoy)) foreach (glob("$privado/agente-*.cnt") ?: [] as $viejo) @unlink($viejo); // un contador por día
$contador = fopen($hoy, 'c+');
if ($contador && flock($contador, LOCK_EX)) {
  $usadas = (int) stream_get_contents($contador);
  if ($usadas >= $tope) { flock($contador, LOCK_UN); fijo('limite', $lang); }
  ftruncate($contador, 0); rewind($contador); fwrite($contador, (string) ($usadas + 1));
  flock($contador, LOCK_UN);
}

// ---------- Búsqueda en lo publicado ----------
$base = json_decode((string) @file_get_contents(__DIR__ . '/conocimiento.json'), true)['fragmentos'] ?? [];
$frag = array_values(array_filter($base, fn($f) => ($f['lang'] ?? '') === $lang));
$consulta = $pregunta;
for ($i = count($historial) - 1; $i >= 0; $i--) if ($historial[$i][0] === 'yo') { $consulta .= ' ' . $historial[$i][1]; break; }
$q = terminos($consulta);

// IDF: un término raro pesa más que uno que está en todas partes.
$n = max(1, count($frag));
$tokens = [];
$df = array_fill_keys($q, 0);
foreach ($frag as $k => $f) {
  preg_match_all('/[a-z0-9]{3,}/', plano($f['titulo'] . ' ' . $f['texto']), $m);
  $tokens[$k] = array_count_values(array_map('raiz', $m[0]));
  foreach ($q as $t) if (isset($tokens[$k][$t])) $df[$t]++;
}
$puntos = [];
foreach ($frag as $k => $f) {
  $s = 0.0;
  $tit = plano($f['titulo']);
  foreach ($q as $t) {
    if (!isset($tokens[$k][$t])) continue;
    $idf = log(1 + $n / (1 + $df[$t]));
    $s += $idf * (1 + log((float) $tokens[$k][$t])) + (str_contains($tit, $t) ? 2 * $idf : 0);
  }
  $ruta = (string) parse_url((string) $f['url'], PHP_URL_PATH);
  if ($s > 0 && $ruta === $pagina) $s += 1.5;
  if ($s > 0) $puntos[$k] = $s;
}
arsort($puntos);

// Siempre va lo básico (primer fragmento de Nosotros); después, lo más pertinente.
$inicio = $lang === 'es' ? '/nosotros/' : '/en/about/';
$elegidos = [];
foreach ($frag as $k => $f) if (parse_url((string) $f['url'], PHP_URL_PATH) === $inicio) { $elegidos[] = $k; break; }
foreach (array_keys($puntos) as $k) if (!in_array($k, $elegidos, true)) $elegidos[] = $k;
$contexto = '';
foreach ($elegidos as $k) {
  $f = $frag[$k];
  $bloque = "[{$f['titulo']} · {$f['url']}]\n{$f['texto']}\n\n";
  if (strlen($contexto) + strlen($bloque) > CONTEXTO_MAX) continue;
  $contexto .= $bloque;
}

// Documentos (catálogo vivo de Power Automate) y vacantes abiertas.
$docs = json_decode((string) @file_get_contents(__DIR__ . '/documentos.json'), true) ?: [];
$permitidas = [];
foreach ($base as $f) $permitidas[(string) parse_url((string) $f['url'], PHP_URL_PATH)] = (string) $f['titulo'];
$lineasDocs = [];
foreach ($docs as $d) {
  if (!is_array($d) || !isset($d['url'], $d['titulo'])) continue;
  if (!empty($d['vigenteHasta']) && $d['vigenteHasta'] < date('Y-m-d')) continue; // vencido: ni se cita ni se enlaza
  $permitidas[(string) $d['url']] = (string) $d['titulo'];
  $vig = !empty($d['vigenteHasta']) ? ($lang === 'es' ? ' · vigente hasta ' : ' · valid until ') . $d['vigenteHasta'] : '';
  $texto = "[{$d['titulo']} · " . SITIO . "{$d['url']}] " . trim(($d['descripcion'] ?? '') . ' · ' . ($d['datosClave'] ?? ''), ' ·') . $vig;
  $s = 0;
  foreach ($q as $t) if (str_contains(plano($texto), $t)) $s++;
  $lineasDocs[] = [$s, $texto];
}
usort($lineasDocs, fn($a, $b) => $b[0] <=> $a[0]);
$empleo = preg_match('/\b(empleo|vacante|trabaj|cargo|hoja de vida|postul|job|career|opening|position|vacanc|hiring)/', plano($consulta));
if ($empleo) {
  $vacantes = json_decode((string) @file_get_contents(__DIR__ . '/vacantes.json'), true) ?: [];
  $trabaje = $lang === 'es' ? '/trabaje-con-nosotros/' : '/en/careers/';
  foreach ($vacantes as $v) {
    if (!is_array($v) || empty($v['id']) || empty($v['titulo']) || (($v['cierre'] ?? '9999') < date('Y-m-d'))) continue;
    array_unshift($lineasDocs, [99, "[Vacante {$v['id']} · {$v['titulo']} · " . SITIO . "$trabaje?vacante={$v['id']}] " . linea(($v['sede'] ?? '') . ', ' . ($v['pais'] ?? '') . ' · cierre ' . ($v['cierre'] ?? ''), 200)]);
  }
}
$documentos = '';
foreach ($lineasDocs as [, $t]) {
  if (strlen($documentos) + strlen($t) + 1 > DOCUMENTOS_MAX) break;
  $documentos .= "$t\n";
}

$hist = implode("\n", array_map(fn($h) => ($h[0] === 'yo' ? ($lang === 'es' ? 'Visitante: ' : 'Visitor: ') : ($lang === 'es' ? 'Asistente: ' : 'Assistant: ')) . $h[1], $historial));

// ---------- Modelo (flujo 4) ----------
function simulado(string $pregunta, string $contexto, string $lang): string {
  if (preg_match('/\b(cotiz|precio|propuesta|asesor|quote|price|proposal|sales)/', plano($pregunta))) {
    return json_encode(['respuesta' => $lang === 'es' ? 'Con gusto. Para una cotización lo mejor es hablar con el equipo comercial.' : 'Gladly. For a quote, the sales team is the best contact.', 'intencion' => 'comercial', 'fuentes' => []]);
  }
  if (!preg_match('/\[([^\]]+) · (https?:[^\]\s]+)\]\n([^\n]+)/', $contexto, $m)) {
    return json_encode(['respuesta' => $lang === 'es' ? 'No encuentro eso en lo publicado por HL.' : "I can't find that in what HL has published.", 'intencion' => 'sin_respuesta', 'fuentes' => []]);
  }
  return "```json\n" . json_encode(['respuesta' => '(Respuesta simulada) ' . mb_substr($m[3], 0, 200), 'intencion' => 'informativa', 'fuentes' => [['titulo' => $m[1], 'url' => $m[2]], ['titulo' => 'Inventada', 'url' => 'https://ejemplo.com/x']]]) . "\n```";
}

if (getenv('HL_AGENTE_PRUEBA') === '1') {
  $crudo = simulado($pregunta, $contexto, $lang);
} else {
  $url = (string) ($env['AGENTE_URL'] ?? '');
  $clave = (string) ($env['CLAVE_AGENTE'] ?? '');
  if (!str_starts_with($url, 'https://') || strlen($clave) < 32 || !function_exists('curl_init')) fijo('sin_servicio', $lang);
  $cuerpo = json_encode(['idioma' => $lang, 'pagina' => $pagina, 'historial' => $hist, 'contexto' => $contexto ?: '(sin coincidencias)', 'documentos' => $documentos ?: '(ninguno)', 'pregunta' => $pregunta], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $crudo = '';
  for ($intento = 0; $intento < 2 && $crudo === ''; $intento++) {
    $c = curl_init($url);
    curl_setopt_array($c, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $cuerpo, CURLOPT_RETURNTRANSFER => true,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8', "X-HL-Clave: $clave"],
      CURLOPT_CONNECTTIMEOUT => 5, CURLOPT_TIMEOUT => 30]);
    $r = curl_exec($c);
    $codigo = (int) curl_getinfo($c, CURLINFO_RESPONSE_CODE);
    $errno = curl_errno($c);
    curl_close($c);
    if ($codigo === 200 && is_string($r)) $crudo = $r;
    elseif ($errno !== CURLE_COULDNT_CONNECT && $errno !== CURLE_COULDNT_RESOLVE_HOST) break; // solo se reintenta si no hubo conexión
  }
  if ($crudo === '') fijo('sin_servicio', $lang);
}

// La salida del prompt es JSON, a veces dentro de un bloque ```json o con texto alrededor.
$json = $crudo;
$a = strpos($crudo, '{');
$b = strrpos($crudo, '}');
if ($a !== false && $b !== false && $b > $a) $json = substr($crudo, $a, $b - $a + 1);
$r = json_decode($json, true);
if (!is_array($r) && is_string(json_decode($crudo))) $r = json_decode(json_decode($crudo), true); // texto JSON dentro de una cadena
if (!is_array($r) || !is_string($r['respuesta'] ?? null)) fijo('sin_servicio', $lang);

$intencion = in_array($r['intencion'] ?? '', ['informativa', 'comercial', 'etico', 'fuera_de_alcance', 'sin_respuesta'], true) ? $r['intencion'] : 'informativa';
if ($intencion === 'etico') fijo('etico', $lang);
$respuesta = mb_substr(trim(strip_tags($r['respuesta'])), 0, 1200);

// Solo fuentes que el sitio publica, como ruta relativa y sin repetir.
$fuentes = [];
foreach (is_array($r['fuentes'] ?? null) ? $r['fuentes'] : [] as $f) {
  if (!is_array($f)) continue;
  $u = (string) ($f['url'] ?? '');
  $partes = parse_url($u);
  if (!$partes || (isset($partes['host']) && !in_array($partes['host'], ['hlingenieros.com', 'www.hlingenieros.com'], true))) continue;
  $ruta = (string) ($partes['path'] ?? '');
  if (!isset($permitidas[$ruta]) && !preg_match('#^/(trabaje-con-nosotros|en/careers)/$#', $ruta)) continue;
  $destino = $ruta . (isset($partes['query']) && preg_match('/^vacante=V-\d+$/', $partes['query']) ? '?' . $partes['query'] : '');
  if (isset($fuentes[$destino])) continue;
  $fuentes[$destino] = ['titulo' => linea($f['titulo'] ?? '', 80) ?: ($permitidas[$ruta] ?? $ruta), 'url' => $destino, 'tipo' => str_ends_with($ruta, '.pdf') ? 'pdf' : 'pagina'];
  if (count($fuentes) === 3) break;
}

$salida = ['estado' => 'ok', 'lang' => $lang, 'respuesta' => $respuesta, 'intencion' => $intencion, 'fuentes' => array_values($fuentes)];
// En modo prueba se ve qué contexto se armó (títulos), para revisar la búsqueda.
if (getenv('HL_AGENTE_PRUEBA') === '1') { preg_match_all('/^\[([^\]]+)\]/m', $contexto . $documentos, $m); $salida['contexto'] = $m[1]; }
salir(200, $salida);
