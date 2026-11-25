# TAXONOMY.md — vocabulário canônico de áreas

> Orçamento-alvo: ≤1.600 bytes. Toda feature de `docs/features/` DEVE corresponder a uma área daqui (R.4).
> Área nova = confirmação explícita do usuário (R.13). Namespaces com `/` (ex.: `api/auth`).
> Formato por linha: `- <area> — definição 1 linha (aliases proibidos: x→area)`

## Áreas

- base — casca do site, registro de módulos, roteador, visual, armazenamento, catálogo de jogos, controle e idioma (aliases proibidos: core→base, shell→base)
- diario — diário do jogador com capas da Wikipedia, status, notas e histórico (aliases proibidos: backlog→diario)
- speedrun — ranking do speedrun.com e cronômetro com splits (aliases proibidos: timer→speedrun)
- recomps — catálogo de recomps e ports vindo do GitHub (aliases proibidos: ports→recomps)
- hardware — "Roda no meu PC?": detecção e requisitos (aliases proibidos: requisitos→hardware)
- torneio — chaveamento de campeonatos (aliases proibidos: bracket→torneio)
- recomendador — sugestões de jogos sem IA (aliases proibidos: sugestao→recomendador)
- wrapped — resumo animado do ano (aliases proibidos: retrospectiva→wrapped)
- conta — login Supabase e sincronização (aliases proibidos: login→conta, sync→conta)
- almanaque — livro dos recordes dos games: prêmios de Jogo do Ano, recordes, neste dia e curiosidades (aliases proibidos: guinness→almanaque, curiosidades→almanaque)
- entrega — publicação, README, relatório e slides (aliases proibidos: deploy→entrega)
