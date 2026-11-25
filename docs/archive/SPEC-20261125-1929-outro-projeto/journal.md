# Journal — SPEC-20261125-1929

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 19:32
**Onde tô:** aba Outro projeto no fim do menu com o vídeo do Drift Tela
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** vídeo copiado para assets/ e servido pelo GitHub Pages
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/base.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | aba | concluído | 2026-11-25 19:32 |
| 2 | teste | concluído | 2026-11-25 19:32 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: único arquivo do vídeo no PC: Downloads/drift-tela-v2-celular.mp4 (1280x720, 30 fps, 1:10)
- fato: teste do controle (RB) passou a esperar a aba Apresentação depois da Início

### Respostas-chave do usuário
- "coloque uma nova aba no final escrito outro projeto e lá você vai colocar o vídeo que fizemos do Drift Tela"

### Tentativas que falharam
- teste do controle quebrado desde a aba Apresentação (RB ia para Diário)

### Arquivos tocados
- js/modules/outro-projeto/index.js
- assets/drift-tela.mp4
- assets/drift-tela-capa.jpg
- js/modules/registry.js
- js/core/i18n.js
- tests/e2e/outro-projeto.spec.js
- tests/e2e/controle-idioma.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 19:32 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-25 19:29 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/outro-projeto, base main)

## 2026-11-25 19:32 — [conclusão] entregue

Aba Outro projeto entregue. 1/1 critério verificado.
⎿ commit 7e9d616+dirty · 4 files changed, 9 insertions(+), 2 deletions(-)

## 2026-11-25 19:32 — [nota] verify: 1/1 critérios passaram (commit `629404f`)

- PASS: aba no fim do menu mostra o vídeo do Drift Tela | verify: `…
