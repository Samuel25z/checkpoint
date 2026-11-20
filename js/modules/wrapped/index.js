// Wrapped — o seu ano em jogos, em telas animadas, com card final para baixar.
import { h, usarEstilo, cabecalho, vazio, capa } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { JOGOS, arteDoRegistro } from '../../games.js';
import { lerJogos } from '../diario/dados.js';
import { estatisticas, periodos, lerPeriodo } from './logic.js';

const DURACAO = 5500;
let parar = () => {};

const num = (n) => String(n).replace('.', ',');

function telas(e) {
  const lista = [
    { cor: 'tela-a', conteudo: [h('p', { class: 'w-pre' }, 'Checkpoint apresenta'), h('h2', { class: 'w-gigante w-abertura' }, e.rotulo, h('br'), 'em jogos'), h('p', { class: 'w-sub' }, 'Aperte play. Ou só espere.')] },
    { cor: 'tela-b', conteudo: [h('p', { class: 'w-pre' }, 'Você jogou'), h('h2', { class: 'w-numero numero' }, num(e.horas)), h('p', { class: 'w-grande' }, 'horas'), h('p', { class: 'w-sub' }, e.dias >= 1 ? `Isso dá ${num(e.dias)} dias inteiros sem parar.` : 'Cada minuto contou.')] },
    { cor: 'tela-c', conteudo: [h('p', { class: 'w-pre' }, 'Você zerou'), h('h2', { class: 'w-numero numero' }, e.zerados), h('p', { class: 'w-grande' }, e.zerados === 1 ? 'jogo' : 'jogos'),
      e.capasZerados.length ? h('div', { class: 'w-leque' }, e.capasZerados.map((c) => capa(c.capa, c.nome))) : null,
      e.platinados ? h('p', { class: 'w-sub' }, `${e.platinados} deles até a platina.`) : null] }
  ];
  lista[1].mosaico = e.capas; // horas: mosaico das capas do período ao fundo
  if (e.maisJogado) lista.push({ cor: 'tela-d', arte: arteDoRegistro(e.maisJogado).hero || arteDoRegistro(e.maisJogado).capa, conteudo: [h('p', { class: 'w-pre' }, 'O jogo que mais te prendeu'), capa(e.maisJogado.capa, e.maisJogado.nome, 'w-capa'), h('h2', { class: 'w-titulo' }, e.maisJogado.nome), h('p', { class: 'w-sub' }, `${num(e.maisJogado.horas)} horas`)] });
  if (e.genero) lista.push({ cor: 'tela-e', conteudo: [h('p', { class: 'w-pre' }, e.periodo.tipo === 'ano' ? 'Seu gênero do ano' : 'Seu gênero favorito'), h('h2', { class: 'w-gigante' }, e.genero), e.plataforma ? h('p', { class: 'w-sub' }, `Quase sempre no ${e.plataforma}.`) : null] });
  if (e.melhorNota) lista.push({ cor: 'tela-f', arte: arteDoRegistro(e.melhorNota).hero || arteDoRegistro(e.melhorNota).capa, conteudo: [h('p', { class: 'w-pre' }, 'Sua nota mais alta'), capa(e.melhorNota.capa, e.melhorNota.nome, 'w-capa'), h('h2', { class: 'w-titulo' }, e.melhorNota.nome), h('p', { class: 'w-grande numero' }, `${num(e.melhorNota.nota)} ★`)] });
  if (e.mes) lista.push({ cor: 'tela-g', conteudo: [h('p', { class: 'w-pre' }, 'O mês em que você mais jogou'), h('h2', { class: 'w-gigante' }, e.mes), e.mediaNotas ? h('p', { class: 'w-sub' }, `Sua nota média: ${num(e.mediaNotas)}`) : null] });
  lista.push({ cor: 'tela-h', final: true, conteudo: [h('p', { class: 'w-pre' }, `Seu perfil · ${e.rotulo}`), h('h2', { class: 'w-titulo w-perfil' }, e.perfil.titulo), h('p', { class: 'w-sub' }, e.perfil.texto),
    h('dl', { class: 'w-resumo' }, h('div', {}, h('dt', {}, 'Horas'), h('dd', { class: 'numero' }, num(e.horas))), h('div', {}, h('dt', {}, 'Zerados'), h('dd', { class: 'numero' }, e.zerados)), h('div', {}, h('dt', {}, 'Jogos'), h('dd', { class: 'numero' }, e.jogos)))] });
  return lista.map((t) => ({ ...t, conteudo: t.conteudo.filter(Boolean) }));
}

