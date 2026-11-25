// Servidor simulado da parte social (usado pelos testes de tela e pelos prints).
export const SDK = /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js/;
export const CONFIG = "export const SUPABASE = { url: 'https://teste.supabase.co', chaveAnon: 'chave-publica-de-teste' }; export const STEAM_AJUDANTE = ''; export const SUPABASE_SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';";

// Login de mentira (só o que a conta usa) + nuvem vazia
export const FAKE_SDK = `
export function createClient() {
  const ouvintes = [];
  let sessao = JSON.parse(localStorage.getItem('fake-sessao') || 'null');
  return {
    auth: {
      onAuthStateChange(cb) { ouvintes.push(cb); setTimeout(() => cb('INITIAL_SESSION', sessao)); return { data: { subscription: { unsubscribe() {} } } }; },
      async signInWithOAuth() { sessao = { user: { id: 'u1', email: 'samuel@exemplo.com', user_metadata: { full_name: 'Samuel Mota' }, app_metadata: { providers: ['google'] } } }; localStorage.setItem('fake-sessao', JSON.stringify(sessao)); ouvintes.forEach((f) => f('SIGNED_IN', sessao)); return { error: null }; },
      async signOut() { sessao = null; localStorage.removeItem('fake-sessao'); ouvintes.forEach((f) => f('SIGNED_OUT', null)); return { error: null }; },
      async getUser() { return { data: { user: sessao?.user || null } }; }
    },
    from() { return { select() { return { in: async () => ({ data: [], error: null }) }; }, async upsert() { return { error: null }; } }; }
  };
}`;

// Serviço social de mentira, guardado no navegador (o de verdade fala com o Supabase)
export const FAKE_SOCIAL = `
export function criarSocial(conta) {
  const db = () => JSON.parse(localStorage.getItem('fake-social') || '{"perfis":{},"seguindo":[]}');
  const gravar = (d) => localStorage.setItem('fake-social', JSON.stringify(d));
  const eu = () => conta?.usuario?.id || null;
  const visivel = (p) => p && (!p.privado || p.user_id === eu());
  return {
    disponivel: () => Boolean(conta?.configurado?.()), logado: () => Boolean(eu()), meuId: eu,
    async meuPerfil() { return db().perfis[eu()] || null; },
    async salvarPerfil(d) { const x = db(); if (Object.values(x.perfis).some((p) => p.usuario === d.usuario && p.user_id !== eu())) throw { code: '23505', message: 'duplicate key' }; x.perfis[eu()] = { ...x.perfis[eu()], ...d, user_id: eu() }; gravar(x); return x.perfis[eu()]; },
    async porUsuario(u) { return Object.values(db().perfis).find((p) => p.usuario === u && visivel(p)) || null; },
    async buscar(t) { return Object.values(db().perfis).filter((p) => p.usuario.startsWith(t) && visivel(p)); },
    async perfisDe(ids) { return ids.map((i) => db().perfis[i]).filter(visivel); },
    async conexoes(id = eu()) { const s = db().seguindo; return { seguindo: s.filter((x) => x[0] === id).map((x) => x[1]), seguidores: s.filter((x) => x[1] === id).map((x) => x[0]) }; },
    async seguir(id) { const x = db(); x.seguindo.push([eu(), id]); gravar(x); },
    async deixarDeSeguir(id) { const x = db(); x.seguindo = x.seguindo.filter((s) => !(s[0] === eu() && s[1] === id)); gravar(x); }
  };
}`;

