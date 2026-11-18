# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:34
**Onde tô:** roda-no-pc entregue: detecção da GPU pelo WebGL, formulário com listas, vários PCs, resumo por nível com filtro e lista com gargalo
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** nível pela pior razão entre o PC e o requisito recomendado; abaixo de 90% do mínimo em qualquer peça = não roda
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/hardware.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica de classificação e reconhecimento de peças | concluído | 2026-11-18 20:34 |
| 2 | detecção no navegador | concluído | 2026-11-18 20:34 |
| 3 | tela | concluído | 2026-11-18 20:34 |
| 4 | testes | concluído | 2026-11-18 20:34 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: o renderer do WebGL vem como 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Laptop GPU Direct3D11...)' — reconhecido pelo modelo mais específico
- fato: navigator.deviceMemory é limitado a 8 GB pelo navegador

### Respostas-chave do usuário


### Tentativas que falharam


### Arquivos tocados
- js/modules/roda-no-pc/{index,logic,detect}.js
- js/modules/roda-no-pc/estilo.css
- tests/unit/hardware.test.js
- tests/e2e/roda-no-pc.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:34 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:31 — [ativação] SPEC ativada (branch spec/roda-no-pc, base main)

## 2026-11-18 20:34 — [nota] verify: 2/2 critérios passaram (commit `ef298ae`)

- PASS: A classificação (não roda/baixo/médio/alto/ultra) e a busca…
- PASS: Na tela, a detecção preenche o formulário, salva dois PCs e…

## 2026-11-18 20:34 — [conclusão] entregue

Aba 'Roda no meu PC?' entregue com detecção automática da placa e resultado para 61 jogos. 2/2 critérios verificados.
⎿ commit ef298ae+dirty · 2 files changed, 26 insertions(+), 12 deletions(-)
