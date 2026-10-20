import { test, expect } from '@playwright/test';

// F4 · riesgos: el formulario debe enviar sin JavaScript, no avanzar sin datos válidos ni enviar sin la
// autorización Ley 1581, y el botón "Hablar con HL" debe abrir el agente sin navegar.

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('Contacto es un formulario que envía al PHP, con autorización obligatoria y trampa', async ({ page }) => {
    await page.goto('/contacto/');
    const form = page.locator('form.fm');
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).toHaveAttribute('action', '/api/enviar.php');
    await expect(form).toHaveAttribute('enctype', 'multipart/form-data');
    await expect(form.locator('input[name=ley]')).toHaveAttribute('required', '');
    await expect(form.locator('input[name=sitio_web]')).toHaveCount(1);
    await expect(form.locator('input[name=intencion]')).toHaveValue('cotizacion');
  });
});

test('las hojas no avanzan sin datos válidos y el error queda enlazado al campo', async ({ page }) => {
  await page.goto('/contacto/');
  const seguir = page.locator('.fm-pie .fm-primario');
  await expect(seguir).toBeDisabled();
  await page.locator('.fm-int').first().click();
  await seguir.click();
  await expect(page.locator('.fm-hoja h2')).toHaveText('Sus datos');
  await seguir.click();
  const nombre = page.locator('#fm-nombre');
  await expect(nombre).toBeFocused();
  await expect(nombre).toHaveAttribute('aria-describedby', 'fm-e-nombre');
  await expect(page.locator('#fm-e-nombre')).toBeVisible();
});

test('no se envía sin la autorización de datos', async ({ page }) => {
  await page.goto('/proveedores/');
  for (const [id, v] of [['empresa', 'Demo'], ['nit', '900'], ['nombre', 'Ana'], ['correo', 'ana@demo.com']]) await page.fill(`#fm-${id}`, v);
  await page.selectOption('#fm-pais', { index: 1 });
  await page.selectOption('#fm-categoria', { index: 1 });
  const seguir = page.locator('.fm-pie .fm-primario');
  await seguir.click();
  await page.fill('#fm-mensaje', 'Suministro de acero estructural certificado.');
  await seguir.click();
  await expect(seguir).toHaveText('Enviar solicitud');
  await expect(seguir).toBeDisabled();
  await page.locator('.fm-ley input').check();
  await expect(seguir).toBeEnabled();
});

test('Hablar con HL abre el agente sin navegar y Escape lo cierra', async ({ page }) => {
  await page.goto('/hse/');
  await page.locator('#hablar').click();
  await expect(page).toHaveURL(/\/hse\/$/);
  await expect(page.locator('.ag')).toHaveClass(/ag-abierto/);
  await expect(page.locator('#hablar')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.ag-vista')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ag')).not.toHaveClass(/ag-abierto/);
});
