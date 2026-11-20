// visual.js — os 3 visuais do Checkpoint. Deck é o padrão; Palco e Joy são opção em Configurações.
// O visual muda fontes, cores de marca, cantos e a casca; o tema (claro/escuro) é independente.

export const VISUAIS = [
  { id: 'deck', nome: 'Deck', descricao: 'Menu lateral, magenta e letras de console. O padrão do Checkpoint.', fontes: 'Chakra+Petch:wght@500;600;700&family=Inter+Tight:wght@400;500;600;700', cores: ['#0d1219', '#ff3d7f', '#ffb547'] },
  { id: 'palco', nome: 'Palco', descricao: 'A arte do jogo ocupa a tela, azul e violeta, como um console de sala.', fontes: 'Outfit:wght@400;500;600;700;800', cores: ['#06080f', '#5aa8ff', '#9b7bff'] },
  { id: 'joy', nome: 'Joy', descricao: 'Claro e arredondado, coral e verde-água, botões grandes.', fontes: 'Rubik:wght@400;500;600;700;800', cores: ['#eef0f4', '#ff5a4e', '#14bfb0'] }
];
export const VISUAL_PADRAO = 'deck';
const PORID = Object.fromEntries(VISUAIS.map((v) => [v.id, v]));

export function visualValido(id) { return PORID[id] ? id : VISUAL_PADRAO; }

/** Aplica o visual na página (atributo + fontes) e guarda a escolha. */
export function aplicarVisual(id, storage) {
  const v = PORID[visualValido(id)];
  document.documentElement.dataset.visual = v.id;
  const href = `https://fonts.googleapis.com/css2?family=${v.fontes}&display=swap`;
  let link = document.getElementById('fontes-visual');
  if (!link) { link = document.createElement('link'); link.rel = 'stylesheet'; link.id = 'fontes-visual'; document.head.append(link); }
  if (link.href !== href) link.href = href;
  storage?.gravar('pref:visual', v.id);
  document.dispatchEvent(new CustomEvent('checkpoint:visual', { detail: v.id }));
  return v.id;
}
