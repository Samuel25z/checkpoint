# Journal — SPEC-20261120-1907

## SNAPSHOT (sobrescrever — DEVE caber nas primeiras 60 linhas do arquivo)

**Última atualização:** 2026-11-20 19:14
**Onde tô:** Roda no meu PC? com FPS estimado na lista (no nível do selo e na resolução escolhida), seletor 1080p/1440p/4K salvo e detalhe por jogo: tabela qualidade × resolução, peça por peça, quem limita o FPS, qualidade para 60+ e placa atual que resolve
**Próximo passo:** fechar a SPEC e seguir para a próxima do programa (specctl next)
**Última decisão:** recomendado = ~60 FPS no Alto em 1080p; placa escala, processador limita o teto, memória abaixo do recomendado tira 15%; FPS da lista segue o nível do selo para não contradizer
**Bloqueio atual:** nenhum
**Se retomar, ler:** main.md desta SPEC e docs/features/roda-no-pc.md

### Fases
| # | Descrição | Status | Atualizado |
|---|---|---|---|
| 1 | lógica de FPS e testes | concluído | 2026-11-20 19:14 |
| 2 | lista, resolução e detalhe | concluído | 2026-11-20 19:14 |
| 3 | inglês e testes de tela | concluído | 2026-11-20 19:14 |

### Fatos confirmados / Inferências prováveis / Dúvidas em aberto
- fato: i5-12400F + GTX 1660 Super no Cyberpunk: ~48 no Alto 1080p, ~60 no Médio; troca sugerida Intel Arc A580
- fato: jogos leves batem no teto de 240 FPS e aparecem como 240+

### Respostas-chave do usuário
- "Você poderia dar também estimativa de quantos FPS roda. Ele tá dando poucas informações. Coloque mais informações para a pessoa conseguir entender mais a profundidade daquilo"

### Tentativas que falharam
- lista mostrava FPS no Ultra com selo Alto (corrigido: FPS no nível do selo)
- sugestão de troca indicava GTX 1080 antiga (corrigido: placas atuais primeiro)
- texto 'igual ao o recomendado'

### Arquivos tocados
- js/modules/roda-no-pc/logic.js
- js/modules/roda-no-pc/index.js
- js/modules/roda-no-pc/estilo.css
- js/core/i18n.js
- tests/unit/hardware.test.js
- tests/e2e/roda-no-pc.spec.js

### Onde parei
- critérios verificados pela ferramenta; pronto para close

### Sessões (máx 5 linhas + 1 agregada)
- 2026-11-20 19:14 — implementação + verificação

## LOG (append-only — NUNCA editar entradas antigas)
<!-- tipos: ativação descoberta decisão tentativa blocker unblock refactor nota conclusão | entrada nova: specctl log -->

## 2026-11-20 19:07 — [ativação] SPEC criada e ativada (@samuel25z, branch spec/roda-fps, base main)

## 2026-11-20 19:14 — [conclusão] entregue

FPS estimado e detalhe por jogo entregues. 2/2 critérios verificados.
⎿ commit 32eb688+dirty · 6 files changed, 295 insertions(+), 5 deletions(-)
