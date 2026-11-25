// Lógica pura do Perfil: números, nível, medalhas e estatísticas, tudo calculado do Diário.
import { JOGOS, POR_ID, normalizar } from '../../games.js';

const FINALIZADOS = new Set(['zerado', 'platinado']);
const DIA = 86400000;
const POR_NOME = Object.fromEntries(JOGOS.map((j) => [normalizar(j.nome), j]));

/** Jogo do catálogo ligado a um registro do Diário (por id ou pelo nome). */
export const doCatalogo = (r) => POR_ID[r?.jogoId] || POR_NOME[normalizar(r?.nome)] || null;

/** Preferências do perfil, sempre na mesma forma; favoritos que sumiram do Diário são ignorados. */
export function lerPerfil(salvo, diario = []) {
  const ids = new Set(diario.map((r) => r.id));
  const favoritos = [...new Set(Array.isArray(salvo?.favoritos) ? salvo.favoritos : [])].filter((id) => ids.has(id)).slice(0, 5);
  return {
    nome: String(salvo?.nome || '').trim().slice(0, 40),
    frase: String(salvo?.frase || '').trim().slice(0, 140),
    favoritos,
    coroado: favoritos.includes(salvo?.coroado) ? salvo.coroado : favoritos[0] || null,
  };
}

/** Valida o formulário de edição. */
export function validarPerfil(v, diario = []) {
  const erros = {};
  const nome = String(v.nome || '').trim();
  if (nome.length > 40) erros.nome = 'Use até 40 letras.';
  if (String(v.frase || '').trim().length > 140) erros.frase = 'Use até 140 letras.';
  const favoritos = [...new Set(v.favoritos || [])];
  if (favoritos.length > 5) erros.favoritos = 'Escolha no máximo 5 favoritos.';
  return { ok: !Object.keys(erros).length, erros, valor: lerPerfil({ ...v, favoritos }, diario) };
}

/** Iniciais para o avatar. */
export function iniciais(nome) {
  const p = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (!p.length) return 'CP';
  return (p.length > 1 ? p[0][0] + p.at(-1)[0] : p[0].slice(0, 2)).toUpperCase();
}

/** Números grandes do topo. */
export function numeros(diario) {
  const avaliados = diario.filter((r) => r.nota !== null && r.nota !== undefined);
  return {
    jogos: diario.length,
    finalizados: diario.filter((r) => FINALIZADOS.has(r.status)).length,
    platinados: diario.filter((r) => r.status === 'platinado').length,
    horas: Math.round(diario.reduce((a, r) => a + (Number(r.horas) || 0), 0)),
    media: avaliados.length ? Math.round((avaliados.reduce((a, r) => a + r.nota, 0) / avaliados.length) * 10) / 10 : null,
    avaliados: avaliados.length,
  };
}

/* ---------- nível ---------- */
export const TITULOS = [[35, 'Lenda'], [20, 'Veterano'], [10, 'Explorador'], [5, 'Aventureiro'], [1, 'Novato']];

/** XP: cada jogo, zerada, platina, hora jogada, nota e resenha contam. */
export function xp(diario) {
  return diario.reduce((a, r) => a + 10 + (FINALIZADOS.has(r.status) ? 40 : 0) + (r.status === 'platinado' ? 60 : 0)
    + Math.floor(Number(r.horas) || 0) + (r.nota !== null && r.nota !== undefined ? 5 : 0) + (r.resenha ? 15 : 0), 0);
}

const xpDoNivel = (n) => 25 * (n - 1) ** 2;

/** Nível a partir do XP (curva que vai ficando mais lenta), título e progresso até o próximo. */
export function nivel(pontos) {
  const n = Math.floor(Math.sqrt(Math.max(0, pontos) / 25)) + 1;
  const de = xpDoNivel(n), ate = xpDoNivel(n + 1);
  return { nivel: n, xp: pontos, titulo: TITULOS.find(([min]) => n >= min)[1], progresso: (pontos - de) / (ate - de), faltam: ate - pontos };
}

/* ---------- medalhas ---------- */
export const MEDALHAS = [
  { id: 'colecionador', nome: 'Colecionador', texto: 'jogos no diário', medir: (d) => d.length, niveis: [10, 50, 150] },
  { id: 'finalizador', nome: 'Finalizador', texto: 'jogos zerados', medir: (d) => d.filter((r) => FINALIZADOS.has(r.status)).length, niveis: [5, 20, 50] },
  { id: 'platinador', nome: 'Caçador de troféus', texto: 'platinas', medir: (d) => d.filter((r) => r.status === 'platinado').length, niveis: [1, 5, 15] },
  { id: 'maratonista', nome: 'Maratonista', texto: 'horas jogadas', medir: (d) => Math.round(d.reduce((a, r) => a + (Number(r.horas) || 0), 0)), niveis: [100, 500, 2000] },
  { id: 'critico', nome: 'Crítico', texto: 'resenhas escritas', medir: (d) => d.filter((r) => r.resenha).length, niveis: [3, 10, 30] },
  { id: 'ecletico', nome: 'Eclético', texto: 'gêneros diferentes', medir: (d) => new Set(d.flatMap((r) => doCatalogo(r)?.generos || [])).size, niveis: [4, 8, 12] },
];
const TIERS = ['bronze', 'prata', 'ouro'];

