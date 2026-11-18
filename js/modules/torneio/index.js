// Torneio — chaveamento rápido e animado para campeonatos entre amigos.
import { h, usarEstilo, cabecalho, vazio, confirmar, capaGerada, dataCurta } from '../../core/ui.js';
import { icone } from '../../core/icons.js';
import { novoId } from '../../storage.js';
import { MIN, MAX, validarJogadores, gerarChave, definirVencedor, desfazer, campeao, nomeRodada, rodadaAtual } from './logic.js';

const CH_LISTA = 'torneio:lista';
const CH_ATUAL = 'torneio:atual';

const lerLista = (s) => s.ler(CH_LISTA, []);
function salvar(s, t) {
  const lista = lerLista(s);
  const i = lista.findIndex((x) => x.id === t.id);
  if (i >= 0) lista[i] = t; else lista.unshift(t);
  s.gravar(CH_LISTA, lista);
}

function avatar(j) {
  if (!j) return h('span', { class: 'avatar vazio' });
  const { tom, iniciais } = capaGerada(j.nome);
  const el = h('span', { class: 'avatar', style: `--tom:${tom}` }, iniciais);
  if (j.foto) {
    const img = h('img', { src: j.foto, alt: '', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () => img.remove());
    el.append(img);
  }
  return el;
}

function confete(alvo) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cores = ['var(--acento)', 'var(--st-zerado)', 'var(--st-platinado)', 'var(--st-larguei)', '#fff'];
  const camada = h('div', { class: 'confete', 'aria-hidden': 'true' });
  for (let i = 0; i < 70; i++) {
    camada.append(h('i', { style: `--x:${Math.random() * 100}%;--d:${0.8 + Math.random() * 1.6}s;--a:${Math.random() * 0.6}s;--r:${Math.random() * 720 - 360}deg;background:${cores[i % cores.length]}` }));
  }
  alvo.append(camada);
  setTimeout(() => camada.remove(), 3200);
}

function telaCriar(el, ctx, redesenhar) {
  const historico = lerLista(ctx.storage).filter((t) => t.campeao);
  const erroEl = h('p', { class: 'campo-erro', id: 'erro-jogadores' });
  const contador = h('span', { class: 'texto-3', id: 'contador-jogadores' }, `0 de ${MAX}`);
  const area = h('textarea', { class: 'entrada', name: 'jogadores', rows: '8', placeholder: 'Samuel\nArthur\nJoão\nMaria', 'aria-describedby': 'contador-jogadores' });
  area.addEventListener('input', () => { contador.textContent = `${area.value.split('\n').filter((l) => l.trim()).length} de ${MAX}`; erroEl.textContent = ''; });
  const form = h('form', { class: 'torneio-form painel', novalidate: true },
    h('div', { class: 'grade-campos' },
      h('label', { class: 'campo' }, h('span', {}, 'Nome do torneio'), h('input', { class: 'entrada', name: 'nome', placeholder: 'Copa da sala' })),
      h('label', { class: 'campo' }, h('span', {}, 'Jogo'), h('input', { class: 'entrada', name: 'jogo', placeholder: 'Rocket League' }))),
    h('label', { class: 'campo' }, h('span', {}, `Jogadores (um por linha, de ${MIN} a ${MAX})`), area, h('span', { class: 'linha-dica' }, contador, h('span', { class: 'texto-3' }, 'Quer foto? Escreva: Nome | link da imagem'))),
    erroEl,
    h('button', { class: 'btn btn-primario btn-grande', type: 'submit', html: `${icone('trofeu')}<span>Sortear a chave</span>` }));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const linhas = String(f.get('jogadores')).split('\n').filter((l) => l.trim());
    const { ok, erro, lista } = validarJogadores(linhas.map((l) => l.split('|')[0]));
    if (!ok) { erroEl.textContent = erro; area.focus(); return; }
    const jogadores = lista.map((nome, i) => {
      const foto = (linhas[i].split('|')[1] || '').trim();
      return { id: novoId() + i, nome, foto: /^https?:\/\//.test(foto) ? foto : null };
    });
    const t = { id: novoId(), nome: String(f.get('nome')).trim() || 'Torneio', jogo: String(f.get('jogo')).trim(), jogadores, chave: gerarChave(jogadores), campeao: null, criadoEm: new Date().toISOString() };
    salvar(ctx.storage, t);
    ctx.storage.gravar(CH_ATUAL, t.id);
    ctx.toast('Chave sorteada', 'sucesso');
    redesenhar();
  });

  el.replaceChildren(
    cabecalho('Torneio', 'Monte um campeonato entre amigos em segundos: coloque os nomes, sorteie e clique em quem venceu.'),
    form,
    h('section', { class: 'secao' }, h('div', { class: 'secao-topo' }, h('h2', {}, 'Campeões anteriores')),
      historico.length ? h('ul', { class: 'historico-torneios', id: 'historico-torneios' }, historico.map((t) => {
        const c = t.jogadores.find((j) => j.id === t.campeao);
        return h('li', {}, h('button', { type: 'button', class: 'linha-torneio', onclick: () => { ctx.storage.gravar(CH_ATUAL, t.id); redesenhar(); } },
          avatar(c), h('span', {}, h('strong', {}, c?.nome), h('span', { class: 'texto-3' }, ` venceu ${t.nome}${t.jogo ? ' · ' + t.jogo : ''}`)), h('time', { class: 'texto-3' }, dataCurta(t.criadoEm))));
      })) : h('p', { class: 'texto-3' }, 'Os campeões aparecem aqui.')));
}

