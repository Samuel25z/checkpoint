// Lógica pura da Central de Speedrun: tempo, cronômetro com splits, PB e conversão da API.
// Todos os tempos em milissegundos; "acumulado" = tempo desde o início da run.

/** 4:29.34 · 1:02:03.45 · 0.50 · com sinal: +1.20 / −0.85 */
export function formatarTempo(ms, { sinal = false, casas = 2 } = {}) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return '—';
  const neg = ms < 0;
  let t = Math.abs(ms);
  const fator = 10 ** casas;
  t = Math.floor(t / (1000 / fator)); // trunca, como os cronômetros de speedrun
  const frac = t % fator; t = Math.floor(t / fator);
  const s = t % 60; t = Math.floor(t / 60);
  const m = t % 60; const hh = Math.floor(t / 60);
  const fracTxt = casas ? '.' + String(frac).padStart(casas, '0') : '';
  let corpo;
  if (hh) corpo = `${hh}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}${fracTxt}`;
  else if (m) corpo = `${m}:${String(s).padStart(2, '0')}${fracTxt}`;
  else corpo = `${s}${fracTxt}`;
  return (neg ? '−' : sinal ? '+' : '') + corpo;
}

/** Lê "1:02:03.45", "4:29.3" ou "75" e devolve ms (ou null). */
export function lerTempo(texto) {
  const t = String(texto || '').trim().replace(',', '.');
  if (!/^(\d+:){0,2}\d+(\.\d+)?$/.test(t)) return null;
  const partes = t.split(':').map(Number);
  let seg = 0;
  for (const p of partes) seg = seg * 60 + p;
  return Math.round(seg * 1000);
}

/* ---------- cronômetro ---------- */
export function novaRun(totalSplits) {
  return { estado: 'parado', inicio: null, fim: null, tempos: [], totalSplits };
}

export function iniciar(run, agora) {
  if (run.estado !== 'parado') return run;
  return { ...run, estado: 'correndo', inicio: agora, tempos: [] };
}

/** Marca o split atual; no último, termina a run. */
export function marcar(run, agora) {
  if (run.estado === 'parado') return iniciar(run, agora);
  if (run.estado !== 'correndo') return run;
  const tempos = [...run.tempos, agora - run.inicio];
  const terminou = tempos.length >= run.totalSplits;
  return { ...run, tempos, estado: terminou ? 'terminado' : 'correndo', fim: terminou ? agora : null };
}

export function desfazer(run) {
  if (!run.tempos.length || run.estado === 'parado') return run;
  return { ...run, tempos: run.tempos.slice(0, -1), estado: 'correndo', fim: null };
}

export function reiniciar(run) { return novaRun(run.totalSplits); }

export function decorrido(run, agora) {
  if (run.estado === 'parado') return 0;
  if (run.estado === 'terminado') return run.fim - run.inicio;
  return agora - run.inicio;
}

/* ---------- rota, PB e melhores trechos ---------- */
export function novaRota({ nome, jogo = '', splits = ['Fim'], categoria = null }) {
  const lista = splits.map((s) => String(s).trim()).filter(Boolean);
  return { nome: String(nome || '').trim() || 'Nova rota', jogo, categoria, splits: (lista.length ? lista : ['Fim']).map((n) => ({ nome: n, pb: null, melhor: null })), pbTotal: null, tentativas: 0, concluidas: 0 };
}

/** Diferença de cada split da run para o PB (acumulado). null quando não há PB. */
export function deltas(rota, tempos) {
  return tempos.map((t, i) => (rota.splits[i]?.pb === null || rota.splits[i]?.pb === undefined ? null : t - rota.splits[i].pb));
}

/** Duração de cada trecho a partir dos tempos acumulados. */
export function trechos(tempos) {
  return tempos.map((t, i) => t - (i ? tempos[i - 1] : 0));
}

/** Soma dos melhores trechos (o tempo "possível"). */
export function somaMelhores(rota) {
  if (rota.splits.some((s) => s.melhor === null)) return null;
  return rota.splits.reduce((a, s) => a + s.melhor, 0);
}

/**
 * Registra uma run na rota: conta tentativa, atualiza melhores trechos e, se a run terminou
 * e foi mais rápida, vira o novo PB. Nunca troca o PB por run pior ou incompleta.
 */
export function registrarRun(rota, run) {
  if (run.estado === 'parado' || !run.tempos.length) return { rota, novoPB: false };
  const completa = run.estado === 'terminado' && run.tempos.length === rota.splits.length;
  const t = trechos(run.tempos);
  const splits = rota.splits.map((s, i) => ({ ...s, melhor: i < t.length && (s.melhor === null || t[i] < s.melhor) ? t[i] : s.melhor }));
  const total = completa ? run.tempos[run.tempos.length - 1] : null;
  const novoPB = completa && (rota.pbTotal === null || total < rota.pbTotal);
  return {
    novoPB,
    rota: {
      ...rota,
      tentativas: rota.tentativas + 1,
      concluidas: rota.concluidas + (completa ? 1 : 0),
      pbTotal: novoPB ? total : rota.pbTotal,
      splits: splits.map((s, i) => (novoPB ? { ...s, pb: run.tempos[i] } : s))
    }
  };
}

/* ---------- API do speedrun.com ---------- */
export function converterJogos(json) {
  return (json?.data || []).map((g) => ({
    id: g.id, nome: g.names?.international || g.names?.twitch || g.abbreviation, ano: g.released || null,
    capa: g.assets?.['cover-large']?.uri || g.assets?.['cover-medium']?.uri || null, link: g.weblink
  }));
}

export function converterCategorias(json) {
  return (json?.data || []).filter((c) => c.type === 'per-game' && !c.miscellaneous).map((c) => ({ id: c.id, nome: c.name, link: c.weblink }))
    .concat((json?.data || []).filter((c) => c.type === 'per-game' && c.miscellaneous).map((c) => ({ id: c.id, nome: c.name, link: c.weblink, extra: true })));
}

function nomeJogador(p, jogadores) {
  if (p.rel === 'guest') return p.name;
  const j = jogadores.find((x) => x.id === p.id);
  return j?.names?.international || j?.name || 'Jogador';
}

export function converterRanking(json) {
  const d = json?.data;
  if (!d) return [];
  const jogadores = d.players?.data || [];
  return (d.runs || []).map(({ place, run }) => ({
    posicao: place,
    jogador: (run.players || []).map((p) => nomeJogador(p, jogadores)).join(' & ') || 'Jogador',
    tempo: Math.round((run.times?.primary_t ?? 0) * 1000),
    data: run.date || null,
    video: run.videos?.links?.[0]?.uri || null,
    link: run.weblink
  })).filter((r) => r.posicao > 0).sort((a, b) => a.posicao - b.posicao);
}
