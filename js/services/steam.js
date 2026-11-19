// steam.js — fala com o ajudante da Steam (Cloudflare Worker). A chave nunca passa pelo site.
import { STEAM_AJUDANTE } from '../config.js';

export class ErroSteam extends Error {
  constructor(mensagem, { privado = false, status = 0 } = {}) { super(mensagem); this.privado = privado; this.status = status; }
}

export function criarSteam({ base = STEAM_AJUDANTE, buscar = fetch } = {}) {
  async function pedir(caminho) {
    let r;
    try { r = await buscar(base.replace(/\/$/, '') + caminho); } catch { throw new ErroSteam('Sem conexão com o ajudante da Steam. Confira sua internet.'); }
    let corpo = {};
    try { corpo = await r.json(); } catch { /* resposta sem JSON */ }
    if (!r.ok) throw new ErroSteam(corpo.erro || 'A Steam não respondeu agora.', { privado: Boolean(corpo.privado), status: r.status });
    return corpo;
  }
  return {
    configurado: () => Boolean(base),
    perfil: (entrada) => pedir(`/perfil?entrada=${encodeURIComponent(entrada)}`),
    jogos: async (steamid) => (await pedir(`/jogos?steamid=${steamid}`)).jogos,
    conquistas: async (steamid, appids) => (await pedir(`/conquistas?steamid=${steamid}&appids=${appids.join(',')}`)).conquistas
  };
}
