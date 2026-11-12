// Uso (al cerrar sesión, después de npm run build): node design/bitacora.mjs <html leído del artefacto> <salida.html>
// Regenera DATOS de la Bitácora WebHL: commits (git log) y pendientes (dist/pendientes/index.html).
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , entrada, salida] = process.argv;

// Commits
const log = execFileSync('git', ['log', '--reverse', '--format=@@%h|%aI|%s', '--shortstat'], { encoding: 'utf8' });
const commits = [];
for (const bloque of log.split('@@').slice(1)) {
  const [cab, ...resto] = bloque.trim().split('\n');
  const [h, f, ...m] = cab.split('|');
  const st = resto.join(' ');
  const n = (re) => Number(st.match(re)?.[1] ?? 0);
  commits.push({ h, f, m: m.join('|'), a: n(/(\d+) files? changed/), i: n(/(\d+) insertions?/), d: n(/(\d+) deletions?/) });
}

// Pendientes
const b = await chromium.launch();
const p = await b.newPage();
await p.goto(pathToFileURL(path.resolve('dist/pendientes/index.html')).href);
const pend = await p.evaluate(() => [...document.querySelectorAll('section[data-grupo]')].flatMap((s) =>
  [...s.querySelectorAll('tbody tr[data-coleccion]')].map((tr) => {
    const td = tr.querySelectorAll('td');
    return {
      t: s.dataset.grupo, col: td[0].textContent.trim(), id: tr.dataset.id, e: td[1].textContent.trim(),
      items: [...tr.querySelectorAll('li[data-campo]')].map((li) => {
        const c = li.dataset.campo;
        const det = li.querySelector('.detalle')?.textContent.replace(/^\s*·\s*/, '').trim() ?? '';
        return { c, x: c === 'confirmar' ? li.textContent.trim() : det };
      }),
      b: td[3].textContent.includes('Bloquea'),
    };
  })));
await b.close();
for (const x of pend) if (x.col === 'Sitio' && x.t === 'insumo') x.e = 'Video del Home';
const tipos = new Set(pend.map((x) => x.t));

let s = fs.readFileSync(entrada, 'utf8').replace(/\r\n/g, '\n');
const lineas = s.split('\n');
const i = lineas.findIndex((l) => l.startsWith('const DATOS = '));
lineas[i] = `const DATOS = ${JSON.stringify({ commits, pend })};`;
s = lineas.join('\n');
fs.writeFileSync(salida, s);
console.log(`commits ${commits.length} (último ${commits.at(-1).h}) · pendientes ${pend.length} · bloquean ${pend.filter((x) => x.b).length} · tipos ${[...tipos].join(',')}`);
