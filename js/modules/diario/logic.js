// Lógica pura do Diário (sem DOM) — testada com node --test.

export const STATUS = [
  { id: 'jogando', rotulo: 'Jogando' },
  { id: 'zerado', rotulo: 'Zerado' },
  { id: 'quero', rotulo: 'Quero jogar' },
  { id: 'platinado', rotulo: 'Platinado' },
  { id: 'larguei', rotulo: 'Larguei' }
];
export const ROTULO_STATUS = Object.fromEntries(STATUS.map((s) => [s.id, s.rotulo]));
export const PLATAFORMAS = ['PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series', 'Xbox One', 'Nintendo Switch', 'Switch 2', 'Celular', 'Outro'];
export const ORDENS = [
  { id: 'recentes', rotulo: 'Mais recentes' },
  { id: 'nota', rotulo: 'Maior nota' },
  { id: 'horas', rotulo: 'Mais horas' },
  { id: 'nome', rotulo: 'Nome (A–Z)' }
];

const hoje = () => new Date().toISOString().slice(0, 10);

/** Extrai o id de um vídeo do YouTube de vários formatos de link. */
export function idYoutube(url) {
  if (!url) return null;
  const m = String(url).trim().match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** Valida e normaliza um registro. Retorna { ok, erros: {campo: msg}, valor }. */
export function validarRegistro(r) {
  const erros = {};
  const v = { ...r };
  v.nome = String(r.nome || '').trim();
  if (!v.nome) erros.nome = 'Escolha ou digite o nome do jogo.';
  if (!ROTULO_STATUS[v.status]) erros.status = 'Escolha um status.';

  if (r.nota === '' || r.nota === null || r.nota === undefined) v.nota = null;
  else {
    v.nota = Number(r.nota);
    if (!Number.isFinite(v.nota) || v.nota < 0 || v.nota > 5 || Math.round(v.nota * 2) !== v.nota * 2) erros.nota = 'A nota vai de 0 a 5, de meia em meia estrela.';
  }
  if (r.horas === '' || r.horas === null || r.horas === undefined) v.horas = 0;
  else {
    v.horas = Number(String(r.horas).replace(',', '.'));
    if (!Number.isFinite(v.horas) || v.horas < 0 || v.horas > 20000) erros.horas = 'Informe as horas como número (ex.: 12,5).';
    else v.horas = Math.round(v.horas * 10) / 10;
  }
  v.inicio = r.inicio || null;
  v.fim = r.fim || null;
  const valida = (d) => !d || /^\d{4}-\d{2}-\d{2}$/.test(d);
  if (!valida(v.inicio)) erros.inicio = 'Data inválida.';
  if (!valida(v.fim)) erros.fim = 'Data inválida.';
  if (v.inicio && v.fim && v.fim < v.inicio) erros.fim = 'A data em que zerou não pode ser antes do início.';
  if ((v.status === 'zerado' || v.status === 'platinado') && !v.fim) v.fim = hoje();

  v.video = String(r.video || '').trim();
  if (v.video && !idYoutube(v.video)) erros.video = 'Cole um link do YouTube (youtube.com ou youtu.be).';
  v.resenha = String(r.resenha || '').trim().slice(0, 1000);
  v.plataforma = r.plataforma || '';
  v.favorito = Boolean(r.favorito);
  return { ok: Object.keys(erros).length === 0, erros, valor: v };
}

/** Filtra a lista por status/favoritos/plataforma/texto. */
export function filtrar(lista, { status = 'todos', plataforma = '', texto = '' } = {}) {
  const t = String(texto).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  return lista.filter((j) => {
    if (status === 'favoritos' && !j.favorito) return false;
    if (status !== 'todos' && status !== 'favoritos' && j.status !== status) return false;
    if (plataforma && j.plataforma !== plataforma) return false;
    if (t && !j.nome.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes(t)) return false;
    return true;
  });
}

/** Ordena sem mudar a lista original. */
export function ordenar(lista, ordem = 'recentes') {
  const c = [...lista];
  const porNome = (a, b) => a.nome.localeCompare(b.nome, 'pt-BR');
  if (ordem === 'nome') return c.sort(porNome);
  if (ordem === 'nota') return c.sort((a, b) => (b.nota ?? -1) - (a.nota ?? -1) || porNome(a, b));
  if (ordem === 'horas') return c.sort((a, b) => (b.horas || 0) - (a.horas || 0) || porNome(a, b));
  return c.sort((a, b) => String(b.atualizadoEm).localeCompare(String(a.atualizadoEm)));
}

/** Contagem por status para os filtros. */
export function contar(lista) {
  const c = { todos: lista.length, favoritos: lista.filter((j) => j.favorito).length };
  for (const s of STATUS) c[s.id] = lista.filter((j) => j.status === s.id).length;
  return c;
}

/** Descreve uma mudança de registro como atividade do histórico (ou null se nada relevante mudou). */
export function atividade(antes, depois, quando = new Date().toISOString()) {
  if (!antes) return { tipo: 'adicionou', nome: depois.nome, status: depois.status, registroId: depois.id, quando };
  if (!depois) return { tipo: 'removeu', nome: antes.nome, registroId: antes.id, quando };
  if (antes.status !== depois.status) return { tipo: 'status', nome: depois.nome, status: depois.status, registroId: depois.id, quando };
  if (antes.nota !== depois.nota && depois.nota !== null) return { tipo: 'nota', nome: depois.nome, nota: depois.nota, registroId: depois.id, quando };
  if (!antes.favorito && depois.favorito) return { tipo: 'favoritou', nome: depois.nome, registroId: depois.id, quando };
  return null;
}

/** Texto curto de uma atividade. */
export function textoAtividade(a) {
  switch (a.tipo) {
    case 'adicionou': return `adicionou ${a.nome} como “${ROTULO_STATUS[a.status] || a.status}”`;
    case 'removeu': return `removeu ${a.nome} do diário`;
    case 'status': return a.status === 'zerado' ? `zerou ${a.nome}` : a.status === 'platinado' ? `platinou ${a.nome}` : `marcou ${a.nome} como “${ROTULO_STATUS[a.status]}”`;
    case 'nota': return `deu ${String(a.nota).replace('.', ',')} estrelas para ${a.nome}`;
    case 'favoritou': return `favoritou ${a.nome}`;
    default: return a.nome;
  }
}

/** Mantém só as N atividades mais recentes. */
export function empilhar(historico, nova, limite = 50) {
  return nova ? [nova, ...historico].slice(0, limite) : historico;
}

/** Estrelas em texto acessível: 3.5 → "3,5 de 5 estrelas". */
export function textoNota(n) {
  return n === null || n === undefined ? 'sem nota' : `${String(n).replace('.', ',')} de 5 estrelas`;
}
