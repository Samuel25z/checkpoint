# Techspec — SPEC-20261125-1713-amigos

## Arquitetura
- `js/services/social.js` — criarSocial(ctx.conta): meuPerfil, salvarPerfil (upsert por user_id), porUsuario, buscar (ilike 'termo%'), perfisDe, conexoes, seguir, deixarDeSeguir. Usa o cliente Supabase da conta (ctx.conta.cliente()).
- `js/modules/amigos/logic.js` — sugerirUsuario, validarUsuario, termoBusca (só [a-z0-9_]), montarResumo (numeros, nivel, favoritos, medalhas, jogando, recentes com data só AAAA-MM-DD), amigos (interseção), feed, erroSocial, linkPerfil.
- `js/modules/amigos/publicar.js` — dadosPublicos(storage) e atualizarPublico(social, storage): chamado ao abrir Amigos e ao salvar o Meu perfil.
- `js/modules/amigos/index.js` — rotas #/amigos e #/amigos/@usuario; redesenha no evento `checkpoint:conta` (login/logout).
- `js/core/conta.js` — devolve { cliente, configurado, usuario } e dispara `checkpoint:conta`.

## Banco (supabase/migracao.sql)
- perfis: select para anon e authenticated quando privado = false ou dono; insert/update/delete só dono.
- seguindo: select para authenticated; insert/delete só com seguidor = auth.uid(); anon sem acesso.

## Testes
- Unit: tests/unit/amigos.test.js.
- E2E: tests/e2e/amigos.spec.js com servidor simulado (tests/e2e/fakes-amigos.js) trocando js/services/social.js por um falso em localStorage; tests/e2e/ajuda.js ganhou `brutos` (localStorage cru depois da limpeza).
