// Lógica pura da importação da Steam: só FATOS viram sugestão de status; o resto a pessoa escolhe.
import { JOGOS, normalizar } from '../../games.js';

const POR_APPID = Object.fromEntries(JOGOS.filter((j) => j.steam).map((j) => [j.steam, j]));
export const capaSteam = (appid) => `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/library_600x900.jpg`;
const dia = (iso) => (iso ? String(iso).slice(0, 10) : null);

/**
 * Sugestão de status a partir de fatos da Steam. Sem fato → { status: null }.
 * jogo: { minutos, minutos2semanas } · conquistas: { total, feitas, ultima } | null
 */
export function sugerirStatus(jogo, conquistas) {
  if (conquistas && conquistas.total > 0 && conquistas.feitas === conquistas.total) {
    return { status: 'platinado', motivo: '100% das conquistas', fim: dia(conquistas.ultima) };
  }
  if (jogo.minutos2semanas > 0) return { status: 'jogando', motivo: 'Jogou nas últimas 2 semanas' };
  if (!jogo.minutos) return { status: 'quero', motivo: 'Nunca abriu o jogo' };
  return { status: null, motivo: null };
}

/** Registro do diário que já corresponde a este jogo (por appid, catálogo ou nome). */
export function jaNoDiario(diario, jogo) {
  const doCatalogo = POR_APPID[jogo.appid];
  const nome = normalizar(jogo.nome);
  return diario.find((r) => r.steamAppId === jogo.appid || (doCatalogo && r.jogoId === doCatalogo.id) || normalizar(r.nome) === nome) || null;
}

const horas = (minutos) => Math.round(((minutos || 0) / 60) * 10) / 10;

/** Converte um jogo da Steam + status escolhido em registro do diário. */
export function paraRegistro(jogo, status, conquistas, sugestao = sugerirStatus(jogo, conquistas)) {
  const doCatalogo = POR_APPID[jogo.appid];
  return {
    nome: doCatalogo?.nome || jogo.nome,
    jogoId: doCatalogo?.id,
    tituloWiki: doCatalogo?.wiki,
    ano: doCatalogo?.ano,
    steamAppId: jogo.appid,
    origem: 'steam',
    capa: capaSteam(jogo.appid),
    status,
    plataforma: 'PC',
    horas: horas(jogo.minutos),
    ultimaVez: jogo.ultimaVez || null,
    inicio: null,
    fim: status === 'platinado' && sugestao.status === 'platinado' ? sugestao.fim : null,
    conquistas: conquistas ? { total: conquistas.total, feitas: conquistas.feitas } : null,
    nota: null,
    favorito: false
  };
}

/**
 * Reimportação: registro que veio da Steam ganha as horas e conquistas novas, sem mudar o status
 * escolhido. Registro adicionado à mão não é tocado. Retorna o registro atualizado ou null.
 */
export function atualizarExistente(registro, jogo, conquistas) {
  if (registro.origem !== 'steam') return null;
  const novo = { ...registro, horas: horas(jogo.minutos), ultimaVez: jogo.ultimaVez || registro.ultimaVez || null, conquistas: conquistas ? { total: conquistas.total, feitas: conquistas.feitas } : registro.conquistas || null };
  const mudou = novo.horas !== registro.horas || novo.ultimaVez !== registro.ultimaVez || JSON.stringify(novo.conquistas) !== JSON.stringify(registro.conquistas);
  return mudou ? novo : null;
}

/** Texto curto com os fatos de um jogo. */
export function textoFatos(jogo, conquistas, dataCurta = (d) => d) {
  const partes = [jogo.minutos ? `${String(horas(jogo.minutos)).replace('.', ',')} h` : 'nunca jogou'];
  if (jogo.ultimaVez) partes.push(`última vez ${dataCurta(jogo.ultimaVez)}`);
  if (conquistas) partes.push(`conquistas ${conquistas.feitas}/${conquistas.total}`);
  return partes.join(' · ');
}

/** Divide os appids em lotes (o ajudante aceita até 25 por pedido). */
export function lotes(lista, tamanho = 25) {
  const r = [];
  for (let i = 0; i < lista.length; i += tamanho) r.push(lista.slice(i, i + tamanho));
  return r;
}
