import { test, expect } from '@playwright/test';
import { abrir, semBotaoMorto } from './ajuda.js';

const SDK = /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/;

// Supabase de mentira: login instantâneo e "nuvem" guardada em fake-nuvem (simula outro aparelho).
const FAKE = `
export function createClient() {
  const ouvintes = [];
  let sessao = JSON.parse(localStorage.getItem('fake-sessao') || 'null');
  const quem = () => (sessao ? sessao.user.id : 'ninguem');
  const chave = () => (quem() === 'u1' ? 'fake-nuvem' : 'fake-nuvem-' + quem());
  const nuvem = () => JSON.parse(localStorage.getItem(chave()) || '{}');
  return {
    auth: {
      onAuthStateChange(cb) { ouvintes.push(cb); setTimeout(() => cb('INITIAL_SESSION', sessao)); return { data: { subscription: { unsubscribe() {} } } }; },
      async signInWithOAuth() { const id = localStorage.getItem('fake-proximo') || 'u1'; sessao = { user: { id, email: id + '@exemplo.com', user_metadata: { full_name: 'Jogador ' + id } } }; localStorage.setItem('fake-sessao', JSON.stringify(sessao)); ouvintes.forEach((f) => f('SIGNED_IN', sessao)); return { error: null }; },
      async signInWithPassword({ email, password }) {
        const u = JSON.parse(localStorage.getItem('fake-usuarios') || '{}')[email];
        if (!u || u.senha !== password) return { data: {}, error: { message: 'Invalid login credentials' } };
        if (!u.confirmado) return { data: {}, error: { message: 'Email not confirmed' } };
        sessao = { user: { id: 'u1', email, user_metadata: {} } }; localStorage.setItem('fake-sessao', JSON.stringify(sessao)); ouvintes.forEach((f) => f('SIGNED_IN', sessao)); return { data: { session: sessao }, error: null };
      },
      async signUp({ email, password }) {
        const us = JSON.parse(localStorage.getItem('fake-usuarios') || '{}');
        if (us[email]) return { data: {}, error: { message: 'User already registered' } };
        us[email] = { senha: password, confirmado: false }; localStorage.setItem('fake-usuarios', JSON.stringify(us)); return { data: { user: { email }, session: null }, error: null };
      },
      async resetPasswordForEmail(email) { localStorage.setItem('fake-reset', email); return { data: {}, error: null }; },
      async signOut() { sessao = null; localStorage.removeItem('fake-sessao'); ouvintes.forEach((f) => f('SIGNED_OUT', null)); return { error: null }; }
    },
    async rpc(nome) { if (nome === 'apagar_minha_conta' && sessao) { localStorage.removeItem(chave()); localStorage.setItem('fake-apagou', quem()); return { error: null }; } return { error: { message: 'negado' } }; },
    from() {
      return {
        select() { return { in: async () => ({ data: Object.entries(nuvem()).map(([chave, v]) => ({ chave, valor: v.valor, atualizado_em: v.em })), error: null }) }; },
        async upsert(linhas) { const n = nuvem(); for (const l of linhas) n[l.chave] = { valor: l.valor, em: l.atualizado_em }; localStorage.setItem(chave(), JSON.stringify(n)); return { error: null }; }
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
    const erros = await abrir(page, 'diario', { manterConfig: true, dados: { 'diario:jogos': [{ id: 'local1', nome: 'Celeste', status: 'jogando', nota: null, horas: 3, atualizadoEm: '2026-05-02T00:00:00Z' }] } });
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
    // PC compartilhado: ao sair, os dados saem do navegador
    await expect(page.getByText('Comece seu diário')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('checkpoint:diario:jogos'))).toBeNull();

    // outra pessoa entra no mesmo navegador: não recebe nada da anterior
    await page.evaluate(() => localStorage.setItem('fake-proximo', 'u2'));
    await page.locator('#botao-conta').click();
    await page.getByRole('button', { name: 'Entrar com Google' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    await expect(page.getByText('Comece seu diário')).toBeVisible();
    const nuvemU2 = await page.evaluate(() => JSON.parse(localStorage.getItem('fake-nuvem-u2') || '{}'));
    expect(nuvemU2['diario:jogos']?.valor || []).toEqual([]);
    await semBotaoMorto(page);
    expect(erros).toEqual([]);
  });
});

test.describe('apagar-conta', () => {
  test('o perfil sincroniza e "Apagar conta" apaga a conta, a nuvem e o navegador', async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: "export const SUPABASE = { url: 'https://teste.supabase.co', chaveAnon: 'chave-publica-de-teste' }; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';" }));
    await page.route(SDK, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE, headers: { 'access-control-allow-origin': '*' } }));
    const erros = await abrir(page, 'perfil', { manterConfig: true, dados: {
      'diario:jogos': [{ id: 'j1', nome: 'Celeste', jogoId: 'celeste', status: 'platinado', nota: 5, horas: 14, criadoEm: '2026-05-01T00:00:00Z', atualizadoEm: '2026-05-02T00:00:00Z' }],
      'perfil:dados': { nome: 'Samuel', frase: 'Só mais uma run.', favoritos: ['j1'], coroado: 'j1' },
    } });
    await page.locator('#botao-conta').click();
    await expect(page.getByRole('dialog')).toContainText('Como cuidamos dos seus dados');
    await page.getByRole('button', { name: 'Entrar com Google' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    const perfilNaNuvem = await page.evaluate(() => JSON.parse(localStorage.getItem('fake-nuvem'))['perfil:dados'].valor.nome);
    expect(perfilNaNuvem).toBe('Samuel');

    await page.locator('#botao-conta').click();
    await page.getByRole('dialog', { name: 'Sua conta' }).getByRole('button', { name: 'Apagar conta' }).click();
    const confirma = page.getByRole('dialog', { name: 'Apagar sua conta?' });
    await expect(confirma).toContainText('Não dá para desfazer');
    await confirma.getByRole('button', { name: 'Apagar tudo' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'desligado');
    await expect(page.getByText('Seu perfil começa no Diário')).toBeVisible();
    const sobrou = await page.evaluate(() => ({ nuvem: localStorage.getItem('fake-nuvem'), apagou: localStorage.getItem('fake-apagou'), diario: localStorage.getItem('checkpoint:diario:jogos'), perfil: localStorage.getItem('checkpoint:perfil:dados') }));
    expect(sobrou).toEqual({ nuvem: null, apagou: 'u1', diario: null, perfil: null });
    expect(erros).toEqual([]);
  });

  test('cancelar o "Apagar conta" não apaga nada', async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: "export const SUPABASE = { url: 'https://teste.supabase.co', chaveAnon: 'chave-publica-de-teste' }; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';" }));
    await page.route(SDK, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE, headers: { 'access-control-allow-origin': '*' } }));
    await abrir(page, 'diario', { manterConfig: true, dados: { 'diario:jogos': [{ id: 'j1', nome: 'Celeste', status: 'jogando', nota: null, horas: 1, atualizadoEm: '2026-05-02T00:00:00Z' }] } });
    await page.locator('#botao-conta').click();
    await page.getByRole('button', { name: 'Entrar com Google' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    await page.locator('#botao-conta').click();
    await page.getByRole('button', { name: 'Apagar conta' }).click();
    await page.getByRole('dialog', { name: 'Apagar sua conta?' }).getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    await expect(page.locator('.carta', { hasText: 'Celeste' })).toBeVisible();
  });
});

test.describe('email', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(/\/js\/config\.js$/, (r) => r.fulfill({ contentType: 'text/javascript', body: "export const SUPABASE = { url: 'https://teste.supabase.co', chaveAnon: 'chave-publica-de-teste' }; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';" }));
    await page.route(SDK, (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE, headers: { 'access-control-allow-origin': '*' } }));
  });

  test('criar conta, ser avisado para confirmar, e entrar depois de confirmar', async ({ page }) => {
    const erros = await abrir(page, 'diario', { manterConfig: true });
    await page.locator('#botao-conta').click();
    const d = page.getByRole('dialog', { name: 'Entrar no Checkpoint' });
    await expect(d.getByRole('button', { name: 'Entrar com Google' })).toBeVisible();

    // validações antes de chamar o servidor
    await d.getByLabel('E-mail').fill('nao-e-email');
    await d.locator('#entrar-email').click();
    await expect(d.locator('.conta-aviso')).toHaveText('Digite um e-mail válido.');
    await d.getByLabel('E-mail').fill('samuel@exemplo.com');
    await d.getByLabel('Senha').fill('curta');
    await d.locator('#criar-conta').click();
    await expect(d.locator('.conta-aviso')).toHaveText('A senha precisa ter pelo menos 8 caracteres.');

    // criar: pede confirmação por e-mail
    await d.getByLabel('Senha').fill('senhaboa123');
    await d.locator('#criar-conta').click();
    await expect(d.locator('.conta-aviso')).toContainText('Mandamos um link para samuel@exemplo.com');

    // entrar sem confirmar: explica
    await d.locator('#entrar-email').click();
    await expect(d.locator('.conta-aviso')).toContainText('Falta confirmar o e-mail');

    // senha errada
    await page.evaluate(() => { const u = JSON.parse(localStorage.getItem('fake-usuarios')); u['samuel@exemplo.com'].confirmado = true; localStorage.setItem('fake-usuarios', JSON.stringify(u)); });
    await d.getByLabel('Senha').fill('senhaerrada1');
    await d.locator('#entrar-email').click();
    await expect(d.locator('.conta-aviso')).toHaveText('E-mail ou senha incorretos.');

    // mostrar senha
    await d.getByRole('button', { name: 'Mostrar' }).click();
    await expect(d.getByLabel('Senha')).toHaveAttribute('type', 'text');

    // certo: entra
    await d.getByLabel('Senha').fill('senhaboa123');
    await d.locator('#entrar-email').click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('#botao-conta')).toHaveAttribute('data-estado', 'ok');
    expect(erros).toEqual([]);
  });

  test('criar conta com e-mail que já existe e "Esqueci a senha"', async ({ page }) => {
    await abrir(page, 'diario', { manterConfig: true });
    await page.evaluate(() => localStorage.setItem('fake-usuarios', JSON.stringify({ 'ana@exemplo.com': { senha: 'senhaboa123', confirmado: true } })));
    await page.locator('#botao-conta').click();
    const d = page.getByRole('dialog', { name: 'Entrar no Checkpoint' });
    await d.getByLabel('E-mail').fill('ana@exemplo.com');
    await d.getByLabel('Senha').fill('outrasenha99');
    await d.locator('#criar-conta').click();
    await expect(d.locator('.conta-aviso')).toContainText('Já existe uma conta com esse e-mail');
    await d.locator('#esqueci-senha').click();
    await expect(d.locator('.conta-aviso')).toContainText('chega um link para criar uma senha nova');
    expect(await page.evaluate(() => localStorage.getItem('fake-reset'))).toBe('ana@exemplo.com');
  });
});

