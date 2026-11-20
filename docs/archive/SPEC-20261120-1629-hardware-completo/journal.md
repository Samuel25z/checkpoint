# Journal — SPEC-20261120-1629

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-20 16:35
**Onde tô:** base com 170+ CPUs e 140+ GPUs (desktop, notebook, integradas, portáteis) e caixa de escolha própria com busca, limpar e teclado
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** trocar <datalist> por combobox próprio: o datalist esconde as outras opções quando o campo já tem valor
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/hardware.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | base de peças | concluído | 2026-11-20 16:35 |
| 2 | combobox | concluído | 2026-11-20 16:35 |
| 3 | testes | concluído | 2026-11-20 16:35 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: datalist filtra pelo valor atual: com a placa detectada preenchida, só ela aparecia (print do Samuel)
- fato: fechamento atrasado no blur fechava a lista nova se a pessoa voltasse ao campo em menos de 120 ms

### Respostas-chave do usuário
- "às vezes eu não quero essa placa de vídeo... às vezes eu tô testando outro PC de um amigo meu"

### Tentativas que falharam
- teste do speedrun instável: a 'run pior' às vezes era mais rápida; agora espera 2,5 s

### Arquivos tocados
- js/data/hardware.js
- js/core/combobox.js
- js/modules/roda-no-pc/index.js
- css/style.css
- tests/unit/{combobox,hardware}.test.js
- tests/e2e/roda-no-pc.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-20 16:35 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-20 16:29 — [ativação] SPEC criada e ativada (@samuel, branch spec/hardware-completo, base main)

## 2026-11-20 16:35 — [nota] verify: 3/3 critérios passaram (commit `135fedb`)

- PASS: Base tem 150+ CPUs e 120+ GPUs, sem nomes repetidos, e todo…
- PASS: Busca da caixa de escolha acha por partes do nome em qualqu…
- PASS: Na tela, a placa detectada pode ser trocada por outra pela …

## 2026-11-20 16:35 — [conclusão] entregue

Roda no PC com base grande e troca de peça livre. 3/3 critérios verificados.
⎿ commit 135fedb+dirty · 3 files changed, 37 insertions(+), 13 deletions(-)