/** Cada medalha com o grau atual (ou nenhum), o valor e quanto falta para o próximo. */
export function medalhas(diario) {
  return MEDALHAS.map((m) => {
    const valor = m.medir(diario);
    const atingidos = m.niveis.filter((n) => valor >= n).length;
    const proximo = m.niveis[atingidos] ?? null;
    return { id: m.id, nome: m.nome, texto: m.texto, valor, grau: atingidos ? TIERS[atingidos - 1] : null, proximo, progresso: proximo ? Math.min(1, valor / proximo) : 1 };
  });
}

/* ---------- estatísticas ---------- */

/** Quantos jogos em cada nota (0,5 a 5). */
export function distribuicaoNotas(diario) {
  const faixas = Array.from({ length: 10 }, (_, i) => ({ nota: (i + 1) / 2, quantos: 0 }));
  for (const r of diario) if (r.nota > 0) faixas[Math.round(r.nota * 2) - 1].quantos++;
  return faixas;
}

/** Gêneros mais jogados (por quantidade de jogos, desempate por horas). */
export function generos(diario, limite = 6) {
  const c = new Map();
  for (const r of diario) for (const g of doCatalogo(r)?.generos || []) {
    const x = c.get(g) || { genero: g, jogos: 0, horas: 0 };
    x.jogos++; x.horas += Number(r.horas) || 0; c.set(g, x);
  }
  return [...c.values()].sort((a, b) => b.jogos - a.jogos || b.horas - a.horas || a.genero.localeCompare(b.genero)).slice(0, limite);
}

/** Pontos do radar (SVG): para cada gênero, ângulo e raio proporcional ao maior. */
export function radar(lista, raio = 80, centro = 100) {
  if (lista.length < 3) return null;
  const max = Math.max(...lista.map((g) => g.jogos));
  return lista.map((g, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / lista.length;
    const r = (g.jogos / max) * raio;
    return { ...g, x: +(centro + Math.cos(ang) * r).toFixed(1), y: +(centro + Math.sin(ang) * r).toFixed(1), ex: +(centro + Math.cos(ang) * (raio + 16)).toFixed(1), ey: +(centro + Math.sin(ang) * (raio + 16)).toFixed(1), bx: +(centro + Math.cos(ang) * raio).toFixed(1), by: +(centro + Math.sin(ang) * raio).toFixed(1) };
  });
}

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Mapa de atividade: dias dos últimos N com algo registrado (atividades, início, fim). */
export function mapaAtividade(diario, atividades = [], hoje = new Date(), dias = 91) {
  const conta = new Map();
  const marcar = (data) => { if (data) { const k = String(data).slice(0, 10); conta.set(k, (conta.get(k) || 0) + 1); } };
  atividades.forEach((a) => marcar(a.quando ? iso(new Date(a.quando)) : null));
  diario.forEach((r) => { marcar(r.inicio); marcar(r.fim); });
  const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(fim.getTime() - (dias - 1 - i) * DIA);
    const k = iso(d);
    return { data: k, quantos: conta.get(k) || 0, semana: d.getDay() };
  });
}

/** Destaques: plataforma mais jogada, tempo médio por jogo e % platinados. */
export function destaques(diario) {
  const plats = new Map();
  for (const r of diario) if (r.plataforma) plats.set(r.plataforma, (plats.get(r.plataforma) || 0) + 1);
  const plataforma = [...plats.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || null;
  const comHoras = diario.filter((r) => Number(r.horas) > 0);
  return {
    plataforma,
    media: comHoras.length ? Math.round(comHoras.reduce((a, r) => a + Number(r.horas), 0) / comHoras.length) : null,
    platinados: diario.length ? Math.round((diario.filter((r) => r.status === 'platinado').length / diario.length) * 100) : 0,
  };
}

/** Resumo do ano: jogos com atividade no ano, finalizados no ano e horas desses jogos. */
export function resumoDoAno(diario, ano = new Date().getFullYear()) {
  const doAno = (d) => d && Number(String(d).slice(0, 4)) === ano;
  const lista = diario.filter((r) => doAno(r.inicio) || doAno(r.fim) || doAno(r.ultimaVez) || (!r.inicio && !r.fim && doAno(r.criadoEm || r.atualizadoEm)));
  return { ano, jogos: lista.length, finalizados: lista.filter((r) => FINALIZADOS.has(r.status) && (!r.fim || doAno(r.fim))).length, horas: Math.round(lista.reduce((a, r) => a + (Number(r.horas) || 0), 0)) };
}

/** Jogos mexidos por último. */
export const recentes = (diario, n = 6) => [...diario].sort((a, b) => String(b.atualizadoEm || '').localeCompare(String(a.atualizadoEm || ''))).slice(0, n);

/** "Desde nov. de 2026": data do primeiro registro. */
export function desde(diario) {
  const datas = diario.map((r) => r.criadoEm).filter(Boolean).sort();
  if (!datas.length) return null;
  const d = new Date(datas[0]);
  const m = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'][d.getMonth()];
  return `${m} de ${d.getFullYear()}`;
}
