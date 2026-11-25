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

// PNG 1x1 de verdade e um GIF falso grande (só a assinatura conta para recusar pelo tamanho)
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
const GIF_PEQUENO = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
const GIF_GRANDE = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(300 * 1024)]);

test('foto por arquivo, GIF grande recusado, banner por link, remover e tudo fica salvo', async ({ page }) => {
  await page.route(/exemplo-imagens\.test\/banner\.gif/, (r) => r.fulfill({ contentType: 'image/gif', body: GIF_PEQUENO }));
  const erros = await abrir(page, 'perfil', { dados: { 'diario:jogos': diario } });
  await page.locator('#botao-editar-perfil').click();
  const d = page.getByRole('dialog', { name: 'Editar perfil' });

  // GIF acima do limite: recusa e sugere link
  await d.locator('[data-arquivo="avatar"]').setInputFiles({ name: 'grande.gif', mimeType: 'image/gif', buffer: GIF_GRANDE });
  await expect(d.locator('[data-erro="img-avatar"]')).toContainText(/limite.*200 KB.*link/);

  // arquivo que não é imagem
  await d.locator('[data-arquivo="avatar"]').setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>') });
  await expect(d.locator('[data-erro="img-avatar"]')).toContainText('não é uma imagem aceita');

  // foto de verdade: reduzida e aceita
  await d.locator('[data-arquivo="avatar"]').setInputFiles({ name: 'eu.png', mimeType: 'image/png', buffer: PNG });
  await expect(d.locator('.pf-previa-avatar img')).toHaveAttribute('src', /^data:image\/(webp|jpeg);base64,/);
  await expect(d.locator('[data-imagem="avatar"]')).toContainText('Arquivo enviado');

  // banner por link: http é recusado, https que abre é aceito
  await d.locator('[data-abrir-link="banner"]').click();
  await d.locator('[data-link="banner"]').fill('http://exemplo-imagens.test/banner.gif');
  await d.locator('[data-usar-link="banner"]').click();
  await expect(d.locator('[data-erro="img-banner"]')).toContainText('https://');
  await d.locator('[data-link="banner"]').fill('https://exemplo-imagens.test/banner.gif');
  await d.locator('[data-usar-link="banner"]').click();
  await expect(d.locator('[data-imagem="banner"]')).toContainText('Por link');
  await d.getByRole('button', { name: 'Salvar perfil' }).click();

  await expect(page.locator('.pf-avatar.com-foto img')).toHaveAttribute('src', /^data:image\//);
  await expect(page.locator('.pf-capa-fundo img')).toHaveAttribute('src', 'https://exemplo-imagens.test/banner.gif');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.pf-capa-fundo img')).toHaveAttribute('src', 'https://exemplo-imagens.test/banner.gif');

  // remover a foto volta para as iniciais
  await page.locator('#botao-editar-perfil').click();
  await page.getByRole('dialog', { name: 'Editar perfil' }).locator('[data-remover="avatar"]').click();
  await page.getByRole('dialog', { name: 'Editar perfil' }).getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.locator('.pf-avatar img')).toHaveCount(0);
  await expect(page.locator('.pf-avatar')).not.toHaveClass(/com-foto/);
  expect(erros).toEqual([]);
});

