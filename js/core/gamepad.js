// gamepad.js — usar o Checkpoint com controle de Xbox/PlayStation (mapeamento "standard").
// Direcional/analógico: move o foco · A: confirma · B: volta/fecha · LB/RB: troca de aba
// X: split no cronômetro · Start: vai para o menu. O laço só roda com controle conectado.

export const BOTOES = { 0: 'confirmar', 1: 'voltar', 2: 'split', 4: 'abaAnterior', 5: 'proximaAba', 9: 'menu', 12: 'cima', 13: 'baixo', 14: 'esquerda', 15: 'direita' };
const LIMIAR = 0.55;

/** Ações novas entre dois instantes (botão que acabou de ser apertado). */
export function acoesNovas(antes, agora) {
  const novas = [];
  for (const [i, acao] of Object.entries(BOTOES)) if (agora.botoes[i] && !antes.botoes[i]) novas.push(acao);
  const dir = (eixoX, eixoY) => (eixoY < -LIMIAR ? 'cima' : eixoY > LIMIAR ? 'baixo' : eixoX < -LIMIAR ? 'esquerda' : eixoX > LIMIAR ? 'direita' : null);
  const d0 = dir(antes.eixos[0] || 0, antes.eixos[1] || 0);
  const d1 = dir(agora.eixos[0] || 0, agora.eixos[1] || 0);
  if (d1 && d1 !== d0) novas.push(d1);
  return novas;
}

export function lerControle(gp) {
  return { botoes: gp.buttons.map((b) => b.pressed || b.value > 0.5), eixos: [...gp.axes] };
}

/**
 * Escolhe o próximo elemento na direção pedida (navegação espacial).
 * atual/candidatos: { x, y, w, h } (+ qualquer dado). Prefere o mais alinhado e mais perto.
 */
export function proximoFoco(atual, candidatos, direcao) {
  const cx = (r) => r.x + r.w / 2;
  const cy = (r) => r.y + r.h / 2;
  let melhor = null; let pontos = Infinity;
  for (const c of candidatos) {
    if (c === atual) continue;
    const dx = cx(c) - cx(atual);
    const dy = cy(c) - cy(atual);
    const frente = { direita: dx > 4, esquerda: dx < -4, baixo: dy > 4, cima: dy < -4 }[direcao];
    if (!frente) continue;
    const principal = direcao === 'direita' || direcao === 'esquerda' ? Math.abs(dx) : Math.abs(dy);
    const lateral = direcao === 'direita' || direcao === 'esquerda' ? Math.abs(dy) : Math.abs(dx);
    const p = principal + lateral * 2.5;
    if (p < pontos) { pontos = p; melhor = c; }
  }
  return melhor;
}

const FOCAVEIS = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function visiveis(raiz) {
  return [...raiz.querySelectorAll(FOCAVEIS)].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  }).map((el) => { const r = el.getBoundingClientRect(); return { el, x: r.left, y: r.top, w: r.width, h: r.height }; });
}

export function iniciarControle(ctx) {
  let anterior = null;
  let quadro = null;
  const tecla = (key, code = key) => document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true }));

  function executar(acao) {
    document.body.classList.add('modo-controle');
    const modalAberto = document.querySelector('[data-modal]:last-of-type .modal');
    const raiz = modalAberto || document;
    const lista = visiveis(raiz);
    const ativo = document.activeElement;
    const atual = lista.find((c) => c.el === ativo);
    if (['cima', 'baixo', 'esquerda', 'direita'].includes(acao)) {
      if (!atual) { lista[0]?.el.focus(); return; }
      const alvo = proximoFoco(atual, lista, acao);
      if (alvo) { alvo.el.focus(); alvo.el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' }); }
      return;
    }
    if (acao === 'confirmar') { if (ativo && ativo !== document.body) ativo.click(); else lista[0]?.el.focus(); }
    if (acao === 'voltar') { if (modalAberto) tecla('Escape'); else history.back(); }
    if (acao === 'split') tecla(' ', 'Space');
    if (acao === 'menu') document.querySelector('.nav-item.ativo, .nav-item')?.focus();
    if (acao === 'abaAnterior' || acao === 'proximaAba') {
      const abas = ctx.registro.todos();
      const i = abas.findIndex((m) => m.id === ctx.roteador.atual?.mod.id);
      const prox = abas[(i + (acao === 'proximaAba' ? 1 : -1) + abas.length) % abas.length];
      ctx.irPara(prox.rota);
    }
  }

  function laco() {
    const gp = [...(navigator.getGamepads?.() || [])].find(Boolean);
    if (!gp) { quadro = null; anterior = null; return; }
    const agora = lerControle(gp);
    if (anterior) acoesNovas(anterior, agora).forEach(executar);
    anterior = agora;
    quadro = requestAnimationFrame(laco);
  }

  window.addEventListener('gamepadconnected', (e) => {
    ctx.toast(`Controle conectado: use o direcional e o botão A`, 'sucesso');
    document.body.classList.add('modo-controle');
    if (!quadro) quadro = requestAnimationFrame(laco);
    void e;
  });
  window.addEventListener('gamepaddisconnected', () => ctx.toast('Controle desconectado'));
  window.addEventListener('mousedown', () => document.body.classList.remove('modo-controle'));
  return { executar };
}
