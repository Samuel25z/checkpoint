# Journal — SPEC-20261120-1635

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-20 16:37
**Onde tô:** Wrapped com períodos: ano até agora, últimos 30 dias, desde sempre e anos anteriores; títulos e card com o nome do período
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** atividade no período = começou, terminou ou jogou por último (Steam) dentro da janela
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/wrapped.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica de períodos | concluído | 2026-11-20 16:37 |
| 2 | seletor e textos | concluído | 2026-11-20 16:37 |
| 3 | testes | concluído | 2026-11-20 16:37 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: estatisticas() continua aceitando um número de ano (compatível)

### Respostas-chave do usuário
- "a pessoa pode fazer esse videozinho durante o ano todo, pra não ter que esperar o ano todo"

### Tentativas que falharam


### Arquivos tocados
- js/modules/wrapped/{index,logic}.js
- js/modules/wrapped/estilo.css
- js/core/i18n.js
- tests/unit/wrapped.test.js
- tests/e2e/wrapped.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-20 16:37 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-20 16:35 — [ativação] SPEC criada e ativada (@samuel, branch spec/wrapped-periodos, base main)

## 2026-11-20 16:37 — [nota] verify: 1/2 critérios passaram (commit `7c301ec`)

- PASS: Estatísticas por período (ano, 30 dias, tudo) batem com um …
- FAIL: Na tela, trocar de período muda os números e o título, e o …

## 2026-11-20 16:37 — [conclusão] entregue

Wrapped por período entregue. 2/2 critérios verificados.
⎿ commit 7c301ec+dirty · 3 files changed, 30 insertions(+), 11 deletions(-)

## 2026-11-20 16:37 — [nota] verify: 1/1 critérios passaram (commit `7c301ec`)

- PASS: Na tela, trocar de período muda os números e o título, e o …
