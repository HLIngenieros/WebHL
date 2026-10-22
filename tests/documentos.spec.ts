// Documentos y agente conectado (plan AG.4, AG.6, AG.11). La vista previa no corre PHP: el agente cae en "sin servicio".
// La página Documentos sale de src/content/documentos.yaml, ya en el HTML (sin fetch).
import { test, expect } from '@playwright/test';

test('Documentos viene en el HTML desde la colección; filtra y busca', async ({ page }) => {
  await page.goto('/documentos/');
  await expect(page.locator('#politicas .dc-lam')).toHaveCount(1);
  const pdf = page.locator('#politicas .dc-bajar');
  await expect(pdf).toHaveAttribute('href', '/documentos/politica-datos-M-TI-001-act-2.pdf');
  expect((await page.request.get('/documentos/politica-datos-M-TI-001-act-2.pdf')).ok()).toBe(true);
  await page.getByRole('searchbox').fill('1581');
  await expect(page.locator('.dc-lam')).toHaveCount(1);
  await page.getByRole('searchbox').fill('zzzz');
  await expect(page.locator('.dc-estado')).toBeVisible();
});

test('el catálogo del agente trae cada documento en ambos idiomas', async ({ request }) => {
  const docs = await (await request.get('/api/documentos.json')).json();
  expect(docs.map((d: { lang: string }) => d.lang).sort()).toEqual(['en', 'es']);
});

test('Documents en inglés y enlace desde HSE', async ({ page }) => {
  await page.goto('/en/documents/');
  await expect(page.locator('h2', { hasText: 'Policies' })).toBeVisible();
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
