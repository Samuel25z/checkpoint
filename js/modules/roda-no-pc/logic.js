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
