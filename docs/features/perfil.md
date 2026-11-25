# Feature: perfil

**Keywords:** perfil, favoritos, estatisticas, medalhas, nivel, mapa-de-atividade, generos
**Arquivos principais:**
  - js/modules/perfil/index.js
  - js/modules/perfil/logic.js
**Resumo:** Perfil do jogador com nível, favoritos coroados, medalhas e estatísticas, calculado do Diário e sem login.

## Specs desta feature
### Concluídas
- SPEC-20261125-1201-perfil-imagens | 2026-11-25 | `4d7bb98` | Foto e banner do perfil
- SPEC-20261125-1116-perfil | 2026-11-25 | `11039c2` | Meu perfil do jogador
### Planejadas (future/)

## Estado atual
Rota #/perfil. Storage perfil:dados {nome, frase, favoritos[ids do diário], coroado}. Medalhas em MEDALHAS (logic.js): medalha nova = 1 item com medir() e 3 níveis. Quando o login ligar, esta tela vira o perfil público.

### Delta de estado (SPEC-20261125-1201-perfil-imagens, 2026-11-25 12:06)
Imagens em 'perfil:imagens' {avatar,banner}: {origem: 'arquivo'|'link', url}. lerImagens() descarta o que não for seguro. Link que falha volta para iniciais/arte do jogo.

## Decisões arquiteturais ativas
- DEC-20261125-1125-perfil-do-diario [ativa] (SPEC-20261125-1116-perfil) — perfil não duplica dados: calcula tudo do Diário
- DEC-20261125-1125-perfil-sem-social [ativa] (SPEC-20261125-1116-perfil) — seguir/feed ficam para quando o login estiver ligado

- DEC-20261125-1206-perfil-imagens-limites [ativa] (SPEC-20261125-1201-perfil-imagens) — GIF até 200/450 KB; maior vai por link; SVG nunca

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261125-1116-perfil | radar em SVG (2026-11-25 11:25) — deixar margem no viewBox para os nomes dos gêneros nas pontas
- SPEC-20261125-1201-perfil-imagens | checar tipo de imagem (2026-11-25 12:06) — conferir a assinatura dos bytes, não a extensão nem o mimeType do navegador
