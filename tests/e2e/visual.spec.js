import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';
import { MODULOS } from '../../js/modules/registry.js';

const ano = new Date().getFullYear();
const jogando = { id: 'er', nome: 'Elden Ring', jogoId: 'elden-ring', status: 'jogando', nota: 4, horas: 80, plataforma: 'PC', inicio: `${ano}-08-01`, conquistas: { total: 42, feitas: 30 }, atualizadoEm: `${ano}-11-01` };

test('escolher o visual em Configurações aplica na hora e fica salvo', async ({ page }) => {
  const erros = await abrir(page, 'inicio');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-visual', 'deck');
  await page.locator('#botao-config').click();
  await page.locator('.vis-opcao[data-visual="palco"]').click();
  await expect(html).toHaveAttribute('data-visual', 'palco');
  await expect(page.locator('#fontes-visual')).toHaveAttribute('href', /Outfit/);
  await page.locator('.vis-opcao[data-visual="joy"]').click();
  await expect(html).toHaveAttribute('data-visual', 'joy');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(html).toHaveAttribute('data-visual', 'joy');
  await expect(page.locator('#fontes-visual')).toHaveAttribute('href', /Rubik/);
  expect(erros).toEqual([]);
});

for (const visual of ['deck', 'palco', 'joy']) {
  for (const tema of ['escuro', 'claro']) {
    test(`todas as abas abrem no visual ${visual} (${tema}) sem erro e sem rolagem lateral`, async ({ page }) => {
      const erros = await abrir(page, 'inicio', { dados: { 'pref:visual': visual, 'pref:tema': tema, 'diario:jogos': [jogando] } });
      await expect(page.locator('html')).toHaveAttribute('data-visual', visual);
      await expect(page.locator('html')).toHaveAttribute('data-tema', tema);
      for (const m of MODULOS) {
        await page.goto(`/#/${m.rota}`);
        await expect(page.locator(`#palco .aba-${m.id}`)).toBeVisible();
        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(sobra, `rolagem lateral na aba ${m.id}`).toBeLessThanOrEqual(1);
      }
      await semBotaoMorto(page);
      expect(erros).toEqual([]);
    });
  }
}

test('banner da Início mostra o jogo em andamento com a arte e o anel de conquistas', async ({ page }) => {
  await abrir(page, 'inicio', { dados: { 'diario:jogos': [jogando] } });
  const banner = page.locator('.banner');
  await expect(banner).toContainText('Elden Ring');
  await expect(banner.locator('.banner-fundo img')).toHaveAttribute('src', /1245620\/library_hero\.jpg/);
  await expect(banner.locator('.anel')).toHaveAttribute('aria-label', '71% das conquistas');
  await banner.getByRole('link', { name: 'Abrir no diário' }).click();
  await expect(page).toHaveURL(/#\/diario\/er$/);
  await expect(page.getByRole('dialog')).toContainText('Elden Ring');
  await expect(page.locator('.detalhe-arte img')).toHaveAttribute('src', /library_hero\.jpg/);
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Excluir' })).not.toBeFocused();
});

test('sem jogo em andamento, a arte da página do jogo cai para o padrão da marca', async ({ page }) => {
  await abrir(page, 'diario/x', { dados: { 'diario:jogos': [{ id: 'x', nome: 'Jogo inventado', status: 'quero', nota: null, horas: 0, atualizadoEm: '2026-01-01' }] } });
  await expect(page.locator('.detalhe-arte')).toHaveClass(/padrao-hex/);
});
