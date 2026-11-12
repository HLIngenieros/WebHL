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
  await expect(page.locator('.fm-hoja h2')).toHaveText('Sus datos');
  await seguir.click();
  const nombre = page.locator('#fm-nombre');
  await expect(nombre).toBeFocused();
  await expect(nombre).toHaveAttribute('aria-describedby', 'fm-e-nombre');
  await expect(page.locator('#fm-e-nombre')).toBeVisible();
});

test('las 4 pestañas del acta llevan a su URL con su formulario abierto y sin sedes', async ({ page }) => {
  await page.goto('/contacto/');
  const pestanas = page.locator('.pestanas a');
  await expect(pestanas).toHaveText([/Cotizar/, /proveedor/, /Buzón ético/, /Trabajar con HL/]);
  await expect(pestanas.first()).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.sedes')).toHaveCount(0);
  await pestanas.nth(2).click();
  await expect(page).toHaveURL(/\/buzon-etico\/$/);
  await expect(page).toHaveTitle(/Buzón ético/);
  await expect(page.locator('#nav-principal a[aria-current=page]')).toHaveText('Contacto');
  await expect(page.locator('.fm-cod')).toHaveText('F-03');
  await expect(page.locator('#fm-adjunto')).toHaveAttribute('accept', /pdf/);
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
  await page.goto('/gestion-integral/');
  await page.locator('#hablar').click();
  await expect(page).toHaveURL(/\/gestion-integral\/$/);
  await expect(page.locator('.ag')).toHaveClass(/ag-abierto/);
  await expect(page.locator('#hablar')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.ag-ia')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ag')).not.toHaveClass(/ag-abierto/);
});

test('las vacantes se filtran y "Postularme" entrega la vacante al formulario', async ({ page }) => {
  await page.goto('/vacantes/');
  const vacantes = page.locator('.vc-vac');
  await expect(vacantes.first()).toBeVisible();
  const total = await vacantes.count();
  await page.locator('.vc-grupo').first().locator('.vc-placa').nth(1).click();
  await expect.poll(() => vacantes.count()).toBeLessThan(total);
  await vacantes.first().locator('.vc-fila').click();
  await vacantes.first().getByRole('button', { name: 'Postularme a esta vacante' }).click();
  await expect(page.locator('.fm-vacante strong')).toContainText(/^V-\d+/);
});

test('el ícono y el punto de "Hablar con HL" usan el color del botón (sin choques de clases globales)', async ({ page }) => {
  await page.goto('/');
  const [boton, icono, punto] = await page.evaluate(() => {
    const h = document.getElementById('hablar')!;
    return [getComputedStyle(h).color, getComputedStyle(h.querySelector('.ico svg')!).color, getComputedStyle(h.querySelector('.punto')!).backgroundColor];
  });
  expect(icono).toBe(boton);
  expect(punto).toBe(boton);
});
