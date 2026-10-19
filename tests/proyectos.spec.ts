import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { medida, relacionados, sectoresDe, serviciosDe, clientesDe, auditar } from '../src/lib/contenido';
import { cumple, conteos, leerFiltros, escribirFiltros } from '../src/lib/explorador';
import { urlDe } from '../src/i18n/rutas';
import { p, ids, tj, slugs } from './apoyo';

const SITIO = 'https://hlingenieros.com';

test.describe('relaciones de F2', () => {
  const lista = [
    p('base', { servicios: [{ id: 'montaje-mecanico' }, { id: 'obras-civiles' }] }),
    p('gemelo', { cliente: 'Zeta', servicios: [{ id: 'montaje-mecanico' }, { id: 'obras-civiles' }] }),
    p('mismo-sector', { cliente: 'Alfa', servicios: [{ id: 'fabricacion' }] }),
    p('mismo-servicio', { sector: { id: 'mineria' }, servicios: [{ id: 'obras-civiles' }] }),
    p('nada-en-comun', { sector: { id: 'mineria' }, servicios: [{ id: 'fabricacion' }] }),
    p('oculta', { cliente: 'Secreto', visibilidad: 'discreta' }),
  ];

  test('(foco 1) una discreta no entra en relacionados, sectores, servicios ni clientes', () => {
    expect(ids(relacionados(lista, lista[0], 10))).not.toContain('oculta');
    expect(sectoresDe([lista[5]], 'montaje-mecanico')).toEqual([]);
    expect(serviciosDe([lista[5]], 'cemento')).toEqual([]);
    expect(clientesDe(lista, 'cemento')).not.toContain('Secreto');
  });

  test('relacionados: primero mismo sector y servicios, sin la actual ni sin nada en común', () => {
    expect(ids(relacionados(lista, lista[0]))).toEqual(['gemelo', 'mismo-sector', 'mismo-servicio']);
    expect(ids(relacionados(lista, lista[0], 1))).toEqual(['gemelo']);
  });

  test('sectores de un servicio y servicios de un sector, por frecuencia', () => {
    expect(sectoresDe(lista, 'obras-civiles')).toEqual(['cemento', 'mineria']);
    expect(serviciosDe(lista, 'cemento')).toEqual(['montaje-mecanico', 'obras-civiles', 'fabricacion']);
  });

  test('clientes del sector, únicos y en orden alfabético', () => {
    expect(clientesDe(lista, 'cemento')).toEqual(['Alfa', 'Cliente', 'Zeta']);
  });
});

test.describe('medida()', () => {
  test('cifra con unidad en cada idioma', () => {
    expect(medida(9470000, 'hh', 'es')).toBe('9.470.000 HH');
    expect(medida(9470000, 'hh', 'en')).toBe('9,470,000 man-hours');
    expect(medida(5250, 'tpd', 'es')).toBe('5.250 t/día');
    expect(medida(5250, 'tpd', 'en')).toBe('5,250 t/day');
    expect(medida(95000, 'm3', 'es')).toBe('95.000 m³');
  });
  test('porcentaje: espacio fino en español, pegado en inglés', () => {
    expect(medida(30, 'pct', 'es')).toBe('30 %');
    expect(medida(30, 'pct', 'en')).toBe('30%');
  });
  test('singular con 1 día o 1 mes', () => {
    expect(medida(1, 'dias', 'es')).toBe('1 día');
    expect(medida(1, 'meses', 'en')).toBe('1 month');
    expect(medida(2, 'dias', 'es')).toBe('2 días');
  });
  test('sin unidad, solo el número', () => {
    expect(medida(4, undefined, 'es')).toBe('4');
  });
});

