// social.js — conversa com o banco (Supabase) da parte social: perfis públicos e "seguir".
// Recebe a conta (ctx.conta). Todas as regras de quem pode o quê estão no banco (RLS).

const CAMPOS = 'user_id, usuario, nome, frase, avatar_url, banner_url, privado, resumo, atualizado_em';

export function criarSocial(conta) {
  const cli = async () => {
    if (!conta?.configurado?.()) throw new Error('não configurado');
    return conta.cliente();
  };
  const eu = () => conta?.usuario?.id || null;
  const ok = ({ data, error }) => { if (error) throw error; return data; };

  return {
    disponivel: () => Boolean(conta?.configurado?.()),
    logado: () => Boolean(eu()),
    meuId: eu,

    async meuPerfil() {
      if (!eu()) return null;
      return ok(await (await cli()).from('perfis').select(CAMPOS).eq('user_id', eu()).maybeSingle());
    },
    /** Cria ou atualiza o meu perfil público. */
    async salvarPerfil(dados) {
      const linha = { user_id: eu(), ...dados, atualizado_em: new Date().toISOString() };
      return ok(await (await cli()).from('perfis').upsert(linha, { onConflict: 'user_id' }).select(CAMPOS).single());
    },
    async porUsuario(usuario) {
      return ok(await (await cli()).from('perfis').select(CAMPOS).eq('usuario', usuario).maybeSingle());
    },
    async buscar(termo, limite = 12) {
      return ok(await (await cli()).from('perfis').select(CAMPOS).ilike('usuario', `${termo}%`).order('usuario').limit(limite));
    },
    async perfisDe(ids) {
      if (!ids.length) return [];
      return ok(await (await cli()).from('perfis').select(CAMPOS).in('user_id', ids));
    },
    /** Quem a pessoa segue e quem segue a pessoa (ids). */
    async conexoes(id = eu()) {
      const c = await cli();
      const [a, b] = await Promise.all([
        c.from('seguindo').select('seguido').eq('seguidor', id),
        c.from('seguindo').select('seguidor').eq('seguido', id),
      ]);
      return { seguindo: ok(a).map((x) => x.seguido), seguidores: ok(b).map((x) => x.seguidor) };
    },
    async seguir(id) { ok(await (await cli()).from('seguindo').insert({ seguidor: eu(), seguido: id })); },
    async deixarDeSeguir(id) { ok(await (await cli()).from('seguindo').delete().eq('seguidor', eu()).eq('seguido', id)); },
  };
}
