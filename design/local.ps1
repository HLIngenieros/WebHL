# Servidor local con PHP para probar el agente antes del hosting (D3, guía del agente §5).
# Compila el sitio, deja el PHP portátil listo para HTTPS (cacert.pem) y sirve dist/ en http://127.0.0.1:8080.
# Detener: Ctrl+C.
# Uso:  powershell -ExecutionPolicy Bypass -File design\local.ps1 [-SinCompilar] [-Puerto 8080]
param([switch]$SinCompilar, [int]$Puerto = 8080)
$ErrorActionPreference = 'Stop'

$repo = Split-Path -Parent $PSScriptRoot
$php = if ($env:HL_PHP) { $env:HL_PHP } else { Join-Path $env:USERPROFILE 'herramientas\php\php.exe' }
if (-not (Test-Path $php)) { throw "No encuentro php.exe en $php (define HL_PHP con la ruta)." }
$dirPhp = Split-Path -Parent $php
$ini = Join-Path $dirPhp 'php.ini'

# Certificados para que curl/openssl de PHP confíen en la API del modelo (el PHP portátil no los trae).
$ca = Join-Path $dirPhp 'cacert.pem'
if (-not (Test-Path $ca)) {
  Write-Host 'Descargando cacert.pem (curl.se)...'
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
  Invoke-WebRequest -UseBasicParsing -Uri 'https://curl.se/ca/cacert.pem' -OutFile $ca
}
$t = if (Test-Path $ini) { [IO.File]::ReadAllText($ini) } else { '' }
foreach ($clave in @('curl.cainfo', 'openssl.cafile')) {
  $linea = "$clave=`"$ca`""
  $patron = "(?m)^;?\s*$([regex]::Escape($clave))\s*=.*$"
  if ($t -match $patron) { $t = [regex]::Replace($t, $patron, $linea.Replace('$', '$$')) } else { $t += "`r`n$linea" }
}
[IO.File]::WriteAllText($ini, $t)

# Claves: privado/.env (agente.php lo busca junto a dist/).
$envFile = Join-Path $repo 'privado\.env'
if (-not (Test-Path $envFile)) { throw 'Falta privado\.env con la clave del modelo.' }
$proveedor = (Select-String -Path $envFile -Pattern '^PROVEEDOR=(.*)$').Matches.Groups[1].Value
$apiKey = (Select-String -Path $envFile -Pattern '^ANTHROPIC_API_KEY=(.*)$').Matches.Groups[1].Value
if ($proveedor -eq 'claude-code') { Write-Host 'Proveedor: claude-code (tu sesión de Claude en este equipo, sin clave).' }
elseif (-not $apiKey) { Write-Warning 'ANTHROPIC_API_KEY está vacía en privado\.env: el panel responderá "no disponible" hasta que la pegues.' }

Set-Location $repo
if (-not $SinCompilar) {
  Write-Host 'Compilando el sitio (npm run build)...'
  npm run build | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'La compilación falló.' }
}

Write-Host ''
Write-Host "Sitio y agente en http://127.0.0.1:$Puerto  (API: /api/agente.php). Detener: Ctrl+C."
Write-Host ''
& $php -c $ini -S "127.0.0.1:$Puerto" -t (Join-Path $repo 'dist')
