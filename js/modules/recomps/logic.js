// Lógica pura da aba Recomps: projetos verificados, normalização da API do GitHub e "versão nova".

/** Projetos conferidos à mão: código aberto, sem distribuir o jogo. */
export const VERIFICADOS = [
  { repo: 'Zelda64Recomp/Zelda64Recomp', jogo: "The Legend of Zelda: Majora's Mask", console: 'Nintendo 64', tipo: 'Recomp', precisaRom: true },
  { repo: 'HarbourMasters/Shipwright', jogo: 'The Legend of Zelda: Ocarina of Time', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'HarbourMasters/Ghostship', jogo: 'Super Mario 64', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'HarbourMasters/SpaghettiKart', jogo: 'Mario Kart 64', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'HarbourMasters/Starship', jogo: 'Star Fox 64', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'coop-deluxe/sm64coopdx', jogo: 'Super Mario 64 (multijogador)', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'sm64pc/sm64ex', jogo: 'Super Mario 64', console: 'Nintendo 64', tipo: 'Port', precisaRom: true },
  { repo: 'hedge-dev/UnleashedRecomp', jogo: 'Sonic Unleashed', console: 'Xbox 360', tipo: 'Recomp', precisaRom: true },
  { repo: 'snesrev/zelda3', jogo: 'The Legend of Zelda: A Link to the Past', console: 'Super Nintendo', tipo: 'Port', precisaRom: true },
  { repo: 'zeldaret/oot', jogo: 'The Legend of Zelda: Ocarina of Time', console: 'Nintendo 64', tipo: 'Decomp', precisaRom: true },
  { repo: 'zeldaret/mm', jogo: "The Legend of Zelda: Majora's Mask", console: 'Nintendo 64', tipo: 'Decomp', precisaRom: true },
  { repo: 'n64decomp/sm64', jogo: 'Super Mario 64', console: 'Nintendo 64', tipo: 'Decomp', precisaRom: true },
  { repo: 'pmret/papermario', jogo: 'Paper Mario', console: 'Nintendo 64', tipo: 'Decomp', precisaRom: true },
  { repo: 'OpenMW/openmw', jogo: 'The Elder Scrolls III: Morrowind', console: 'PC', tipo: 'Motor aberto', precisaRom: true },
  { repo: 'OpenRA/OpenRA', jogo: 'Command & Conquer (clássicos)', console: 'PC', tipo: 'Motor aberto', precisaRom: false },
  { repo: 'chocolate-doom/chocolate-doom', jogo: 'Doom', console: 'PC', tipo: 'Source port', precisaRom: true }
];

const POR_REPO = Object.fromEntries(VERIFICADOS.map((v) => [v.repo.toLowerCase(), v]));
export const SEIS_MESES = 182 * 24 * 60 * 60 * 1000;

export function ativo(data, agora = Date.now()) {
  return Boolean(data) && agora - new Date(data).getTime() < SEIS_MESES;
}

/** Converte um repositório da API em um card. */
export function normalizarRepo(item, agora = Date.now()) {
  const v = POR_REPO[String(item.full_name).toLowerCase()];
  return {
    repo: item.full_name,
    nome: item.name,
    descricao: item.description || '',
    estrelas: item.stargazers_count || 0,
    linguagem: item.language || null,
    atualizado: item.pushed_at || item.updated_at || null,
    ativo: ativo(item.pushed_at || item.updated_at, agora),
    url: item.html_url || `https://github.com/${item.full_name}`,
    releases: `${item.html_url || `https://github.com/${item.full_name}`}/releases`,
    arquivado: Boolean(item.archived),
    verificado: Boolean(v),
    jogo: v?.jogo || null,
    console: v?.console || null,
    tipo: v?.tipo || null,
    precisaRom: v ? v.precisaRom : null
  };
}

/** Uma consulta só para buscar todos os verificados (economiza o limite da API). */
export function consultaVerificados() {
  return VERIFICADOS.map((v) => `repo:${v.repo}`).join(' ');
}

/** Consulta da busca livre por nome de jogo. */
export function consultaBusca(termo) {
  const t = String(termo || '').replace(/[^\p{L}\p{N}\s:'.-]/gu, ' ').trim();
  return t ? `${t} (recomp OR decomp OR decompilation OR port)` : '';
}

/** Ordena: verificados primeiro, depois por estrelas. */
export function ordenarProjetos(lista) {
  return [...lista].sort((a, b) => Number(b.verificado) - Number(a.verificado) || b.estrelas - a.estrelas);
}

/** Há versão nova de um projeto seguido? */
export function versaoNova(seguidos, repo, tagAtual) {
  const vista = seguidos[repo];
  return Boolean(tagAtual) && vista !== undefined && vista !== null && vista !== tagAtual;
}

/** "hoje", "há 3 dias", "há 2 meses", "há 1 ano". */
export function tempoRelativo(data, agora = Date.now()) {
  if (!data) return '—';
  const dias = Math.floor((agora - new Date(data).getTime()) / 86400000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
  const anos = Math.floor(meses / 12);
  return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
}

export function formatarEstrelas(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.', ',')} mil` : String(n);
}

/** Projeto recente de console atual "rodando no PC" num repositório não verificado: sinal de golpe. */
export function suspeito(p) {
  if (p.verificado) return false;
  const texto = `${p.nome} ${p.descricao}`.toLowerCase();
  return /(totk|tears of the kingdom|bananza|switch 2|ps5|pc port|download|crack|free pc)/.test(texto);
}
