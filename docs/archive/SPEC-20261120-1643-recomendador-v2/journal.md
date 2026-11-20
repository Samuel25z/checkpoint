# Journal — SPEC-20261120-1643

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-20 16:46
**Onde tô:** recomendador v2: nota do Metacritic e recomendações da Steam como dado real, humor como filtro pela etiqueta principal, semelhança com os jogos bem avaliados, variedade de gênero e sugestão do dia entre as melhores
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** qualidade vem só de dado da loja (sem nota inventada); humor manda, semelhança desempata
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/recomendador.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | dados da loja | concluído | 2026-11-20 16:46 |
| 2 | pontuação nova | concluído | 2026-11-20 16:46 |
| 3 | testes | concluído | 2026-11-20 16:46 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: endpoint appreviews da Steam devolveu a página inicial; appdetails traz metacritic e recommendations
- fato: 63 jogos com dados, 52 com Metacritic (consulta 2026-11-20)

### Respostas-chave do usuário
- "a gente tem que dar uma melhorada nessa sugestão, para não ficar dando sugestão de qualquer coisa"

### Tentativas que falharam
- semelhança com peso alto passava por cima do humor (Silksong em 'Sentir medo')

### Arquivos tocados
- js/modules/recomendador/logic.js
- js/data/avaliacoes.js
- scripts/atualizar-avaliacoes.mjs
- js/core/i18n.js
- tests/unit/recomendador.test.js
- tests/e2e/recomendador.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-20 16:46 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-20 16:43 — [ativação] SPEC criada e ativada (@samuel, branch spec/recomendador-v2, base main)

## 2026-11-20 16:46 — [nota] verify: 2/2 critérios passaram (commit `ac103b5`)

- PASS: Qualidade real, semelhança de gosto, humor como filtro, var…
- PASS: Na tela, as 3 sugestões mostram motivos com fatos e "outra …

## 2026-11-20 16:46 — [conclusão] entregue

Recomendador v2 entregue. 2/2 critérios verificados.
⎿ commit ac103b5+dirty · 3 files changed, 34 insertions(+), 12 deletions(-)
