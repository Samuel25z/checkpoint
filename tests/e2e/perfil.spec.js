import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const J = (id, nome, jogoId, status, nota, horas, extra = {}) => ({ id, nome, jogoId, status, nota, horas, plataforma: 'PC', criadoEm: '2026-05-10T10:00:00Z', atualizadoEm: '2026-11-01T10:00:00Z', ...extra });
const diario = [
  J('a', 'Elden Ring', 'elden-ring', 'jogando', 5, 80, { conquistas: { total: 42, feitas: 30 } }),
  J('b', 'Hollow Knight', 'hollow-knight', 'zerado', 5, 42, { fim: '2026-03-10' }),
  J('c', 'Celeste', 'celeste', 'platinado', 4.5, 14, { fim: '2026-04-20' }),
  J('d', 'Balatro', 'balatro', 'zerado', 4, 60, { fim: '2026-06-02' }),
  J('e', 'Hades II', 'hades-2', 'jogando', 4.5, 30),
  J('f', 'Outer Wilds', 'outer-wilds', 'zerado', 5, 22, { fim: '2026-10-15' }),
];

test('sem jogos no Diário, o perfil convida a começar por lá', async ({ page }) => {
  const erros = await abrir(page, 'perfil');
  await expect(page.getByText('Seu perfil começa no Diário')).toBeVisible();
  await page.getByRole('button', { name: 'Ir para o Diário' }).click();
  await expect(page).toHaveURL(/#\/diario/);
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(erros).toEqual([]);
});

test('editar perfil: nome, frase, até 5 favoritos, coroa e tudo fica salvo', async ({ page }) => {
  const erros = await abrir(page, 'perfil', { dados: { 'diario:jogos': diario } });
  await expect(page.locator('.pf-numeros')).toContainText('6');
  await page.getByRole('button', { name: 'Escolher favoritos' }).click();
  const d = page.getByRole('dialog', { name: 'Editar perfil' });
  await d.locator('input[name="nome"]').fill('Samuel Mota');
  await d.locator('input[name="frase"]').fill('Só mais uma run.');
  for (const id of ['b', 'a', 'c', 'f', 'd']) await d.locator(`[data-fav="${id}"]`).click();
  await expect(d.locator('[data-fav="e"]')).toBeDisabled();
  await expect(d.getByText('5 de 5')).toBeVisible();
  await d.locator('[data-coroa="c"]').click();
  await expect(d.locator('[data-coroa="c"]')).toHaveAttribute('aria-pressed', 'true');
  await d.getByRole('button', { name: 'Salvar perfil' }).click();

  await expect(page.locator('.pf-quem h2')).toContainText('Samuel Mota');
  await expect(page.locator('.pf-avatar')).toHaveText('SM');
  await expect(page.locator('.pf-frase')).toContainText('Só mais uma run.');
  await expect(page.locator('.pf-favoritos .pf-jogo')).toHaveCount(5);
  await expect(page.locator('.pf-jogo.coroado')).toContainText('Celeste');
  await expect(page.locator('.pf-capa-fundo img')).toHaveAttribute('src', /504230\/library_hero\.jpg/);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.pf-jogo.coroado')).toContainText('Celeste');
  await page.locator('.pf-jogo.coroado').click();
  await expect(page).toHaveURL(/#\/diario\/c$/);
  expect(erros).toEqual([]);
});

test('estatísticas, nível e medalhas aparecem calculados do Diário', async ({ page }) => {
  const erros = await abrir(page, 'perfil', { dados: { 'diario:jogos': diario, 'diario:atividades': [{ tipo: 'adicionou', nome: 'X', quando: new Date().toISOString() }] } });
  await expect(page.locator('.pf-nivel')).toContainText(/Nível \d+/);
  await expect(page.locator('.pf-xp')).toHaveAttribute('aria-valuenow', /\d+/);
  await expect(page.locator('.pf-medalha')).toHaveCount(6);
  await expect(page.locator('.pf-medalha[data-medalha="platinador"]')).toContainText('Bronze');
  await expect(page.locator('.pf-radar svg polygon.pf-radar-area')).toHaveCount(1);
  await expect(page.locator('.pf-notas span')).toHaveCount(10);
  await expect(page.locator('.pf-mapa span.ativo')).not.toHaveCount(0);
  await expect(page.locator('.pf-destaques')).toContainText('PC');
  await expect(page.locator('.pf-recentes .pf-jogo')).toHaveCount(6);
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});
