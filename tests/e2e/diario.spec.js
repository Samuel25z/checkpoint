import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto, simular } from './ajuda.js';

const WIKI = /wikipedia\.org\/w\/api\.php/;
const respostaWiki = { query: { pages: { 1: { pageid: 1, index: 1, title: 'Tunic (video game)', extract: 'Tunic is a 2022 action-adventure game.', thumbnail: { source: 'https://upload.wikimedia.org/tunic.jpg' } } } } };

async function adicionar(page, termo, escolha) {
  await page.locator('#botao-adicionar').click();
  await page.getByRole('searchbox', { name: 'Buscar jogo' }).fill(termo);
  await page.locator('.resultado', { hasText: escolha }).first().click();
}

test.describe('fluxo', () => {
  test('adicionar, editar, favoritar, filtrar e excluir; tudo persiste', async ({ page }) => {
    await simular(page, WIKI, respostaWiki);
    const erros = await abrir(page, 'diario');

    // adicionar pelo catálogo
    await page.getByRole('button', { name: 'Adicionar primeiro jogo' }).click();
    await page.getByRole('searchbox', { name: 'Buscar jogo' }).fill('Hades');
    await page.locator('.resultado[data-origem="catalogo"]', { hasText: 'Hades II' }).click();
    await page.locator('[data-status="jogando"]').click();
    await page.locator('input[name="horas"]').fill('12,5');
    await page.locator('input[name="nota"]').evaluate((el) => { el.value = '4.5'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await expect(page.locator('.nota-visor .estrelas')).toHaveAttribute('aria-label', '4,5 de 5 estrelas');
    await page.getByRole('button', { name: 'Adicionar ao diário' }).click();
    await expect(page.locator('.carta', { hasText: 'Hades II' })).toBeVisible();

    // adicionar pela Wikipedia (rede simulada) como zerado
    await adicionar(page, 'Tunic', 'Tunic');
    await page.locator('[data-status="zerado"]').click();
    await page.getByRole('button', { name: 'Adicionar ao diário' }).click();
    await expect(page.locator('.carta', { hasText: 'Tunic' })).toBeVisible();

    // validação: horas inválidas mostram erro e não salvam
    await adicionar(page, 'Celeste', 'Celeste');
    await page.locator('input[name="horas"]').fill('abc');
    await page.getByRole('button', { name: 'Adicionar ao diário' }).click();
    await expect(page.locator('[data-erro="horas"]')).toHaveText(/Informe as horas/);
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.locator('.carta', { hasText: 'Celeste' })).toHaveCount(0);

    // filtrar
    await page.locator('[data-filtro="zerado"]').click();
    await expect(page.locator('#grade-diario .carta')).toHaveCount(1);
    await page.locator('[data-filtro="todos"]').click();
    await page.locator('#busca-diario').fill('hades');
    await expect(page.locator('#grade-diario .carta')).toHaveCount(1);
    await page.locator('#busca-diario').fill('');

    // detalhe → editar
    await page.locator('.carta', { hasText: 'Hades II' }).click();
    await expect(page.getByRole('dialog')).toContainText('12,5 h');
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.locator('[data-status="zerado"]').click();
    await page.getByRole('button', { name: 'Salvar alterações' }).click();
    await expect(page.locator('.carta', { hasText: 'Hades II' })).toContainText('Zerado');

    // favoritar
    await page.locator('.carta', { hasText: 'Tunic' }).click();
    await page.getByRole('button', { name: 'Favoritar' }).click();
    await page.locator('[data-filtro="favoritos"]').click();
    await expect(page.locator('#grade-diario .carta')).toHaveCount(1);
    await page.locator('[data-filtro="todos"]').click();

    // persistência
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#grade-diario .carta')).toHaveCount(2);
    await expect(page.locator('#historico li').first()).toContainText('favoritou Tunic');

    // excluir com confirmação própria
    await page.locator('.carta', { hasText: 'Tunic' }).click();
    await page.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog', { name: 'Excluir do diário?' }).getByRole('button', { name: 'Excluir' }).click();
    await expect(page.locator('.carta', { hasText: 'Tunic' })).toHaveCount(0);
    await semBotaoMorto(page);
    expect(erros).toEqual([]);
  });

  test('o jogo em andamento aparece em "Continuar jogando" na Início', async ({ page }) => {
    await abrir(page, 'inicio', { dados: { 'diario:jogos': [{ id: 'z', nome: 'Celeste', status: 'jogando', nota: null, horas: 2, atualizadoEm: '2026-11-01' }] } });
    await expect(page.locator('.banner')).toContainText('Continuar jogando');
    await expect(page.locator('.banner')).toContainText('Celeste');
    await expect(page.locator('.estante .carta')).toContainText('Celeste');
  });
});

test.describe('estados', () => {
  test('vazio, carregando e erro de rede', async ({ page }) => {
    await page.route(WIKI, async (r) => { await new Promise((ok) => setTimeout(ok, 600)); await r.fulfill({ status: 503, body: 'fora' }); });
    await abrir(page, 'diario');
    await expect(page.getByText('Comece seu diário')).toBeVisible();
    await page.getByRole('button', { name: 'Adicionar primeiro jogo' }).click();
    await page.getByRole('searchbox', { name: 'Buscar jogo' }).fill('Zelda');
    await expect(page.getByText('Buscando na Wikipedia…')).toBeVisible();
    await expect(page.locator('.aviso-rede')).toBeVisible();
    await expect(page.getByRole('button', { name: /Adicionar “Zelda”/ })).toBeVisible();
    await page.getByRole('button', { name: /Adicionar “Zelda”/ }).click();
    await page.getByRole('button', { name: 'Adicionar ao diário' }).click();
    await expect(page.locator('.carta', { hasText: 'Zelda' })).toBeVisible();
  });
});
