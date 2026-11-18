// storage.js — único ponto de leitura/escrita de dados do Checkpoint.
// Tudo fica no LocalStorage com o prefixo "checkpoint:" e cada mudança
// avisa os interessados (é por aqui que a sincronização com a conta entra).

export const PREFIXO = 'checkpoint:';
export const VERSAO_ESQUEMA = 1;

/** Cria um armazenamento sobre qualquer objeto no formato do localStorage (útil nos testes). */
export function criarStorage(base) {
  const ouvintes = new Set();
  let disponivel = true;

  function chave(nome) { return PREFIXO + nome; }

  function ler(nome, padrao = null) {
    try {
      const bruto = base.getItem(chave(nome));
      return bruto === null ? padrao : JSON.parse(bruto);
    } catch {
      return padrao;
    }
  }

  function gravar(nome, valor, { silencioso = false } = {}) {
    try {
      base.setItem(chave(nome), JSON.stringify(valor));
      disponivel = true;
    } catch (erro) {
      disponivel = false;
      throw new Error('Não deu para salvar no navegador. Libere espaço ou permita o armazenamento do site.', { cause: erro });
    }
    if (!silencioso) ouvintes.forEach((fn) => fn({ nome, valor }));
    return valor;
  }

  function atualizar(nome, padrao, transformar) {
    return gravar(nome, transformar(ler(nome, padrao)));
  }

  function remover(nome) {
    try { base.removeItem(chave(nome)); } catch { /* sem armazenamento: nada a remover */ }
    ouvintes.forEach((fn) => fn({ nome, valor: null }));
  }

  /** Lista os nomes (sem prefixo) de tudo que o Checkpoint guardou. */
  function nomes() {
    const lista = [];
    for (let i = 0; i < base.length; i++) {
      const k = base.key(i);
      if (k && k.startsWith(PREFIXO)) lista.push(k.slice(PREFIXO.length));
    }
    return lista;
  }

  function aoMudar(fn) { ouvintes.add(fn); return () => ouvintes.delete(fn); }

  function migrar() {
    const atual = ler('meta:versao', 0);
    if (atual < VERSAO_ESQUEMA) gravar('meta:versao', VERSAO_ESQUEMA, { silencioso: true });
    return VERSAO_ESQUEMA;
  }

  return { ler, gravar, atualizar, remover, nomes, aoMudar, migrar, get disponivel() { return disponivel; } };
}

/** Memória simples no formato do localStorage, usada quando o navegador bloqueia o armazenamento. */
export function memoria() {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); }
  };
}

function baseDoNavegador() {
  try {
    const ls = globalThis.localStorage;
    ls.setItem('checkpoint:teste', '1');
    ls.removeItem('checkpoint:teste');
    return ls;
  } catch {
    return memoria();
  }
}

export const storage = criarStorage(typeof window === 'undefined' ? memoria() : baseDoNavegador());

/** Gera um id curto e único. */
export function novoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
