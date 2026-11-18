# Feature: wrapped

**Keywords:** wrapped, resumo-anual, estatisticas, stories, card, canvas
**Arquivos principais:**
  - js/modules/wrapped/logic.js
  - js/modules/wrapped/index.js
**Resumo:** Resumo do ano a partir do diário em telas animadas estilo stories, com perfil divertido e card PNG para postar.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-wrapped | 2026-11-18 | `b6cf932` | Wrapped do ano
### Planejadas (future/)

## Estado atual
estatisticas(diario, ano, catalogo) → {jogos, zerados, platinados, horas, dias, maisJogado, melhorNota, mediaNotas, genero, plataforma, mes, capasZerados, perfil}. Rota #/wrapped/<ano>. Card gerado em canvas 1080×1920 (só texto).

## Decisões arquiteturais ativas
- DEC-20261118-2044-wrapped-card-texto [ativa] (SPEC-20261118-1956-wrapped) — card PNG sem imagens externas para o canvas não ser bloqueado (CORS)

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-wrapped | camadas de toque invisíveis cobrindo botões (2026-11-18 20:44) — esconder a camada quando a tela tem ações
