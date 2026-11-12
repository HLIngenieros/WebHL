// PHP del agente (plan AG.3) contra un PHP real, sobre una copia temporal de dist/api y dist/documentos (así no
// pisa lo que leen las otras pruebas en paralelo). Corre solo si HL_PHP apunta a php.exe (p. ej. C:\Users\jurbina\herramientas\php\php.exe): el hosting tiene PHP 8.3, el equipo de pruebas no siempre.
import { test, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const PHP = process.env.HL_PHP ?? '';
const PUERTO = 4330;
const BASE = `http://127.0.0.1:${PUERTO}`;
let DIST = ''; // raíz temporal que sirve el PHP

test.describe.configure({ mode: 'serial' });
test.skip(!PHP, 'Sin HL_PHP: se omiten las pruebas de PHP');

let php: ChildProcess;
test.beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'hl-php-'));
  DIST = join(dir, 'raiz');
  for (const d of ['api', 'documentos']) cpSync(join(process.cwd(), 'dist', d), join(DIST, d), { recursive: true });
  rmSync(join(DIST, 'api', 'documentos.json'), { force: true });
  const env = join(dir, '.env');
  writeFileSync(env, `# prueba (con comentario: el .env real los lleva)\nAGENTE_URL=\nTOPE_DIARIO=5\n`);
  const ini = join(dirname(PHP), 'php.ini');
  php = spawn(PHP, [...(existsSync(ini) ? ['-c', ini] : []), '-S', `127.0.0.1:${PUERTO}`, '-t', DIST], {
    env: { ...process.env, HL_ENV: env, HL_AGENTE_PRUEBA: '1', HL_FORM_PRUEBA: '1' }, stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
});
test.afterAll(() => { php?.kill(); });

const preguntar = (pregunta: string, extra: object = {}) =>
  fetch(`${BASE}/api/agente.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pregunta, idioma: 'es', pagina: '/', historial: [], ...extra }) });

test.describe('agente.php (respuestas simuladas)', () => {
  test('rechaza otro origen', async () => {
    const r = await fetch(`${BASE}/api/agente.php`, { method: 'POST', headers: { 'Content-Type': 'text/plain', Origin: 'https://otro.example' }, body: JSON.stringify({ pregunta: 'hola', idioma: 'es' }) });
    expect(r.status).toBe(403);
  });
  test('valida la entrada', async () => {
    expect((await fetch(`${BASE}/api/agente.php`)).status).toBe(405);
    expect((await preguntar(' ')).status).toBe(422);
  });

  test('el tema ético se responde sin IA', async () => {
    expect(await (await preguntar('Quiero denunciar a un supervisor por acoso')).json()).toMatchObject({ estado: 'etico' });
    expect(await (await preguntar('I want to report harassment', { idioma: 'en' })).json()).toMatchObject({ estado: 'etico', lang: 'en' });
  });

  test('responde con contexto del sitio y descarta fuentes que no son del sitio', async () => {
    const r = await (await preguntar('¿Desde qué año existe HL?')).json();
    expect(r.estado).toBe('ok');
    expect(r.intencion).toBe('informativa');
    expect(r.fuentes.length).toBeGreaterThan(0);
    for (const f of r.fuentes) expect(f.url).toMatch(/^\/[a-z0-9/_-]*\/(\?vacante=V-\d+)?$|\.pdf$/);
    expect(JSON.stringify(r)).not.toContain('ejemplo.com');
  });

  test('la intención comercial llega al panel', async () => {
    expect(await (await preguntar('Necesito una cotización de montaje')).json()).toMatchObject({ estado: 'ok', intencion: 'comercial' });
  });

  test('respeta el tope diario', async () => {
    let ultimo = '';
    for (let i = 0; i < 6; i++) ultimo = (await (await preguntar('Proyectos de cemento')).json()).estado;
    expect(ultimo).toBe('limite');
  });
});

// R-8: adjuntos PDF de hasta 5 MB, validados en el PHP (tipo real, tamaño, cantidad); HL_FORM_PRUEBA escribe el
// correo en el temporal en vez de enviarlo.
test.describe('enviar.php (adjuntos)', () => {
  const pdf = (bytes = 2000) => new Blob(['%PDF-1.4\n' + 'x'.repeat(bytes)], { type: 'application/pdf' });
  const proveedor = (archivos: [string, Blob, string][] = []) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries({ intencion: 'proveedor', lang: 'es', t: '0', ley: 'si', empresa: 'Demo S.A.S.', nit: '900', nombre: 'Ana',
      correo: 'ana@demo.com', pais: 'Colombia', categoria: 'Materiales', mensaje: 'Suministro de acero estructural certificado.' })) fd.append(k, v);
    for (const [k, b, n] of archivos) fd.append(k, b, n);
    return fetch(`${BASE}/api/enviar.php`, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
  };

  test('acepta un PDF opcional o ninguno', async () => {
    expect(await (await proveedor()).json()).toMatchObject({ ok: true });
    expect(await (await proveedor([['adjunto', pdf(), 'presentación.pdf']])).json()).toMatchObject({ ok: true });
  });
  test('rechaza lo que no es PDF, lo que pasa de 5 MB y los archivos de más', async () => {
    const r1 = await proveedor([['adjunto', new Blob(['MZ ejecutable'], { type: 'application/pdf' }), 'falso.pdf']]);
    expect(r1.status).toBe(422);
    expect((await r1.json()).campos).toContain('adjunto');
    expect((await proveedor([['adjunto', pdf(5 * 1024 * 1024 + 10), 'grande.pdf']])).status).toBe(422);
    expect((await proveedor([['adjunto', pdf(), 'a.pdf'], ['otro', pdf(), 'b.pdf']])).status).toBe(422);
  });
  test('un envío mayor que post_max_size avisa del tamaño (413), no de un motivo inválido', async () => {
    const r = await proveedor([['adjunto', pdf(9 * 1024 * 1024), 'enorme.pdf']]);
    expect(r.status).toBe(413);
    // El PHP portátil muestra su aviso de arranque antes del JSON (display_errors); en el hosting va apagado.
    expect(await r.text()).toContain('demasiado grande');
  });
  test('en un reporte ético anónimo el adjunto pierde su nombre original', async () => {
    const { readdirSync, statSync, readFileSync } = await import('node:fs');
    const fd = new FormData();
    for (const [k, v] of Object.entries({ intencion: 'etico', lang: 'es', t: '0', ley: 'si', anonimo: 'si', pais: 'Colombia', tipo: 'Otra',
      mensaje: 'Reporte de prueba con soporte adjunto para el comité.' })) fd.append(k, v);
    fd.append('adjunto', pdf(), 'Ana_Perez_soporte.pdf');
    const antes = Date.now();
    expect(await (await fetch(`${BASE}/api/enviar.php`, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })).json()).toMatchObject({ ok: true });
    const eml = readdirSync(tmpdir()).filter((f) => f.startsWith('hl-correo-')).map((f) => join(tmpdir(), f))
      .filter((f) => statSync(f).mtimeMs >= antes - 1000).map((f) => readFileSync(f, 'utf8')).find((t) => t.includes('buzonetico@'));
    expect(eml).toBeTruthy();
    expect(eml).toContain('filename="adjunto.pdf"');
    expect(eml).not.toContain('Ana_Perez');
  });
});