test.describe('filtros del explorador', () => {
  const ts = [tj('a', 'montaje-mecanico', 'cemento', 'co'), tj('b', 'obras-civiles', 'cemento', 'gt'), tj('c', 'montaje-mecanico', 'mineria', 'co')];

  test('cumple: Y entre dimensiones', () => {
    expect(ts.filter((t) => cumple(t, { sector: 'cemento', pais: 'co' })).map((t) => t.id)).toEqual(['a']);
    expect(ts.filter((t) => cumple(t, {})).length).toBe(3);
  });

  test('conteos: cada opción cuenta con los otros filtros aplicados', () => {
    const c = conteos(ts, { sector: 'cemento', servicio: 'obras-civiles' }, 'servicio');
    expect(c.get('montaje-mecanico')).toBe(1);
    expect(c.get('obras-civiles')).toBe(1);
    expect(conteos(ts, { servicio: 'montaje-mecanico' }, 'pais').get('gt') ?? 0).toBe(0);
  });

  test('leerFiltros ignora valores desconocidos; escribirFiltros en orden fijo', () => {
    const validos = { servicio: new Set(['montaje-mecanico']), sector: new Set(['cemento']), pais: new Set(['co']) };
    expect(leerFiltros('?sector=nada&pais=co', validos)).toEqual({ pais: 'co' });
    expect(escribirFiltros({})).toBe('');
    expect(escribirFiltros({ pais: 'co', servicio: 'montaje-mecanico' })).toBe('?servicio=montaje-mecanico&pais=co');
  });
});

test.describe('rutas de contenido', () => {
  test('(foco 4) urlDe arma la URL del idioma', () => {
    expect(urlDe('proyectos', { es: 'planta-columbus', en: 'columbus-plant' }, 'en')).toBe('/en/projects/columbus-plant/');
    expect(urlDe('sectores', { es: 'mineria', en: 'mining' }, 'es')).toBe('/sectores/mineria/');
  });

  test('un país desconocido detiene la compilación', () => {
    expect(() => auditar({ proyectos: [p('raro', { pais: 'XX' })] }, { modo: 'desarrollo' })).toThrow(/raro.*XX/);
  });

  for (const seccion of ['proyectos', 'servicios', 'sectores'] as const) {
    test(`(foco 4) cada página de ${seccion} existe en ES y EN y enlaza a su par`, async ({ page }) => {
      for (const slug of slugs(seccion)) {
        const es = urlDe(seccion, slug, 'es');
        const en = urlDe(seccion, slug, 'en');
        for (const [aqui, otra] of [[es, en], [en, es]]) {
          const resp = await page.goto(aqui);
          expect(resp?.status(), aqui).toBe(200);
          const otroLang = otra.startsWith('/en/') ? 'en' : 'es';
          await expect(page.locator(`link[rel=alternate][hreflang=${otroLang}]`)).toHaveAttribute('href', SITIO + otra);
          await expect(page.locator('a.idioma')).toHaveAttribute('href', otra);
        }
      }
    });
  }
});

