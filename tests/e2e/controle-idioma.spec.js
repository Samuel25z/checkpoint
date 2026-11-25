import { test, expect } from '@playwright/test';
import { abrir } from './ajuda.js';
import { MODULOS } from '../../js/modules/registry.js';

// Controle de mentira: o teste aperta botões mudando este objeto.
const CONTROLE = () => {
  const estado = { buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0], connected: true, id: 'Controle de teste', mapping: 'standard', index: 0 };
  window.__controle = estado;
  navigator.getGamepads = () => [estado];
  window.__apertar = async (i) => {
    estado.buttons[i].pressed = true; await new Promise((r) => setTimeout(r, 80));
    estado.buttons[i].pressed = false; await new Promise((r) => setTimeout(r, 80));
  };
};

test('com controle, o foco anda e LB/RB trocam de aba', async ({ page }) => {
  await page.addInitScript(CONTROLE);
  await abrir(page, 'inicio');
  await page.evaluate(() => window.dispatchEvent(new Event('gamepadconnected')));
  await expect(page.locator('body')).toHaveClass(/modo-controle/);
  await page.evaluate(() => window.__apertar(13)); // baixo
  const focado = await page.evaluate(() => document.activeElement?.tagName);
  expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focado);
  await page.evaluate(() => window.__apertar(5)); // RB: próxima aba do menu (Apresentação)
  await expect(page).toHaveURL(/#\/video/);
  await page.evaluate(() => window.__apertar(4)); // LB
  await expect(page).toHaveURL(/#\/inicio/);
});

test('trocar para inglês muda a interface de todas as abas e fica salvo', async ({ page }) => {
  const erros = await abrir(page, 'inicio');
  await page.locator('#botao-config').click();
  await page.getByRole('radio', { name: 'English' }).click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.nav-item[data-rota="diario"]')).toHaveText('Journal');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your checkpoint');
  for (const m of MODULOS.filter((x) => x.id !== 'inicio')) {
    await page.goto(`/#/${m.rota}`);
    await expect(page.locator(`#palco .aba-${m.id} h1`)).toBeVisible();
    const h1 = (await page.locator(`#palco .aba-${m.id} h1`).textContent()).trim();
    expect(h1, `título em português na aba ${m.id}`).not.toMatch(/[ãõçáéíóúê]|Diário|Roda no|Torneio|Que jogo/);
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('.nav-item[data-rota="diario"]')).toHaveText('Journal');
  // voltar para português
  await page.locator('#botao-config').click();
  await page.getByRole('radio', { name: 'Português' }).click();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('.nav-item[data-rota="diario"]')).toHaveText('Diário');
  expect(erros).toEqual([]);
});
