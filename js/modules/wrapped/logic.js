// Lógica pura do Wrapped: estatísticas do ano a partir do diário.
import { normalizar } from '../../games.js';

export const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

const anoDe = (d) => (d ? Number(String(d).slice(0, 4)) : null);

/** O registro pertence ao ano se começou, terminou ou (sem datas) foi criado nele. */
export function doAno(r, ano) {
  if (r.inicio || r.fim) return anoDe(r.inicio) === ano || anoDe(r.fim) === ano;
  return anoDe(r.criadoEm || r.atualizadoEm) === ano;
}

export function anosDisponiveis(diario) {
  const anos = new Set();
  for (const r of diario) for (const d of [r.inicio, r.fim, !r.inicio && !r.fim ? (r.criadoEm || r.atualizadoEm) : null]) if (d) anos.add(anoDe(d));
  return [...anos].filter(Boolean).sort((a, b) => b - a);
}

function maisFrequente(itens) {
  const c = new Map();
  for (const i of itens) if (i) c.set(i, (c.get(i) || 0) + 1);
  let melhor = null;
  for (const [k, v] of c) if (!melhor || v > melhor[1] || (v === melhor[1] && k < melhor[0])) melhor = [k, v];
  return melhor ? { valor: melhor[0], vezes: melhor[1] } : null;
}

/* ---------- períodos: ver o resumo a qualquer momento ---------- */
const DIA = 86400000;

/** Lê o período da rota: "2026", "30-dias" ou "tudo". */
export function lerPeriodo(id, agora = new Date()) {
  if (id === 'tudo') return { tipo: 'tudo', id: 'tudo' };
  const dias = String(id || '').match(/^(\d{1,3})-dias$/);
  if (dias) return { tipo: 'dias', n: Number(dias[1]), id: `${dias[1]}-dias` };
  const ano = Number(id) || agora.getFullYear();
  return { tipo: 'ano', ano, id: String(ano) };
}

export function rotuloPeriodo(p, agora = new Date()) {
  if (p.tipo === 'tudo') return 'Desde sempre';
  if (p.tipo === 'dias') return `Seus últimos ${p.n} dias`;
  return p.ano === agora.getFullYear() ? `Seu ${p.ano} até agora` : `Seu ${p.ano}`;
}

/** Opções do seletor: ano atual, 30 dias, tudo e anos anteriores com registros. */
export function periodos(diario, agora = new Date()) {
  const atual = agora.getFullYear();
  const anteriores = anosDisponiveis(diario).filter((a) => a < atual);
  return [lerPeriodo(String(atual), agora), lerPeriodo('30-dias'), lerPeriodo('tudo'), ...anteriores.map((a) => lerPeriodo(String(a)))]
    .map((p) => ({ ...p, rotulo: p.tipo === 'ano' && p.ano === atual ? `${atual} até agora` : p.tipo === 'dias' ? 'Últimos 30 dias' : p.tipo === 'tudo' ? 'Desde sempre' : String(p.ano) }));
}

/** A data cai dentro do período? */
function naJanela(d, p, agora) {
  if (!d) return false;
  if (p.tipo === 'tudo') return true;
  if (p.tipo === 'ano') return anoDe(d) === p.ano;
  const t = new Date(String(d).length === 10 ? `${d}T12:00:00` : d).getTime();
  return t >= agora.getTime() - p.n * DIA && t <= agora.getTime() + DIA;
}

/** O registro tem atividade no período (começou, terminou, jogou por último ou, sem datas, foi criado). */
export function noPeriodo(r, p, agora = new Date()) {
  const datas = [r.inicio, r.fim, r.ultimaVez].filter(Boolean);
  if (!datas.length) return naJanela(r.criadoEm || r.atualizadoEm, p, agora);
  return datas.some((d) => naJanela(d, p, agora));
}

