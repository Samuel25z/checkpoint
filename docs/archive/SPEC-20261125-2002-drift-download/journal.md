# Journal — SPEC-20261125-2002

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 20:04
**Onde tô:** botões Baixar para Windows e Abrir no navegador na aba Outro projeto
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** link para o instalador oficial do servidor do Drift (o mesmo do atualizador do app), não cópia
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/base.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | botões | concluído | 2026-11-25 20:04 |
| 2 | teste | concluído | 2026-11-25 20:04 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: app-update.yml do drift-tela aponta para .../app/; latest.yml = 1.0.19, Drift-setup.exe 120647532 bytes
- fato: /tela serve o Drift Tela no navegador

### Respostas-chave do usuário
- coloca o link do download do drift tela

### Tentativas que falharam


### Arquivos tocados
- js/modules/outro-projeto/index.js
- js/core/i18n.js
- tests/e2e/outro-projeto.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 20:04 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-25 20:02 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/drift-download, base main)

## 2026-11-25 20:04 — [nota] verify: 1/1 critérios passaram (commit `8bffa9d`)

- PASS: aba mostra os botões de baixar e abrir no navegador com os …

## 2026-11-25 20:04 — [conclusão] entregue

Download do Drift Tela entregue. 1/1 critério verificado.
⎿ commit 8bffa9d+dirty · 4 files changed, 13 insertions(+), 1 deletion(-)
