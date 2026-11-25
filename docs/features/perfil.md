# Feature: perfil

**Keywords:** perfil, favoritos, estatisticas, medalhas, nivel, mapa-de-atividade, generos
**Arquivos principais:**
  - js/modules/perfil/index.js
  - js/modules/perfil/logic.js
**Resumo:** Perfil do jogador com nível, favoritos coroados, medalhas e estatísticas, calculado do Diário e sem login.

## Specs desta feature
### Concluídas
- SPEC-20261125-1116-perfil | 2026-11-25 | `11039c2` | Meu perfil do jogador
### Planejadas (future/)

## Estado atual
Rota #/perfil. Storage perfil:dados {nome, frase, favoritos[ids do diário], coroado}. Medalhas em MEDALHAS (logic.js): medalha nova = 1 item com medir() e 3 níveis. Quando o login ligar, esta tela vira o perfil público.

## Decisões arquiteturais ativas
- DEC-20261125-1125-perfil-do-diario [ativa] (SPEC-20261125-1116-perfil) — perfil não duplica dados: calcula tudo do Diário
- DEC-20261125-1125-perfil-sem-social [ativa] (SPEC-20261125-1116-perfil) — seguir/feed ficam para quando o login estiver ligado

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261125-1116-perfil | radar em SVG (2026-11-25 11:25) — deixar margem no viewBox para os nomes dos gêneros nas pontas
