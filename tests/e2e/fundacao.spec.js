import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';
import { MODULOS } from '../../js/modules/registry.js';

test.describe('navegacao', () => {
  test('abre cada aba pelo menu e pela URL, sem erro no console', async ({ page }) => {
    const erros = await abrir(page);
    for (const m of MODULOS) {
      await page.locator(`.nav-item[data-rota="${m.rota}"]`).click();
      await expect(page).toHaveURL(new RegExp(`#/${m.rota}`));
      await expect(page.locator(`#palco .aba-${m.id}`)).toBeVisible();
      await expect(page.locator(`.nav-item[data-rota="${m.rota}"]`)).toHaveAttribute('aria-current', 'page');
    }
    for (const m of MODULOS) {
      await page.goto(`/#/${m.rota}`);
      await expect(page.locator(`#palco .aba-${m.id}`)).toBeVisible();
    }
    expect(erros).toEqual([]);
  });

  test('rota desconhecida volta para o Início', async ({ page }) => {
    await abrir(page, 'nao-existe');
    await expect(page).toHaveURL(/#\/inicio$/);
    await expect(page.getByRole('heading', { name: 'Seu checkpoint' })).toBeVisible();
  });

  test('o link "Pular para o conteúdo" leva o foco ao conteúdo sem trocar de aba', async ({ page }) => {
    await abrir(page, 'inicio');
    await page.locator('.pular').focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#\/inicio$/);
    await expect(page.locator('#palco')).toBeFocused();
  });

  test('a página não rola para o lado no celular', async ({ page }) => {
    await abrir(page);
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(1);
  });
});

test.describe('tema', () => {
  test('alterna claro/escuro e lembra ao recarregar', async ({ page }) => {
    await abrir(page);
    const html = page.locator('html');
    const inicial = await html.getAttribute('data-tema');
    const outro = inicial === 'escuro' ? 'claro' : 'escuro';
    await page.locator('#botao-tema').click();
    await expect(html).toHaveAttribute('data-tema', outro);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(html).toHaveAttribute('data-tema', outro);
    await expect(page.locator('#botao-tema')).toHaveAttribute('aria-label', /Mudar para o tema/);
  });

  test('sem botão morto e sem alert nativo', async ({ page }) => {
    let dialogo = false;
    page.on('dialog', (d) => { dialogo = true; d.dismiss(); });
    await abrir(page);
    await semBotaoMorto(page);
    for (const a of await page.locator('a.atalho').all()) await expect(a).toHaveAttribute('href', /^#\/.+/);
    expect(dialogo).toBe(false);
  });
});
