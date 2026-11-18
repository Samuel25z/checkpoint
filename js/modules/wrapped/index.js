// Wrapped — o seu ano em jogos, em telas animadas, com card final para baixar.
import { h, usarEstilo, cabecalho, vazio, capa } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { JOGOS } from '../../games.js';
import { lerJogos } from '../diario/dados.js';
import { estatisticas, anosDisponiveis } from './logic.js';

const DURACAO = 5500;
let parar = () => {};

const num = (n) => String(n).replace('.', ',');

function telas(e) {
  const lista = [
    { cor: 'tela-a', conteudo: [h('p', { class: 'w-pre' }, 'Checkpoint apresenta'), h('h2', { class: 'w-gigante' }, `Seu ${e.ano}`, h('br'), 'em jogos'), h('p', { class: 'w-sub' }, 'Aperte play. Ou só espere.')] },
    { cor: 'tela-b', conteudo: [h('p', { class: 'w-pre' }, 'Você jogou'), h('h2', { class: 'w-numero numero' }, num(e.horas)), h('p', { class: 'w-grande' }, 'horas'), h('p', { class: 'w-sub' }, e.dias >= 1 ? `Isso dá ${num(e.dias)} dias inteiros sem parar.` : 'Cada minuto contou.')] },
    { cor: 'tela-c', conteudo: [h('p', { class: 'w-pre' }, 'Você zerou'), h('h2', { class: 'w-numero numero' }, e.zerados), h('p', { class: 'w-grande' }, e.zerados === 1 ? 'jogo' : 'jogos'),
      e.capasZerados.length ? h('div', { class: 'w-leque' }, e.capasZerados.map((c) => capa(c.capa, c.nome))) : null,
      e.platinados ? h('p', { class: 'w-sub' }, `${e.platinados} deles até a platina.`) : null] }
  ];
  if (e.maisJogado) lista.push({ cor: 'tela-d', conteudo: [h('p', { class: 'w-pre' }, 'O jogo que mais te prendeu'), capa(e.maisJogado.capa, e.maisJogado.nome, 'w-capa'), h('h2', { class: 'w-titulo' }, e.maisJogado.nome), h('p', { class: 'w-sub' }, `${num(e.maisJogado.horas)} horas`)] });
  if (e.genero) lista.push({ cor: 'tela-e', conteudo: [h('p', { class: 'w-pre' }, 'Seu gênero do ano'), h('h2', { class: 'w-gigante' }, e.genero), e.plataforma ? h('p', { class: 'w-sub' }, `Quase sempre no ${e.plataforma}.`) : null] });
  if (e.melhorNota) lista.push({ cor: 'tela-f', conteudo: [h('p', { class: 'w-pre' }, 'Sua nota mais alta'), capa(e.melhorNota.capa, e.melhorNota.nome, 'w-capa'), h('h2', { class: 'w-titulo' }, e.melhorNota.nome), h('p', { class: 'w-grande numero' }, `${num(e.melhorNota.nota)} ★`)] });
  if (e.mes) lista.push({ cor: 'tela-g', conteudo: [h('p', { class: 'w-pre' }, 'O mês em que você mais jogou'), h('h2', { class: 'w-gigante' }, e.mes), e.mediaNotas ? h('p', { class: 'w-sub' }, `Sua nota média no ano: ${num(e.mediaNotas)}`) : null] });
  lista.push({ cor: 'tela-h', final: true, conteudo: [h('p', { class: 'w-pre' }, `Seu perfil em ${e.ano}`), h('h2', { class: 'w-titulo w-perfil' }, e.perfil.titulo), h('p', { class: 'w-sub' }, e.perfil.texto),
    h('dl', { class: 'w-resumo' }, h('div', {}, h('dt', {}, 'Horas'), h('dd', { class: 'numero' }, num(e.horas))), h('div', {}, h('dt', {}, 'Zerados'), h('dd', { class: 'numero' }, e.zerados)), h('div', {}, h('dt', {}, 'Jogos'), h('dd', { class: 'numero' }, e.jogos)))] });
  return lista.map((t) => ({ ...t, conteudo: t.conteudo.filter(Boolean) }));
}

