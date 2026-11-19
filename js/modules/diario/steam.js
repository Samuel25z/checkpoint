// Importar da Steam — tela de revisão. Só fatos viram sugestão; o resto a pessoa escolhe.
import { h, modal, capa, carregando, dataCurta } from '../../core/ui.js';
import { criarSteam } from '../../services/steam.js';
import { STATUS, ROTULO_STATUS } from './logic.js';
import { lerJogos, salvarVarios } from './dados.js';
import { sugerirStatus, jaNoDiario, paraRegistro, atualizarExistente, textoFatos, lotes, capaSteam } from './steam-logic.js';

const CH_PERFIL = 'diario:steamPerfil';

export async function importarDaSteam(ctx) {
  const steam = criarSteam();
  if (!steam.configurado()) {
    await modal({ titulo: 'Importar da Steam', conteudo: h('div', { class: 'conta-info' },
      h('p', {}, 'A importação da Steam ainda não foi ligada neste site.'),
      h('p', { class: 'texto-2' }, 'Ela precisa do ajudante da Steam publicado, com a chave da API. O passo a passo está no README do projeto.')) });
    return null;
  }

  const corpo = h('div', { class: 'steam-importar' });
  const resultado = new Promise((fim) => { corpo.fim = fim; });
  const fechar = (v) => { modal.fecharAtual(v); corpo.fim(v); };

  // passo 1: perfil
  const entrada = h('input', { class: 'entrada', name: 'perfil-steam', placeholder: 'https://steamcommunity.com/id/seu-nome', value: ctx.storage.ler(CH_PERFIL, ''), 'aria-label': 'Link do perfil da Steam' });
  const erroEl = h('p', { class: 'campo-erro', id: 'erro-steam' });
  const form = h('form', { class: 'steam-perfil' },
    h('p', { class: 'texto-2' }, 'Cole o link do seu perfil da Steam. O Checkpoint traz seus jogos com as horas e as conquistas. Nada é marcado como zerado por suposição: só o que a Steam confirma.'),
    h('label', { class: 'campo' }, h('span', {}, 'Perfil da Steam'), entrada),
    erroEl,
    h('p', { class: 'texto-3 dica' }, 'O perfil e os “Detalhes do jogo” precisam estar públicos. ', h('a', { href: 'https://steamcommunity.com/my/edit/settings', target: '_blank', rel: 'noopener' }, 'Abrir privacidade da Steam')),
    h('div', { class: 'modal-acoes form-acoes' },
      h('button', { class: 'btn', type: 'button', onclick: () => fechar(null) }, 'Cancelar'),
      h('button', { class: 'btn btn-primario', type: 'submit', id: 'buscar-steam' }, 'Buscar minha biblioteca')));
  corpo.append(form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    erroEl.textContent = '';
    const valor = entrada.value.trim();
    if (!valor) { erroEl.textContent = 'Cole o link do seu perfil.'; return; }
    const status = h('div', { class: 'steam-progresso' }, carregando('Procurando o perfil…'));
    corpo.replaceChildren(status);
    try {
      const perfil = await steam.perfil(valor);
      ctx.storage.gravar(CH_PERFIL, valor);
      status.replaceChildren(carregando(`Lendo a biblioteca de ${perfil.nome}…`));
      const jogos = await steam.jogos(perfil.steamid);
      const comHoras = jogos.filter((j) => j.minutos > 0).map((j) => j.appid);
      const conquistas = {};
      const grupos = lotes(comHoras);
      for (let i = 0; i < grupos.length; i++) {
        status.replaceChildren(carregando(`Conferindo conquistas (${Math.min((i + 1) * 25, comHoras.length)} de ${comHoras.length})…`));
        Object.assign(conquistas, await steam.conquistas(perfil.steamid, grupos[i]).catch(() => ({})));
      }
      revisar(perfil, jogos, conquistas);
    } catch (err) {
      corpo.replaceChildren(form);
      erroEl.textContent = err.privado ? 'Sua biblioteca está privada. Deixe “Detalhes do jogo” como público na Steam e tente de novo.' : err.message;
    }
  });

  function revisar(perfil, jogos, conquistas) {
    const diario = lerJogos(ctx.storage);
    const linhas = jogos.map((j) => {
      const c = conquistas[j.appid] || null;
      const sug = sugerirStatus(j, c);
      const existente = jaNoDiario(diario, j);
      return { jogo: j, conquistas: c, sugestao: sug, existente, status: existente ? null : sug.status, incluir: !existente && Boolean(sug.status) };
    }).sort((a, b) => Number(Boolean(a.existente)) - Number(Boolean(b.existente)) || b.jogo.minutos - a.jogo.minutos);

    const contador = h('strong', { id: 'contador-steam' });
    const botaoImportar = h('button', { class: 'btn btn-primario', type: 'button', id: 'confirmar-importacao' });
    const lista = h('ul', { class: 'steam-lista', id: 'lista-steam' });

    const atualizarContador = () => {
      const n = linhas.filter((l) => l.incluir && l.status).length;
      const semStatus = linhas.filter((l) => !l.existente && !l.status).length;
      contador.textContent = `${n} para importar`;
      botaoImportar.textContent = n ? `Importar ${n} ${n === 1 ? 'jogo' : 'jogos'}` : 'Atualizar horas';
      aviso.textContent = semStatus ? `${semStatus} sem status: escolha um para eles entrarem.` : '';
    };
    const aviso = h('span', { class: 'texto-3' });

    function linhaEl(l) {
      const seletor = h('select', { class: 'entrada steam-status', 'aria-label': `Status de ${l.jogo.nome}`, disabled: Boolean(l.existente) },
        h('option', { value: '' }, l.existente ? 'Já no diário' : 'Escolher status…'),
        STATUS.map((s) => h('option', { value: s.id, selected: l.status === s.id }, s.rotulo)));
      const marca = h('input', { type: 'checkbox', checked: l.incluir, disabled: Boolean(l.existente), 'aria-label': `Importar ${l.jogo.nome}` });
      seletor.addEventListener('change', () => { l.status = seletor.value || null; l.incluir = Boolean(l.status); marca.checked = l.incluir; atualizarContador(); });
      marca.addEventListener('change', () => { l.incluir = marca.checked && Boolean(l.status); if (marca.checked && !l.status) { marca.checked = false; seletor.focus(); } atualizarContador(); });
      return h('li', { class: `steam-linha ${l.existente ? 'existente' : ''}`, 'data-appid': l.jogo.appid },
        marca,
        capa(capaSteam(l.jogo.appid), l.jogo.nome, 'capa-mini'),
        h('div', { class: 'steam-texto' },
          h('strong', {}, l.jogo.nome),
          h('span', { class: 'texto-3' }, textoFatos(l.jogo, l.conquistas, dataCurta)),
          l.existente ? h('span', { class: 'steam-sug' }, l.existente.origem === 'steam' ? 'Já no diário: as horas serão atualizadas' : 'Já no diário')
            : l.sugestao.status ? h('span', { class: 'steam-sug' }, `Sugestão da Steam: ${ROTULO_STATUS[l.sugestao.status]} (${l.sugestao.motivo})`) : null),
        seletor);
    }
    lista.replaceChildren(...linhas.map(linhaEl));

    const emMassa = h('select', { class: 'entrada', id: 'status-em-massa', 'aria-label': 'Status para os jogos sem status' },
      h('option', { value: '' }, 'Escolha um status…'), STATUS.map((s) => h('option', { value: s.id }, s.rotulo)));
    const aplicar = h('button', { class: 'btn btn-pequeno', type: 'button', id: 'aplicar-em-massa' }, 'Aplicar aos sem status');
    aplicar.addEventListener('click', () => {
      if (!emMassa.value) { emMassa.focus(); return; }
      linhas.filter((l) => !l.existente && !l.status).forEach((l) => { l.status = emMassa.value; l.incluir = true; });
      lista.replaceChildren(...linhas.map(linhaEl));
      atualizarContador();
    });

    botaoImportar.addEventListener('click', () => {
      const novos = linhas.filter((l) => l.incluir && l.status && !l.existente).map((l) => paraRegistro(l.jogo, l.status, l.conquistas, l.sugestao));
      const atualizados = linhas.filter((l) => l.existente).map((l) => atualizarExistente(l.existente, l.jogo, l.conquistas)).filter(Boolean);
      const r = salvarVarios(ctx.storage, novos, atualizados, 'Steam');
      fechar(r);
    });

    corpo.replaceChildren(
      h('div', { class: 'steam-topo' },
        perfil.avatar ? h('img', { src: perfil.avatar, alt: '', class: 'steam-avatar', referrerpolicy: 'no-referrer' }) : null,
        h('div', {}, h('strong', {}, perfil.nome), h('span', { class: 'texto-3' }, ` · ${jogos.length} jogos na biblioteca`))),
      h('div', { class: 'steam-massa' }, emMassa, aplicar),
      lista,
      h('div', { class: 'modal-acoes form-acoes steam-rodape' }, h('span', { class: 'steam-conta' }, contador, aviso),
        h('button', { class: 'btn', type: 'button', onclick: () => fechar(null) }, 'Cancelar'), botaoImportar));
    atualizarContador();
  }

  modal({ titulo: 'Importar da Steam', conteudo: corpo, acoes: [], largo: true }).then((v) => corpo.fim(v));
  entrada.focus();
  return resultado;
}
