// sync.js — regras puras de sincronização entre este navegador e a conta (nuvem).
// Listas com id (diário, rotas, torneios, PCs) são mescladas ITEM A ITEM em toda sincronização:
// adições feitas em aparelhos diferentes se somam, a versão mais nova de cada item vence e
// exclusões viajam como "marcas de remoção" (sync:removidos) para nada voltar.

export const CHAVE_REMOVIDOS = 'sync:removidos';
/** O que vai para a conta. Preferências de tela e caches ficam só no navegador. */
export const SINCRONIZAVEIS = ['diario:jogos', 'diario:atividades', 'speedrun:rotas', 'torneio:lista', 'hardware:pcs', 'recomps:seguidos', 'recomendador:respostas', 'perfil:dados', 'perfil:imagens', CHAVE_REMOVIDOS];
export const LISTAS = ['diario:jogos', 'speedrun:rotas', 'torneio:lista', 'hardware:pcs'];
export const sincronizavel = (chave) => SINCRONIZAVEIS.includes(chave);

const listaComId = (v) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && 'id' in x);
const quando = (x) => String(x?.atualizadoEm || x?.criadoEm || '');
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Formato esperado de cada chave (dado da nuvem com formato errado é ignorado). */
export function formatoValido(chave, valor) {
  if (LISTAS.includes(chave) || chave === 'diario:atividades') return Array.isArray(valor) && (chave === 'diario:atividades' || listaComId(valor));
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor);
}

/** Ids que sumiram de uma lista viram marcas de remoção com a data. */
export function registrarRemocoes(removidos, chave, idsAntes, idsDepois, em) {
  const sumiram = idsAntes.filter((id) => !idsDepois.includes(id));
  if (!sumiram.length) return removidos;
  const daChave = { ...(removidos[chave] || {}) };
  for (const id of sumiram) daChave[id] = em;
  return { ...removidos, [chave]: daChave };
}

/** Junta duas coleções de marcas de remoção (fica a data mais recente). */
export function unirRemovidos(a = {}, b = {}) {
  const r = {};
  for (const fonte of [a, b]) for (const [chave, ids] of Object.entries(fonte || {})) {
    r[chave] = { ...(r[chave] || {}) };
    for (const [id, em] of Object.entries(ids || {})) if (!r[chave][id] || em > r[chave][id]) r[chave][id] = em;
  }
  return r;
}

/**
 * Junta dois valores sem perder nada.
 * Listas com id: união, ficando a versão mais recente de cada item, menos os removidos depois da última edição.
 */
export function unir(local, nuvem, removidos = {}) {
  if (listaComId(local ?? []) && listaComId(nuvem ?? [])) {
    const mapa = new Map();
    for (const item of [...(nuvem || []), ...(local || [])]) {
      const atual = mapa.get(item.id);
      if (!atual || quando(item) >= quando(atual)) mapa.set(item.id, item);
    }
    return [...mapa.values()].filter((item) => !(removidos[item.id] && removidos[item.id] >= quando(item)))
      .sort((a, b) => quando(b).localeCompare(quando(a)));
  }
  if (nuvem === undefined || nuvem === null) return local;
  if (local === undefined || local === null) return nuvem;
  if (Array.isArray(local) && Array.isArray(nuvem)) return local.length >= nuvem.length ? local : nuvem;
  if (typeof local === 'object' && typeof nuvem === 'object') return { ...nuvem, ...local };
  return local;
}

/**
 * Decide o que fazer com cada chave.
 * local/nuvem: { chave: { valor, em } }. Retorna { gravarLocal: {chave: valor}, enviar: {chave: valor} }.
 * - listas com id: sempre mescla item a item (com marcas de remoção);
 * - demais: no primeiro login deste navegador junta; depois vence quem mudou por último.
 */
export function planejar(local, nuvem, { primeiraVez }) {
  const gravarLocal = {};
  const enviar = {};
  const marcar = (chave, junto, l, n) => {
    if (!igual(junto, l)) gravarLocal[chave] = junto;
    if (!igual(junto, n)) enviar[chave] = junto;
  };

  const removidos = unirRemovidos(local[CHAVE_REMOVIDOS]?.valor, nuvem[CHAVE_REMOVIDOS]?.valor);
  if (Object.keys(removidos).length) marcar(CHAVE_REMOVIDOS, removidos, local[CHAVE_REMOVIDOS]?.valor, nuvem[CHAVE_REMOVIDOS]?.valor);

  for (const chave of SINCRONIZAVEIS) {
    if (chave === CHAVE_REMOVIDOS) continue;
    const l = local[chave];
    const n = nuvem[chave];
    if (!l && !n) continue;
    if (LISTAS.includes(chave)) { marcar(chave, unir(l?.valor, n?.valor, removidos[chave]), l?.valor, n?.valor); continue; }
    if (primeiraVez) { marcar(chave, unir(l?.valor, n?.valor), l?.valor, n?.valor); continue; }
    if (l && (!n || String(l.em) > String(n.em))) enviar[chave] = l.valor;
    else if (n && (!l || String(n.em) > String(l.em))) gravarLocal[chave] = n.valor;
  }
  return { gravarLocal, enviar };
}
