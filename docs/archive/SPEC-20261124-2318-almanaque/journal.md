# Journal — SPEC-20261124-2318

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-25 00:04
**Onde tô:** aba Almanaque entregue: capa com Fato do Dia e Me surpreenda, capítulos Prêmios (TGA, BAFTA, GDC, D.I.C.E.), Recordes (speedrun ao vivo, mais vendidos, mais jogados), Neste Dia e Curiosidades; dados semanais por GitHub Actions
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** foto dos dados em js/data/almanaque.json atualizada por script semanal; só o speedrun é ao vivo; curiosidades escritas à mão com fonte em js/data/curiosidades.js
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/almanaque.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | fontes de dados e script | concluído | 2026-11-25 00:03 |
| 2 | curiosidades com fonte | concluído | 2026-11-25 00:03 |
| 3 | tela e estilo | concluído | 2026-11-25 00:03 |
| 4 | testes, inglês e robô semanal | concluído | 2026-11-25 00:03 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: Wikidata tem P166/P1411 com P585 para TGA (Q78762377), BAFTA (Q16969671), GDC (Q24956138) e D.I.C.E. (Q56033669)
- fato: rótulos agora podem vir só em 'mul': usar o serviço de rótulos com pt,en,mul
- fato: consulta de lançamentos inteira passa dos 60 s e o WDQS corta a resposta no meio: um mês por consulta
- fato: vendas no Wikidata são pouco confiáveis; a tabela da Wikipedia é a fonte
- fato: ISteamChartsService/GetMostPlayedGames não pede chave

### Respostas-chave do usuário
- "A gente faz uma planilha onde vai ter todos os jogos indicados e ganhadores dos anos, desde quando começou"
- "a gente tem que achar alguma forma de que as informações vão se atualizando de uma forma sustentável"

### Tentativas que falharam
- camada ::after do padrao-hex cobria o texto do Fato do Dia
- falha nos prêmios sobrescrevia a lista de jogos com vazio (corrigido e testado)
- nomes com caractere de controle cru quebravam o JSON do Wikidata

### Arquivos tocados
- js/modules/almanaque/index.js
- js/modules/almanaque/logic.js
- js/modules/almanaque/estilo.css
- js/data/almanaque.json
- js/data/curiosidades.js
- scripts/atualizar-almanaque.mjs
- .github/workflows/almanaque.yml
- js/modules/registry.js
- js/core/icons.js
- js/core/i18n.js
- tests/unit/almanaque.test.js
- tests/unit/almanaque-script.test.js
- tests/e2e/almanaque.spec.js
- README.md
- relatorio/prompts.md

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-25 00:03 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-24 23:18 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/almanaque, base main)

## 2026-11-25 00:03 — [conclusão] entregue

Almanaque entregue. 3/3 critérios verificados.
⎿ commit 737929a+dirty · 6 files changed, 38 insertions(+)

## 2026-11-25 00:04 — [nota] verify: 3/3 critérios passaram (commit `5021b55`)

- PASS: lógica do almanaque (fato do dia, sorteio, rankings, neste …
- PASS: script monta o JSON a partir de respostas salvas, sem inter…
- PASS: aba com capa, 4 capítulos, Me surpreenda e controle funcion…
