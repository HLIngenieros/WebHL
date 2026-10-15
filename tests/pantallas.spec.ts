import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Matriz de pantallas de la especificación §6 + móvil en horizontal.
const PANTALLAS = [[360, 780], [390, 844], [768, 1024], [1024, 768], [1366, 768], [1920, 1080], [2560, 1440], [844, 390]];
const PAGINAS = ['/', '/nosotros/', '/en/about/', '/muestra/', '/404.html'];

for (const [w, h] of PANTALLAS) {
  for (const ruta of PAGINAS) {
    test(`${ruta} a ${w}×${h}: sin scroll horizontal ni violaciones de accesibilidad`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(ruta);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
      const nombre = `${ruta.replace(/[^a-z0-9]+/gi, '_') || 'inicio'}-${w}x${h}.png`;
      await page.screenshot({ path: `test-results/pantallas/${nombre}`, fullPage: true });
    });
  }
}
