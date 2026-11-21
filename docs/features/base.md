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
- SPEC-20261121-0014-barra-rolagem | 2026-11-21 | `d13b728` | Barra de rolagem moderna
- SPEC-20261120-1736-identidade-v2 | 2026-11-20 | `eaaf13e` | Identidade v2: Deck, Palco e Joy
- SPEC-20261118-1956-controle-idioma | 2026-11-18 | `8b8f1aa` | Controle de videogame e idioma inglês
- SPEC-20261118-1956-fundacao | 2026-11-18 | `545b89d` | Fundação modular do Checkpoint
### Planejadas (future/)

## Estado atual
Aba nova = js/modules/<id>/index.js (export default { montar(el, ctx), desmontar?, painelInicio? }) + 1 linha em registry.js; CSS da aba em js/modules/<id>/estilo.css via usarEstilo(). ctx = { storage, registro, irPara, toast, params, modulo }. storage grava em 'checkpoint:<nome>' e emite aoMudar (gancho do sync). Catálogo js/games.js: 65 jogos com etiquetas, requisitos (peças de js/data/hardware.js) e appid Steam para capas.

### Delta de estado (SPEC-20261118-1956-controle-idioma, 2026-11-18 20:50)
Preferência 'pref:idioma' (pt|en); trocar recarrega a página. Dicionário EN e padrões em js/core/i18n.js. Controle: BOTOES em gamepad.js (A confirmar, B voltar, X split, LB/RB aba, Start menu, direcional/analógico foco).

### Delta de estado (SPEC-20261120-1736-identidade-v2, 2026-11-20 17:47)
Visual em storage 'pref:visual' (deck|palco|joy) aplicado antes de desenhar (script no index.html) e por aplicarVisual(); fontes por visual carregadas em #fontes-visual. Tokens por [data-visual] e [data-tema]. Deck usa menu lateral fixo a partir de 1000 px. Arte dos jogos: arteDoRegistro(r) → {hero, capa} (Steam).

### Delta de estado (SPEC-20261121-0014-barra-rolagem, 2026-11-21 00:16)
Barra de rolagem: tokens --rolagem/--rolagem-hover em css/style.css; modal com margem no trilho para não cortar o canto.

## Decisões arquiteturais ativas
- DEC-20261118-2013-abas-plugaveis [ativa] (SPEC-20261118-1956-fundacao) — abas como módulos registrados em registry.js com import preguiçoso; erro num módulo só afeta a própria aba
- DEC-20261118-2013-css-por-aba [ativa] (SPEC-20261118-1956-fundacao) — cada aba carrega seu CSS da própria pasta; style.css só tem casca e componentes
- DEC-20261118-2013-capas-steam [ativa] (SPEC-20261118-1956-fundacao) — capas do catálogo pela CDN da Steam (library_600x900) e da Wikipedia (pilicense=any) para jogos buscados

- DEC-20261118-2050-i18n-por-dicionario-na-tela [ativa] (SPEC-20261118-1956-controle-idioma) — tradução aplicada aos nós de texto e atributos (placeholder, aria-label, title) via MutationObserver

- DEC-20261120-1747-visual-x-tema [ativa] (SPEC-20261120-1736-identidade-v2) — visual (marca/casca) e tema (claro/escuro) independentes; 6 combinações testadas
- DEC-20261120-1747-logo-hex-rosa [ativa] (SPEC-20261120-1736-identidade-v2) — logo hexagonal rosa e branca fixa em todos os visuais

- DEC-20261121-0016-barra-rolagem-webkit [ativa] (SPEC-20261121-0014-barra-rolagem) — ::-webkit-scrollbar no Chrome/Edge; scrollbar-width/color só via @supports no Firefox

## Alternativas consideradas e rejeitadas
- SPEC-20261118-1956-fundacao | framework (React/Vue) — rejeitado: disciplina exige JS puro e sem build

## Gotchas
- SPEC-20261118-1956-fundacao | backdrop-filter cria bloco de contenção para position:fixed (2026-11-18 20:13) — nunca usar backdrop-filter num ancestral de elemento fixo (barra de abas no celular)
- SPEC-20261118-1956-fundacao | âncora interna (#palco) dispara hashchange (2026-11-18 20:13) — router ignora hash que não começa com #/ e só move o foco
- SPEC-20261118-1956-controle-idioma | texto novo sem tradução (2026-11-18 20:50) — o teste gamepad-i18n reprova; acrescentar a frase em EN
- SPEC-20261120-1736-identidade-v2 | foco inicial de janela em ação destrutiva (2026-11-20 17:47) — modal foca campo, depois ação primária, nunca .btn-perigo
- SPEC-20261121-0014-barra-rolagem | scrollbar-color no Chrome (2026-11-21 00:16) — desliga o ::-webkit-scrollbar e as setas voltam
