// Utilidades compartilhadas pelos testes de ponta a ponta.
import { expect } from '@playwright/test';

/** Abre o site limpo (sem dados salvos) e registra erros de console. */
// Config de teste sem login: os testes nunca falam com o Supabase de verdade.
// Quem testa a conta passa { manterConfig: true } e simula a própria config antes de abrir.
const CONFIG_SEM_LOGIN = "export const SUPABASE = { url: '', chaveAnon: '' }; export const STEAM_AJUDANTE = ''; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';";

export async function abrir(page, rota = 'inicio', { dados = {}, manterConfig = false } = {}) {
  const erros = [];
  if (!manterConfig) await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: CONFIG_SEM_LOGIN }));
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) erros.push(m.text()); });
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('__limpo')) return;
    localStorage.clear();
    for (const [k, v] of Object.entries(d)) localStorage.setItem('checkpoint:' + k, JSON.stringify(v));
    sessionStorage.setItem('__limpo', '1');
  }, dados);
  await page.goto('/#/' + rota, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#palco .aba')).toBeVisible();
  return erros;
}

/** Garante que a tela não tem botão morto óbvio. */
export async function semBotaoMorto(page) {
  await expect(page.locator('a[href="#"]')).toHaveCount(0);
  await expect(page.getByText(/em breve/i)).toHaveCount(0);
  const textoSolto = await page.locator('body').evaluate((p) => /(^|\s)(null|undefined|NaN|\[object Object\])(\s|$)/.test(p.innerText));
  expect(textoSolto, 'texto "null/undefined" aparecendo na tela').toBe(false);
  const semNome = await page.locator('button').evaluateAll((bs) => bs.filter((b) => b.offsetParent && !(b.textContent.trim() || b.getAttribute('aria-label'))).length);
  expect(semNome, 'botão visível sem texto nem aria-label').toBe(0);
}

/** Responde a uma URL externa com JSON fixo (rede simulada). */
export async function simular(page, padrao, corpo, status = 200) {
  await page.route(padrao, (r) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(corpo), headers: { 'access-control-allow-origin': '*' } }));
}
