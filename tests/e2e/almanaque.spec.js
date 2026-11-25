import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto, simular } from './ajuda.js';

const SPEEDRUN = /speedrun\.com\/api\/v1\/leaderboards/;
const recorde = { data: { runs: [{ place: 1, run: { players: [{ rel: 'guest', name: 'Corredor' }], times: { primary_t: 294.299 }, date: '2026-10-31', weblink: 'https://www.speedrun.com/run/1' } }], players: { data: [] } } };

test('capa: fato do dia, 4 capítulos e "Me surpreenda" que troca de fato', async ({ page }) => {
  const erros = await abrir(page, 'almanaque');
  await expect(page.getByRole('heading', { name: 'Almanaque', level: 1 })).toBeVisible();
  const dia = page.getByRole('region', { name: 'Fato do dia' });
  await expect(dia).toContainText('Fato do dia');
  await expect(dia.locator('.alm-fonte')).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('.alm-capitulo')).toHaveCount(4);
  await expect(page.locator('.alm-rodape')).toContainText(/Dados atualizados em \d{2}\/\d{2}\/\d{4}/);

  await page.locator('#botao-surpreenda').click();
  const modal = page.getByRole('dialog', { name: 'Me surpreenda' });
  const primeiro = await modal.locator('.alm-fato-grande').getAttribute('data-fato');
  await modal.getByRole('button', { name: 'Outro' }).click();
  await expect(modal.locator('.alm-fato-grande')).not.toHaveAttribute('data-fato', primeiro);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});

test('prêmios: troca de prêmio, linha do tempo, rankings e "Quero jogar" vai para o diário', async ({ page }) => {
  const erros = await abrir(page, 'almanaque');
  await page.locator('.alm-capitulo[data-capitulo="premios"]').click();
  await expect(page).toHaveURL(/#\/almanaque\/premios/);
  await expect(page.locator('.alm-aba[data-premio="tga"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.alm-edicao[data-ano="2014"]')).toContainText('Dragon Age: Inquisition');
  await expect(page.locator('.alm-ranking').first().locator('li')).not.toHaveCount(0);

  await page.locator('.alm-aba[data-premio="bafta"]').click();
  await expect(page).toHaveURL(/#\/almanaque\/premios\/bafta$/);
  await expect(page.locator('.alm-aba[data-premio="bafta"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.alm-edicao').first()).toBeVisible();

  const vencedor = page.locator('.alm-vencedor').first();
  const nome = (await vencedor.locator('h3').textContent()).trim();
  await vencedor.getByRole('button', { name: 'Quero jogar' }).click();
  await expect(vencedor.getByRole('button', { name: 'No seu diário' })).toBeDisabled();
  await page.goto('/#/diario');
  await expect(page.locator('.carta', { hasText: nome })).toContainText('Quero jogar');
  expect(erros).toEqual([]);
});

test('recordes ao vivo do speedrun.com, mais vendidos e mais jogados', async ({ page }) => {
  await simular(page, SPEEDRUN, recorde);
  const erros = await abrir(page, 'almanaque/recordes');
  await expect(page.locator('.alm-run')).toHaveCount(8);
  await expect(page.locator('.alm-run').first().locator('.alm-tempo')).toHaveText('4:54.299');
  await expect(page.locator('.alm-run').first()).toContainText('Corredor');
  await expect(page.locator('.alm-barras li').first()).toContainText('Tetris');
  await expect(page.locator('.alm-steam li')).not.toHaveCount(0);
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});

test('speedrun.com fora do ar: o resto do capítulo continua', async ({ page }) => {
  await simular(page, SPEEDRUN, { erro: 'fora' }, 503);
  await abrir(page, 'almanaque/recordes');
  await expect(page.locator('.alm-run').first()).toContainText('fora do ar');
  await expect(page.locator('.alm-barras li').first()).toContainText('Tetris');
});

test('neste dia e curiosidades', async ({ page }) => {
  const erros = await abrir(page, 'almanaque/neste-dia');
  await expect(page.locator('.alm-dia-item').first().locator('.alm-ha')).toHaveText(/^Há \d+ anos?$|^Neste ano$/);
  await page.locator('.alm-nav-item', { hasText: 'Curiosidades' }).click();
  await expect(page.locator('.alm-card').first()).toBeVisible();
  expect(await page.locator('.alm-card').count()).toBeGreaterThanOrEqual(20);
  await expect(page.locator('.alm-card .alm-fonte')).not.toHaveCount(0);
  await page.locator('.alm-nav a', { hasText: 'Capa' }).click();
  await expect(page.locator('.alm-capitulo')).toHaveCount(4);
  expect(erros).toEqual([]);
});

test('sem o arquivo de dados: mostra erro com "Tentar de novo", sem quebrar', async ({ page }) => {
  await page.route(/almanaque\.json/, (r) => r.fulfill({ status: 500, body: 'x' }));
  await abrir(page, 'almanaque');
  await expect(page.getByRole('alert')).toContainText('Não deu para abrir o Almanaque');
  await expect(page.getByRole('button', { name: 'Tentar de novo' })).toBeVisible();
});
