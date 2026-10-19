import { test, expect } from '@playwright/test';
import { cifrasInicio } from '../src/lib/inicio';
import { auditar } from '../src/lib/contenido';

// ── Datos del inicio (guía §12.1-3) ──

test.describe('cifras del inicio', () => {
  const base = { fundacion: 1968, paises: ['CO', 'PA', 'CR', 'DO', 'GT', 'BO', 'EC'], sedes: 4, certificaciones: 3 };

  test('trayectoria, presencia, sedes y calidad, en ese orden', () => {
    const cifras = cifrasInicio(base, 'es', new Date(2026, 9, 19));
    expect(cifras.map((c) => c.clave)).toEqual(['trayectoria', 'presencia', 'sedes', 'calidad']);
    expect(cifras.map((c) => c.valor)).toEqual([58, 7, 4, 3]);
  });

  test('la edad se calcula con el año', () => {
    expect(cifrasInicio(base, 'es', new Date(2027, 0, 1))[0].valor).toBe(59);
  });

  test('cada cifra lleva su etiqueta en el idioma', () => {
    const es = cifrasInicio(base, 'es', new Date(2026, 9, 19));
    const en = cifrasInicio(base, 'en', new Date(2026, 9, 19));
    expect(es[0].etiqueta).toBe('años');
    expect(en[0].etiqueta).toBe('years');
  });
});

test('un país de la lista del sitio sin nombre detiene la compilación', () => {
  const sitio = [{ id: 'hl', data: { paises: ['CO', 'XX'], asociadas: [{}], clientes: [], cifras: [] } }];
  expect(() => auditar({ sitio } as never, { modo: 'desarrollo' })).toThrow(/"XX"/);
});
