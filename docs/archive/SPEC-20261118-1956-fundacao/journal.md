# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:13
**Onde tô:** fundação entregue: casca, registro de módulos, roteador, tema, storage, catálogo de 65 jogos, Início e testes
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** cada aba carrega o próprio CSS da sua pasta (usarEstilo) para que uma aba nova seja só pasta + 1 linha
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/base.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | casca, tokens e componentes | concluído | 2026-11-18 20:13 |
| 2 | storage, registro e roteador | concluído | 2026-11-18 20:13 |
| 3 | catálogo e hardware | concluído | 2026-11-18 20:13 |
| 4 | testes unitários e E2E | concluído | 2026-11-18 20:13 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: APIs Wikipedia, speedrun.com e GitHub respondem com CORS liberado (spike 2026-11-18)
- fato: capas da Wikipedia só vêm com pilicense=any (capas são imagens não livres)
- fato: as 61 capas Steam do catálogo existem (HEAD 200)

### Respostas-chave do usuário
- "faz um projeto estruturado para evoluir... lançando novas abas, novas atualizações"
- "faz suave" — animação leve que não trave

### Tentativas que falharam
- node --test com diretório não funciona no Node 24 — usar glob "tests/unit/*.test.js"
- backdrop-filter no topo prendia a barra fixa de abas no celular (cobria o botão de tema)

### Arquivos tocados
- index.html
- css/tokens.css
- css/style.css
- js/app.js
- js/storage.js
- js/games.js
- js/data/hardware.js
- js/core/{ui,router,icons}.js
- js/modules/registry.js
- js/modules/inicio/*
- scripts/{serve,lint}.mjs
- tests/unit/*
- tests/e2e/*

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:13 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 19:59 — [ativação] SPEC ativada (branch spec/fundacao, base main)

## 2026-11-18 20:13 — [nota] verify: 6/6 critérios passaram (commit `545b89d`)

- PASS: O registro de módulos carrega todas as abas registradas e u…
- PASS: storage.js grava, lê, versiona e emite evento de mudança co…
- PASS: Catálogo tem pelo menos 60 jogos válidos (campos obrigatóri…
- PASS: A navegação abre cada aba pelo menu e pela URL (#/rota) sem…
- PASS: O tema claro/escuro alterna, persiste ao recarregar e o HTM…
- PASS: Checagens estáticas do código passam (sintaxe JS, sem TODO/…

## 2026-11-18 20:13 — [decisão] arquitetura de abas plugáveis

Cada aba é uma pasta em js/modules com index.js e estilo.css; registry.js tem uma linha por aba. Atende o pedido de projeto evolutivo do Samuel.
⎿ commit 545b89d+dirty · 2 files changed, 46 insertions(+), 16 deletions(-)

## 2026-11-18 20:13 — [conclusão] entregue

Fundação entregue: casca, registro de abas, roteador, tema persistente, storage com eventos, catálogo de 65 jogos, componentes (modal, toast, estados) e Início. 6/6 critérios verificados (unit + E2E celular/PC + lint).
⎿ commit 545b89d+dirty · 2 files changed, 51 insertions(+), 16 deletions(-)
