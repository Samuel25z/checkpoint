# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:50
**Onde tô:** controle + inglês entregues: Gamepad API com navegação espacial, LB/RB entre abas, X faz split; configurações com idioma PT/EN aplicado por tradutor de tela com dicionário testado
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** inglês por dicionário aplicado na tela (MutationObserver) em vez de reescrever cada aba; aba nova traduz acrescentando frases ao EN
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/base.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | gamepad e navegação espacial | concluído | 2026-11-18 20:50 |
| 2 | i18n e configurações | concluído | 2026-11-18 20:50 |
| 3 | testes | concluído | 2026-11-18 20:50 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: teste unitário varre os módulos e reprova título/rótulo/estado vazio sem tradução
- fato: laço do controle só roda com controle conectado

### Respostas-chave do usuário
- "no fim, opção do site em inglês, se der tempo"

### Tentativas que falharam


### Arquivos tocados
- js/core/{gamepad,i18n,configuracoes}.js
- js/app.js
- css/style.css
- tests/unit/gamepad-i18n.test.js
- tests/e2e/controle-idioma.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:50 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:47 — [ativação] SPEC ativada (branch spec/controle-idioma, base main)

## 2026-11-18 20:50 — [nota] verify: 2/2 critérios passaram (commit `8b8f1aa`)

- PASS: Mapeamento de botões para ações e dicionários de idioma com…
- PASS: Com controle simulado, o foco anda e troca de aba; trocar p…

## 2026-11-18 20:50 — [conclusão] entregue

Controle de videogame e inglês entregues. 2/2 critérios verificados; suíte completa 76 unit + 48 E2E passando.
⎿ commit 8b8f1aa+dirty · 3 files changed, 33 insertions(+), 12 deletions(-)