/** Desenha o card final (1080×1920) só com texto e cores — sem imagens de outros sites. */
async function gerarCard(e) {
  // espera a fonte no máximo 1,5 s; sem ela, o card sai com a fonte do sistema
  await Promise.race([Promise.all([document.fonts?.load?.('700 80px "Chakra Petch"'), document.fonts?.load?.('500 40px "Inter Tight"')]), new Promise((ok) => setTimeout(ok, 1500))]).catch(() => {});
  const c = document.createElement('canvas');
  c.width = 1080; c.height = 1920;
  const g = c.getContext('2d');
  g.fillStyle = '#0d1219'; g.fillRect(0, 0, 1080, 1920);
  // hexágonos da marca ao fundo
  const hex = (cx, cy, r) => { g.beginPath(); for (let k = 0; k < 6; k++) { const a = Math.PI / 3 * k - Math.PI / 2; g[k ? 'lineTo' : 'moveTo'](cx + r * Math.cos(a), cy + r * Math.sin(a)); } g.closePath(); };
  g.strokeStyle = 'rgba(255,61,127,0.13)'; g.lineWidth = 3;
  for (let lin = 0, y = 0; y < 2000; lin++, y += 96) for (let x = (lin % 2) * 42; x < 1140; x += 84) { hex(x, y, 48); g.stroke(); }
  const brilho = g.createRadialGradient(900, 260, 0, 900, 260, 700);
  brilho.addColorStop(0, 'rgba(255,61,127,0.35)'); brilho.addColorStop(1, 'rgba(255,61,127,0)');
  g.fillStyle = brilho; g.fillRect(0, 0, 1080, 1920);
  // logo: hexágono rosa com bandeira
  g.lineWidth = 9; g.strokeStyle = '#ff3d7f'; g.lineJoin = 'round'; hex(150, 200, 62); g.stroke();
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(134, 242); g.lineTo(134, 160); g.stroke();
  g.fillStyle = '#ff3d7f'; g.beginPath(); g.moveTo(134, 162); g.lineTo(184, 162); g.lineTo(171, 181); g.lineTo(184, 200); g.lineTo(134, 200); g.fill();
  const fonte = (peso, tam, fam = '"Chakra Petch"') => `${peso} ${tam}px ${fam}, "Segoe UI", sans-serif`;
  g.fillStyle = '#f2f5fa'; g.font = fonte(700, 52); g.fillText('CHECKPOINT', 240, 220);
  g.fillStyle = '#9aa6b8'; g.font = fonte(500, 44, '"Inter Tight"'); g.fillText(e.rotulo.replace(/^Seu /, 'Meu ').replace(/^Seus /, 'Meus '), 90, 420);
  g.fillStyle = '#ff3d7f'; g.font = fonte(700, 96);
  quebrar(g, e.perfil.titulo, 90, 540, 900, 104);
  const itens = [['Horas jogadas', num(e.horas)], ['Jogos zerados', String(e.zerados)], ['Mais jogado', e.maisJogado?.nome || '—'], ['Gênero favorito', e.genero || '—'], ['Nota mais alta', e.melhorNota ? `${e.melhorNota.nome} · ${num(e.melhorNota.nota)}★` : '—']];
  let y = 860;
  for (const [rotulo, valor] of itens) {
    g.fillStyle = '#6f7b8d'; g.font = fonte(500, 34, '"Inter Tight"'); g.fillText(rotulo.toUpperCase(), 90, y);
    g.fillStyle = '#f2f5fa'; g.font = fonte(700, valor.length > 18 ? 50 : 68); quebrar(g, valor, 90, y + 74, 900, 64);
    y += 200;
  }
  g.fillStyle = '#6f7b8d'; g.font = fonte(500, 30, '"Inter Tight"'); g.fillText('samuel25z.github.io/checkpoint', 90, 1830);
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
  const fundo = h('div', { class: 'w-fundo', 'aria-hidden': 'true' });
  const reduzido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const baixar = async (botao) => {
    botao.disabled = true;
    const blob = await gerarCard(e);
    const a = h('a', { href: URL.createObjectURL(blob), download: `checkpoint-wrapped-${e.periodo.id}.png` });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    botao.disabled = false;
    ctx.toast('Card baixado', 'sucesso');
  };

  function mostrar(n) {
    i = Math.max(0, Math.min(lista.length - 1, n));
    const t = lista[i];
    palco.className = `w-palco ${t.cor}${t.arte ? ' com-arte' : ''}`;
    // fundo: arte do jogo, mosaico de capas ou só o padrão da marca
    fundo.replaceChildren(...(t.arte ? [h('img', { src: t.arte, alt: '', class: 'w-fundo-arte', referrerpolicy: 'no-referrer' })]
      : t.mosaico?.length ? [h('div', { class: 'w-mosaico' }, t.mosaico.slice(0, 12).map((x) => h('span', { style: x.capa ? `background-image:url("${x.capa}")` : '' })))] : []));
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
  palco.replaceChildren(fundo, barras, area,
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
    const agora = new Date();
    const periodo = lerPeriodo(ctx.params[0], agora);
    const seletor = h('div', { class: 'segmentos w-periodos', role: 'tablist', 'aria-label': 'Período' },
      periodos(diario, agora).map((p) => h('button', { type: 'button', role: 'tab', 'aria-selected': String(p.id === periodo.id), 'data-periodo': p.id, onclick: () => ctx.irPara('wrapped', p.id) }, p.rotulo)));
    const e = estatisticas(diario, periodo, JOGOS, agora);
    el.append(cabecalho('Wrapped', 'Seu resumo em telas animadas, a qualquer momento do ano. No fim, baixe o card para postar.'), seletor);
    if (!e.jogos) {
      el.append(vazio({ titulo: `Nada registrado: ${e.rotulo.toLowerCase()}`, texto: 'O Wrapped é montado com o seu diário. Registre os jogos que você jogou nesse período.', acao: { rotulo: 'Abrir diário', onclick: () => ctx.irPara('diario') } }));
      return;
    }
    const palco = h('section', { class: 'w-palco', id: 'wrapped', 'aria-label': `Wrapped: ${e.rotulo}`, 'aria-live': 'polite' });
    el.append(palco, h('p', { class: 'texto-3 w-dica' }, 'Toque nas laterais ou use as setas do teclado. Segure para pausar.'));
    tocar(palco, e, ctx);
  },
  desmontar() { parar(); parar = () => {}; }
};
