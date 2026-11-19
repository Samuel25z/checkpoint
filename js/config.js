// config.js — configurações públicas do Checkpoint.
// A chave "anon" do Supabase é pública por natureza: a proteção dos dados vem das regras
// de segurança (RLS) no banco, que só deixam cada usuário ler e gravar o que é dele.
// Enquanto url e chaveAnon estiverem vazios, o site funciona só com o armazenamento do navegador.

export const SUPABASE = {
  url: '',
  chaveAnon: ''
};

// Endereço do ajudante da Steam (servidor/steam-worker, publicado no Cloudflare).
// Vazio = o botão "Importar da Steam" explica que a importação ainda não foi ligada.
export const STEAM_AJUDANTE = '';

export const SUPABASE_SDK ='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
