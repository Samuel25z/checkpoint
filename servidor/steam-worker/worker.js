// Checkpoint — ajudante da Steam (Cloudflare Worker).
// Guarda a chave da Steam (segredo STEAM_KEY) e repassa só o necessário para o site:
//   GET /perfil?entrada=<link do perfil | id | nome>   → { steamid, nome, avatar, publico }
//   GET /jogos?steamid=<id>                           → { jogos: [{ appid, nome, minutos, minutos2semanas, ultimaVez }] }
//   GET /conquistas?steamid=<id>&appids=1,2,3          → { conquistas: { appid: { total, feitas, ultima } } }
// Só responde para as origens em ORIGENS (o site e o localhost).

const API = 'https://api.steampowered.com';
const ORIGENS_PADRAO = 'https://samuel25z.github.io,http://localhost:5173,http://localhost:5174';

/** Lê link de perfil, id de 17 dígitos ou nome personalizado. */
export function lerEntrada(entrada) {
  const t = String(entrada || '').trim();
  const porId = t.match(/(?:steamcommunity\.com\/profiles\/)?(\d{17})/);
  if (porId) return { steamid: porId[1] };
  const porNome = t.match(/steamcommunity\.com\/id\/([\w-]{2,64})/i) || t.match(/^([\w-]{2,64})$/);
  if (porNome) return { vanity: porNome[1] };
  return null;
}

function resposta(corpo, status, origem, extra = {}) {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': origem, 'vary': 'Origin', 'cache-control': status === 200 ? 'public, max-age=300' : 'no-store', ...extra }
  });
}

async function steam(caminho, params, chave) {
  const u = new URL(API + caminho);
  for (const [k, v] of Object.entries({ key: chave, format: 'json', ...params })) u.searchParams.set(k, v);
  const r = await fetch(u.toString(), { headers: { 'user-agent': 'checkpoint-worker' } });
  if (r.status === 400 || r.status === 403) return { _status: r.status };
  if (!r.ok) throw new Error('steam ' + r.status);
  return r.json();
}

async function perfil(url, chave) {
  const e = lerEntrada(url.searchParams.get('entrada'));
  if (!e) return [{ erro: 'Não reconheci esse perfil. Cole o link da sua página da Steam.' }, 400];
  let steamid = e.steamid;
  if (!steamid) {
    const v = await steam('/ISteamUser/ResolveVanityURL/v1/', { vanityurl: e.vanity }, chave);
    if (v?.response?.success !== 1) return [{ erro: 'Perfil não encontrado na Steam.' }, 404];
    steamid = v.response.steamid;
  }
  const s = await steam('/ISteamUser/GetPlayerSummaries/v2/', { steamids: steamid }, chave);
  const p = s?.response?.players?.[0];
  if (!p) return [{ erro: 'Perfil não encontrado na Steam.' }, 404];
  return [{ steamid, nome: p.personaname, avatar: p.avatarfull || null, publico: p.communityvisibilitystate === 3 }, 200];
}

async function jogos(url, chave) {
  const steamid = url.searchParams.get('steamid');
  if (!/^\d{17}$/.test(steamid || '')) return [{ erro: 'steamid inválido' }, 400];
  const j = await steam('/IPlayerService/GetOwnedGames/v1/', { steamid, include_appinfo: 1, include_played_free_games: 1 }, chave);
  const lista = j?.response?.games;
  if (!lista) return [{ erro: 'A biblioteca deste perfil está privada.', privado: true }, 403];
  return [{ jogos: lista.map((g) => ({ appid: g.appid, nome: g.name, minutos: g.playtime_forever || 0, minutos2semanas: g.playtime_2weeks || 0, ultimaVez: g.rtime_last_played ? new Date(g.rtime_last_played * 1000).toISOString() : null })) }, 200];
}

async function conquistas(url, chave) {
  const steamid = url.searchParams.get('steamid');
  const appids = String(url.searchParams.get('appids') || '').split(',').map(Number).filter((n) => Number.isInteger(n) && n > 0).slice(0, 25);
  if (!/^\d{17}$/.test(steamid || '') || !appids.length) return [{ erro: 'parâmetros inválidos' }, 400];
  const pares = await Promise.all(appids.map(async (appid) => {
    try {
      const a = await steam('/ISteamUserStats/GetPlayerAchievements/v1/', { steamid, appid }, chave);
      const lista = a?.playerstats?.achievements;
      if (!lista?.length) return [appid, null]; // jogo sem conquistas ou sem estatísticas
      const feitas = lista.filter((x) => x.achieved === 1);
      const ultima = feitas.reduce((m, x) => Math.max(m, x.unlocktime || 0), 0);
      return [appid, { total: lista.length, feitas: feitas.length, ultima: ultima ? new Date(ultima * 1000).toISOString() : null }];
    } catch { return [appid, null]; }
  }));
  return [{ conquistas: Object.fromEntries(pares) }, 200];
}

export default {
  async fetch(request, env) {
    const permitidas = String(env.ORIGENS || ORIGENS_PADRAO).split(',').map((s) => s.trim());
    const origem = request.headers.get('origin') || '';
    if (!permitidas.includes(origem)) return new Response('Origem não permitida', { status: 403 });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'access-control-allow-origin': origem, 'access-control-allow-methods': 'GET', 'access-control-max-age': '86400', 'vary': 'Origin' } });
    if (request.method !== 'GET') return resposta({ erro: 'método não permitido' }, 405, origem);
    if (!env.STEAM_KEY) return resposta({ erro: 'O ajudante da Steam está sem chave configurada.' }, 500, origem);
    const url = new URL(request.url);
    const rotas = { '/perfil': perfil, '/jogos': jogos, '/conquistas': conquistas };
    const rota = rotas[url.pathname];
    if (!rota) return resposta({ erro: 'rota inexistente' }, 404, origem);
    try {
      const [corpo, status] = await rota(url, env.STEAM_KEY);
      return resposta(corpo, status, origem);
    } catch {
      return resposta({ erro: 'A Steam não respondeu agora. Tente de novo em instantes.' }, 502, origem);
    }
  }
};
