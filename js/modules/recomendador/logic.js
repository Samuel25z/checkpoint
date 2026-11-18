// Lógica pura do Recomendador: pontuação explicável por etiquetas, sem IA.
import { normalizar } from '../../games.js';

export const HUMORES = [
  { id: 'relaxar', rotulo: 'Relaxar', etiquetas: ['relaxante', 'aconchegante', 'fazenda', 'construcao', 'leve'] },
  { id: 'adrenalina', rotulo: 'Adrenalina', etiquetas: ['acao', 'tiro', 'adrenalina', 'competitivo', 'corrida', 'caotico'] },
  { id: 'historia', rotulo: 'Uma boa história', etiquetas: ['historia', 'escolhas', 'cinematografico', 'emocionante'] },
  { id: 'desafio', rotulo: 'Desafio', etiquetas: ['dificil', 'rogue', 'estrategia'] },
  { id: 'rir', rotulo: 'Dar risada', etiquetas: ['engracado', 'caotico', 'amigos', 'leve'] },
  { id: 'medo', rotulo: 'Sentir medo', etiquetas: ['terror', 'misterio', 'atmosfera'] },
  { id: 'explorar', rotulo: 'Explorar', etiquetas: ['exploracao', 'mundo-aberto', 'misterio', 'espaco', 'oceano'] }
];
export const TEMPOS = [
  { id: 'rapido', rotulo: 'Uma partida rápida' },
  { id: 'medio', rotulo: 'Algumas noites' },
  { id: 'longo', rotulo: 'Um jogo para meses' }
];
export const COMPANHIAS = [{ id: 'sozinho', rotulo: 'Sozinho' }, { id: 'amigos', rotulo: 'Com amigos' }];
export const PLATAFORMAS = ['Qualquer', 'PC', 'PlayStation', 'Xbox', 'Switch', 'Celular'];

const NOMES_ETIQUETA = {
  relaxante: 'relaxante', aconchegante: 'aconchegante', historia: 'história forte', escolhas: 'escolhas que importam', cinematografico: 'cinematográfico',
  emocionante: 'emocionante', dificil: 'difícil', rogue: 'roguelike', estrategia: 'estratégia', engracado: 'engraçado', caotico: 'caótico', terror: 'terror',
  misterio: 'mistério', atmosfera: 'clima marcante', exploracao: 'exploração', 'mundo-aberto': 'mundo aberto', coop: 'cooperativo', multiplayer: 'multijogador',
  acao: 'ação', tiro: 'tiro', competitivo: 'competitivo', 'partidas-curtas': 'partidas curtas', indie: 'indie', 'arte-bonita': 'arte linda', rpg: 'RPG'
};
export const nomeEtiqueta = (e) => NOMES_ETIQUETA[e] || e.replace(/-/g, ' ');

const EXCLUIR_STATUS = new Set(['zerado', 'platinado', 'jogando', 'larguei']);

/** Liga registros do diário a jogos do catálogo (por id ou nome). */
export function ligarDiario(diario, jogos) {
  const porNome = Object.fromEntries(jogos.map((j) => [normalizar(j.nome), j]));
  const porId = Object.fromEntries(jogos.map((j) => [j.id, j]));
  return diario.map((r) => ({ registro: r, jogo: porId[r.jogoId] || porNome[normalizar(r.nome)] || null })).filter((x) => x.jogo);
}

/** Peso por etiqueta a partir das notas do diário (nota 5 = +2, nota 1 = −2). */
export function gostoDoDiario(ligados) {
  const gosto = {};
  for (const { registro, jogo } of ligados) {
    if (registro.nota === null || registro.nota === undefined) continue;
    const peso = registro.nota - 3;
    if (!peso) continue;
    for (const e of jogo.etiquetas) gosto[e] = (gosto[e] || 0) + peso;
  }
  return gosto;
}

