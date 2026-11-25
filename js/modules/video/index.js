// Apresentação — o vídeo de demonstração do Checkpoint, para abrir antes de mostrar o site.
// Vídeo novo = trocar o item em VIDEOS (o primeiro da lista é o que aparece).
import { h, usarEstilo, cabecalho } from '../../core/ui.js';
import { icone } from '../../core/icons.js';

export const VIDEOS = [
  { id: 'v2', titulo: 'Checkpoint em menos de 2 minutos', arquivo: 'relatorio/Video-Checkpoint.mp4', capa: 'assets/video-capa.jpg', duracao: '1:55' },
];

export default {
  montar(el) {
    usarEstilo('js/modules/video/estilo.css');
    const v = VIDEOS[0];
    const player = h('video', { class: 'vd-player', id: 'video-apresentacao', src: v.arquivo, poster: v.capa, controls: true, preload: 'metadata', playsinline: true, 'aria-label': `Vídeo: ${v.titulo}` });
    const telaCheia = () => (player.requestFullscreen?.() || player.webkitEnterFullscreen?.());
    el.replaceChildren(
      cabecalho('Apresentação', 'O vídeo de demonstração do Checkpoint. Assista antes de explorar o site.'),
      h('section', { class: 'vd-palco padrao-hex' },
        h('div', { class: 'vd-moldura' }, player)),
      h('div', { class: 'vd-acoes' },
        h('button', { type: 'button', class: 'btn btn-primario', id: 'video-tocar', onclick: () => { telaCheia(); player.play?.(); }, html: `${icone('play')}<span>Assistir em tela cheia</span>` }),
        h('a', { class: 'btn', href: '#/inicio', html: `<span>Ir para o site</span>${icone('seta')}` }),
        h('span', { class: 'texto-3' }, `${v.titulo} · ${v.duracao}`)));
  }
};
