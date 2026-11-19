import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const AJUDANTE = 'https://ajudante.exemplo';
const CONFIG = `export const SUPABASE = { url: '', chaveAnon: '' }; export const STEAM_AJUDANTE = '${AJUDANTE}'; export const SUPABASE_SDK = '';`;
const json = (corpo, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(corpo), headers: { 'access-control-allow-origin': '*' } });

const JOGOS = [
  { appid: 367520, nome: 'Hollow Knight', minutos: 2520, minutos2semanas: 0, ultimaVez: '2026-03-01T00:00:00.000Z' },   // 100% → platinado
  { appid: 1145350, nome: 'Hades II', minutos: 600, minutos2semanas: 120, ultimaVez: '2026-11-15T00:00:00.000Z' },      // 2 semanas → jogando
  { appid: 2379780, nome: 'Balatro', minutos: 0, minutos2semanas: 0, ultimaVez: null },                                  // nunca → quero
  { appid: 1245620, nome: 'ELDEN RING', minutos: 4800, minutos2semanas: 0, ultimaVez: '2026-06-01T00:00:00.000Z' },     // sem fato → escolher
  { appid: 504230, nome: 'Celeste', minutos: 1320, minutos2semanas: 0, ultimaVez: '2026-04-20T00:00:00.000Z' }          // já no diário
];

test.describe('importar', () => {
  test('cola o perfil, revisa só com fatos, escolhe em massa e importa sem duplicar', async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: CONFIG }));
    await page.route(`${AJUDANTE}/perfil**`, (r) => r.fulfill(json({ steamid: '76561198000000001', nome: 'Samuel', avatar: null, publico: true })));
    await page.route(`${AJUDANTE}/jogos**`, (r) => r.fulfill(json({ jogos: JOGOS })));
    await page.route(`${AJUDANTE}/conquistas**`, (r) => r.fulfill(json({ conquistas: { 367520: { total: 63, feitas: 63, ultima: '2026-03-01T12:00:00.000Z' }, 1145350: { total: 49, feitas: 10, ultima: null }, 1245620: { total: 42, feitas: 30, ultima: null }, 504230: null } })));
    const erros = await abrir(page, 'diario', { dados: { 'diario:jogos': [{ id: 'm1', nome: 'Celeste', jogoId: 'celeste', status: 'zerado', nota: 5, horas: 9, atualizadoEm: '2026-04-20' }] } });

    await page.locator('#botao-steam').click();
    await page.getByLabel('Link do perfil da Steam').fill('https://steamcommunity.com/id/samuel');
    await page.locator('#buscar-steam').click();
    const lista = page.locator('#lista-steam');
    await expect(lista.locator('li')).toHaveCount(5);
    await expect(lista.locator('[data-appid="367520"]')).toContainText('100% das conquistas');
    await expect(lista.locator('[data-appid="1145350"] select')).toHaveValue('jogando');
    await expect(lista.locator('[data-appid="2379780"] select')).toHaveValue('quero');
    await expect(lista.locator('[data-appid="1245620"] select')).toHaveValue('', { timeout: 2000 }); // sem fato, sem chute
    await expect(lista.locator('[data-appid="504230"]')).toContainText('Já no diário');
    await expect(page.locator('#contador-steam')).toHaveText('3 para importar');
    await semBotaoMorto(page); // inclui a janela aberta (sem "null" solto)

    // escolha em massa para quem está sem status
    await page.locator('#status-em-massa').selectOption('larguei');
    await page.locator('#aplicar-em-massa').click();
    await expect(lista.locator('[data-appid="1245620"] select')).toHaveValue('larguei');
    await expect(page.locator('#contador-steam')).toHaveText('4 para importar');
    await page.locator('#confirmar-importacao').click();

    await expect(page.locator('#grade-diario .carta')).toHaveCount(5);
    await expect(page.locator('.carta', { hasText: 'Hollow Knight' })).toContainText('Platinado');
    await expect(page.locator('.carta', { hasText: 'Elden Ring' })).toContainText('Larguei');
    await expect(page.locator('.carta', { hasText: 'Celeste' })).toHaveCount(1);
    await expect(page.locator('#historico li').first()).toContainText('importou 4 jogos da Steam');

    // reimportar não duplica nada
    await page.locator('#botao-steam').click();
    await page.locator('#buscar-steam').click();
    await expect(page.locator('#contador-steam')).toHaveText('0 para importar');
    await page.locator('#confirmar-importacao').click();
    await expect(page.locator('#grade-diario .carta')).toHaveCount(5);
    await semBotaoMorto(page);
    expect(erros).toEqual([]);
  });

  test('biblioteca privada mostra como resolver', async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: CONFIG }));
    await page.route(`${AJUDANTE}/perfil**`, (r) => r.fulfill(json({ steamid: '76561198000000001', nome: 'Samuel', publico: false })));
    await page.route(`${AJUDANTE}/jogos**`, (r) => r.fulfill(json({ erro: 'A biblioteca deste perfil está privada.', privado: true }, 403)));
    await abrir(page, 'diario');
    await page.locator('#botao-steam').click();
    await page.getByLabel('Link do perfil da Steam').fill('samuel');
    await page.locator('#buscar-steam').click();
    await expect(page.locator('#erro-steam')).toContainText('Detalhes do jogo');
  });
});

test.describe('sem-ajudante', () => {
  test('sem o ajudante publicado, explica que a importação não está ligada', async ({ page }) => {
    await abrir(page, 'diario');
    await page.locator('#botao-steam').click();
    await expect(page.getByRole('dialog', { name: 'Importar da Steam' })).toContainText('ainda não foi ligada');
  });
});
