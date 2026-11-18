# Feature: diario

**Keywords:** diario, jogos, capa, wikipedia, status, nota, historico, favoritos
**Arquivos principais:**
  - js/modules/diario/index.js
  - js/modules/diario/logic.js
  - js/modules/diario/dados.js
  - js/services/wikipedia.js
**Resumo:** Diário do jogador: registros com status, nota em meias estrelas, horas, datas, resenha, vídeo e favorito; capa automática; histórico de atividades.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-diario | 2026-11-18 | `70469ce` | Diário do jogador com capas da Wikipedia
### Planejadas (future/)

## Estado atual
Dados em storage 'diario:jogos' (lista de registros) e 'diario:atividades' (últimas 50). Outras abas leem via js/modules/diario/dados.js (lerJogos/salvarJogo). Registro: id, nome, capa, resumo, tituloWiki, tituloPt, jogoId?, ano, status (jogando|zerado|quero|platinado|larguei), plataforma, horas, nota|null, inicio, fim, resenha, video, favorito, criadoEm, atualizadoEm. Rota #/diario/adicionar abre a busca direto.

## Decisões arquiteturais ativas
- DEC-20261118-2021-dados-diario-compartilhados [ativa] (SPEC-20261118-1956-diario) — dados.js é a única porta de escrita do diário; Recomendador/Wrapped/Início só leem por ele

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-diario | Wikipedia pageimages esconde capas não livres (2026-11-18 20:21) — sempre pilicense=any
- SPEC-20261118-1956-diario | dois modais abertos ao confirmar exclusão (2026-11-18 20:21) — nos testes, localizar o diálogo pelo nome
