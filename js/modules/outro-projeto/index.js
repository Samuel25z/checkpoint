// Outro projeto — vídeo do Drift Tela, outro projeto do Samuel, mostrado no fim do menu.
import { h, usarEstilo, cabecalho } from '../../core/ui.js';
import { icone } from '../../core/icons.js';

export const PROJETO = {
  nome: 'Drift Tela',
  texto: 'Compartilhar a tela com os amigos a 60 fps, com o som do jogo. Sem conta e sem senha: só o código da sala. No navegador ou no app para Windows.',
  arquivo: 'assets/drift-tela.mp4',
  capa: 'assets/drift-tela-capa.jpg',
  duracao: '1:10',
};

export default {
  montar(el) {
    usarEstilo('js/modules/video/estilo.css');
    const p = PROJETO;
    const player = h('video', { class: 'vd-player', id: 'video-outro-projeto', src: p.arquivo, poster: p.capa, controls: true, preload: 'metadata', playsinline: true, 'aria-label': `Vídeo: ${p.nome}` });
    const telaCheia = () => (player.requestFullscreen?.() || player.webkitEnterFullscreen?.());
    el.replaceChildren(
      cabecalho('Outro projeto', `${p.nome}: ${p.texto}`),
      h('section', { class: 'vd-palco padrao-hex' }, h('div', { class: 'vd-moldura' }, player)),
      h('div', { class: 'vd-acoes' },
        h('button', { type: 'button', class: 'btn btn-primario', id: 'outro-tocar', onclick: () => { telaCheia(); player.play?.(); }, html: `${icone('play')}<span>Assistir em tela cheia</span>` }),
        h('span', { class: 'texto-3' }, `${p.nome} · ${p.duracao}`)));
  }
};
