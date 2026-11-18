# Feature: recomps

**Keywords:** recomps, ports, decomp, github, releases, golpe
**Arquivos principais:**
  - js/modules/recomps/index.js
  - js/modules/recomps/logic.js
  - js/services/github.js
**Resumo:** Catálogo vivo de recomps/ports do GitHub com selo de verificado, alerta de golpe e aviso de versão nova para projetos seguidos.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-recomps | 2026-11-18 | `7463bf6` | Catálogo de recomps e ports do GitHub
### Planejadas (future/)

## Estado atual
Lista VERIFICADOS em logic.js (adicionar projeto = 1 linha). Seguidos em storage 'recomps:seguidos' {repo: ultimaTagVista}. Cache das respostas em 'cache:github:<url>' por 1h; sem rede usa cache antigo; 403/429 vira LimiteGitHub com horário de volta. Rota #/recomps/<termo> já busca.

## Decisões arquiteturais ativas
- DEC-20261118-2031-recomps-verificados [ativa] (SPEC-20261118-1956-recomps) — selo e link 'Página oficial' só para a lista conferida; suspeitos sem link
- DEC-20261118-2031-github-consulta-unica [ativa] (SPEC-20261118-1956-recomps) — todos os verificados numa busca com vários repo: para caber no limite de 60/h

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-recomps | limite de 60 pedidos/hora do GitHub sem chave (2026-11-18 20:31) — cache de 1h no storage e versão só sob demanda ou para seguidos