/** Desenha o card final (1080×1920) só com texto e cores — sem imagens de outros sites. */
async function gerarCard(e) {
  // espera a fonte no máximo 1,5 s; sem ela, o card sai com a fonte do sistema
  await Promise.race([document.fonts?.load?.('800 80px Unbounded'), new Promise((ok) => setTimeout(ok, 1500))]).catch(() => {});
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1920;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 1080, 1920);
  grad.addColorStop(0, '#1a1c24'); grad.addColorStop(1, '#121319');
  g.fillStyle = grad; g.fillRect(0, 0, 1080, 1920);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 30; x < 1080; x += 44) for (let y = 30; y < 1920; y += 44) g.fillRect(x, y, 3, 3);
  g.fillStyle = '#ffb21a'; g.fillRect(90, 140, 120, 120);
  g.fillStyle = '#1a1300'; g.fillRect(132, 168, 10, 72); g.beginPath(); g.moveTo(137, 172); g.lineTo(185, 172); g.lineTo(173, 192); g.lineTo(185, 212); g.lineTo(137, 212); g.fill();
  const fonte = (peso, tam) => `${peso} ${tam}px Unbounded, "Segoe UI", sans-serif`;
  g.fillStyle = '#f1efe9'; g.font = fonte(800, 46); g.fillText('Checkpoint', 240, 222);
  g.fillStyle = '#aeb0b9'; g.font = fonte(500, 44); g.fillText(`Meu ${e.ano} em jogos`, 90, 420);
  g.fillStyle = '#ffb21a'; g.font = fonte(800, 92);
  quebrar(g, e.perfil.titulo, 90, 540, 900, 104);
  const itens = [['Horas jogadas', num(e.horas)], ['Jogos zerados', String(e.zerados)], ['Mais jogado', e.maisJogado?.nome || '—'], ['Gênero favorito', e.genero || '—'], ['Nota mais alta', e.melhorNota ? `${e.melhorNota.nome} · ${num(e.melhorNota.nota)}★` : '—']];
  let y = 860;
  for (const [rotulo, valor] of itens) {
    g.fillStyle = '#7a7d8a'; g.font = fonte(500, 34); g.fillText(rotulo, 90, y);
    g.fillStyle = '#f1efe9'; g.font = fonte(800, valor.length > 18 ? 46 : 64); quebrar(g, valor, 90, y + 72, 900, 64);
    y += 200;
  }
  g.fillStyle = '#7a7d8a'; g.font = fonte(500, 30); g.fillText('samuel25z.github.io/checkpoint', 90, 1830);
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
}

function quebrar(g, texto, x, y, largura, linha) {
  const palavras = String(texto).split(' ');
  let atual = '';
  for (const p of palavras) {
    const teste = atual ? `${atual} ${p}` : p;
    if (g.measureText(teste).width > largura && atual) { g.fillText(atual, x, y); y += linha; atual = p; } else atual = teste;
  }
  g.fillText(atual, x, y);
}

