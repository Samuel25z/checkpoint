import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const repo = (full, extra = {}) => ({ full_name: full, name: full.split('/')[1], html_url: `https://github.com/${full}`, stargazers_count: 100, pushed_at: new Date().toISOString(), description: 'Projeto', language: 'C++', ...extra });

test('destaques, busca com alerta de golpe, seguir projeto e limite da API', async ({ page }) => {
  let versao = 'v1.0.0';
  let limite = false;
  await page.route(/api\.github\.com\/search\/repositories/, (r) => {
    if (limite) return r.fulfill({ status: 403, body: '{}', headers: { 'x-ratelimit-reset': '1800000000', 'access-control-allow-origin': '*' } });
    const q = new URL(r.request().url()).searchParams.get('q');
    const items = q.includes('repo:')
      ? [repo('Zelda64Recomp/Zelda64Recomp', { stargazers_count: 7736 }), repo('HarbourMasters/Shipwright')]
      : [repo('golpista/totk-pc-recomp', { description: 'Tears of the Kingdom PC port download' }), repo('zeldaret/oot')];
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items }), headers: { 'access-control-allow-origin': '*' } });
  });
  await page.route(/api\.github\.com\/repos\/.+\/releases\/latest/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tag_name: versao, name: versao, published_at: new Date().toISOString(), html_url: 'https://github.com/x/releases' }), headers: { 'access-control-allow-origin': '*' } }));

  const erros = await abrir(page, 'recomps');
  await expect(page.locator('.aviso-legal')).toContainText('não hospeda nem distribui jogos');
  const zelda = page.locator('#verificados .projeto[data-repo="Zelda64Recomp/Zelda64Recomp"]');
  await expect(zelda).toContainText('Verificado');
  await expect(zelda).toContainText('7,7 mil');
  await expect(zelda.getByRole('link', { name: 'Página oficial' })).toHaveAttribute('href', /Zelda64Recomp\/releases$/);

  // busca: golpe aparece marcado e sem link de download
  await page.locator('#busca-recomps').fill('Zelda');
  await page.getByRole('button', { name: 'Buscar' }).click();
  const golpe = page.locator('#resultado-busca .projeto[data-repo="golpista/totk-pc-recomp"]');
  await expect(golpe).toContainText('costuma ser golpe');
  await expect(golpe.getByRole('link', { name: 'Página oficial' })).toHaveCount(0);

  // seguir e receber aviso de versão nova
  await zelda.getByRole('button', { name: 'Seguir' }).click();
  await expect(page.locator('#lista-seguidos')).toContainText('Zelda64Recomp/Zelda64Recomp');
  versao = 'v1.1.0';
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('cache:github')).forEach((k) => localStorage.removeItem(k)));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#lista-seguidos')).toContainText('Versão nova: v1.1.0');
  await page.getByRole('button', { name: 'Marcar como vista' }).click();
  await expect(page.locator('#lista-seguidos')).not.toContainText('Versão nova');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);

  // limite da API (sem cache)
  limite = true;
  await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('cache:github')).forEach((k) => localStorage.removeItem(k)));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('O GitHub pediu uma pausa')).toBeVisible();
  await expect(page.locator('.lista-offline li').first()).toBeVisible();
});
