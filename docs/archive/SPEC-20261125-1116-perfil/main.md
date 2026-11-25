# SPEC-20261125-1116: perfil

**Status:** done
**Porte:** M
**Owner:** @samuel25z
**Criada:** 2026-11-25 11:16
**Ativada:** 2026-11-25 11:16
**Concluída:** 2026-11-25 11:25
**Pausada em:** —
**Commit final:** `53ecf38`
**Keywords:** perfil, favoritos, estatisticas, medalhas, nivel, mapa-de-atividade, generos
**Features:** perfil
**Branch:** spec/perfil
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 11:16
**Resumo:** Aba Meu Perfil, inspirada no Your Gamer Profile: capa, nível, números, 5 favoritos com 1 coroado, estatísticas visuais e medalhas, tudo calculado do Diário e sem precisar de login.

## Objetivo

O Samuel pediu para analisar o yourgamerprofile.com e trazer o que é bom. Aprovou começar pelo perfil do jogador ("Pode começar por ela"): capa, números, favoritos com coroa, estatísticas (notas, gêneros, atividade, destaques) e medalhas com nível. Quando o login estiver ligado, essa tela vira o perfil público para amigos.

## Escopo

**DENTRO:**
- Capa com a arte do jogo coroado, avatar (iniciais), nome, frase, nível com barra de XP, título do nível e "desde"
- Números: jogos, finalizados, platinados, horas, nota média
- 5 jogos favoritos escolhidos do Diário, 1 coroado em destaque; jogos recentes
- Estatísticas: resumo do ano, distribuição das notas, radar dos gêneros, mapa de atividade dos últimos 90 dias, destaques (plataforma mais jogada, tempo médio, % platinados)
- Medalhas bronze/prata/ouro calculadas do Diário, com progresso até a próxima
- Editar perfil (nome, frase, favoritos e coroa) em janela própria
- Inglês, celular, visuais Deck/Palco/Joy

**FORA:**
- Seguir amigos, perfil público, feed e curtidas (dependem do login: SPEC conta-sync)
- Status "Pausado" no Diário (mudança separada)
- Foto enviada pela pessoa (avatar fica nas iniciais)

## Invariantes

- SEMPRE tudo é calculado do Diário; o perfil só guarda nome, frase, favoritos e coroa
- NUNCA medalha ou número inventado: sem dado, mostra estado vazio que leva ao Diário

## Implementação

Módulo js/modules/perfil/ (index.js, logic.js, estilo.css) + 1 linha no registry. Preferências em storage 'perfil:dados' { nome, frase, favoritos: [registroId], coroado }. Gêneros vêm do catálogo (jogoId ou nome). Gráficos em SVG/CSS puro.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| perfil:dados (LocalStorage) | { nome, frase, favoritos: [id do registro do Diário, até 5], coroado: id } |

## Riscos

- Diário vazio deixa a tela pobre — mitigação: estados vazios com convite para o Diário
- Favorito apagado do Diário — mitigação: ignorar ids que não existem mais

## Sinais de sucesso

- O Samuel abre o perfil e sente que é o "cartão de visitas" dele de jogador

## Critério de aceite

- [x] números, nível, medalhas, gêneros, notas e mapa de atividade calculados e testados (2026-11-25 11:25, commit `53ecf38`, verify: exit 0) | verify: `node --test tests/unit/perfil.test.js`
- [x] tela do perfil com edição, favoritos, coroa e estados vazios no PC e celular (2026-11-25 11:25, commit `53ecf38`, verify: exit 0) | verify: `npx playwright test tests/e2e/perfil.spec.js`
