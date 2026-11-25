// Lógica pura da parte social: @usuário, resumo público do perfil, amigos (quem se segue de volta) e feed.
import { arteDoRegistro } from '../../games.js';
import { numeros, nivel, xp, medalhas, recentes } from '../perfil/logic.js';

export const USUARIO_REGRA = /^[a-z0-9_]{3,20}$/;
const RESERVADOS = new Set(['admin', 'checkpoint', 'suporte', 'moderador', 'oficial', 'root', 'null', 'undefined']);

/** "@Samuel.Mota " → "samuel_mota" (sugestão: minúsculas, sem acento, só letras, números e _). */
export function sugerirUsuario(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/^@+/, '').replace(/[^a-z0-9_]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
}

/** Valida o @ que a pessoa digitou. */
export function validarUsuario(texto) {
  const u = String(texto || '').trim().replace(/^@+/, '').toLowerCase();
  if (!u) return { ok: false, erro: 'Escolha um nome de usuário.' };
  if (u.length < 3) return { ok: false, erro: 'Use pelo menos 3 caracteres.' };
  if (u.length > 20) return { ok: false, erro: 'Use no máximo 20 caracteres.' };
  if (!USUARIO_REGRA.test(u)) return { ok: false, erro: 'Use só letras sem acento, números e _ (sem espaço).' };
  if (RESERVADOS.has(u)) return { ok: false, erro: 'Esse nome é reservado. Escolha outro.' };
  return { ok: true, usuario: u };
}

/** Texto de busca → termo seguro para o filtro "começa com" do banco. */
export function termoBusca(texto) {
  const t = String(texto || '').trim().replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  return t.length >= 2 ? t : null;
}

const pequeno = (r) => ({ nome: r.nome, capa: arteDoRegistro(r).capa || null, status: r.status, horas: Math.round(Number(r.horas) || 0) || 0 });

/**
 * O que vai para o perfil público: só o necessário para mostrar o cartão.
 * Nada de resenha, datas exatas ou listas inteiras.
 */
export function montarResumo(diario, perfil = {}) {
  const n = numeros(diario);
  const lv = nivel(xp(diario));
  const fav = (perfil.favoritos || []).map((id) => diario.find((r) => r.id === id)).filter(Boolean)
    .map((r) => ({ ...pequeno(r), coroado: r.id === perfil.coroado }));
  return {
    numeros: { jogos: n.jogos, finalizados: n.finalizados, platinados: n.platinados, horas: n.horas, media: n.media },
    nivel: { nivel: lv.nivel, titulo: lv.titulo },
    favoritos: fav,
    medalhas: medalhas(diario).filter((m) => m.grau).map((m) => ({ id: m.id, nome: m.nome, grau: m.grau })),
    jogando: diario.filter((r) => r.status === 'jogando').slice(0, 6).map(pequeno),
    recentes: recentes(diario, 6).map((r) => ({ ...pequeno(r), em: String(r.atualizadoEm || '').slice(0, 10) })),
  };
}

/** Amigos = quem eu sigo e também me segue. */
export function amigos(seguindo = [], seguidores = []) {
  const meus = new Set(seguidores);
  return seguindo.filter((id) => meus.has(id));
}

/** Feed: o que cada pessoa que eu sigo andou jogando, do mais novo para o mais antigo. */
export function feed(perfis = [], limite = 30) {
  const itens = [];
  for (const p of perfis) for (const r of p.resumo?.recentes || []) itens.push({ ...r, usuario: p.usuario, nomePessoa: p.nome || p.usuario, avatar: p.avatar_url || null });
  return itens.sort((a, b) => String(b.em || '').localeCompare(String(a.em || '')) || a.usuario.localeCompare(b.usuario)).slice(0, limite);
}

/** Erros do banco em português. */
export function erroSocial(e) {
  const m = `${e?.code || ''} ${e?.message || e || ''}`;
  if (/PGRST205|PGRST202|schema cache/i.test(m)) return 'A parte de amigos ainda não foi ligada no servidor. Tente de novo mais tarde.';
  if (/23505|duplicate key|unique/i.test(m)) return 'Esse @ já é de outra pessoa. Escolha outro.';
  if (/23514|check constraint/i.test(m)) return 'Algum dado está fora do formato aceito (nome, frase ou imagem grande demais).';
  if (/failed to fetch|network/i.test(m)) return 'Sem conexão com o servidor. Confira a internet.';
  if (/JWT|not authenticated|42501|permission/i.test(m)) return 'Entre na sua conta para usar essa parte.';
  return 'Não deu certo agora. Tente de novo em instantes.';
}

export const linkPerfil = (usuario, base = '') => `${base}#/amigos/@${usuario}`;
