// Ícones em SVG (traço 2px, estilo contorno). Uso: icone('casa').
const P = {
  casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  livro: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/>',
  cronometro: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9.5 2h5"/><path d="M12 2v3"/>',
  ramo: '<circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="7" r="2.2"/><path d="M6 7.2v9.6"/><path d="M18 9.2c0 5-6 3.8-11.2 8"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  trofeu: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>',
  brilho: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7z"/>',
  presente: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13"/><path d="M12 8C10 4 6.5 4.5 7.5 7c.5 1 4.5 1 4.5 1s4-0 4.5-1c1-2.5-2.5-3-4.5 1z"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  lua: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  busca: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
  coracao: '<path d="M12 20s-7-4.4-9-8.6C1.6 8.3 3.6 5 7 5c2 0 3.5 1.2 5 3 1.5-1.8 3-3 5-3 3.4 0 5.4 3.3 4 6.4-2 4.2-9 8.6-9 8.6z"/>',
  estrela: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  lixeira: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  editar: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  play: '<path d="M7 4v16l13-8z"/>',
  pausa: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  voltar: '<path d="M15 6l-6 6 6 6"/>',
  seta: '<path d="M9 6l6 6-6 6"/>',
  externo: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v6H4V6h6"/>',
  config: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.4 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  bandeira: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  download: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  controle: '<path d="M7 9h4M9 7v4"/><circle cx="15.5" cy="10" r=".8"/><circle cx="17.5" cy="12" r=".8"/><path d="M6.5 5h11a4.5 4.5 0 0 1 4.4 5.4l-1.2 6A3 3 0 0 1 15.8 18l-1.8-2h-4l-1.8 2a3 3 0 0 1-4.9-1.6l-1.2-6A4.5 4.5 0 0 1 6.5 5z"/>',
  refazer: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
  alerta: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/>',
  sair: '<path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M18 12H9"/>'
};

export function icone(nome, classe = '') {
  return `<svg class="ic ${classe}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[nome] || P.bandeira}</svg>`;
}

export const ICONES = Object.keys(P);
