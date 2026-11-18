// sync.js — regras puras de sincronização entre este navegador e a conta (nuvem).
// Cada "chave" do storage é sincronizada inteira, com a data da última mudança.

/** O que vai para a conta. Preferências de tela e caches ficam só no navegador. */
export const SINCRONIZAVEIS = ['diario:jogos', 'diario:atividades', 'speedrun:rotas', 'torneio:lista', 'hardware:pcs', 'recomps:seguidos', 'recomendador:respostas'];
export const sincronizavel = (chave) => SINCRONIZAVEIS.includes(chave);

const listaComId = (v) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && 'id' in x);
const quando = (x) => String(x?.atualizadoEm || x?.criadoEm || '');

/**
 * Junta dois valores sem perder nada. Usado no PRIMEIRO login deste navegador.
 * Listas com id: união, ficando a versão mais recente de cada item. Objetos: chaves somadas.
 */
export function unir(local, nuvem) {
  if (nuvem === undefined || nuvem === null) return local;
  if (local === undefined || local === null) return nuvem;
  if (listaComId(local) && listaComId(nuvem)) {
    const mapa = new Map();
    for (const item of [...nuvem, ...local]) {
      const atual = mapa.get(item.id);
      if (!atual || quando(item) >= quando(atual)) mapa.set(item.id, item);
    }
    return [...mapa.values()].sort((a, b) => quando(b).localeCompare(quando(a)));
  }
  if (Array.isArray(local) && Array.isArray(nuvem)) return local.length >= nuvem.length ? local : nuvem;
  if (typeof local === 'object' && typeof nuvem === 'object') return { ...nuvem, ...local };
  return local;
}

/**
 * Decide o que fazer com cada chave.
 * - primeiro login neste navegador: unir local + nuvem e enviar;
 * - depois: vence quem mudou por último (assim exclusões também valem).
 * local: { chave: { valor, em } } · nuvem: { chave: { valor, em } }
 * Retorna { gravarLocal: {chave: valor}, enviar: {chave: valor} }.
 */
export function planejar(local, nuvem, { primeiraVez }) {
  const gravarLocal = {};
  const enviar = {};
  for (const chave of SINCRONIZAVEIS) {
    const l = local[chave];
    const n = nuvem[chave];
    if (!l && !n) continue;
    if (primeiraVez) {
      const junto = unir(l?.valor, n?.valor);
      if (JSON.stringify(junto) !== JSON.stringify(l?.valor)) gravarLocal[chave] = junto;
      if (JSON.stringify(junto) !== JSON.stringify(n?.valor)) enviar[chave] = junto;
      continue;
    }
    if (l && (!n || String(l.em) > String(n.em))) enviar[chave] = l.valor;
    else if (n && (!l || String(n.em) > String(l.em))) gravarLocal[chave] = n.valor;
  }
  return { gravarLocal, enviar };
}
