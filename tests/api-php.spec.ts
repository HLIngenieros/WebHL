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
    env: { ...process.env, HL_ENV: env, HL_AGENTE_PRUEBA: '1' }, stdio: 'ignore',
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