function tocar(palco, e, ctx) {
  parar();
  const lista = telas(e);
  let i = 0; let inicio = 0; let restante = DURACAO; let pausado = false; let quadro;
  const barras = h('div', { class: 'w-barras' }, lista.map(() => h('span', {}, h('i'))));
  const area = h('div', { class: 'w-tela' });
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const baixar = async (botao) => {
    botao.disabled = true;
    const blob = await gerarCard(e);
    const a = h('a', { href: URL.createObjectURL(blob), download: `checkpoint-wrapped-${e.ano}.png` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    botao.disabled = false;
    ctx.toast('Card baixado', 'sucesso');
  };

  function mostrar(n) {
    i = Math.max(0, Math.min(lista.length - 1, n));
    const t = lista[i];
    palco.className = `w-palco ${t.cor}`;
    area.replaceChildren(...t.conteudo.map((n) => n.cloneNode(true)));
    area.dataset.tela = String(i + 1);
    if (t.final) {
      const botao = h('button', { class: 'btn btn-primario', id: 'baixar-card', type: 'button', html: `${icone('download')}<span>Baixar card</span>` });
      botao.addEventListener('click', (ev) => { ev.stopPropagation(); baixar(botao); });
      area.append(h('div', { class: 'w-acoes' }, botao, h('button', { class: 'btn', type: 'button', onclick: (ev) => { ev.stopPropagation(); mostrar(0); } }, 'Ver de novo')));
    }
    [...barras.children].forEach((b, k) => b.firstChild.style.transform = `scaleX(${k < i ? 1 : 0})`);
    restante = DURACAO; inicio = performance.now();
  }

  function laco(agora) {
    if (!pausado && !lista[i].final) {
      const p = 1 - Math.max(0, restante - (agora - inicio)) / DURACAO;
      barras.children[i].firstChild.style.transform = `scaleX(${p})`;
      if (p >= 1) mostrar(i + 1);
    }
    quadro = requestAnimationFrame(laco);
  }

  const pausar = (v) => { if (v && !pausado) restante -= performance.now() - inicio; if (!v && pausado) inicio = performance.now(); pausado = v; };
  palco.replaceChildren(barras, area,
    h('button', { class: 'w-nav w-ant', type: 'button', 'aria-label': 'Tela anterior', onclick: () => mostrar(i - 1) }),
    h('button', { class: 'w-nav w-prox', type: 'button', 'aria-label': 'Próxima tela', onclick: () => mostrar(i + 1) }));
  palco.addEventListener('pointerdown', () => pausar(true));
  palco.addEventListener('pointerup', () => pausar(false));
  palco.addEventListener('pointerleave', () => pausar(false));
  const teclas = (ev) => {
    if (ev.target.closest('input, select, textarea')) return;
    if (ev.key === 'ArrowRight') mostrar(i + 1);
    if (ev.key === 'ArrowLeft') mostrar(i - 1);
  };
  document.addEventListener('keydown', teclas);
  mostrar(0);
  if (!reduzido) quadro = requestAnimationFrame(laco);
  parar = () => { cancelAnimationFrame(quadro); document.removeEventListener('keydown', teclas); };
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/wrapped/estilo.css');
    const diario = lerJogos(ctx.storage);
    const anos = anosDisponiveis(diario);
    const atual = new Date().getFullYear();
    let ano = Number(ctx.params[0]) || (anos.includes(atual) ? atual : anos[0] || atual);
    const seletor = h('select', { class: 'entrada', id: 'ano-wrapped', 'aria-label': 'Ano', onchange: (e) => { ctx.irPara('wrapped', e.target.value); } },
      (anos.length ? anos : [atual]).map((a) => h('option', { value: a, selected: a === ano }, a)));
    const e = estatisticas(diario, ano, JOGOS);
    el.append(cabecalho('Wrapped', 'Seu ano em jogos, em telas animadas. No fim, baixe o card para postar.', seletor));
    if (!e.jogos) {
      el.append(vazio({ titulo: `Nada registrado em ${ano}`, texto: 'O Wrapped é montado com o seu diário. Registre os jogos que você jogou este ano.', acao: { rotulo: 'Abrir diário', onclick: () => ctx.irPara('diario') } }));
      return;
    }
    const palco = h('section', { class: 'w-palco', id: 'wrapped', 'aria-label': `Wrapped ${ano}`, 'aria-live': 'polite' });
    el.append(palco, h('p', { class: 'texto-3 w-dica' }, 'Toque nas laterais ou use as setas do teclado. Segure para pausar.'));
    tocar(palco, e, ctx);
  },
  desmontar() { parar(); parar = () => {}; }
};
