// github.js — API pública do GitHub (sem chave, 60 pedidos/hora por IP).
// Cache de 1 hora guardado no navegador para não estourar o limite.

const API = 'https://api.github.com';
const UMA_HORA = 60 * 60 * 1000;

export class LimiteGitHub extends Error {
  constructor(reset) { super('Limite de consultas do GitHub atingido'); this.reset = reset; }
}

export function criarGitHub({ storage, buscar = fetch, agora = () => Date.now() } = {}) {
  async function pedir(url) {
    const chave = 'cache:github:' + url;
    const c = storage?.ler(chave);
    if (c && agora() - c.quando < UMA_HORA) return c.json;
    let r;
    try {
      r = await buscar(url, { headers: { Accept: 'application/vnd.github+json' } });
    } catch (e) {
      if (c) return c.json; // sem rede: usa o que estiver guardado, mesmo antigo
      throw e;
    }
    if (r.status === 403 || r.status === 429) {
      if (c) return c.json;
      throw new LimiteGitHub(Number(r.headers?.get?.('x-ratelimit-reset')) * 1000 || null);
    }
    if (r.status === 404) return null;
    if (!r.ok) { if (c) return c.json; throw new Error('HTTP ' + r.status); }
    const json = await r.json();
    try { storage?.gravar(chave, { json, quando: agora() }, { silencioso: true }); } catch { /* cache é opcional */ }
    return json;
  }
  return {
    buscarRepos: async (q, porPagina = 30) => (await pedir(`${API}/search/repositories?per_page=${porPagina}&sort=stars&q=${encodeURIComponent(q)}`))?.items || [],
    ultimaVersao: async (repo) => {
      const j = await pedir(`${API}/repos/${repo}/releases/latest`);
      return j ? { tag: j.tag_name, nome: j.name || j.tag_name, data: j.published_at, url: j.html_url } : null;
    }
  };
}
