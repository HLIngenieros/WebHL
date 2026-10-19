import { test, expect } from '@playwright/test';

test('navegar entre páginas no recarga el documento', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.goto('/');
  await page.evaluate(() => { (window as any).__marca = 1; });
  await page.locator('#nav-principal a[href="/nosotros/"]').click();
  await expect(page).toHaveURL(/\/nosotros\/$/);
  await expect(page.locator('h1')).toHaveText(/Gente que cumple/);
  expect(await page.evaluate(() => (window as any).__marca)).toBe(1);
});

test('la barra y el botón de contacto tienen nombre de transición propio (no se barren con el contenido)', async ({ page }) => {
  await page.goto('/');
  const nombres = await page.evaluate(() => ({
    barra: getComputedStyle(document.querySelector('header.barra')!).viewTransitionName,
    hablar: getComputedStyle(document.getElementById('hablar')!).viewTransitionName,
    main: getComputedStyle(document.querySelector('main')!).viewTransitionName,
  }));
  expect(nombres.barra).not.toBe('none');
  expect(nombres.hablar).not.toBe('none');
  expect(nombres.main).not.toBe('none');
  expect(new Set(Object.values(nombres)).size).toBe(3);
});

test('las entradas terminan visibles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1');
});

test('con movimiento reducido no hay animación de entrada', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const h1 = page.locator('h1.aparece');
  await expect(h1).toHaveCSS('transition-duration', '0s');
  await expect(h1).toHaveCSS('opacity', '1');
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('el contenido animable es visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1');
  });
});

test('si el script de revelado no carga, el contenido aparece igual', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).IntersectionObserver = function () { throw new Error('sin IntersectionObserver'); };
  });
  await page.goto('/');
  await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1', { timeout: 4000 });
});

test('atrás tras navegar desde el menú móvil: menú cerrado, scroll restaurado y contenido visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForFunction(() => window.scrollY === 300);
  await page.locator('#boton-menu').click();
  await page.locator('#menu-movil .fila a[href="/proyectos/"]').click();
  await expect(page).toHaveURL(/\/proyectos\/$/);
  await expect(page.locator('#menu-movil')).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#menu-movil')).toBeHidden();
  await page.waitForFunction(() => Math.abs(window.scrollY - 300) < 2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1');
});

test('el rescate del revelado se mantiene al navegar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 800 });
  await page.addInitScript(() => {
    (window as any).IntersectionObserver = function () { throw new Error('sin IntersectionObserver'); };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/sin-revela/, { timeout: 4000 });
  await page.locator('#nav-principal a[href="/nosotros/"]').click();
  await expect(page).toHaveURL(/\/nosotros\/$/);
  await expect(page.locator('h1.aparece')).toHaveCSS('opacity', '1');
});
