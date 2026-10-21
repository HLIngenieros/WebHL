// PHP de documentos y del agente (plan AG.2-AG.3) contra un PHP real, sobre una copia temporal de dist/api y
// dist/documentos (así no pisa el catálogo de muestra que leen las otras pruebas en paralelo). Corre solo si HL_PHP apunta a
// php.exe (p. ej. C:\Users\jurbina\herramientas\php\php.exe): el hosting tiene PHP 8.3, el equipo de pruebas no siempre.
import { test, expect } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

const PHP = process.env.HL_PHP ?? '';
const PUERTO = 4330;
const BASE = `http://127.0.0.1:${PUERTO}`;
const CLAVE = 'a'.repeat(64);
let DIST = ''; // raíz temporal que sirve el PHP
const PDF = Buffer.from('%PDF-1.4\n% prueba\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n').toString('base64');

test.describe.configure({ mode: 'serial' });
test.skip(!PHP, 'Sin HL_PHP: se omiten las pruebas de PHP');

let php: ChildProcess;
test.beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'hl-php-'));
  DIST = join(dir, 'raiz');
  for (const d of ['api', 'documentos']) cpSync(join(process.cwd(), 'dist', d), join(DIST, d), { recursive: true });
  rmSync(join(DIST, 'api', 'documentos.json'), { force: true }); // las pruebas parten de un catálogo vacío
  const env = join(dir, '.env');
  writeFileSync(env, `CLAVE_DOCUMENTOS=${CLAVE}\nCLAVE_AGENTE=${'b'.repeat(64)}\nAGENTE_URL=\nTOPE_DIARIO=5\n`);
  const ini = join(dirname(PHP), 'php.ini');
  php = spawn(PHP, [...(existsSync(ini) ? ['-c', ini] : []), '-S', `127.0.0.1:${PUERTO}`, '-t', DIST], {
    env: { ...process.env, HL_ENV: env, HL_AGENTE_PRUEBA: '1' }, stdio: 'ignore',
  });
  for (let i = 0; i < 50; i++) {
    try { await fetch(`${BASE}/`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
});
test.afterAll(() => { php?.kill(); });

const enviar = (cuerpo: object, clave = CLAVE) =>
  fetch(`${BASE}/api/documentos.php`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-HL-Clave': clave }, body: JSON.stringify(cuerpo) });
const guardar = (extra: object = {}) => enviar({ accion: 'guardar', lote: '', id: '7', archivo: 'HL-Certificado-ISO-45001.pdf', carpeta: 'Certificaciones', titulo: 'ISO 45001:2018', idioma: 'ES/EN', area: 'HSE', emisor: 'SGS', codigo: 'CO24/00000107', vigenteHasta: '2027-03-15T05:00:00Z', descripcion: 'Seguridad y salud en el trabajo', datosClave: 'ISO 45001:2018 · SGS', modificado: '2026-10-21T15:00:00Z', contenido: PDF, ...extra });
const catalogo = () => JSON.parse(readFileSync(join(DIST, 'api', 'documentos.json'), 'utf8'));

test.describe('documentos.php', () => {
  test('rechaza sin clave, con clave mala y por GET', async () => {
    expect((await enviar({ accion: 'inicio' }, 'mala')).status).toBe(401);
    expect((await fetch(`${BASE}/api/documentos.php`)).status).toBe(405);
  });

  test('rechaza lo que no es un PDF o está fuera de las 6 carpetas', async () => {
    expect((await guardar({ contenido: Buffer.from('<html>').toString('base64') })).status).toBe(422);
    expect((await guardar({ carpeta: '' })).status).toBe(422);
    expect((await guardar({ carpeta: 'Nómina' })).status).toBe(422);
    expect((await guardar({ archivo: 'virus.exe' })).status).toBe(422);
  });

  test('guarda el PDF con nombre seguro y lo agrega al catálogo', async () => {
    const r = await guardar();
    expect(r.status).toBe(200);
    expect((await r.json()).url).toBe('/documentos/certificaciones/hl-certificado-iso-45001.pdf');
    expect(existsSync(join(DIST, 'documentos', 'certificaciones', 'hl-certificado-iso-45001.pdf'))).toBe(true);
    const d = catalogo().find((x: { id: string }) => x.id === '7');
    expect(d).toMatchObject({ carpeta: 'certificaciones', titulo: 'ISO 45001:2018', vigenteHasta: '2027-03-15', emisor: 'SGS', idioma: 'ES/EN' });
    // "Políticas" con tilde también vale
    expect((await guardar({ id: '8', carpeta: 'Políticas', archivo: 'Politica SGI.pdf', titulo: '' })).status).toBe(200);
    expect(catalogo().find((x: { id: string }) => x.id === '8')).toMatchObject({ carpeta: 'politicas', titulo: 'Politica SGI', url: '/documentos/politicas/politica-sgi.pdf' });
  });

  test('al renombrar quita el archivo anterior; borrar lo retira', async () => {
    await guardar({ archivo: 'ISO-45001-v2.pdf' });
    expect(existsSync(join(DIST, 'documentos', 'certificaciones', 'hl-certificado-iso-45001.pdf'))).toBe(false);
    expect(existsSync(join(DIST, 'documentos', 'certificaciones', 'iso-45001-v2.pdf'))).toBe(true);
    expect((await enviar({ accion: 'borrar', id: '8' })).status).toBe(200);
    expect(catalogo().some((x: { id: string }) => x.id === '8')).toBe(false);
    expect(existsSync(join(DIST, 'documentos', 'politicas', 'politica-sgi.pdf'))).toBe(false);
  });

  test('fin del lote retira lo que no llegó, pero no los PDF del sitio', async () => {
    const lote = new Date(Date.now() + 60_000).toISOString().replace(/\D/g, '').slice(0, 14);
    expect((await enviar({ accion: 'inicio', lote })).status).toBe(200);
    await guardar({ id: '9', archivo: 'Brochure.pdf', carpeta: 'Brochures', lote });
    const r = await (await enviar({ accion: 'fin', lote })).json();
    expect(r.ok).toBe(true);
    const ids = catalogo().map((x: { id: string }) => x.id);
    expect(ids).toEqual(['9']);
    expect(existsSync(join(DIST, 'documentos', 'politica-datos-M-TI-001-act-2.pdf'))).toBe(true);
  });
});

const preguntar = (pregunta: string, extra: object = {}) =>
  fetch(`${BASE}/api/agente.php`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pregunta, idioma: 'es', pagina: '/', historial: [], ...extra }) });

test.describe('agente.php (respuestas simuladas)', () => {
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
