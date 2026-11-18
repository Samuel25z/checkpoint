import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto, simular } from './ajuda.js';

const JOGOS = { data: [{ id: 'g1', names: { international: 'Hollow Knight' }, released: 2017, assets: {}, weblink: 'https://www.speedrun.com/hk' }] };
const CATS = { data: [{ id: 'c1', name: 'Any%', type: 'per-game', miscellaneous: false, weblink: 'https://www.speedrun.com/hk?x=any' }] };
const RANK = { data: { runs: [{ place: 1, run: { times: { primary_t: 269.34 }, date: '2024-04-01', players: [{ rel: 'user', id: 'u1' }], videos: { links: [{ uri: 'https://youtu.be/HcBHdz2GgP8' }] } } }], players: { data: [{ id: 'u1', names: { international: 'Fireb0rn' } }] } } };

test.describe('cronometro', () => {
  test('criar rota, correr com teclado, terminar e guardar o PB', async ({ page }) => {
    const erros = await abrir(page, 'speedrun');
    await page.getByRole('button', { name: 'Criar rota' }).click();
    await page.locator('input[name="nome"]').fill('Celeste — Any%');
    await page.locator('textarea[name="splits"]').fill('Capítulo 1\nCapítulo 2\nFim');
    await page.getByRole('button', { name: 'Criar rota' }).last().click();
    await expect(page.locator('#lista-splits li')).toHaveCount(3);

    await page.locator('#relogio').click();
    await page.keyboard.press('Space');
    await expect(page.locator('#relogio')).toHaveClass(/correndo/);
    await page.waitForTimeout(150);
    await page.keyboard.press('Space');
    await expect(page.locator('#lista-splits li.feito')).toHaveCount(1);
    await page.keyboard.press('z'); // desfaz
    await expect(page.locator('#lista-splits li.feito')).toHaveCount(0);
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await expect(page.locator('#relogio')).toHaveClass(/terminado/);
    await expect(page.locator('#pb')).not.toHaveText('—');
    const pb = await page.locator('#pb').textContent();

    // run pior não troca o PB
    await page.keyboard.press('Space'); // nova tentativa
    await page.keyboard.press('Space');
    await page.waitForTimeout(400);
    await page.getByRole('button', { name: 'Split' }).click();
    await page.getByRole('button', { name: 'Split' }).click();
    await page.getByRole('button', { name: 'Terminar' }).click().catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#pb')).toHaveText(pb);
    await expect(page.locator('#seletor-rota')).toHaveValue(/.+/);

    // modo foco abre e fecha com Esc
    await page.locator('#botao-foco').click();
    await expect(page.locator('.painel-tempo')).toHaveClass(/foco/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.painel-tempo')).not.toHaveClass(/foco/);
    await semBotaoMorto(page);
    expect(erros).toEqual([]);
  });

  test('o PB aparece em "Seus recordes" na Início', async ({ page }) => {
    await abrir(page, 'inicio', { dados: { 'speedrun:rotas': [{ id: 'r', nome: 'HK Any%', jogo: 'HK', splits: [{ nome: 'Fim', pb: 300000, melhor: 300000 }], pbTotal: 300000, tentativas: 1, concluidas: 1, categoria: null }] } });
    await expect(page.locator('.painel-speedrun')).toContainText('5:00.00');
  });
});

test.describe('ranking', () => {
  test('busca o jogo, mostra o top com rede simulada e cria rota com o recorde mundial', async ({ page }) => {
    await simular(page, /speedrun\.com\/api\/v1\/games\?/, JOGOS);
    await simular(page, /speedrun\.com\/api\/v1\/games\/g1\/categories/, CATS);
    await simular(page, /speedrun\.com\/api\/v1\/leaderboards\//, RANK);
    await abrir(page, 'speedrun/recordes');
    await page.locator('#busca-speedrun').fill('hollow');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await page.locator('.sr-carta', { hasText: 'Hollow Knight' }).click();
    await expect(page.locator('.ranking')).toContainText('Fireb0rn');
    await expect(page.locator('.ranking')).toContainText('4:29.34');
    await expect(page.getByRole('link', { name: 'Enviar sua run' })).toHaveAttribute('href', /speedrun\.com/);
    await page.locator('#criar-rota-categoria').click();
    await expect(page.locator('.placar-wr')).toContainText('4:29.34');
  });

  test('erro da API mostra mensagem e botão de tentar de novo', async ({ page }) => {
    await page.route(/speedrun\.com\/api/, (r) => r.fulfill({ status: 500, body: 'erro' }));
    await abrir(page, 'speedrun/recordes');
    await page.locator('#busca-speedrun').fill('hollow');
    await page.getByRole('button', { name: 'Buscar' }).click();
    await expect(page.getByText('O speedrun.com não respondeu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
  });
});
