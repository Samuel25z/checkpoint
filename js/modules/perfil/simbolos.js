// Símbolos das medalhas: cada uma com o seu desenho, dentro do hexágono da marca Checkpoint.
// O grau aparece na cor da borda e em 1, 2 ou 3 pontinhos; bloqueada fica apagada, com cadeado.

const TRACO = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';

/** Desenho do meio de cada medalha (área de 24x24, centrado no hexágono). */
export const DESENHOS = {
  // estante de jogos: três caixas em pé, uma inclinada
  colecionador: `<g ${TRACO}><rect x="3" y="6" width="4.5" height="13" rx="1"/><rect x="9" y="6" width="4.5" height="13" rx="1"/><path d="m15.2 7.4 4.2-1.3 3.6 11.6-4.2 1.3z"/><path d="M2 20.5h20"/></g>`,
  // bandeira quadriculada de chegada
  finalizador: `<g ${TRACO}><path d="M5 21V3.5"/><path d="M5 4h14v9H5"/></g><g fill="currentColor"><rect x="5" y="4" width="3.5" height="3"/><rect x="12" y="4" width="3.5" height="3"/><rect x="8.5" y="7" width="3.5" height="3"/><rect x="15.5" y="7" width="3.5" height="3"/><rect x="5" y="10" width="3.5" height="3"/><rect x="12" y="10" width="3.5" height="3"/></g>`,
  // troféu
  platinador: `<g ${TRACO}><path d="M7 3.5h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H3.8a3.2 3.2 0 0 0 3.6 4.4M17 5h3.2a3.2 3.2 0 0 1-3.6 4.4"/><path d="M12 13.5v3.5M8 20.5h8M9.5 17h5v3.5h-5z"/></g>`,
  // cronômetro
  maratonista: `<g ${TRACO}><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4.2l2.8 2"/><path d="M9.5 2.5h5M12 2.5V6"/><path d="m18.3 6.2 1.4-1.4"/></g>`,
  // estrela com lápis (avaliação escrita)
  critico: `<g ${TRACO}><path d="m9.5 3 1.9 4 4.4.5-3.3 3 .9 4.3-3.9-2.2-3.9 2.2.9-4.3-3.3-3 4.4-.5z"/><path d="m14.5 20.5 6-6 1.8 1.8-6 6h-1.8z"/><path d="M3 21h8"/></g>`,
  // ecletismo: quatro formas diferentes (gêneros diferentes)
  ecletico: `<g ${TRACO}><path d="m7 3 4 7H3z"/><circle cx="17" cy="6.5" r="3.6"/><rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.2"/><path d="m14 14 6 6M20 14l-6 6"/></g>`,
};

const CADEADO = `<g ${TRACO}><rect x="6" y="11" width="12" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/></g>`;
const PONTOS = { bronze: 1, prata: 2, ouro: 3 };

/** SVG completo de uma medalha. grau: 'bronze' | 'prata' | 'ouro' | null (bloqueada). */
export function svgMedalha(id, grau = null) {
  const desenho = grau ? DESENHOS[id] || DESENHOS.colecionador : CADEADO;
  const n = PONTOS[grau] || 0;
  const pontos = Array.from({ length: n }, (_, i) => {
    const x = 32 - (n - 1) * 5 + i * 10;
    return `<path class="md-ponto" d="M${x} 63.4l2.8 2.8-2.8 2.8-2.8-2.8z"/>`;
  }).join('');
  return `<svg class="md" viewBox="0 0 64 70" role="img" aria-hidden="true" data-grau="${grau || 'bloqueada'}">
    <path class="md-fundo" d="M32 3 57 17.5v29L32 61 7 46.5v-29z"/>
    <path class="md-borda" d="M32 3 57 17.5v29L32 61 7 46.5v-29z"/>
    <path class="md-brilho" d="M32 8.5 52 20"/>
    <g class="md-desenho" transform="translate(16.4 15.4) scale(1.3)">${desenho}</g>
    ${pontos}
  </svg>`;
}
