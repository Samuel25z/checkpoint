# SPEC-20261118-1956: fundacao

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 19:56
**Ativada:** 2026-11-18 19:59
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** fundacao, base, modulos, design-system, router, storage, catalogo
**Features:** base
**Branch:** spec/fundacao
**Programa:** checkpoint
**Workspace:** —
**Origem:** usuário em 2026-11-18 19:56
**Resumo:** Base modular do Checkpoint: casca do site, sistema de abas plugáveis, visual, tema claro/escuro, armazenamento e catálogo de jogos.

## Objetivo

Criar a fundação sobre a qual todas as abas são construídas: cada aba é um módulo independente registrado em uma linha, o visual (estilo Backloggd com toques de PS5/Switch) é definido por tokens e o armazenamento local é único e versionado. Assim, lançar abas novas no futuro não exige mexer nas existentes.

## Escopo

**DENTRO:**
- index.html semântico com cabeçalho, navegação, <main> e rodapé (Samuel Mota Ramos e Arthur)
- Registro de módulos (js/modules/registry.js): adicionar aba = 1 pasta + 1 linha
- Roteador por hash (#/inicio, #/diario...) com carregamento preguiçoso do módulo
- Tokens de design (css/tokens.css), tema claro/escuro com persistência e respeito a prefers-reduced-motion
- storage.js: LocalStorage com namespace 'checkpoint:', versão de esquema e eventos de mudança (ponto de encaixe do sync)
- Catálogo de jogos (js/games.js) com ~60 jogos: gêneros, etiquetas, duração, requisitos min/rec, trailer
- Componentes de UI reutilizáveis: toast, modal próprio (sem alert/confirm), estados carregando/vazio/erro
- Página Início com atalhos para as abas e painéis que cada módulo preenche
- Servidor de desenvolvimento sem dependências (scripts/serve.mjs) e testes (node --test + Playwright)

**FORA:**
- Conteúdo das abas (SPECs próprias)
- Login (SPEC conta-sync)
- Idioma inglês (SPEC controle-idioma)

## Invariantes

- SEMPRE: uma aba nova entra só criando a pasta do módulo e registrando no registry — nenhuma outra aba é editada
- NUNCA usar alert()/confirm()/prompt() nativos
- NUNCA link ou botão sem efeito visível (href="#", handler vazio, 'em breve')
- SEMPRE todo dado persistido passa por storage.js

## Implementação

HTML/CSS/JS puro com ES modules, sem build, publicável direto no GitHub Pages. js/app.js inicia tema, casca e roteador; cada módulo exporta { id, titulo, icone, rota, montar(el, ctx), desmontar() }. Lógica pura (cálculos) fica em arquivos sem DOM para ser testada com node --test.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| storage (LocalStorage) | chave 'checkpoint:<modulo>:<nome>' → JSON; 'checkpoint:meta:versao' |
| Jogo (catálogo) | id, nome, ano, generos[], etiquetas[], duracaoHoras, plataformas[], requisitos{min,rec}, trailerYoutube, wiki |

## Riscos

- Módulo quebrado derrubar o site — mitigação: roteador captura erro do import e mostra estado de erro só naquela aba
- LocalStorage cheio ou bloqueado — mitigação: storage.js com try/catch e aviso ao usuário

## Sinais de sucesso

- Uma aba de exemplo é adicionada em teste só com pasta + registro e aparece na navegação

## Critério de aceite

- [ ] O registro de módulos carrega todas as abas registradas e uma aba nova entra só por pasta + 1 linha | verify: `node --test tests/unit/registry.test.js`
- [ ] storage.js grava, lê, versiona e emite evento de mudança com namespace checkpoint: | verify: `node --test tests/unit/storage.test.js`
- [ ] Catálogo tem pelo menos 60 jogos válidos (campos obrigatórios, ids únicos, requisitos completos) | verify: `node --test tests/unit/games.test.js`
- [ ] A navegação abre cada aba pelo menu e pela URL (#/rota) sem erro no console, no celular (375px) e no PC (1280px) | verify: `npx playwright test tests/e2e/fundacao.spec.js -g "navegacao"`
- [ ] O tema claro/escuro alterna, persiste ao recarregar e o HTML não tem botão morto nem alert nativo | verify: `npx playwright test tests/e2e/fundacao.spec.js -g "tema"`
- [ ] Checagens estáticas do código passam (sintaxe JS, sem TODO/lorem/href=#/alert) | verify: `npm run lint`
