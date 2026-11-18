// speedrun.js — API pública do speedrun.com (v1, sem chave). Cache de 10 minutos.
import { converterJogos, converterCategorias, converterRanking } from '../modules/speedrun/logic.js';

const API = 'https://www.speedrun.com/api/v1';
const DEZ_MIN = 10 * 60 * 1000;

export function criarSpeedrun({ buscar = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }), agora = () => Date.now() } = {}) {
  const cache = new Map();
  async function pedir(url) {
    const c = cache.get(url);
    if (c && agora() - c.quando < DEZ_MIN) return c.json;
    const json = await buscar(url);
    cache.set(url, { json, quando: agora() });
    return json;
  }
  return {
    jogos: async (nome) => converterJogos(await pedir(`${API}/games?name=${encodeURIComponent(nome)}&max=8`)),
    categorias: async (jogoId) => converterCategorias(await pedir(`${API}/games/${jogoId}/categories`)),
    ranking: async (jogoId, categoriaId, top = 10) => converterRanking(await pedir(`${API}/leaderboards/${jogoId}/category/${categoriaId}?top=${top}&embed=players`))
  };
}

export const speedrun = criarSpeedrun();