test.describe('identidad por sección', () => {
  test.use({ colorScheme: 'light' });

  test('(foco 4) <html> declara la sección de la página', async ({ page }) => {
    const seccion = async (url: string) => { await page.goto(url); return page.locator('html').getAttribute('data-seccion'); };
    expect(await seccion('/proyectos/')).toBe('proyectos');
    expect(await seccion('/proyectos/planta-columbus/')).toBe('proyectos');
    expect(await seccion('/en/services/')).toBe('servicios');
    expect(await seccion('/sectores/mineria/')).toBe('sectores');
    expect(await seccion('/')).toBeNull();
    expect(await seccion('/nosotros/')).toBeNull();
  });

  test('el indicador del menú toma el acento de la sección', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    const color = async (url: string) => {
      await page.goto(url);
      return page.locator('#nav-principal a[aria-current]').evaluate((a) => getComputedStyle(a).borderBottomColor);
    };
    expect(await color('/proyectos/')).toBe('rgb(138, 90, 0)');
    // Servicios cuelga de Proyectos en la barra (guía §13.1): se marca Proyectos, con su acento.
    expect(await color('/servicios/')).toBe('rgb(138, 90, 0)');
  });

  test('un pod con otra sección toma su acento dentro de la página', async ({ page }) => {
    await page.goto('/muestra/');
    expect(await page.locator('html').getAttribute('data-seccion')).toBe('proyectos');
    const barra = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el, '::before').backgroundColor);
    expect(await barra('.pod-rotulo[data-seccion="hse"]')).toBe('rgb(31, 111, 58)');
    expect(await barra('.pod-rotulo:not([data-seccion])')).toBe('rgb(138, 90, 0)');
    await expect(page.locator('.pod-eje')).not.toHaveCount(0);
    await expect(page.locator('.pod-senal')).not.toHaveCount(0);
  });

  for (const tema of ['light', 'dark'] as const) {
    test(`los pods cumplen contraste en tema ${tema}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema, reducedMotion: 'reduce' });
      await page.goto('/muestra/');
      const r = await new AxeBuilder({ page }).include('#pods').withTags(['wcag2a', 'wcag2aa']).analyze();
      expect(r.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
});

test.describe('lámina, tarjeta e ilustraciones', () => {
  test('la tarjeta con foto sale en AVIF y WebP con dimensiones fijas', async ({ page }) => {
    await page.goto('/muestra/');
    const tarjeta = page.locator('.tarjeta[data-id="planta-columbus"]');
    await expect(tarjeta.locator('source[type="image/avif"]')).toHaveCount(1);
    await expect(tarjeta.locator('source[type="image/webp"]')).toHaveCount(1);
    await expect(tarjeta.locator('img')).toHaveAttribute('width', /^\d+$/);
    await expect(tarjeta.locator('img')).toHaveAttribute('height', /^\d+$/);
    await expect(tarjeta.locator('h3 a')).toHaveAttribute('href', '/proyectos/planta-columbus/');
  });

  test('la tarjeta sin foto muestra la ilustración del sector', async ({ page }) => {
    await page.goto('/muestra/');
    const tarjeta = page.locator('.tarjeta[data-id="torre-grua-maceo"]');
    // Decorativa: el título ya lo lee el H3 de la tarjeta.
    await expect(tarjeta.locator('svg.ilustracion[aria-hidden="true"]')).toHaveCount(1);
    await expect(tarjeta.locator('svg[role="img"], img')).toHaveCount(0);
  });

  test('las seis ilustraciones existen y la muestra no carga React', async ({ page }) => {
    await page.goto('/muestra/');
    await expect(page.locator('#ilustraciones svg.ilustracion')).toHaveCount(6);
    await expect(page.locator('astro-island')).toHaveCount(0);
  });

  test('la lámina va en gris y vuelve a color al pasar el cursor', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/muestra/');
    const img = page.locator('.tarjeta[data-id="planta-columbus"] img');
    expect(await img.evaluate((el) => getComputedStyle(el).filter)).toContain('grayscale(1)');
    await page.locator('.tarjeta[data-id="planta-columbus"]').hover();
    await expect.poll(() => img.evaluate((el) => getComputedStyle(el).filter)).toBe('none');
  });

  test('(foco 5) con reduced-motion los trazos están completos', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/muestra/');
    const estado = await page.locator('.trazo .t').evaluateAll((xs) => xs.map((x) => [getComputedStyle(x).clipPath, getComputedStyle(x).strokeDasharray]));
    expect(estado.length).toBeGreaterThan(0);
    expect(estado.filter(([clip, guion]) => clip !== 'none' || guion !== 'none')).toEqual([]);
  });

  test('(foco 3) ninguna variante generada pasa de 800 px de ancho', async () => {
    const sharp = (await import('sharp')).default;
    const dir = path.join(process.cwd(), 'dist', '_astro');
    const anchas: string[] = [];
    for (const f of fs.readdirSync(dir).filter((x) => /\.(avif|webp)$/.test(x))) {
      const { width } = await sharp(path.join(dir, f)).metadata();
      if ((width ?? 0) > 800) anchas.push(`${f}: ${width}`);
    }
    expect(anchas).toEqual([]);
  });
});

test.describe('ficha de proyecto', () => {
  const DISCRETAS = ['patio-de-carbon-estrella', 'tanques-cobre-panama'];

  test('(foco 2) ninguna ficha se ve rota, con o sin datos', async ({ page }) => {
    for (const slug of slugs('proyectos')) {
      for (const lang of ['es', 'en'] as const) {
        const url = urlDe('proyectos', slug, lang);
        await page.goto(url);
        await expect(page.locator('h1'), url).toHaveCount(1);
        const texto = await page.locator('main').innerText();
        expect(texto, url).not.toMatch(/\b(undefined|NaN|null)\b/);
        const vacias = await page.locator('.rotulo dd').evaluateAll((xs) => xs.filter((x) => !x.textContent?.trim()).length);
        expect(vacias, url).toBe(0);
        const fotos = await page.locator('.ficha-portada img').count();
        if (!fotos) await expect(page.locator('.ficha-portada svg[role="img"]'), url).toHaveCount(1);
      }
    }
  });

  test('Columbus: cifras por idioma, cantidades, hoja de contactos y LCP', async ({ page }) => {
    await page.goto('/proyectos/planta-columbus/');
    await expect(page.locator('.cifras dd').first()).toContainText('9.470.000');
    await expect(page.locator('.cantidades tbody tr')).toHaveCount(11);
    await expect(page.locator('.hoja figure')).toHaveCount(4);
    await expect(page.locator('.ficha-portada img')).toHaveAttribute('fetchpriority', 'high');
    await page.locator('.hoja button').nth(1).click();
    const visor = page.locator('.visor:popover-open');
    await expect(visor).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(visor).toHaveCount(0);
    await page.goto('/en/projects/columbus-plant/');
    await expect(page.locator('.cifras dd').first()).toContainText('9,470,000');
  });

  test('(foco 3) a 2560 px ninguna foto pasa de 800 px, ni abierta', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/proyectos/planta-columbus/');
    const anchos = () => page.locator('main img').evaluateAll((xs) => xs.filter((x) => x.getClientRects().length).map((x) => x.getBoundingClientRect().width));
    expect((await anchos()).filter((w) => w > 800.5)).toEqual([]);
    await page.locator('.hoja button').first().click();
    expect((await anchos()).filter((w) => w > 800.5)).toEqual([]);
  });

  test('(foco 1) los relacionados nunca enlazan a una discreta; las discretas se indexan', async ({ page }) => {
    for (const slug of slugs('proyectos')) {
      await page.goto(urlDe('proyectos', slug, 'es'));
      for (const d of DISCRETAS) await expect(page.locator(`.relacionados a[href*="${d}"]`)).toHaveCount(0);
    }
    for (const d of DISCRETAS) {
      const resp = await page.goto(`/proyectos/${d}/`);
      expect(resp?.status()).toBe(200);
      await expect(page.locator('meta[name=robots]')).toHaveCount(0);
    }
  });

  test('(foco 4) en inglés todos los enlaces internos de la ficha son EN', async ({ page }) => {
    await page.goto('/en/projects/columbus-plant/');
    const hrefs = await page.locator('main a[href^="/"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('href')!));
    expect(hrefs.length).toBeGreaterThan(3);
    expect(hrefs.filter((h) => !h.startsWith('/en/'))).toEqual([]);
  });

  test('las 51 fotos de proyecto aparecen en su ficha', async ({ page }) => {
    let total = 0;
    for (const slug of slugs('proyectos')) {
      await page.goto(urlDe('proyectos', slug, 'es'));
      total += await page.locator('.ficha-portada img, .hoja img').count();
    }
    expect(total).toBe(51);
  });
});

test.describe('mapa de presencia', () => {
  test('proyectar deja las ciudades dentro del lienzo y en su orden', async () => {
    const { proyectar, ANCHO, ALTO } = await import('../src/lib/mapa');
    const ciudades = { bogota: [4.711, -74.072], guatemala: [14.634, -90.506], riobamba: [-1.664, -78.654], santoDomingo: [18.486, -69.931] } as const;
    for (const [lat, lon] of Object.values(ciudades)) {
      const [x, y] = proyectar([lat, lon]);
      expect(x).toBeGreaterThan(0); expect(x).toBeLessThan(ANCHO);
      expect(y).toBeGreaterThan(0); expect(y).toBeLessThan(ALTO);
    }
    const [bx, by] = proyectar(ciudades.bogota);
    const [gx, gy] = proyectar(ciudades.guatemala);
    expect(bx).toBeGreaterThan(gx);
    expect(by).toBeGreaterThan(gy);
  });

  test('el mapa marca los países con obra y un punto por ciudad', async ({ page }) => {
    await page.goto('/muestra/');
    const mapa = page.locator('#mapa .mapa');
    for (const pais of ['co', 'gt', 'ec', 'pa']) await expect(mapa.locator(`path.con-obra[data-pais="${pais}"]`)).toHaveCount(1);
    await expect(mapa.locator('.punto')).toHaveCount(15);
    await expect(mapa.locator('.sede')).toHaveCount(4);
  });

  test('(foco 5) con reduced-motion las estacas no se mueven', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/muestra/');
    const t = await page.locator('#mapa .estaca').evaluateAll((xs) => xs.map((x) => getComputedStyle(x).transform));
    expect(t.length).toBeGreaterThan(0);
    expect(t.filter((v) => v !== 'none')).toEqual([]);
  });
});

test.describe('explorador de proyectos', () => {
  const DISCRETAS = ['patio-de-carbon-estrella', 'tanques-cobre-panama'];
  const hidratado = (page: import('@playwright/test').Page) => page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
  const visibles = (page: import('@playwright/test').Page) => page.locator('.explorador .tarjeta:visible');
  const boton = (page: import('@playwright/test').Page, dim: string, valor: string) =>
    page.locator(`.filtros-inline [data-dim="${dim}"] button[data-valor="${valor}"]`);

  test.describe('sin JavaScript', () => {
    test.use({ javaScriptEnabled: false });
    test('(foco 5) se ven las 22 tarjetas y no hay filtros muertos; las discretas van al final', async ({ page }) => {
      await page.goto('/proyectos/');
      await expect(visibles(page)).toHaveCount(22);
      await expect(page.locator('.filtros-inline')).toBeHidden();
      await expect(page.locator('.abrir-filtros')).toBeHidden();
      const ids = await page.locator('.explorador .tarjeta').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-id')));
      expect(ids.slice(-2).sort()).toEqual([...DISCRETAS].sort());
    });
  });

  test('filtrar por sector marca el botón, cambia la URL y la lista', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/proyectos/');
    await hidratado(page);
    await boton(page, 'sector', 'mineria').click();
    await expect(boton(page, 'sector', 'mineria')).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/\?sector=mineria$/);
    await expect(visibles(page)).toHaveCount(4);
    await expect(page.locator('.contador')).toContainText('4');
  });

  test('en inglés el filtro usa el slug EN', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/en/projects/');
    await hidratado(page);
    await boton(page, 'sector', 'mining').click();
    await expect(page).toHaveURL(/\?sector=mining$/);
  });

  test('la URL llega filtrada y los valores desconocidos se ignoran', async ({ page }) => {
    await page.goto('/proyectos/?sector=cemento&servicio=fabricacion');
    await hidratado(page);
    await expect(visibles(page)).toHaveCount(1);
    await page.goto('/proyectos/?sector=nada');
    await hidratado(page);
    await expect(visibles(page)).toHaveCount(22);
  });

  test('(foco 5) sin resultados aparece "Quitar filtros" y devuelve las 22', async ({ page }) => {
    await page.goto('/proyectos/?sector=infraestructura&servicio=fabricacion');
    await hidratado(page);
    await expect(visibles(page)).toHaveCount(0);
    await page.locator('.sin-resultados button').click();
    await expect(visibles(page)).toHaveCount(22);
    await expect(page).toHaveURL(/\/proyectos\/$/);
  });

  test('clic en Panamá en el mapa filtra por país', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/proyectos/');
    await hidratado(page);
    await page.locator('.explorador path.con-obra[data-pais="pa"]').click({ force: true });
    await expect(page).toHaveURL(/\?pais=pa$/);
    await expect(visibles(page)).toHaveCount(1);
  });

  test('(foco 5) en móvil los filtros van en una hoja que atrapa y devuelve el foco', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/proyectos/');
    await hidratado(page);
    await expect(page.locator('.filtros-inline')).toBeHidden();
    const abrir = page.locator('.abrir-filtros');
    await abrir.click();
    const hoja = page.locator('dialog.hoja-filtros');
    await expect(hoja).toHaveAttribute('open', '');
    expect(await page.evaluate(() => !!document.activeElement?.closest('dialog.hoja-filtros'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(hoja).not.toHaveAttribute('open', '');
    await expect(abrir).toBeFocused();
  });
});

test.describe('servicios y sectores', () => {
  const DISCRETAS = ['patio-de-carbon-estrella', 'tanques-cobre-panama'];

  test('(foco 1) ninguna página de servicio o sector enlaza a una discreta, y no cargan React', async ({ page }) => {
    const urls = ['/servicios/', '/sectores/', ...slugs('servicios').map((s) => urlDe('servicios', s, 'es')), ...slugs('sectores').map((s) => urlDe('sectores', s, 'es'))];
    for (const url of urls) {
      await page.goto(url);
      await expect(page.locator('h1'), url).toHaveCount(1);
      for (const d of DISCRETAS) await expect(page.locator(`main a[href*="${d}"]`), url).toHaveCount(0);
      await expect(page.locator('astro-island'), url).toHaveCount(0);
    }
  });

  test('(foco 1) los conteos de los índices cuentan solo visibles', async ({ page }) => {
    await page.goto('/sectores/');
    await expect(page.locator('[data-id="mineria"] .conteo')).toHaveText(/^3\b/);
    await page.goto('/servicios/');
    await expect(page.locator('[data-id="montaje-mecanico"] .conteo')).not.toHaveText(/^0\b/);
  });

  test('montaje mecánico: 4 tarjetas, enlace al explorador filtrado y normas', async ({ page }) => {
    await page.goto('/servicios/montaje-mecanico/');
    await expect(page.locator('main .tarjeta')).toHaveCount(4);
    await expect(page.locator('a.ver-todos')).toHaveAttribute('href', '/proyectos/?servicio=montaje-mecanico');
    for (const n of ['ASME', 'API 650', 'AWS']) await expect(page.locator('.normas').getByText(n, { exact: true })).toHaveCount(1);
  });

  test('un servicio sin FAQ ni capacidad no muestra esas secciones', async ({ page }) => {
    await page.goto('/servicios/montaje-mecanico/');
    await expect(page.getByRole('heading', { name: 'Preguntas frecuentes' })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Capacidad' })).toHaveCount(0);
    await page.goto('/servicios/gerencia-de-proyectos/');
    await expect(page.getByRole('heading', { name: 'Capacidad' })).toHaveCount(1);
  });

  test('(foco 4) en inglés los enlaces internos y el filtro son EN', async ({ page }) => {
    await page.goto('/en/services/mechanical-installation/');
    const hrefs = await page.locator('main a[href^="/"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('href')!));
    expect(hrefs.filter((h) => !h.startsWith('/en/'))).toEqual([]);
    await expect(page.locator('a.ver-todos')).toHaveAttribute('href', '/en/projects/?servicio=mechanical-installation');
  });

  test('(foco 5) con reduced-motion las capas y subcapacidades quedan quietas y visibles', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sectores/mineria/');
    const capas = await page.locator('.escenario g[class^="capa-"]').evaluateAll((xs) => xs.map((x) => getComputedStyle(x).transform));
    expect(capas.length).toBe(3);
    expect(capas.filter((v) => v !== 'none')).toEqual([]);
    await page.goto('/servicios/montaje-mecanico/');
    const subs = await page.locator('.capa-plano').evaluateAll((xs) => xs.map((x) => [getComputedStyle(x).transform, getComputedStyle(x).opacity]));
    expect(subs.length).toBe(4);
    expect(subs.filter(([t, o]) => t !== 'none' || o !== '1')).toEqual([]);
  });
});

test.describe('accesibilidad de F2 (Lighthouse)', () => {
  test('el texto visible del logo está en su nombre accesible', async ({ page }) => {
    await page.goto('/proyectos/');
    const visible = ((await page.locator('a.logo').textContent()) ?? '').replace(/\s+/g, ' ').trim();
    expect(visible).toBe('HL Ingenieros');
    expect(await page.locator('a.logo').getAttribute('aria-label')).toContain(visible);
  });

  test('el explorador no salta de H1 a H3', async ({ page }) => {
    await page.goto('/proyectos/');
    const niveles = await page.locator('main :is(h1, h2, h3)').evaluateAll((xs) => xs.map((x) => Number(x.tagName[1])));
    const saltos = niveles.filter((n, i) => i > 0 && n - niveles[i - 1] > 1);
    expect(saltos).toEqual([]);
  });
});

test.describe('revisión final', () => {
  test('"Ver los N proyectos" cuenta lo mismo que muestra el explorador', async ({ page }) => {
    await page.goto('/servicios/montaje-mecanico/');
    const enlace = page.locator('a.ver-todos');
    const n = Number((await enlace.innerText()).match(/\d+/)![0]);
    await enlace.click();
    await page.waitForSelector('astro-island:not([ssr])', { state: 'attached' });
    await expect(page.locator('.explorador .tarjeta:visible')).toHaveCount(n);
  });

  test('textos con número en singular', async () => {
    const { tn } = await import('../src/i18n/ui');
    expect(tn('es', 'verN', 1)).toBe('Ver 1 proyecto');
    expect(tn('en', 'verN', 1)).toBe('See 1 project');
    expect(tn('es', 'verN', 3)).toBe('Ver 3 proyectos');
  });
});

test.describe('menores de la revisión', () => {
  test('la cifra de la tarjeta no repite la unidad que ya dice la etiqueta', async ({ page }) => {
    await page.goto('/muestra/');
    await expect(page.locator('.tarjeta[data-id="planta-columbus"] .tarjeta-cifra .cifra')).toHaveText('9.470.000');
  });

  test('la fila de cifras no deja tramos vacíos con 1 o 3 cifras', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    for (const url of ['/proyectos/torre-grua-maceo/', '/proyectos/molienda-de-cemento-sonson/']) {
      await page.goto(url);
      const [fila, celdas] = await page.locator('.cifras').evaluate((dl) => [dl.getBoundingClientRect().width,
        [...dl.children].reduce((t, c) => t + c.getBoundingClientRect().width, 0)]);
      expect(Math.abs(fila - celdas), url).toBeLessThan(2);
    }
  });

  test('la cabecera de sector no repite su código', async ({ page }) => {
    await page.goto('/sectores/mineria/');
    await expect(page.locator('.cota-texto')).toHaveText(/proyectos/);
  });
});

// Guía §13.3 · Página de Sectores: escenarios para Cemento y Minería, índice para el resto.
test.describe('página de Sectores', () => {
  test('Cemento y Minería como escenarios, en ese orden; los otros 4 en el índice', async ({ page }) => {
    await page.goto('/sectores/');
    const escenas = page.locator('.escena');
    await expect(escenas).toHaveCount(2);
    await expect(escenas.nth(0)).toHaveAttribute('data-id', 'cemento');
    await expect(escenas.nth(1)).toHaveAttribute('data-id', 'mineria');
    await expect(page.locator('.indice li')).toHaveCount(4);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('cada escenario enlaza a su sector y al explorador filtrado, con 3 obras', async ({ page }) => {
    await page.goto('/sectores/');
    const cemento = page.locator('.escena[data-id=cemento]');
    await expect(cemento.locator('.obras li')).toHaveCount(3);
    await expect(cemento.locator('.obras li').first()).toContainText('Planta Columbus');
    await expect(cemento.locator('a.ir').nth(0)).toHaveAttribute('href', '/sectores/cemento/');
    await expect(cemento.locator('a.ir').nth(1)).toHaveAttribute('href', '/proyectos/?sector=cemento');
    await page.goto('/en/sectors/');
    await expect(page.locator('.escena[data-id=mineria] a.ir').nth(1)).toHaveAttribute('href', '/en/projects/?sector=mining');
  });

  test('la foto de la lámina no pasa de 800 px', async ({ page }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto('/sectores/');
    const ancho = await page.locator('.lamina-esc').first().evaluate((e) => e.getBoundingClientRect().width);
    expect(ancho).toBeLessThanOrEqual(800);
  });

  test('con movimiento reducido las capas quedan quietas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/sectores/');
    await expect(page.locator('.escena .capas .capa-cotas').first()).toHaveCSS('animation-name', 'none');
  });
});
