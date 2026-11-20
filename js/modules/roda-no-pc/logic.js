// Lógica pura do "Roda no meu PC?": achar peças, comparar com requisitos e classificar.
import { CPUS, GPUS } from '../../data/hardware.js';

export const NIVEIS = [
  { id: 'nao', rotulo: 'Não roda' },
  { id: 'baixo', rotulo: 'Baixo' },
  { id: 'medio', rotulo: 'Médio' },
  { id: 'alto', rotulo: 'Alto' },
  { id: 'ultra', rotulo: 'Ultra' }
];
export const ROTULO_NIVEL = Object.fromEntries(NIVEIS.map((n) => [n.id, n.rotulo]));
export const RAMS = [4, 8, 12, 16, 24, 32, 64];

const norm = (t) => String(t || '').toLowerCase().replace(/\(r\)|\(tm\)|®|™/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/** Parte que diferencia o modelo: "NVIDIA GeForce RTX 3060 Ti" → "rtx 3060 ti". */
function modelo(nome) {
  return norm(nome).replace(/^(nvidia geforce|amd radeon|intel core|amd ryzen|intel|amd)\s*/, '').trim();
}

/** Encontra a peça mais provável num texto livre (ex.: renderer do WebGL). Retorna o nome da tabela ou null. */
export function encontrarPeca(texto, tabela) {
  const t = ` ${norm(texto)} `;
  if (!t.trim()) return null;
  let melhor = null;
  for (const nome of Object.keys(tabela)) {
    const m = modelo(nome);
    if (!m) continue;
    if (t.includes(` ${m} `) || t.includes(` ${norm(nome)} `)) {
      if (!melhor || m.length > modelo(melhor).length) melhor = nome;
    }
  }
  return melhor;
}

export const encontrarGpu = (t) => encontrarPeca(t, GPUS);
export const encontrarCpu = (t) => encontrarPeca(t, CPUS);

/**
 * Classifica um PC frente aos requisitos de um jogo.
 * Folga = pior razão entre o PC e o requisito recomendado (CPU, GPU e RAM).
 */
export function classificar(pc, requisitos) {
  if (!requisitos) return { nivel: null, gargalo: null };
  const cpu = CPUS[pc.cpu];
  const gpu = GPUS[pc.gpu];
  if (!cpu || !gpu || !pc.ram) return { nivel: null, gargalo: null };
  const { min, rec } = requisitos;
  const razMin = { cpu: cpu / CPUS[min.cpu], gpu: gpu / GPUS[min.gpu], ram: pc.ram / min.ram };
  const razRec = { cpu: cpu / CPUS[rec.cpu], gpu: gpu / GPUS[rec.gpu], ram: pc.ram / rec.ram };
  const gargaloDe = (r) => Object.entries(r).sort((a, b) => a[1] - b[1])[0];
  const [pecaMin, menorMin] = gargaloDe(razMin);
  if (menorMin < 0.9) return { nivel: 'nao', gargalo: pecaMin };
  const [pecaRec, folga] = gargaloDe(razRec);
  const nivel = folga < 0.75 ? 'baixo' : folga < 1 ? 'medio' : folga < 1.6 ? 'alto' : 'ultra';
  return { nivel, gargalo: nivel === 'ultra' ? null : pecaRec, folga: Math.round(folga * 100) / 100 };
}

const NOME_PECA = { cpu: 'processador', gpu: 'placa de vídeo', ram: 'memória' };

export function explicar({ nivel, gargalo }) {
  if (!nivel) return 'Sem requisitos de PC';
  if (nivel === 'nao') return `A ${NOME_PECA[gargalo]} está abaixo do mínimo`;
  if (nivel === 'ultra') return 'Sobra desempenho';
  return `Quem segura é a ${NOME_PECA[gargalo]}`;
}

/** Resultado para uma lista de jogos, do mais leve para o mais pesado. */
export function resultado(pc, jogos) {
  const ordem = Object.fromEntries(NIVEIS.map((n, i) => [n.id, i]));
  return jogos.filter((j) => j.requisitos).map((j) => ({ jogo: j, ...classificar(pc, j.requisitos) }))
    .sort((a, b) => ordem[b.nivel] - ordem[a.nivel] || a.jogo.nome.localeCompare(b.jogo.nome, 'pt-BR'));
}

export function resumo(lista) {
  const c = Object.fromEntries(NIVEIS.map((n) => [n.id, 0]));
  for (const r of lista) if (r.nivel) c[r.nivel]++;
  return c;
}

/** Valida um PC do formulário. */
export function validarPc(pc) {
  const erros = {};
  if (!String(pc.nome || '').trim()) erros.nome = 'Dê um nome, como "Meu PC".';
  if (!CPUS[pc.cpu]) erros.cpu = 'Escolha um processador da lista.';
  if (!GPUS[pc.gpu]) erros.gpu = 'Escolha uma placa de vídeo da lista.';
  if (!RAMS.includes(Number(pc.ram))) erros.ram = 'Escolha a memória.';
  return { ok: !Object.keys(erros).length, erros, valor: { ...pc, nome: String(pc.nome || '').trim(), ram: Number(pc.ram) } };
}

/* ---------- FPS estimado ---------- */
// Base: o requisito recomendado mira ~60 FPS no Alto em 1080p. A placa escala o FPS pela pontuação,
// o processador limita o teto e memória abaixo do recomendado tira 15%. É estimativa, não benchmark.
export const QUALIDADES = [
  { id: 'baixo', rotulo: 'Baixo', fator: 1.6 },
  { id: 'medio', rotulo: 'Médio', fator: 1.25 },
  { id: 'alto', rotulo: 'Alto', fator: 1 },
  { id: 'ultra', rotulo: 'Ultra', fator: 0.75 }
];
export const RESOLUCOES = [
  { id: '1080p', rotulo: '1080p', fator: 1 },
  { id: '1440p', rotulo: '1440p', fator: 0.65 },
  { id: '4k', rotulo: '4K', fator: 0.35 }
];
const FPS_TETO = 240;

/** FPS estimado (inteiro) ou null se não roda / sem dados. */
export function estimarFps(pc, requisitos, { qualidade = 'alto', resolucao = '1080p' } = {}) {
  if (!requisitos) return null;
  const { nivel } = classificar(pc, requisitos);
  if (!nivel || nivel === 'nao') return null;
  const q = QUALIDADES.find((x) => x.id === qualidade)?.fator ?? 1;
  const r = RESOLUCOES.find((x) => x.id === resolucao)?.fator ?? 1;
  const gpu = 60 * (GPUS[pc.gpu] / GPUS[requisitos.rec.gpu]) * q * r;
  // o processador quase não liga para qualidade/resolução: teto fixo pelo quanto ele passa do recomendado
  const cpu = 60 * 1.4 * (CPUS[pc.cpu] / CPUS[requisitos.rec.cpu]);
  const ram = pc.ram < requisitos.rec.ram ? 0.85 : 1;
  return Math.max(1, Math.min(FPS_TETO, Math.round(Math.min(gpu, cpu) * ram)));
}

/** Quem limita o FPS naquela combinação: 'gpu' ou 'cpu'. */
export function limitante(pc, requisitos, opcoes = {}) {
  const q = QUALIDADES.find((x) => x.id === (opcoes.qualidade || 'alto'))?.fator ?? 1;
  const r = RESOLUCOES.find((x) => x.id === (opcoes.resolucao || '1080p'))?.fator ?? 1;
  const gpu = 60 * (GPUS[pc.gpu] / GPUS[requisitos.rec.gpu]) * q * r;
  const cpu = 60 * 1.4 * (CPUS[pc.cpu] / CPUS[requisitos.rec.cpu]);
  return gpu <= cpu ? 'gpu' : 'cpu';
}

/** Tabela qualidade × resolução. */
export function tabelaFps(pc, requisitos) {
  return QUALIDADES.map((q) => ({ ...q, fps: Object.fromEntries(RESOLUCOES.map((r) => [r.id, estimarFps(pc, requisitos, { qualidade: q.id, resolucao: r.id })])) }));
}

/** FPS na qualidade do nível do jogo (Baixo/Médio/Alto/Ultra), para a lista bater com o selo. */
export function fpsDoNivel(pc, requisitos, nivel, resolucao = '1080p') {
  if (!QUALIDADES.some((q) => q.id === nivel)) return null;
  return estimarFps(pc, requisitos, { qualidade: nivel, resolucao });
}

/** "~72", ou "240+" quando bate no teto. */
export const textoFps = (fps) => (fps === null ? '—' : fps >= FPS_TETO ? `${FPS_TETO}+` : `~${fps}`);

/** Melhor qualidade que ainda segura 60 FPS na resolução (ou a que der mais FPS, se nenhuma chegar). */
export function qualidadeSugerida(pc, requisitos, resolucao = '1080p') {
  const t = tabelaFps(pc, requisitos);
  if (t[0].fps[resolucao] === null) return null;
  const boas = t.filter((q) => q.fps[resolucao] >= 60);
  const q = boas.length ? boas[boas.length - 1] : t[0];
  return { id: q.id, rotulo: q.rotulo, fps: q.fps[resolucao] };
}

/** Faixa de leitura do FPS. */
export function sensacao(fps) {
  if (fps === null || fps === undefined) return 'Não roda';
  if (fps < 30) return 'Travando';
  if (fps < 45) return 'Jogável';
  if (fps < 60) return 'Bom';
  if (fps < 100) return 'Liso';
  return 'Muito liso';
}

/** Peça por peça: sua pontuação comparada ao mínimo e ao recomendado. */
export function comparar(pc, requisitos) {
  const tab = { cpu: CPUS, gpu: GPUS };
  return ['cpu', 'gpu', 'ram'].map((p) => {
    const voce = p === 'ram' ? pc.ram : tab[p][pc[p]];
    const min = p === 'ram' ? requisitos.min.ram : tab[p][requisitos.min[p]];
    const rec = p === 'ram' ? requisitos.rec.ram : tab[p][requisitos.rec[p]];
    return { peca: p, nome: p === 'ram' ? `${pc.ram} GB` : pc[p], min: requisitos.min[p], rec: requisitos.rec[p],
      vsRec: Math.round((voce / rec) * 100) / 100, situacao: voce < min * 0.9 ? 'abaixo' : voce < rec ? 'entre' : 'acima' };
  });
}

/** A placa mais fraca da lista que dá ~60 FPS no Alto (1080p) com o resto do PC igual; null se o processador não deixa. */
export function placaPara60(pc, requisitos, resolucao = '1080p') {
  const todas = Object.entries(GPUS).filter(([n, p]) => p > (GPUS[pc.gpu] || 0) && !/laptop|graphics|vega|steam deck/i.test(n)).sort((a, b) => a[1] - b[1]);
  // primeiro as placas que ainda se compram (RTX 30+, RX 6000+, Arc); só depois as antigas
  const atual = (n) => /RTX [345]0|RX [679]\d{3}|Arc /i.test(n);
  for (const [nome] of [...todas.filter(([n]) => atual(n)), ...todas.filter(([n]) => !atual(n))]) {
    const fps = estimarFps({ ...pc, gpu: nome }, requisitos, { qualidade: 'alto', resolucao });
    if (fps !== null && fps >= 60) return nome;
  }
  return null;
}
