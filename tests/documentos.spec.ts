// Documentos y agente conectado (plan AG.4, AG.6). La vista previa no corre PHP: el agente cae en "sin servicio"
// y la página Documentos lee el catálogo de muestra (src/lib/documentos-muestra.json).
import { test, expect } from '@playwright/test';

test('Documentos agrupa por carpeta, filtra y busca; el vencido no aparece', async ({ page }) => {
  await page.goto('/documentos/');
  await expect(page.locator('.dc-grupo')).toHaveCount(5);
  await expect(page.locator('#certificaciones .dc-lam')).toHaveCount(3);
  await expect(page.locator('#certificaciones .dc-aviso')).toHaveCount(1); // ISO 45001 vence en < 60 días (muestra)
  await page.getByRole('button', { name: /Políticas/ }).click();
  await expect(page.locator('.dc-lam')).toHaveCount(2);
  await page.getByRole('button', { name: /Todos/ }).click();
  await page.getByRole('searchbox').fill('sgs');
  await expect(page.locator('.dc-lam')).toHaveCount(3);
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.locator('.dc-estado')).toBeVisible();
});

test('Documents en inglés y enlace desde HSE', async ({ page }) => {
  await page.goto('/en/documents/');
  await expect(page.locator('h2', { hasText: 'Certifications' })).toBeVisible();
  await page.goto('/hse/');
  await expect(page.locator('a.cert-docs')).toHaveAttribute('href', '/documentos/#certificaciones');
});

test('el agente sin servicio ofrece los contactos de siempre', async ({ page }) => {
  await page.goto('/contacto/');
  await page.locator('#hablar').click();
  await page.locator('.ag-entrada input').fill('¿Desde cuándo existe HL?');
  await page.locator('.ag-entrada button').click();
  await expect(page.locator('.ag-falla')).toBeVisible();
  await expect(page.locator('.ag-derivar .ag-btn')).toHaveAttribute('href', '/contacto/');
  await expect(page.locator('.ag-cnt')).toHaveText('1 / 20');
});
