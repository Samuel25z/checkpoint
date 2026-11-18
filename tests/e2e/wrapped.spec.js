import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const ano = new Date().getFullYear();
const diario = [
  { id: 'a', nome: 'Hollow Knight', jogoId: 'hollow-knight', status: 'zerado', nota: 5, horas: 42, plataforma: 'PC', inicio: `${ano}-01-10`, fim: `${ano}-03-02`, atualizadoEm: `${ano}-03-02` },
  { id: 'b', nome: 'Elden Ring', jogoId: 'elden-ring', status: 'jogando', nota: 4, horas: 80, plataforma: 'PC', inicio: `${ano}-03-05`, atualizadoEm: `${ano}-03-05` }
];

test('percorre as telas e baixa o card PNG', async ({ page }) => {
  const erros = await abrir(page, 'wrapped', { dados: { 'diario:jogos': diario } });
  const tela = page.locator('.w-tela');
  await expect(tela).toContainText(`Seu ${ano}`);
  await page.keyboard.press('ArrowRight');
  await expect(tela).toContainText('122');
  await expect(tela).toContainText('horas');
  await page.keyboard.press('ArrowRight');
  await expect(tela).toContainText('Você zerou');
  await page.keyboard.press('ArrowRight');
  await expect(tela).toContainText('Elden Ring');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await expect(tela).toContainText('Seu perfil');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#baixar-card').click()]);
  expect(download.suggestedFilename()).toBe(`checkpoint-wrapped-${ano}.png`);
  await page.getByRole('button', { name: 'Ver de novo' }).click();
  await expect(tela).toContainText(`Seu ${ano}`);
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});

test('ano sem jogos mostra o estado vazio com atalho para o diário', async ({ page }) => {
  await abrir(page, 'wrapped');
  await expect(page.getByText(`Nada registrado em ${ano}`)).toBeVisible();
  await page.getByRole('button', { name: 'Abrir diário' }).click();
  await expect(page).toHaveURL(/#\/diario/);
});
