// conta.js — login com Google (Supabase) e sincronização entre aparelhos.
// O site funciona sem login; ao entrar, os dados deste navegador sobem e os da conta descem.
import { SUPABASE, SUPABASE_SDK } from '../config.js';
import { SINCRONIZAVEIS, LISTAS, CHAVE_REMOVIDOS, sincronizavel, planejar, registrarRemocoes, formatoValido } from './sync.js';
import { h, modal, confirmar, capaGerada } from './ui.js';
import { icone } from './icons.js';

const META_EM = 'meta:sync:em';
const META_USUARIO = 'meta:sync:usuario';
const META_ULTIMA = 'meta:sync:ultima';
const META_IDS = 'meta:sync:ids';
const TABELA = 'checkpoint_dados';

export const configurado = () => Boolean(SUPABASE.url && SUPABASE.chaveAnon);

export function iniciarConta(ctx) {
  const { storage } = ctx;
  let cliente = null;
  let usuario = null;
  let estado = 'desligado';
  let aplicandoRemoto = false;
  let fila = new Set();
  let tempo;

  const botao = h('button', { class: 'btn-icone botao-conta', id: 'botao-conta', type: 'button', 'aria-label': 'Entrar na sua conta', title: 'Entrar' });
  document.getElementById('topo-acoes').prepend(botao);

  function pintar() {
    botao.dataset.estado = estado;
    if (usuario) {
      const nome = usuario.user_metadata?.full_name || usuario.email || 'Você';
      const { tom, iniciais } = capaGerada(nome);
      const foto = usuario.user_metadata?.avatar_url;
      botao.innerHTML = '';
      botao.append(h('span', { class: 'conta-avatar', style: `--tom:${tom}` }, foto ? h('img', { src: foto, alt: '', referrerpolicy: 'no-referrer' }) : iniciais), h('span', { class: 'conta-ponto', 'aria-hidden': 'true' }));
      botao.setAttribute('aria-label', `Sua conta (${nome}). ${estado === 'ok' ? 'Sincronizado' : estado === 'erro' ? 'Erro ao sincronizar' : 'Sincronizando'}`);
      botao.title = 'Sua conta';
    } else {
      botao.innerHTML = icone('usuario');
      botao.setAttribute('aria-label', 'Entrar na sua conta');
      botao.title = 'Entrar';
    }
  }

  // ids conhecidos de cada lista: ao sumir um id, nasce uma marca de remoção (exclusão sincroniza)
  const idsDe = (chave) => (storage.ler(chave, []) || []).map((x) => x.id);
  const lembrarIds = () => storage.gravar(META_IDS, Object.fromEntries(LISTAS.map((c) => [c, idsDe(c)])), { silencioso: true });
  if (!storage.ler(META_IDS)) lembrarIds();

  // registra quando cada dado mudou (para saber quem é mais novo)
  storage.aoMudar(({ nome }) => {
    if (!sincronizavel(nome) || aplicandoRemoto) return;
    const em = new Date().toISOString();
    if (LISTAS.includes(nome)) {
      const ids = storage.ler(META_IDS, {});
      const depois = idsDe(nome);
      const antes = storage.ler(CHAVE_REMOVIDOS, {});
      const removidos = registrarRemocoes(antes, nome, ids[nome] || [], depois, em);
      storage.gravar(META_IDS, { ...ids, [nome]: depois }, { silencioso: true });
      if (removidos !== antes) storage.gravar(CHAVE_REMOVIDOS, removidos);
    }
    storage.gravar(META_EM, { ...storage.ler(META_EM, {}), [nome]: em }, { silencioso: true });
    if (usuario) { fila.add(nome); clearTimeout(tempo); tempo = setTimeout(enviarFila, 1200); }
  });

  async function carregarCliente() {
    if (cliente) return cliente;
    const { createClient } = await import(SUPABASE_SDK);
    cliente = createClient(SUPABASE.url, SUPABASE.chaveAnon, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
    return cliente;
  }

  async function enviar(mapa) {
    const chaves = Object.keys(mapa);
    if (!chaves.length || !usuario) return;
    const em = new Date().toISOString();
    const linhas = chaves.map((chave) => ({ user_id: usuario.id, chave, valor: mapa[chave], atualizado_em: em }));
    const { error } = await cliente.from(TABELA).upsert(linhas, { onConflict: 'user_id,chave' });
    if (error) throw error;
    storage.gravar(META_EM, { ...storage.ler(META_EM, {}), ...Object.fromEntries(chaves.map((c) => [c, em])) }, { silencioso: true });
  }

  async function enviarFila() {
    const chaves = [...fila]; fila = new Set();
    if (!chaves.length || !usuario) return;
    estado = 'sincronizando'; pintar();
    try {
      await enviar(Object.fromEntries(chaves.map((c) => [c, storage.ler(c)])));
      estado = 'ok'; storage.gravar(META_ULTIMA, new Date().toISOString(), { silencioso: true });
    } catch (e) {
      console.warn('[conta] envio falhou', e);
      chaves.forEach((c) => fila.add(c));
      estado = 'erro';
    }
    pintar();
  }

  async function sincronizar() {
    if (!usuario) return;
    estado = 'sincronizando'; pintar();
    try {
      const { data, error } = await cliente.from(TABELA).select('chave, valor, atualizado_em').in('chave', SINCRONIZAVEIS);
      if (error) throw error;
      const nuvem = Object.fromEntries((data || []).filter((l) => {
        const ok = formatoValido(l.chave, l.valor);
        if (!ok) console.warn(`[conta] "${l.chave}" na nuvem está num formato inesperado e foi ignorado`);
        return ok;
      }).map((l) => [l.chave, { valor: l.valor, em: l.atualizado_em }]));
      const em = storage.ler(META_EM, {});
      const local = {};
      for (const chave of SINCRONIZAVEIS) {
        const valor = storage.ler(chave);
        if (valor !== null) local[chave] = { valor, em: em[chave] || '1970-01-01T00:00:00Z' };
      }
      const primeiraVez = storage.ler(META_USUARIO) !== usuario.id;
      const { gravarLocal, enviar: subir } = planejar(local, nuvem, { primeiraVez });
      if (Object.keys(gravarLocal).length) {
        aplicandoRemoto = true;
        const novasDatas = {};
        for (const [chave, valor] of Object.entries(gravarLocal)) { storage.gravar(chave, valor); novasDatas[chave] = nuvem[chave]?.em || new Date().toISOString(); }
        storage.gravar(META_EM, { ...storage.ler(META_EM, {}), ...novasDatas }, { silencioso: true });
        lembrarIds();
        aplicandoRemoto = false;
      }
      await enviar(subir);
      storage.gravar(META_USUARIO, usuario.id, { silencioso: true });
      storage.gravar(META_ULTIMA, new Date().toISOString(), { silencioso: true });
      estado = 'ok';
      if (Object.keys(gravarLocal).length) ctx.roteador?.navegar();
    } catch (e) {
      aplicandoRemoto = false;
      console.warn('[conta] sincronização falhou', e);
      estado = 'erro';
    }
    pintar();
  }

  async function entrar() {
    try {
      await carregarCliente();
      const { error } = await cliente.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
      if (error) throw error;
    } catch (e) {
      console.warn(e);
      ctx.toast('Não deu para abrir o login agora. Tente de novo.', 'erro');
    }
  }

  /** Erros do Supabase em português, sem jargão. */
  function erroLegivel(e) {
    const m = String(e?.message || e || '');
    if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
    if (/email not confirmed/i.test(m)) return 'Falta confirmar o e-mail: abra o link que mandamos para a sua caixa de entrada (veja o spam também).';
    if (/already registered|already been registered|user already exists/i.test(m)) return 'Já existe uma conta com esse e-mail. Use "Entrar" ou "Esqueci a senha".';
    if (/rate limit|too many|over_email_send_rate_limit|security purposes/i.test(m)) return 'Muitas tentativas agora. Espere alguns minutos e tente de novo.';
    if (/password should be at least|weak/i.test(m)) return 'Senha fraca: use pelo menos 8 caracteres, misturando letras e números.';
    if (/signups? not allowed|signup is disabled/i.test(m)) return 'O cadastro por e-mail está desligado no momento.';
    if (/failed to fetch|network/i.test(m)) return 'Sem conexão com o servidor. Confira a internet.';
    return 'Não deu certo agora. Tente de novo em instantes.';
  }

  const emailValido = (t) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(t).trim());

  /** Janela de entrar: Google ou e-mail e senha (entrar, criar conta, esqueci a senha). */
  function janelaEntrar() {
    const aviso = h('p', { class: 'conta-aviso', role: 'status', 'aria-live': 'polite' });
    const email = h('input', { class: 'entrada', type: 'email', name: 'email', autocomplete: 'email', required: true, placeholder: 'voce@exemplo.com', 'aria-label': 'E-mail' });
    const senha = h('input', { class: 'entrada', type: 'password', name: 'senha', autocomplete: 'current-password', required: true, minlength: 8, placeholder: 'Sua senha', 'aria-label': 'Senha' });
    const mostrar = h('button', { type: 'button', class: 'btn btn-pequeno btn-fantasma', 'aria-pressed': 'false', onclick: () => {
      const ver = senha.type === 'password';
      senha.type = ver ? 'text' : 'password';
      mostrar.setAttribute('aria-pressed', String(ver));
      mostrar.textContent = ver ? 'Esconder' : 'Mostrar';
    } }, 'Mostrar');
    const ocupado = (sim) => form.querySelectorAll('button').forEach((b) => { b.disabled = sim; });
    const conferir = (exigirSenha = true) => {
      if (!emailValido(email.value)) { aviso.textContent = 'Digite um e-mail válido.'; email.focus(); return false; }
      if (exigirSenha && senha.value.length < 8) { aviso.textContent = 'A senha precisa ter pelo menos 8 caracteres.'; senha.focus(); return false; }
      return true;
    };
    async function comEmail(acao) {
      if (!conferir(acao !== 'esqueci')) return;
      aviso.className = 'conta-aviso'; aviso.textContent = 'Um instante…';
      ocupado(true);
      try {
        await carregarCliente();
        const volta = location.origin + location.pathname;
        if (acao === 'entrar') {
          const { error } = await cliente.auth.signInWithPassword({ email: email.value.trim(), password: senha.value });
          if (error) throw error;
          modal.fecharAtual(null);
          ctx.toast('Você entrou na sua conta', 'sucesso');
          return;
        }
        if (acao === 'criar') {
          const { data, error } = await cliente.auth.signUp({ email: email.value.trim(), password: senha.value, options: { emailRedirectTo: volta } });
          if (error) throw error;
          if (data?.session) { modal.fecharAtual(null); ctx.toast('Conta criada. Bem-vindo!', 'sucesso'); return; }
          aviso.className = 'conta-aviso ok';
          aviso.textContent = `Conta criada! Mandamos um link para ${email.value.trim()}. Abra e confirme para poder entrar (veja o spam também).`;
          return;
        }
        const { error } = await cliente.auth.resetPasswordForEmail(email.value.trim(), { redirectTo: volta });
        if (error) throw error;
        aviso.className = 'conta-aviso ok';
        aviso.textContent = `Se existir uma conta com ${email.value.trim()}, chega um link para criar uma senha nova.`;
      } catch (e) {
        console.warn('[conta]', e);
        aviso.className = 'conta-aviso erro';
        aviso.textContent = erroLegivel(e);
      } finally { ocupado(false); }
    }
    const form = h('form', { class: 'conta-form', novalidate: true },
      h('button', { type: 'button', class: 'btn conta-google', id: 'entrar-google', onclick: () => { modal.fecharAtual(null); entrar(); } }, 'Entrar com Google'),
      h('p', { class: 'conta-ou texto-3' }, 'ou com e-mail'),
      h('label', { class: 'campo' }, h('span', {}, 'E-mail'), email),
      h('div', { class: 'campo' }, h('span', {}, 'Senha'), h('div', { class: 'conta-senha' }, senha, mostrar), h('span', { class: 'texto-3' }, 'Pelo menos 8 caracteres.')),
      aviso,
      h('div', { class: 'conta-botoes' },
        h('button', { type: 'submit', class: 'btn btn-primario', id: 'entrar-email' }, 'Entrar'),
        h('button', { type: 'button', class: 'btn', id: 'criar-conta', onclick: () => comEmail('criar') }, 'Criar conta'),
        h('button', { type: 'button', class: 'btn btn-fantasma btn-pequeno', id: 'esqueci-senha', onclick: () => comEmail('esqueci') }, 'Esqueci a senha')),
      h('p', { class: 'texto-2' }, 'O que já está neste navegador sobe para a sua conta. Nada é apagado.'),
      linkPrivacidade());
    form.addEventListener('submit', (e) => { e.preventDefault(); comEmail('entrar'); });
    return modal({ titulo: 'Entrar no Checkpoint', conteudo: form, acoes: [] });
  }

  /** Voltou pelo link de "esqueci a senha": pede a senha nova. */
  async function novaSenha() {
    const aviso = h('p', { class: 'conta-aviso', role: 'status', 'aria-live': 'polite' });
    const senha = h('input', { class: 'entrada', type: 'password', autocomplete: 'new-password', minlength: 8, 'aria-label': 'Senha nova', placeholder: 'Senha nova' });
    const form = h('form', { class: 'conta-form', novalidate: true },
      h('label', { class: 'campo' }, h('span', {}, 'Senha nova'), senha, h('span', { class: 'texto-3' }, 'Pelo menos 8 caracteres.')), aviso,
      h('div', { class: 'conta-botoes' }, h('button', { type: 'submit', class: 'btn btn-primario' }, 'Salvar senha nova')));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (senha.value.length < 8) { aviso.textContent = 'A senha precisa ter pelo menos 8 caracteres.'; return; }
      const { error } = await cliente.auth.updateUser({ password: senha.value });
      if (error) { aviso.className = 'conta-aviso erro'; aviso.textContent = erroLegivel(error); return; }
      modal.fecharAtual(null);
      ctx.toast('Senha nova salva', 'sucesso');
    });
    return modal({ titulo: 'Criar senha nova', conteudo: form, acoes: [] });
  }

  async function sair() {
    if (!await confirmar('Sair da conta?', 'Seus jogos, recordes e torneios saem deste navegador e continuam salvos na sua conta. Assim, a próxima pessoa que usar este computador não vê nada seu.', 'Sair')) return;
    clearTimeout(tempo);
    if (fila.size) await enviarFila(); // nada fica sem subir
    await cliente.auth.signOut();
    usuario = null; estado = 'desligado';
    aplicandoRemoto = true;
    for (const chave of SINCRONIZAVEIS) storage.remover(chave);
    for (const meta of [META_USUARIO, META_EM, META_ULTIMA]) storage.remover(meta);
    lembrarIds();
    aplicandoRemoto = false;
    pintar();
    ctx.roteador?.navegar();
    ctx.toast('Você saiu da conta. Seus dados foram tirados deste navegador.');
  }

  /** Direito de apagar tudo (LGPD): a função no banco remove o usuário, e os dados vão junto (on delete cascade). */
  async function apagarConta() {
    const ok = await confirmar('Apagar sua conta?', 'Isso apaga para sempre a sua conta e tudo o que está salvo nela: diário, recordes, torneios, PCs e perfil. Não dá para desfazer. Os dados também saem deste navegador.', 'Apagar tudo', true);
    if (!ok) return;
    try {
      clearTimeout(tempo); fila = new Set();
      const { error } = await cliente.rpc('apagar_minha_conta');
      if (error) throw error;
      await cliente.auth.signOut();
    } catch (e) {
      console.warn('[conta] apagar falhou', e);
      ctx.toast('Não deu para apagar a conta agora. Tente de novo.', 'erro');
      return;
    }
    usuario = null; estado = 'desligado';
    aplicandoRemoto = true;
    for (const chave of SINCRONIZAVEIS) storage.remover(chave);
    for (const meta of [META_USUARIO, META_EM, META_ULTIMA]) storage.remover(meta);
    lembrarIds();
    aplicandoRemoto = false;
    pintar();
    ctx.roteador?.navegar();
    ctx.toast('Sua conta e seus dados foram apagados.', 'sucesso');
  }

  const linkPrivacidade = () => h('p', { class: 'texto-3' }, h('a', { href: 'privacidade.html', target: '_blank', rel: 'noopener' }, 'Como cuidamos dos seus dados'));

  botao.addEventListener('click', async () => {
    if (!configurado()) {
      modal({ titulo: 'Conta', conteudo: h('div', { class: 'conta-info' },
        h('p', {}, 'O login com Google ainda não foi configurado neste site.'),
        h('p', { class: 'texto-2' }, 'Tudo funciona normalmente: seus jogos, recordes e torneios ficam salvos neste navegador.')) });
      return;
    }
    if (!usuario) {
      janelaEntrar();
      return;
    }
    const ultima = storage.ler(META_ULTIMA);
    const r = await modal({ titulo: 'Sua conta', conteudo: h('div', { class: 'conta-info' },
      h('p', {}, h('strong', {}, usuario.user_metadata?.full_name || 'Conta Google'), h('br'), h('span', { class: 'texto-2' }, usuario.email || '')),
      h('p', { class: `conta-estado est-${estado}` }, estado === 'ok' ? `Sincronizado${ultima ? ' às ' + new Date(ultima).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}` : estado === 'erro' ? 'Não deu para sincronizar. Confira a internet.' : 'Sincronizando…'),
      linkPrivacidade()),
    acoes: [{ rotulo: 'Apagar conta', valor: 'apagar', tipo: 'perigo' }, { rotulo: 'Sair', valor: 'sair' }, { rotulo: 'Sincronizar agora', valor: 'sync', tipo: 'primario' }] });
    if (r === 'sync') { await sincronizar(); ctx.toast(estado === 'ok' ? 'Tudo sincronizado' : 'Não deu para sincronizar', estado === 'ok' ? 'sucesso' : 'erro'); }
    if (r === 'sair') sair();
    if (r === 'apagar') apagarConta();
  });

  pintar();
  if (configurado()) {
    carregarCliente().then((c) => {
      c.auth.onAuthStateChange((evento, sessao) => {
        if (evento === 'PASSWORD_RECOVERY') setTimeout(novaSenha);
        const antes = usuario?.id;
        usuario = sessao?.user || null;
        pintar();
        if (usuario && usuario.id !== antes) sincronizar();
      });
    }).catch((e) => { console.warn('[conta] SDK indisponível', e); estado = 'erro'; pintar(); });
  }
  window.addEventListener('online', () => { if (usuario && fila.size) enviarFila(); });
  return { sincronizar, get usuario() { return usuario; } };
}
