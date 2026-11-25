import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

test('aba Outro projeto fica no fim do menu e mostra o vídeo do Drift Tela', async ({ page }) => {
  const erros = await abrir(page, 'outro-projeto');
  await expect(page.getByRole('heading', { name: 'Outro projeto', level: 1 })).toBeVisible();
  const video = page.locator('#video-outro-projeto');
  await expect(video).toHaveAttribute('src', 'assets/drift-tela.mp4');
  await expect(video).toHaveAttribute('poster', 'assets/drift-tela-capa.jpg');
  const ok = await page.evaluate(async () => (await fetch('assets/drift-tela.mp4', { method: 'HEAD' })).ok && (await fetch('assets/drift-tela-capa.jpg', { method: 'HEAD' })).ok);
  expect(ok).toBe(true);
  await expect(page.locator('#outro-baixar')).toHaveAttribute('href', 'https://drift-app-production-9075.up.railway.app/app/Drift-setup.exe');
  await expect(page.locator('#outro-baixar')).toContainText('Baixar para Windows');
  await expect(page.locator('#outro-navegador')).toHaveAttribute('href', 'https://drift-app-production-9075.up.railway.app/tela');
  const ultimo = await page.locator('nav a[href^="#/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')).filter((h) => h !== '#/configuracoes').at(-1));
  expect(ultimo).toBe('#/outro-projeto');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});
