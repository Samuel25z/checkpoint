# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:28
**Onde tô:** speedrun entregue: busca no speedrun.com, categorias, top 10 com vídeo, cronômetro com splits/PB/deltas/soma dos melhores, atalhos, modo foco e painel da Início
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** envio de run = link para a categoria no speedrun.com (envio automático exige chave do usuário)
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/speedrun.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica do cronômetro e PB | concluído | 2026-11-18 20:28 |
| 2 | serviço speedrun.com com cache | concluído | 2026-11-18 20:28 |
| 3 | telas cronômetro e recordes | concluído | 2026-11-18 20:28 |
| 4 | testes | concluído | 2026-11-18 20:28 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: API v1 do speedrun.com responde com CORS liberado e sem chave
- fato: tempos são truncados (não arredondados), como nos cronômetros de speedrun

### Respostas-chave do usuário
- "organizar e aparecer o cronômetro muito facilmente"

### Tentativas que falharam
- no celular, clicar num ponto qualquer da página podia focar um select e o espaço não iniciava — teste passou a clicar no relógio

### Arquivos tocados
- js/modules/speedrun/{index,logic}.js
- js/modules/speedrun/estilo.css
- js/services/speedrun.js
- tests/unit/speedrun*.test.js
- tests/e2e/speedrun.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:28 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:22 — [ativação] SPEC ativada (branch spec/speedrun, base main)

## 2026-11-18 20:28 — [nota] verify: 4/4 critérios passaram (commit `153fb80`)

- PASS: Cronômetro, splits, deltas e PB funcionam (lógica pura, inc…
- PASS: Conversão da resposta do speedrun.com em ranking (tempos, j…
- PASS: Na tela, criar rota, rodar com atalhos de teclado, terminar…
- PASS: O ranking de um jogo aparece com dados simulados de rede e …

## 2026-11-18 20:28 — [decisão] visual novo (pedido do Samuel)

Samuel achou o visual genérico. Novo sistema: fonte Unbounded, âmbar #ffb21a, fundo com grade de pontos, abas com traço, capas como caixinhas com faixa preta e filete na cor do status.
⎿ commit 153fb80+dirty · 2 files changed, 31 insertions(+), 14 deletions(-)

## 2026-11-18 20:28 — [conclusão] entregue

Central de speedrun entregue com ranking (rede simulada nos testes) e cronômetro completo. 4/4 critérios verificados. Junto: redesign global pedido pelo Samuel (caixinhas de jogo, Unbounded, âmbar).
⎿ commit 153fb80+dirty · 2 files changed, 36 insertions(+), 14 deletions(-)
