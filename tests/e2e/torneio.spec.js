import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

test('cria torneio de 6, joga até o campeão, recarrega e vê no histórico', async ({ page }) => {
  const erros = await abrir(page, 'torneio');
  await page.locator('input[name="nome"]').fill('Copa da sala');
  await page.locator('input[name="jogo"]').fill('Rocket League');

  // validação
  await page.locator('textarea[name="jogadores"]').fill('Ana\nBeto\nana');
  await page.getByRole('button', { name: 'Sortear a chave' }).click();
  await expect(page.locator('#erro-jogadores')).toContainText(/pelo menos 4|duas vezes/);

  await page.locator('textarea[name="jogadores"]').fill('Samuel\nArthur\nJoão\nMaria\nLeo\nBia');
  await expect(page.locator('#contador-jogadores')).toHaveText('6 de 32');
  await page.getByRole('button', { name: 'Sortear a chave' }).click();
  await expect(page.locator('.rodada')).toHaveCount(3);
  await expect(page.locator('.rodada').first().locator('.lado.vazio')).toHaveCount(2); // 2 folgas

  // joga até acabar: sempre clica no primeiro lado jogável sem vencedor
  for (let i = 0; i < 10; i++) {
    const lado = page.locator('.partida:not(.decidida) .lado:not([disabled])').first();
    if (!(await lado.count())) break;
    await lado.click();
  }
  await expect(page.locator('#campeao')).toBeVisible();
  const nome = (await page.locator('#campeao h2').textContent()).trim();

  // desfazer a final tira o campeão
  await page.locator('.rodada').last().locator('.lado.ganhou').click();
  await expect(page.locator('#campeao')).toHaveCount(0);
  await page.locator('.rodada').last().locator('.lado', { hasText: nome }).click();
  await expect(page.locator('#campeao h2')).toHaveText(nome);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#campeao h2')).toHaveText(nome);
  await page.getByRole('button', { name: 'Novo torneio' }).click();
  await expect(page.locator('#historico-torneios')).toContainText(`${nome}`);
  await expect(page.locator('#historico-torneios')).toContainText('venceu Copa da sala');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});
