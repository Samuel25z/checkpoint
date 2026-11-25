import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

test('aba Apresentação mostra o vídeo com capa e leva para o site', async ({ page }) => {
  const erros = await abrir(page, 'video');
  await expect(page.getByRole('heading', { name: 'Apresentação', level: 1 })).toBeVisible();
  const video = page.locator('#video-apresentacao');
  await expect(video).toHaveAttribute('src', 'relatorio/Video-Checkpoint.mp4');
  await expect(video).toHaveAttribute('poster', 'assets/video-capa.jpg');
  const ok = await page.evaluate(async () => {
    const [v, c] = await Promise.all([fetch('relatorio/Video-Checkpoint.mp4', { method: 'HEAD' }), fetch('assets/video-capa.jpg', { method: 'HEAD' })]);
    return v.ok && c.ok;
  });
  expect(ok, 'arquivo do vídeo e capa existem no site').toBe(true);
  await page.getByRole('link', { name: 'Ir para o site' }).click();
  await expect(page).toHaveURL(/#\/inicio$/);
  await page.goto('/#/video');
  await semBotaoMorto(page);
  expect(erros).toEqual([]);
});
