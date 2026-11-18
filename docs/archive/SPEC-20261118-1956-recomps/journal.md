# Journal — SPEC-20261118-1956

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-18 20:31
**Onde tô:** recomps entregue: 16 verificados numa consulta só, busca livre, alerta de golpe, seguir projeto com aviso de versão nova, cache de 1h e tela de limite
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** só projetos da lista VERIFICADOS recebem selo e link; busca livre marca 'não verificado' e esconde link de projeto suspeito
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/recomps.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica e lista verificada | concluído | 2026-11-18 20:31 |
| 2 | serviço GitHub com cache e limite | concluído | 2026-11-18 20:31 |
| 3 | tela | concluído | 2026-11-18 20:31 |
| 4 | testes | concluído | 2026-11-18 20:31 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: busca por 'zelda' no GitHub traz 'totk-pc-recomp' com 7,6 mil estrelas — padrão de golpe
- fato: API de busca aceita vários repo: numa consulta só (15+ projetos em 1 pedido)

### Respostas-chave do usuário
- "se eu precisar do Donkey Kong Bananza, vai aparecer os recomps..." — resposta: não existe; o site avisa e marca promessas assim como suspeitas

### Tentativas que falharam


### Arquivos tocados
- js/modules/recomps/{index,logic}.js
- js/modules/recomps/estilo.css
- js/services/github.js
- tests/unit/recomps.test.js
- tests/e2e/recomps.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-18 20:31 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-18 20:31 — [ativação] SPEC ativada (branch spec/recomps, base main)

## 2026-11-18 20:31 — [nota] verify: 2/2 critérios passaram (commit `7463bf6`)

- PASS: Normalização dos repositórios, regra de ativo e detecção de…
- PASS: A aba mostra destaques e busca com rede simulada, segue um …

## 2026-11-18 20:31 — [conclusão] entregue

Aba Recomps entregue com dados reais do GitHub, proteção contra golpe e acompanhamento de versões. 2/2 critérios verificados.
⎿ commit 7463bf6+dirty · 2 files changed, 26 insertions(+), 11 deletions(-)
