import { test, expect } from '@playwright/test';
import { modulosDe } from './presupuesto.mjs';

test('el presupuesto cuenta los módulos importados por los scripts de la página', () => {
  const archivos = modulosDe('dist/index.html').map((f: string) => f.split('\\').join('/'));
  expect(archivos.some((f: string) => /\/prefetch\.[\w-]+\.js$/.test(f))).toBe(true);
});

test('el presupuesto cuenta el JS de las islas (componente y renderizador)', () => {
  const archivos = modulosDe('dist/proyectos/index.html').map((f: string) => f.split('\\').join('/'));
  expect(archivos.some((f: string) => /\/Explorador\.[\w-]+\.js$/.test(f))).toBe(true);
  expect(archivos.some((f: string) => /\/client\.[\w-]+\.js$/.test(f))).toBe(true);
});
