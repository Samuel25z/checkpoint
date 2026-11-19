# Journal — SPEC-20261118-2106

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 21:10
**Onde tô:** achados do revisor corrigidos: sair limpa o navegador, mescla por item com marcas de remoção, formato da nuvem conferido, recomps não verificado sem link de downloads, links de API só http/https
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** exclusões sincronizam por marcas de remoção (sync:removidos) em vez de última-gravação-vence por chave
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/conta.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | sincronização por item + remoções | concluído | 2026-11-18 21:10 |
| 2 | sair limpa o navegador | concluído | 2026-11-18 21:10 |
| 3 | links seguros e recomps | concluído | 2026-11-18 21:10 |
| 4 | testes | concluído | 2026-11-18 21:10 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: revisor cético (subagente separado) apontou 8 itens; 6 corrigidos, 2 aceitos como limite conhecido (foto de jogador por URL, SRI do SDK na CDN)
- fato: RLS do Supabase sem falha de acesso entre usuários

### Respostas-chave do usuário


### Tentativas que falharam


### Arquivos tocados
- js/core/{sync,conta,i18n}.js
- js/modules/{speedrun,recomps}/logic.js
- js/modules/recomps/index.js
- js/modules/{speedrun,torneio,roda-no-pc}/index.js
- js/services/wikipedia.js
- supabase/migracao.sql
- tests/unit/{sync,recomps,speedrun-api}.test.js
- tests/e2e/{conta,recomps}.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 21:10 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 21:06 — [ativação] SPEC criada e ativada (@samuel, branch spec/revisao-final, base main)

## 2026-11-18 21:10 — [nota] verify: 4/4 critérios passaram (commit `98d751a`)

- PASS: Mescla por item mantém adições feitas em dois aparelhos, re…
- PASS: Links de API sem http/https são descartados e recomps não v…
- PASS: Sair da conta limpa o navegador e outra conta que entra não…
- PASS: Catálogo de recomps com rede simulada mostra "Ver no GitHub…

## 2026-11-18 21:10 — [conclusão] entregue

Revisão cética tratada: 4/4 critérios verificados; suíte 79 unit + 48 E2E verde.
⎿ commit 98d751a+dirty · 2 files changed, 34 insertions(+), 14 deletions(-)
