import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

test('responde as perguntas, vê 3 sugestões com motivo e adiciona uma ao diário', async ({ page }) => {
  const erros = await abrir(page, 'recomendador', { dados: { 'diario:jogos': [{ id: 'd1', nome: 'Hollow Knight', jogoId: 'hollow-knight', status: 'zerado', nota: 5, atualizadoEm: '2026-01-01' }] } });
  await page.locator('[data-grupo="humor"][data-valor="desafio"]').click();
  await page.locator('[data-grupo="tempo"][data-valor="medio"]').click();
  await page.locator('[data-grupo="plataforma"][data-valor="PC"]').click();
  await page.locator('#recomendar').click();
  const cartoes = page.locator('#sugestoes .sugestao');
  await expect(cartoes).toHaveCount(3);
  await expect(page.locator('#sugestoes')).toContainText('Porque você deu 5 para Hollow Knight');
  await expect(page.locator('#sugestoes .sugestao[data-jogo="hollow-knight"]')).toHaveCount(0);
  await expect(cartoes.first().getByRole('link', { name: 'Ver trailer' })).toHaveAttribute('href', /youtube\.com\/results/);

  // outra sugestão não repete
  const antes = await cartoes.evaluateAll((c) => c.map((x) => x.dataset.jogo));
  await page.locator('#outra-sugestao').click();
  const depois = await page.locator('#sugestoes .sugestao').evaluateAll((c) => c.map((x) => x.dataset.jogo));
  expect(depois.some((id) => antes.includes(id))).toBe(false);

  // adicionar ao diário
  const nome = (await page.locator('#sugestoes .sugestao h3').first().textContent()).trim();
  await page.locator('#sugestoes .sugestao').first().getByRole('button', { name: 'Quero jogar' }).click();
  await expect(page.locator('#sugestoes .sugestao').first()).toContainText('Já está no diário');
  await page.goto('/#/diario');
  await expect(page.locator('.carta', { hasText: nome })).toContainText('Quero jogar');

  // respostas lembradas
  await page.goto('/#/recomendador');
  await expect(page.locator('[data-grupo="humor"][data-valor="desafio"]')).toHaveAttribute('aria-pressed', 'true');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});

test('sugestão do dia aparece na Início', async ({ page }) => {
  await abrir(page, 'inicio');
  await expect(page.locator('.painel-recomendador')).toContainText('Sugestão do dia');
});
