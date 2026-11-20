# Feature: wrapped

**Keywords:** wrapped, resumo-anual, estatisticas, stories, card, canvas
**Arquivos principais:**
  - js/modules/wrapped/logic.js
  - js/modules/wrapped/index.js
**Resumo:** Resumo do ano a partir do diário em telas animadas estilo stories, com perfil divertido e card PNG para postar.

## Specs desta feature
### Concluídas
- SPEC-20261120-1635-wrapped-periodos | 2026-11-20 | `7c301ec` | Wrapped a qualquer momento
- SPEC-20261118-1956-wrapped | 2026-11-18 | `b6cf932` | Wrapped do ano
### Planejadas (future/)

## Estado atual
estatisticas(diario, ano, catalogo) → {jogos, zerados, platinados, horas, dias, maisJogado, melhorNota, mediaNotas, genero, plataforma, mes, capasZerados, perfil}. Rota #/wrapped/<ano>. Card gerado em canvas 1080×1920 (só texto).

### Delta de estado (SPEC-20261120-1635-wrapped-periodos, 2026-11-20 16:37)
Rotas #/wrapped/<ano>, #/wrapped/30-dias, #/wrapped/tudo. lerPeriodo(id) → {tipo:'ano'|'dias'|'tudo'}; rotuloPeriodo dá 'Seu 2026 até agora' etc. Visual das telas ainda o antigo (aguarda identidade nova).

## Decisões arquiteturais ativas
- DEC-20261118-2044-wrapped-card-texto [ativa] (SPEC-20261118-1956-wrapped) — card PNG sem imagens externas para o canvas não ser bloqueado (CORS)

- DEC-20261120-1637-wrapped-por-periodo [ativa] (SPEC-20261120-1635-wrapped-periodos) — período em vez de só ano; ultimaVez da Steam conta como atividade

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-wrapped | camadas de toque invisíveis cobrindo botões (2026-11-18 20:44) — esconder a camada quando a tela tem ações
