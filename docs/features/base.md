# Feature: base

**Keywords:** fundacao, casca, registro, router, tema, storage, catalogo, ui
**Arquivos principais:**
  - js/app.js
  - js/modules/registry.js
  - js/core/router.js
  - js/core/ui.js
  - js/storage.js
  - js/games.js
  - css/style.css
**Resumo:** Casca do Checkpoint: abas plugáveis por registro, roteador por hash, tema claro/escuro, storage único com eventos e catálogo de jogos.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-fundacao | 2026-11-18 | `545b89d` | Fundação modular do Checkpoint
### Planejadas (future/)

## Estado atual
Aba nova = js/modules/<id>/index.js (export default { montar(el, ctx), desmontar?, painelInicio? }) + 1 linha em registry.js; CSS da aba em js/modules/<id>/estilo.css via usarEstilo(). ctx = { storage, registro, irPara, toast, params, modulo }. storage grava em 'checkpoint:<nome>' e emite aoMudar (gancho do sync). Catálogo js/games.js: 65 jogos com etiquetas, requisitos (peças de js/data/hardware.js) e appid Steam para capas.

## Decisões arquiteturais ativas
- DEC-20261118-2013-abas-plugaveis [ativa] (SPEC-20261118-1956-fundacao) — abas como módulos registrados em registry.js com import preguiçoso; erro num módulo só afeta a própria aba
- DEC-20261118-2013-css-por-aba [ativa] (SPEC-20261118-1956-fundacao) — cada aba carrega seu CSS da própria pasta; style.css só tem casca e componentes
- DEC-20261118-2013-capas-steam [ativa] (SPEC-20261118-1956-fundacao) — capas do catálogo pela CDN da Steam (library_600x900) e da Wikipedia (pilicense=any) para jogos buscados

## Alternativas consideradas e rejeitadas
- SPEC-20261118-1956-fundacao | framework (React/Vue) — rejeitado: disciplina exige JS puro e sem build

## Gotchas
- SPEC-20261118-1956-fundacao | backdrop-filter cria bloco de contenção para position:fixed (2026-11-18 20:13) — nunca usar backdrop-filter num ancestral de elemento fixo (barra de abas no celular)
- SPEC-20261118-1956-fundacao | âncora interna (#palco) dispara hashchange (2026-11-18 20:13) — router ignora hash que não começa com #/ e só move o foco
