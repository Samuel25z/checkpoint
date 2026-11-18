import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

test('detecta a placa, salva dois PCs e mostra o resultado por jogo', async ({ page }) => {
  // simula o texto que o navegador devolve para a placa de vídeo
  await page.addInitScript(() => {
    const orig = WebGLRenderingContext.prototype.getParameter;
    const fake = function (p) { return p === 0x9246 ? 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU Direct3D11 vs_5_0 ps_5_0, D3D11)' : orig.call(this, p); };
    WebGLRenderingContext.prototype.getParameter = fake;
    if (window.WebGL2RenderingContext) WebGL2RenderingContext.prototype.getParameter = fake;
  });
  const erros = await abrir(page, 'roda-no-pc');
  await page.getByRole('button', { name: 'Analisar meu PC' }).last().click();
  await expect(page.locator('#deteccao')).toContainText('Detectamos: NVIDIA GeForce RTX 3060');
  await expect(page.locator('input[name="gpu"]')).toHaveValue('NVIDIA GeForce RTX 3060');

  // validação: processador fora da lista
  await page.locator('input[name="cpu"]').fill('processador inventado');
  await page.getByRole('button', { name: 'Ver o que roda' }).click();
  await expect(page.locator('[data-erro="cpu"]')).toHaveText(/Escolha um processador/);

  // texto livre reconhecido
  await page.locator('input[name="cpu"]').fill('Intel(R) Core(TM) i5-12400');
  await page.locator('select[name="ram"]').selectOption('16');
  await page.getByRole('button', { name: 'Ver o que roda' }).click();
  await expect(page.locator('.pc-pecas')).toContainText('Intel Core i5-12400');
  await expect(page.locator('#lista-jogos-pc li').first()).toBeVisible();
  const total = await page.locator('#lista-jogos-pc li').count();
  expect(total).toBeGreaterThanOrEqual(55);

  // filtro por nível
  await page.locator('.pc-total[data-nivel="ultra"]').click();
  const ultra = Number(await page.locator('.pc-total[data-nivel="ultra"] strong').textContent());
  await expect(page.locator('#lista-jogos-pc li.pc-jogo')).toHaveCount(ultra);
  await page.locator('.pc-total[data-nivel="ultra"]').click();

  // segundo PC, fraco
  await page.locator('#botao-novo-pc').click();
  await page.locator('input[name="nome"]').fill('PC da faculdade');
  await page.locator('input[name="cpu"]').fill('Intel Core i3-4130');
  await page.locator('input[name="gpu"]').fill('Intel UHD Graphics 620');
  await page.locator('select[name="ram"]').selectOption('8');
  await page.getByRole('button', { name: 'Ver o que roda' }).click();
  await expect(page.getByRole('tab', { name: 'PC da faculdade' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.pc-jogo[data-jogo="cyberpunk-2077"]')).toContainText('Não roda');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('tab')).toHaveCount(2);
  await page.getByRole('tab', { name: 'Meu PC' }).click();
  await expect(page.locator('.pc-jogo[data-jogo="hollow-knight"]')).toContainText('Ultra');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});
