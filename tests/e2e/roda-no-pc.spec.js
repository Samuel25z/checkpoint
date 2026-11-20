import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

async function escolher(page, rotulo, texto, opcao) {
  const campo = page.getByRole('combobox', { name: rotulo });
  await campo.click();
  await campo.fill(texto);
  await page.getByRole('option', { name: opcao, exact: true }).click();
  await expect(campo).toHaveValue(opcao);
}

test('detecta a placa, troca por outra pela lista, salva dois PCs e mostra o resultado', async ({ page }) => {
  await page.addInitScript(() => {
    const orig = WebGLRenderingContext.prototype.getParameter;
    const fake = function (p) { return p === 0x9246 ? 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER (0x000021C4) Direct3D11 vs_5_0 ps_5_0, D3D11)' : orig.call(this, p); };
    WebGLRenderingContext.prototype.getParameter = fake;
    if (window.WebGL2RenderingContext) WebGL2RenderingContext.prototype.getParameter = fake;
  });
  const erros = await abrir(page, 'roda-no-pc');
  await page.getByRole('button', { name: 'Analisar meu PC' }).last().click();
  await expect(page.locator('#deteccao')).toContainText('Detectamos: NVIDIA GeForce GTX 1660 Super');
  const gpu = page.getByRole('combobox', { name: 'Placa de vídeo' });
  await expect(gpu).toHaveValue('NVIDIA GeForce GTX 1660 Super');

  // abrir a lista com a placa já escolhida mostra TODAS (não só a escolhida)
  await gpu.click();
  expect(await page.getByRole('option').count()).toBeGreaterThan(20);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible(); // Esc fecha a lista, não a janela

  // limpar e escolher outra (PC do amigo)
  await page.getByRole('button', { name: 'Limpar Placa de vídeo' }).click();
  await expect(gpu).toHaveValue('');
  await escolher(page, 'Placa de vídeo', 'rtx 3060', 'NVIDIA GeForce RTX 3060');

  // processador por busca em partes
  await escolher(page, 'Processador', '12400f', 'Intel Core i5-12400F');
  await page.locator('select[name="ram"]').selectOption('16');
  await page.getByRole('button', { name: 'Ver o que roda' }).click();
  await expect(page.locator('.pc-pecas')).toContainText('Intel Core i5-12400F');
  await expect(page.locator('.pc-pecas')).toContainText('NVIDIA GeForce RTX 3060');
  expect(await page.locator('#lista-jogos-pc li').count()).toBeGreaterThanOrEqual(55);

  // filtro por nível
  await page.locator('.pc-total[data-nivel="ultra"]').click();
  const ultra = Number(await page.locator('.pc-total[data-nivel="ultra"] strong').textContent());
  await expect(page.locator('#lista-jogos-pc li.pc-jogo')).toHaveCount(ultra);
  await page.locator('.pc-total[data-nivel="ultra"]').click();

  // validação: texto que não é peça
  await page.locator('#botao-novo-pc').click();
  await page.locator('input[name="nome"]').fill('PC da faculdade');
  await page.getByRole('combobox', { name: 'Processador' }).fill('processador inventado');
  await page.getByRole('button', { name: 'Ver o que roda' }).click();
  await expect(page.locator('[data-erro="cpu"]')).toHaveText(/Escolha um processador/);

  // notebook com integrada
  await escolher(page, 'Processador', 'i5 1135', 'Intel Core i5-1135G7');
  await page.getByRole('button', { name: 'Limpar Placa de vídeo' }).click();
  await escolher(page, 'Placa de vídeo', 'iris xe', 'Intel Iris Xe Graphics');
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
