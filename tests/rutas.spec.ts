import { test, expect } from '@playwright/test';
import { RUTAS, par, langDe } from '../src/i18n/rutas';

const SITIO = 'https://hlingenieros.com';

test.describe('par() y langDe()', () => {
  test('empareja rutas conocidas en ambos sentidos', () => {
    expect(par('/nosotros/')).toBe('/en/about/');
    expect(par('/en/about/')).toBe('/nosotros/');
    expect(par('/')).toBe('/en/');
    expect(par('/en/')).toBe('/');
  });
  test('una ruta sin par lleva al inicio del otro idioma', () => {
    expect(par('/desconocida/')).toBe('/en/');
    expect(par('/en/unknown/')).toBe('/');
    expect(par('/404.html')).toBe('/en/');
  });
  test('detecta el idioma por el prefijo', () => {
    expect(langDe('/en/about/')).toBe('en');
    expect(langDe('/en/')).toBe('en');
    expect(langDe('/nosotros/')).toBe('es');
    expect(langDe('/entrada/')).toBe('es');
  });
});

for (const [clave, r] of Object.entries(RUTAS)) {
  for (const lang of ['es', 'en'] as const) {
    test(`${clave} (${lang}) responde con idioma, H1 y hreflang correctos`, async ({ page }) => {
      const resp = await page.goto(r[lang]);
      expect(resp?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('link[rel=alternate][hreflang=es]')).toHaveAttribute('href', SITIO + r.es);
      await expect(page.locator('link[rel=alternate][hreflang=en]')).toHaveAttribute('href', SITIO + r.en);
      await expect(page.locator('link[rel=alternate][hreflang=x-default]')).toHaveAttribute('href', SITIO + r.es);
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', SITIO + r[lang]);
      const viewport = await page.locator('meta[name=viewport]').getAttribute('content');
      expect(viewport).not.toMatch(/maximum-scale|user-scalable/);
    });
  }
}

test('la 404 es bilingüe, no se indexa y enlaza a ambos inicios', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('main a[href="/"]')).toHaveCount(1);
  await expect(page.locator('main a[href="/en/"]')).toHaveCount(1);
});
