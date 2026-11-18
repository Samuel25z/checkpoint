import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const SDK = /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/;

// Supabase de mentira: login instantâneo e "nuvem" guardada em fake-nuvem (simula outro aparelho).
const FAKE = `
export function createClient() {
  const ouvintes = [];
  let sessao = JSON.parse(localStorage.getItem('fake-sessao') || 'null');
  const nuvem = () => JSON.parse(localStorage.getItem('fake-nuvem') || '{}');
  return {
    auth: {
      onAuthStateChange(cb) { ouvintes.push(cb); setTimeout(() => cb('INITIAL_SESSION', sessao)); return { data: { subscription: { unsubscribe() {} } } }; },
      async signInWithOAuth() { sessao = { user: { id: 'u1', email: 'jogador@exemplo.com', user_metadata: { full_name: 'Jogador Teste' } } }; localStorage.setItem('fake-sessao', JSON.stringify(sessao)); ouvintes.forEach((f) => f('SIGNED_IN', sessao)); return { error: null }; },
      async signOut() { sessao = null; localStorage.removeItem('fake-sessao'); ouvintes.forEach((f) => f('SIGNED_OUT', null)); return { error: null }; }
    },
    from() {
      return {
        select() { return { in: async () => ({ data: Object.entries(nuvem()).map(([chave, v]) => ({ chave, valor: v.valor, atualizado_em: v.em })), error: null }) }; },
        async upsert(linhas) { const n = nuvem(); for (const l of linhas) n[l.chave] = { valor: l.valor, em: l.atualizado_em }; localStorage.setItem('fake-nuvem', JSON.stringify(n)); return { error: null }; }
      };
    }
  };
}`;

test.describe('sem-config', () => {
  test('sem Supabase configurado o site funciona e explica que o login não está ligado', async ({ page }) => {
    let pediuSdk = false;
    await page.route(SDK, (r) => { pediuSdk = true; r.abort(); });
    const erros = await abrir(page, 'diario');
    await page.locator('#botao-conta').click();
    await expect(page.getByRole('dialog', { name: 'Conta' })).toContainText('ainda não foi configurado');
    await page.getByRole('button', { name: 'Fechar' }).last().click();
    await expect(page.getByText('Comece seu diário')).toBeVisible();
    expect(pediuSdk, 'não deve baixar o SDK sem configuração').toBe(false);
    expect(erros).toEqual([]);
  });
});

test.describe('com-conta', () => {
  test('entrar junta os dados dos dois lados e depois exclusões sincronizam', async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: "export const SUPABASE = { url: 'https://teste.supabase.co', chaveAnon: 'chave-publica-de-teste' }; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';" }));
    await page.route(SDK, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE, headers: { 'access-control-allow-origin': '*' } }));
    const erros = await abrir(page, 'diario', { dados: { 'diario:jogos': [{ id: 'local1', nome: 'Celeste', status: 'jogando', nota: null, horas: 3, atualizadoEm: '2026-05-02T00:00:00Z' }] } });
    // dados que já estavam na conta (vindos de outro computador)
    await page.evaluate(() => localStorage.setItem('fake-nuvem', JSON.stringify({ 'diario:jogos': { valor: [{ id: 'nuvem1', nome: 'Hades', status: 'zerado', nota: 5, horas: 30, atualizadoEm: '2026-04-01T00:00:00Z' }], em: '2026-04-01T00:00:00Z' } })));

    await page.locator('#botao-conta').click();
    await page.getByRole('button', { name: 'Entrar com Google' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    await expect(page.locator('#grade-diario .carta')).toHaveCount(2);
    const nuvem = await page.evaluate(() => JSON.parse(localStorage.getItem('fake-nuvem'))['diario:jogos'].valor.map((j) => j.nome).sort());
    expect(nuvem).toEqual(['Celeste', 'Hades']);

    // excluir aqui apaga na conta também
    await page.locator('.carta', { hasText: 'Celeste' }).click();
    await page.getByRole('button', { name: 'Excluir' }).click();
    await page.getByRole('dialog', { name: 'Excluir do diário?' }).getByRole('button', { name: 'Excluir' }).click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('fake-nuvem'))['diario:jogos'].valor.length), { timeout: 5000 }).toBe(1);

    // recarregar mantém a sessão e não ressuscita o excluído
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    await expect(page.locator('#grade-diario .carta')).toHaveCount(1);

    // sair
    await page.locator('#botao-conta').click();
    await page.getByRole('button', { name: 'Sair' }).click();
    await page.getByRole('dialog', { name: 'Sair da conta?' }).getByRole('button', { name: 'Sair' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('aria-label', 'Entrar na sua conta');
    await semBotaoMorto(page);
    expect(erros).toEqual([]);
  });
});
