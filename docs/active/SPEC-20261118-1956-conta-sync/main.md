# SPEC-20261118-1956: conta sync

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 20:44
**Concluída:** —
**Pausada em:** 2026-11-25 16:47 — login publicado; falta o Samuel testar a conta de verdade (e-mail e Google) para fechar
**Reativada em:** 2026-11-25 16:57
**Commit final:** —
**Keywords:** login, conta, supabase, google, sincronizacao, rls
**Features:** conta
**Branch:** spec/conta-fechar
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Login com Google via Supabase e sincronização do diário, rotas, torneios e PCs entre aparelhos; o site segue funcionando sem login.

## Objetivo

Permitir que o jogador entre na conta em qualquer computador (inclusive o da apresentação) e encontre seus dados, sem perder o uso sem login.

## Escopo

**DENTRO:**
- Botão Entrar com Google (Supabase Auth) e sair
- Tabela única por usuário com RLS (cada um só lê/escreve o próprio dado)
- Ao entrar: mescla dados locais com os da nuvem (mais recente vence por item)
- Sincronização automática após mudanças (debounce) e indicador de status
- Funciona sem login, salvando só no navegador

**FORA:**
- Login por senha própria
- Perfil público

## Invariantes

- NUNCA chave secreta no código (só a chave pública anon do Supabase)
- SEMPRE RLS ligado: usuário A não lê nem grava dados do usuário B

## Implementação

services/supabase.js (SDK via CDN ESM) + sync.js puro (mescla por atualizadoEm). Tabela checkpoint_dados(user_id, chave, valor jsonb, atualizado_em) com políticas RLS por auth.uid().

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| checkpoint_dados | user_id uuid, chave text, valor jsonb, atualizado_em timestamptz — PK(user_id, chave) |

## Riscos

- Conta/projeto Supabase dependem do Samuel — mitigação: site funciona 100% sem login enquanto não houver chave

## Sinais de sucesso

- Entrar no PC da apresentação mostra o diário do Samuel

## Critério de aceite

- [x] A mescla local×nuvem é correta (mais recente vence, nada é perdido) (2026-11-18 20:47, commit `4a2c80e`, verify: exit 0) | verify: `node --test tests/unit/sync.test.js`
- [x] Sem configuração do Supabase o site funciona e o botão de login explica que a conta não está configurada (2026-11-18 20:47, commit `4a2c80e`, verify: exit 0) | verify: `npx playwright test tests/e2e/conta.spec.js -g "sem-config"`
- [ ] Login real com Google e isolamento entre dois usuários (RLS) conferidos | evidence: manual @samuel