export function estatisticas(diario, periodoOuAno, catalogo = [], agora = new Date()) {
  const p = typeof periodoOuAno === 'object' ? periodoOuAno : lerPeriodo(String(periodoOuAno), agora);
  const ano = p.tipo === 'ano' ? p.ano : agora.getFullYear();
  const doCatalogo = Object.fromEntries(catalogo.map((j) => [j.id, j]));
  const porNome = Object.fromEntries(catalogo.map((j) => [normalizar(j.nome), j]));
  const lista = diario.filter((r) => noPeriodo(r, p, agora) && r.status !== 'quero');
  const zerados = lista.filter((r) => (r.status === 'zerado' || r.status === 'platinado') && (!r.fim || naJanela(r.fim, p, agora)));
  const horas = Math.round(lista.reduce((a, r) => a + (Number(r.horas) || 0), 0) * 10) / 10;
  const maisJogado = [...lista].filter((r) => r.horas > 0).sort((a, b) => b.horas - a.horas || a.nome.localeCompare(b.nome))[0] || null;
  const avaliados = lista.filter((r) => r.nota !== null && r.nota !== undefined);
  const melhorNota = [...avaliados].sort((a, b) => b.nota - a.nota || (b.horas || 0) - (a.horas || 0) || a.nome.localeCompare(b.nome))[0] || null;
  const generos = lista.flatMap((r) => (doCatalogo[r.jogoId] || porNome[normalizar(r.nome)])?.generos || []);
  const meses = lista.flatMap((r) => [r.inicio, r.fim].filter((d) => naJanela(d, p, agora)).map((d) => Number(String(d).slice(5, 7)) - 1));
  const mes = maisFrequente(meses.map((m) => String(m).padStart(2, '0')));
  const plataforma = maisFrequente(lista.map((r) => r.plataforma));
  const genero = maisFrequente(generos);

  return {
    ano,
    periodo: p,
    rotulo: rotuloPeriodo(p, agora),
    jogos: lista.length,
    zerados: zerados.length,
    platinados: lista.filter((r) => r.status === 'platinado').length,
    horas,
    dias: Math.round((horas / 24) * 10) / 10,
    maisJogado,
    melhorNota,
    mediaNotas: avaliados.length ? Math.round((avaliados.reduce((a, r) => a + r.nota, 0) / avaliados.length) * 10) / 10 : null,
    genero: genero?.valor || null,
    plataforma: plataforma?.valor || null,
    mes: mes ? MESES[Number(mes.valor)] : null,
    capasZerados: zerados.slice(0, 6).map((r) => ({ nome: r.nome, capa: r.capa || null })),
    capas: [...lista].sort((a, b) => (b.horas || 0) - (a.horas || 0)).slice(0, 12).map((r) => ({ nome: r.nome, capa: r.capa || null })),
    perfil: perfil({ horas, zerados: zerados.length, platinados: lista.filter((r) => r.status === 'platinado').length, jogos: lista.length, genero: genero?.valor })
  };
}

/** Um "título" divertido para o card final. */
export function perfil({ horas, zerados, platinados, jogos, genero }) {
  if (platinados >= 3) return { titulo: 'Caçador de troféus', texto: 'Zerar não basta: você foi até os 100%.' };
  if (horas >= 300) return { titulo: 'Maratonista', texto: 'Seu controle mal teve tempo de esfriar.' };
  if (zerados >= 10) return { titulo: 'Finalizador', texto: 'Começou, terminou. Sem backlog acumulando.' };
  if (genero === 'Roguelike') return { titulo: 'Só mais uma run', texto: 'Morrer faz parte. Voltar também.' };
  if (genero === 'RPG') return { titulo: 'Aventureiro', texto: 'Mundos enormes não te assustam.' };
  if (jogos >= 5) return { titulo: 'Explorador', texto: 'Um pouco de tudo, sempre atrás do próximo jogo.' };
  return { titulo: 'Jogador de fim de semana', texto: 'Pouco tempo, muita diversão.' };
}