function cabeNoTempo(jogo, tempo) {
  const curto = jogo.horas <= 12 || jogo.etiquetas.includes('partidas-curtas');
  if (tempo === 'rapido') return curto ? 3 : -2;
  if (tempo === 'medio') return jogo.horas <= 35 ? 2 : -1;
  if (tempo === 'longo') return jogo.horas >= 30 || jogo.etiquetas.includes('longo') ? 3 : -1;
  return 0;
}

const naPlataforma = (jogo, p) => !p || p === 'Qualquer' || jogo.plataformas.includes(p);
const comAmigos = (jogo) => jogo.etiquetas.some((e) => e === 'coop' || e === 'multiplayer' || e === 'amigos');

/**
 * Recomenda até `quantos` jogos. Sempre o mesmo resultado para as mesmas respostas.
 * Retorna [{ jogo, pontos, motivos: [texto] }].
 */
export function recomendar({ humor, tempo, companhia, plataforma }, diario, jogos, { excluir = [], quantos = 3 } = {}) {
  const ligados = ligarDiario(diario, jogos);
  const jaTem = new Set(ligados.filter((l) => EXCLUIR_STATUS.has(l.registro.status)).map((l) => l.jogo.id));
  const gosto = gostoDoDiario(ligados);
  const favoritos = ligados.filter((l) => l.registro.nota >= 4).sort((a, b) => b.registro.nota - a.registro.nota);
  const alvo = HUMORES.find((h) => h.id === humor)?.etiquetas || [];
  const fora = new Set(excluir);

  const candidatos = jogos.filter((j) => !jaTem.has(j.id) && !fora.has(j.id) && naPlataforma(j, plataforma) && (companhia !== 'amigos' || comAmigos(j)));

  return candidatos.map((j) => {
    const doHumor = j.etiquetas.filter((e) => alvo.includes(e));
    let pontos = doHumor.length * 4 + cabeNoTempo(j, tempo);
    if (companhia === 'sozinho' && j.etiquetas.includes('solo')) pontos += 1;
    let doGosto = 0;
    for (const e of j.etiquetas) doGosto += gosto[e] || 0;
    pontos += Math.max(-6, Math.min(8, doGosto * 0.5));

    const motivos = [];
    if (doHumor.length) motivos.push(`Combina com seu humor: ${doHumor.slice(0, 3).map(nomeEtiqueta).join(', ')}`);
    const parecido = favoritos.map((f) => ({ f, comum: f.jogo.etiquetas.filter((e) => j.etiquetas.includes(e)) })).filter((x) => x.comum.length >= 2 && x.f.jogo.id !== j.id).sort((a, b) => b.comum.length - a.comum.length)[0];
    if (parecido) { motivos.push(`Porque você deu ${String(parecido.f.registro.nota).replace('.', ',')} para ${parecido.f.jogo.nome}`); pontos += 2; }
    if (tempo === 'rapido' && cabeNoTempo(j, tempo) > 0) motivos.push(j.etiquetas.includes('partidas-curtas') ? 'Partidas curtas' : `Dá para terminar em cerca de ${j.horas} h`);
    if (tempo === 'longo' && cabeNoTempo(j, tempo) > 0) motivos.push(`Rende umas ${j.horas} h ou mais`);
    if (companhia === 'amigos') motivos.push(j.etiquetas.includes('coop') ? 'Dá para jogar em cooperativo' : 'Bom para jogar com amigos');
    return { jogo: j, pontos: Math.round(pontos * 10) / 10, motivos };
  }).sort((a, b) => b.pontos - a.pontos || a.jogo.id.localeCompare(b.jogo.id)).slice(0, quantos);
}

/** Sugestão do dia: muda a cada dia, igual para o dia todo. */
export function sugestaoDoDia(diario, jogos, data = new Date()) {
  const lista = recomendar({ humor: null, tempo: null, companhia: null, plataforma: 'Qualquer' }, diario, jogos, { quantos: 15 });
  if (!lista.length) return null;
  const dia = Math.floor(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / 86400000);
  return lista[dia % lista.length];
}
