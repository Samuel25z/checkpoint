# SPEC-20261124-2318: almanaque

**Status:** active
**Porte:** M
**Owner:** @samuel25z
**Criada:** 2026-11-24 23:18
**Ativada:** 2026-11-24 23:18
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** almanaque, premios, game-awards, recordes, curiosidades, neste-dia, wikidata
**Features:** almanaque
**Branch:** spec/almanaque
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-24 23:18
**Resumo:** Aba Almanaque, um "livro dos recordes" dos games: Hall da Fama dos prêmios de Jogo do Ano, recordes, "neste dia" e curiosidades com fonte, com dados que se atualizam sozinhos toda semana.

## Objetivo

O Samuel quer uma parte do site como os livros de recordes que ele folheava quando criança, só que de games: "quem vai ser o jogo ganhador do ano", "todos os jogos indicados e ganhadores dos anos, desde quando começou", curiosidades legais, e "alguma forma de que as informações vão se atualizando de uma forma sustentável".

## Escopo

**DENTRO:**
- Capa da aba: Fato do Dia (o mesmo para todos no mesmo dia), 4 capítulos e botão "Me surpreenda" (fato aleatório em página cheia, botão "Outro", funciona com controle)
- Capítulo Prêmios: linha do tempo por ano com vencedor e indicados do Jogo do Ano (The Game Awards, BAFTA Melhor Jogo, GDC e D.I.C.E., o que o Wikidata tiver), ranking de quem mais ganhou, adicionar o jogo ao Diário
- Capítulo Recordes: recordes mundiais de speedrun de jogos famosos (ao vivo do speedrun.com), mais jogados na Steam e mais vendidos da história (do arquivo de dados, com data)
- Capítulo Neste Dia: jogos lançados no dia/mês de hoje em anos passados ("há N anos")
- Capítulo Curiosidades: cartões estilo livro dos recordes, parte calculada dos dados e parte de uma base pesquisada, todos com fonte
- Dados em js/data/almanaque.json, gerados por scripts/atualizar-almanaque.mjs (Wikidata, Wikipedia, Steam)
- GitHub Action semanal (e manual) que roda o script e publica se mudou
- Visual do Checkpoint (Deck/Palco/Joy, claro/escuro), inglês, celular

**FORA:**
- Usar a marca "Guinness" ou copiar texto de livros e sites de recordes
- Aba de platina/conquistas (próxima conversa)

## Invariantes

- SEMPRE cada fato mostra a fonte (link) e a data em que o dado foi buscado
- NUNCA a aba fica em branco sem internet: usa o último arquivo de dados salvo
- NUNCA inventar dado: o que não veio da fonte não aparece

## Implementação

Módulo js/modules/almanaque/ (index.js tela, logic.js lógica pura, estilo.css) + 1 linha no registry. Rota com capítulo: #/almanaque/premios etc. O script consulta o SPARQL do Wikidata (P166 prêmio recebido e P1411 indicado, qualificador P585 data), a lista de mais vendidos da Wikipedia e o GetNumberOfCurrentPlayers da Steam, e grava o JSON. Speedrun ao vivo usa js/services/speedrun.js. O Action roda node scripts/atualizar-almanaque.mjs e faz commit só se o JSON mudou.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| js/data/almanaque.json | { geradoEm, premios: [{ id, nome, fonte, anos: [{ ano, vencedor, indicados: [jogo] }] }], jogos: { qid: { nome, steam?, estudio?, ano? } }, maisVendidos: [{ nome, vendas, fonte }], maisJogados: [{ nome, steam, jogadores }], lancamentos: { "MM-DD": [{ nome, ano, qid }] }, curiosidades: [{ id, titulo, texto, fonte, url }] } |

Alternativa rejeitada: buscar tudo ao vivo no navegador (lento, falha, Steam bloqueia CORS). Planilha manual: não é sustentável.

## Riscos

- Wikidata incompleto ou com nome faltando — mitigação: nome em inglês como reserva; prêmio sem dados não aparece
- Script semanal quebrar — mitigação: se a consulta falhar, mantém o JSON anterior (não sobrescreve com vazio)

## Sinais de sucesso

- O Samuel abre o Almanaque, folheia os capítulos e o "Me surpreenda" e tem vontade de continuar, como no livro

## Critério de aceite

- [ ] lógica do almanaque (fato do dia, sorteio, rankings, neste dia, curiosidades calculadas) testada | verify: `node --test tests/unit/almanaque.test.js`
- [ ] script monta o JSON a partir de respostas salvas, sem internet | verify: `node --test tests/unit/almanaque-script.test.js`
- [ ] aba com capa, 4 capítulos, Me surpreenda e controle funciona no PC e celular | verify: `npx playwright test tests/e2e/almanaque.spec.js`
