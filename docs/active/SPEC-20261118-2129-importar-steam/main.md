# SPEC-20261118-2129: importar steam

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 21:29
**Ativada:** 2026-11-18 21:29
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** steam, importar, biblioteca, conquistas, worker
**Features:** diario
**Branch:** spec/importar-steam
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-18 21:29
**Resumo:** Importar a biblioteca da Steam para o Diário só com fatos (horas, última vez, conquistas), com tela de revisão onde a pessoa decide o status.

## Objetivo

Quem joga na Steam não precisa cadastrar jogo por jogo: cola o link do perfil e o Checkpoint traz a biblioteca com horas e conquistas. Nada é chutado: o site só sugere status quando a Steam informa um fato, e o resto a pessoa escolhe.

## Escopo

**DENTRO:**
- Servidor ajudante (Cloudflare Worker) que guarda a chave da Steam e repassa: perfil, jogos (horas, última vez, últimas 2 semanas) e conquistas
- Botão "Importar da Steam" no Diário: colar link do perfil, id ou nome
- Tela de revisão: fatos de cada jogo, status sugerido só por fato, escolha em massa, jogos já no diário marcados
- Sugestões por fato: 0 h → Quero jogar; jogou nas últimas 2 semanas → Jogando; 100% das conquistas → Platinado com data da última conquista
- Reimportar atualiza horas dos jogos que vieram da Steam sem mexer no status escolhido
- Sem servidor configurado: botão explica que a importação não está ligada

**FORA:**
- Horas por ano (a Steam não informa)
- "Provavelmente zerou" por suposição
- PlayStation, Xbox e leitura dos jogos instalados no PC (precisam de outra solução)

## Invariantes

- NUNCA a chave da Steam no site ou no repositório (só no segredo do Worker)
- NUNCA status chutado: sem fato, sem sugestão
- NUNCA duplicar jogo que já está no diário

## Implementação

servidor/steam-worker (Cloudflare Worker, sem dependências) com rotas /perfil, /jogos e /conquistas, CORS só para o site e localhost. js/services/steam.js chama o Worker; js/modules/diario/steam.js tem a lógica pura (fatos → sugestão, duplicados, conversão em registro) e a tela de revisão.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| Registro do diário | ganha `origem: 'steam'`, `steamAppId`, `ultimaVez` |

## Riscos

- Perfil privado na Steam — mitigação: mensagem explicando como deixar "Detalhes do jogo" público
- Limite de pedidos da Steam — mitigação: conquistas só sob demanda para jogos com horas, em lotes

## Sinais de sucesso

- Uma biblioteca de dezenas de jogos entra no diário em menos de um minuto, sem nenhum status inventado

## Critério de aceite

- [ ] Sugestões só por fato, conversão para registro, duplicados e reimportação estão corretos | verify: `node --test tests/unit/steam.test.js`
- [ ] Worker resolve perfil, lista jogos, resume conquistas, esconde a chave e só aceita origens permitidas | verify: `node --test tests/unit/steam-worker.test.js`
- [ ] Na tela, colar o perfil, revisar, escolher status em massa e importar sem duplicar; sem servidor explica que não está ligado | verify: `npx playwright test tests/e2e/steam.spec.js`
- [ ] Importação real com a chave e o perfil do Samuel conferida | evidence: manual @samuel