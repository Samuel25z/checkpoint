# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:37
**Onde tô:** torneio entregue: cadastro com validação e foto opcional, sorteio com folgas, clique no vencedor, desfazer em cascata, campeão com confete e histórico
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** clicar de novo no vencedor desfaz; trocar o vencedor apaga só o que dependia daquela partida
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/torneio.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica da chave | concluído | 2026-11-18 20:37 |
| 2 | tela da chave e campeão | concluído | 2026-11-18 20:37 |
| 3 | testes | concluído | 2026-11-18 20:37 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: chave validada de 4 a 32 jogadores sem partida vazia
- fato: replaceChildren(null) escreve 'null' na tela — filtrar antes

### Respostas-chave do usuário
- "se eu fazer um chaveamento organizado, bem feito, sem muito trabalho, de forma dinâmica, divertida e animada"

### Tentativas que falharam
- 'null' aparecendo no topo do torneio e no placar do speedrun sem recorde mundial

### Arquivos tocados
- js/modules/torneio/{index,logic}.js
- js/modules/torneio/estilo.css
- tests/unit/torneio.test.js
- tests/e2e/torneio.spec.js
- tests/e2e/ajuda.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:37 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:34 — [ativação] SPEC ativada (branch spec/torneio, base main)

## 2026-11-18 20:37 — [nota] verify: 2/2 critérios passaram (commit `16f6cfb`)

- PASS: Geração da chave com byes, avanço, desfazer e campeão estão…
- PASS: Na tela, criar torneio de 6, jogar até o campeão, recarrega…

## 2026-11-18 20:37 — [conclusão] entregue

Aba Torneio entregue. 2/2 critérios verificados; suíte E2E completa (32) passando.
⎿ commit 16f6cfb+dirty · 2 files changed, 26 insertions(+), 12 deletions(-)
