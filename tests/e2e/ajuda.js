// Utilidades compartilhadas pelos testes de ponta a ponta.
import { expect } from '@playwright/test';

/** Abre o site limpo (sem dados salvos) e registra erros de console. */
export async function abrir(page, rota = 'inicio', { dados = {} } = {}) {
  const erros = [];
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
  const textoSolto = await page.locator('#palco').evaluate((p) => /(^|\s)(null|undefined|NaN|\[object Object\])(\s|$)/.test(p.innerText));
  expect(textoSolto, 'texto "null/undefined" aparecendo na tela').toBe(false);
  const semNome = await page.locator('button').evaluateAll((bs) => bs.filter((b) => b.offsetParent && !(b.textContent.trim() || b.getAttribute('aria-label'))).length);
  expect(semNome, 'botão visível sem texto nem aria-label').toBe(0);
}

/** Responde a uma URL externa com JSON fixo (rede simulada). */
export async function simular(page, padrao, corpo, status = 200) {
  await page.route(padrao, (r) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(corpo), headers: { 'access-control-allow-origin': '*' } }));
}
