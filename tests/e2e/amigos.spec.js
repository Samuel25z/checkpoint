import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

import { SDK, CONFIG, FAKE_SDK, FAKE_SOCIAL } from './fakes-amigos.js';

const ANA = { user_id: 'u2', usuario: 'ana_games', nome: 'Ana', frase: 'Platino tudo.', privado: false, avatar_url: null, banner_url: null,
  resumo: { numeros: { jogos: 12, finalizados: 8, platinados: 3, horas: 410, media: 4.5 }, nivel: { nivel: 9, titulo: 'Aventureiro' },
    favoritos: [{ nome: 'Celeste', capa: null, horas: 14, coroado: true }], medalhas: [{ id: 'platinador', nome: 'Caçador de troféus', grau: 'prata' }],
    jogando: [{ nome: 'Hades II', capa: null, status: 'jogando', horas: 30 }], recentes: [{ nome: 'Hades II', capa: null, status: 'jogando', horas: 30, em: '2026-11-20' }] } };
const SECRETO = { user_id: 'u3', usuario: 'anonimo', nome: 'Secreto', privado: true, resumo: {} };

async function preparar(page, { logado = true, social = { perfis: { u2: ANA, u3: SECRETO }, seguindo: [['u2', 'u1']] } } = {}) {
  await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: CONFIG }));
  await page.route(SDK, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_SDK, headers: { 'access-control-allow-origin': '*' } }));
  await page.route(/\/js\/services\/social\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_SOCIAL }));
  const brutos = { 'fake-social': social };
  if (logado) brutos['fake-sessao'] = { user: { id: 'u1', email: 'samuel@exemplo.com', user_metadata: { full_name: 'Samuel Mota' }, app_metadata: { providers: ['google'] } } };
  return brutos;
}

test('sem conta: a aba convida a entrar', async ({ page }) => {
  const brutos = await preparar(page, { logado: false });
  const erros = await abrir(page, 'amigos', { manterConfig: true, brutos });
  await expect(page.getByText('Entre para seguir seus amigos')).toBeVisible();
  expect(erros).toEqual([]);
});

test('escolher o @, buscar, seguir de volta, virar amigos e ver o feed', async ({ page }) => {
  const brutos = await preparar(page);
  const erros = await abrir(page, 'amigos', { manterConfig: true, brutos, dados: { 'perfil:dados': { nome: 'Samuel Mota', frase: '', favoritos: [], coroado: null } } });
  const campo = page.getByLabel('Nome de usuário');
  await expect(campo).toHaveValue('samuel_mota');
  await campo.fill('ab');
  await page.locator('#criar-perfil-publico').click();
  await expect(page.locator('.am-criar .campo-erro')).toHaveText('Use pelo menos 3 caracteres.');
  await campo.fill('ana_games');
  await page.locator('#criar-perfil-publico').click();
  await expect(page.locator('.am-criar .campo-erro')).toContainText('já é de outra pessoa');
  await campo.fill('samuel');
  await page.locator('#criar-perfil-publico').click();

  await expect(page.locator('.am-eu')).toContainText('@samuel');
  await expect(page.locator('.am-eu')).toContainText('1 seguidor ·');
  await page.locator('.am-aba[data-aba="seguidores"]').click();
  await expect(page.locator('.am-pessoa[data-pessoa="ana_games"]')).toContainText('segue você');

  // buscar e seguir de volta
  await page.locator('#busca-amigos').fill('an');
  const resultado = page.locator('.am-resultados .am-pessoa[data-pessoa="ana_games"]');
  await expect(resultado).toBeVisible();
  await expect(page.locator('.am-resultados .am-pessoa[data-pessoa="anonimo"]')).toHaveCount(0);
  await resultado.getByRole('button', { name: 'Seguir' }).click();
  await expect(page.locator('.am-aba[data-aba="amigos"]')).toHaveText('Amigos (1)');
  await page.locator('.am-aba[data-aba="feed"]').click();
  await expect(page.locator('.am-feed li').first()).toContainText('Hades II');

  // perfil público da Ana
  await page.locator('.am-feed-quem').first().click();
  await expect(page).toHaveURL(/#\/amigos\/@ana_games$/);
  await expect(page.locator('.am-capa')).toContainText('Ana');
  await expect(page.locator('.am-capa')).toContainText('Nível 9');
  await expect(page.locator('.pf-jogo.coroado')).toContainText('Celeste');
  await expect(page.getByRole('button', { name: 'Seguindo' })).toBeVisible();
  await page.getByRole('button', { name: 'Seguindo' }).click();
  await expect(page.getByRole('button', { name: 'Seguir', exact: true })).toBeVisible();
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});

test('perfil privado não aparece para os outros', async ({ page }) => {
  const brutos = await preparar(page, { social: { perfis: { u1: { user_id: 'u1', usuario: 'samuel', nome: 'Samuel', privado: false, resumo: {} }, u3: SECRETO }, seguindo: [] } });
  await abrir(page, 'amigos/@anonimo', { manterConfig: true, brutos });
  await expect(page.getByText('@anonimo não encontrado')).toBeVisible();
});

test('deixar o próprio perfil privado', async ({ page }) => {
  const brutos = await preparar(page, { social: { perfis: { u1: { user_id: 'u1', usuario: 'samuel', nome: 'Samuel', privado: false, resumo: {} } }, seguindo: [] } });
  await abrir(page, 'amigos', { manterConfig: true, brutos });
  await page.locator('#perfil-privado').check();
  await expect(page.getByText('Seu perfil agora é privado')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('fake-social')).perfis.u1.privado)).toBe(true);
});
