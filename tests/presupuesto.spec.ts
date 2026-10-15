import { test, expect } from '@playwright/test';
import { modulosDe } from './presupuesto.mjs';

test('el presupuesto cuenta los módulos importados por los scripts de la página', () => {
  const archivos = modulosDe('dist/index.html').map((f: string) => f.split('\\').join('/'));
  expect(archivos.some((f: string) => /\/prefetch\.[\w-]+\.js$/.test(f))).toBe(true);
});
