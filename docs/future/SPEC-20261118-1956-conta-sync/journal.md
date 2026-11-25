# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 17:03
**Onde tô:** login no ar com e-mail e senha ou Google (Supabase), sincronização do diário, perfil e imagens, apagar conta (LGPD) e página de privacidade; testado de verdade pelo Samuel
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** e-mail e senha continuam ligados (pedido do Samuel para a apresentação) junto com o Google; tabela liberada só para authenticated, RLS por usuário
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/conta.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | código de login e sync | concluído | 2026-11-25 16:57 |
| 2 | apagar conta e privacidade | concluído | 2026-11-25 16:57 |
| 3 | projeto Supabase e Google configurados pelo Samuel | concluído | 2026-11-25 16:57 |
| 4 | login por e-mail e senha | concluído | 2026-11-25 16:57 |
| 5 | teste real | concluído | 2026-11-25 16:57 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: projeto Supabase vczwghrqekvqrwhshwbe; Google OAuth no 'My First Project' (limite de projetos atingido)
- fato: visitante sem login recebe 42501 ao ler, gravar ou chamar apagar_minha_conta
- fato: projetos novos do Supabase não dão grant automático: migracao.sql faz grant só para authenticated
- fato: testes de tela usam config simulada (ajuda.js) para nunca falar com o Supabase real

### Respostas-chave do usuário
- "deixe o cadastro por email sim porque na apresentação quero logar por email para ser mais fácil"
- "Entrei, deu certo"

### Tentativas que falharam
- com a config real publicada, os testes passaram a baixar o SDK de verdade: abrir() agora simula config sem login por padrão

### Arquivos tocados
- js/config.js
- js/core/conta.js
- js/core/sync.js
- css/style.css
- supabase/migracao.sql
- privacidade.html
- tests/e2e/ajuda.js
- tests/e2e/conta.spec.js
- tests/e2e/steam.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 16:57 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:44 — [ativação] SPEC ativada (branch spec/conta-sync, base main)

## 2026-11-18 20:47 — [nota] verify: 2/2 critérios passaram (commit `4a2c80e`)

- PASS: A mescla local×nuvem é correta (mais recente vence, nada é …
- PASS: Sem configuração do Supabase o site funciona e o botão de l…

## 2026-11-18 20:47 — [nota] código pronto; falta teste real

⎿ commit 4a2c80e+dirty · 2 files changed, 8 insertions(+), 3 deletions(-)

## 2026-11-18 20:47 — [nota] Pausada: aguardando o Samuel criar a conta Supabase e ligar o Google para o teste real

## 2026-11-25 11:40 — [unblock] Retomada (resume)

## 2026-11-25 12:00 — [nota] Pausada: aguardando o Samuel criar o projeto no Supabase e o login do Google e mandar URL + chave anon

## 2026-11-25 16:10 — [unblock] Retomada (resume)

## 2026-11-25 16:47 — [nota] Pausada: login publicado; falta o Samuel testar a conta de verdade (e-mail e Google) para fechar

## 2026-11-25 16:57 — [unblock] Retomada (resume)

## 2026-11-25 16:57 — [conclusão] entregue

Login entregue e testado pelo Samuel.
⎿ commit b1ccb2c+dirty · 3 files changed, 9 insertions(+), 119 deletions(-)

## 2026-11-25 17:03 — [nota] formas de entrar

Pedido do Samuel: "igual o Roblox faz" — quem cria com Google pode criar senha nas configurações da conta e entrar também por e-mail e senha; quem cria por e-mail pode ligar o Google (linkIdentity, exige "Allow manual linking" no Supabase). Login com Google confirmado pelo e-mail do Google às 16:50 de 25/11. Falta: teste de isolamento entre duas contas reais.
⎿ commit 33be885

## 2026-11-25 17:03 — [nota] Pausada: falta o Samuel testar isolamento entre duas contas reais