function telaChave(el, ctx, t, redesenhar) {
  const porId = Object.fromEntries(t.jogadores.map((j) => [j.id, j]));
  const total = t.chave.rodadas.length;
  const atual = rodadaAtual(t.chave);
  const venc = campeao(t.chave);

  const clicar = (r, i, id) => {
    const p = t.chave.rodadas[r][i];
    const nova = p.vencedor === id ? desfazer(t.chave, r, i) : definirVencedor(t.chave, r, i, id);
    if (nova === t.chave) return;
    const novoCampeao = campeao(nova);
    Object.assign(t, { chave: nova, campeao: novoCampeao });
    salvar(ctx.storage, t);
    redesenhar();
    if (novoCampeao && !venc) {
      const palco = el.querySelector('.campeao');
      if (palco) confete(palco);
    }
  };

  const lado = (r, i, p, id) => {
    const j = porId[id];
    if (!j) return h('div', { class: 'lado vazio' }, h('span', { class: 'texto-3' }, r === 0 ? 'folga' : 'aguardando'));
    const jogavel = p.a && p.b;
    const ganhou = p.vencedor === id;
    const perdeu = p.vencedor && p.vencedor !== id;
    return h('button', { type: 'button', class: `lado ${ganhou ? 'ganhou' : ''} ${perdeu ? 'perdeu' : ''}`, disabled: !jogavel, 'data-jogador': j.nome,
      'aria-label': ganhou ? `${j.nome} venceu. Clique para desfazer` : `Marcar ${j.nome} como vencedor`, onclick: () => clicar(r, i, id) },
      avatar(j), h('span', { class: 'lado-nome' }, j.nome), ganhou ? h('span', { class: 'lado-check', html: icone('trofeu') }) : null);
  };

  const chave = h('div', { class: 'chave', style: `--rodadas:${total}`, id: 'chave' },
    t.chave.rodadas.map((rodada, r) => h('section', { class: `rodada ${r === atual && !venc ? 'atual' : ''}`, 'aria-label': nomeRodada(r, total) },
      h('h3', {}, nomeRodada(r, total)),
      h('div', { class: 'partidas' }, rodada.map((p, i) => h('div', { class: `partida ${p.vencedor ? 'decidida' : ''}` }, lado(r, i, p, p.a), lado(r, i, p, p.b)))))));

  const novo = async () => {
    if (!venc && !await confirmar('Começar outro torneio?', 'Este torneio fica salvo e você pode voltar a ele depois.', 'Novo torneio')) return;
    ctx.storage.remover(CH_ATUAL); redesenhar();
  };
  const excluir = async () => {
    if (!await confirmar('Excluir torneio?', `“${t.nome}” será apagado.`, 'Excluir', true)) return;
    ctx.storage.gravar(CH_LISTA, lerLista(ctx.storage).filter((x) => x.id !== t.id));
    ctx.storage.remover(CH_ATUAL); redesenhar();
  };

  const vencedor = porId[venc];
  el.replaceChildren(...[
    cabecalho(t.nome, `${t.jogo ? t.jogo + ' · ' : ''}${t.jogadores.length} jogadores · clique em quem venceu cada partida`,
      h('button', { class: 'btn', onclick: novo, html: `${icone('mais')}<span>Novo torneio</span>` }),
      h('button', { class: 'btn btn-fantasma', onclick: excluir, html: `${icone('lixeira')}<span>Excluir</span>` })),
    vencedor ? h('section', { class: 'campeao', id: 'campeao', 'aria-live': 'polite' },
      h('span', { class: 'campeao-icone', html: icone('trofeu') }), h('p', { class: 'campeao-rotulo' }, 'Campeão'), avatar(vencedor), h('h2', {}, vencedor.nome),
      h('p', { class: 'texto-2' }, `${t.nome}${t.jogo ? ' · ' + t.jogo : ''}`)) : null,
    h('div', { class: 'chave-rolagem' }, chave)].filter(Boolean));
}

export default {
  montar(el, ctx) {
    usarEstilo('js/modules/torneio/estilo.css');
    const redesenhar = () => {
      const t = lerLista(ctx.storage).find((x) => x.id === ctx.storage.ler(CH_ATUAL));
      if (t) telaChave(el, ctx, t, redesenhar); else telaCriar(el, ctx, redesenhar);
    };
    redesenhar();
  },
  painelInicio(ctx) {
    const lista = lerLista(ctx.storage);
    if (!lista.length) return null;
    const t = lista.find((x) => x.id === ctx.storage.ler(CH_ATUAL)) || lista[0];
    const total = t.chave.rodadas.length;
    const c = t.jogadores.find((j) => j.id === t.campeao);
    return { titulo: c ? 'Último campeão' : 'Torneio em andamento', link: 'Abrir torneio',
      el: h('a', { class: 'pb-cartao torneio-cartao', href: '#/torneio' }, h('span', { class: 'texto-3' }, t.nome), h('strong', {}, c ? c.nome : nomeRodada(rodadaAtual(t.chave), total)), h('span', { class: 'texto-3' }, `${t.jogadores.length} jogadores${t.jogo ? ' · ' + t.jogo : ''}`)) };
  }
};
