# Feature: conta

**Keywords:** conta, login, supabase, sincronizacao, rls, remocoes
**Arquivos principais:**
  - js/core/conta.js
  - js/core/sync.js
  - supabase/migracao.sql
  - js/config.js
**Resumo:** Login Google via Supabase e sincronização item a item com marcas de remoção; site funciona sem login e limpa o navegador ao sair.

## Specs desta feature
### Concluídas
- SPEC-20261118-1956-conta-sync | 2026-11-25 | `b1ccb2c` | Login e sincronização entre aparelhos
- SPEC-20261118-2106-revisao-final | 2026-11-18 | `98d751a` | Correções da revisão cética
### Planejadas (future/)

## Estado atual
Sincroniza: diario:jogos, diario:atividades, speedrun:rotas, torneio:lista, hardware:pcs, recomps:seguidos, recomendador:respostas e sync:removidos. Listas mesclam por id (atualizadoEm) sempre; exclusões viram marcas em sync:removidos; demais chaves: primeiro login junta, depois vence a mais recente. Sair envia pendências e limpa as chaves sincronizáveis do navegador. Configuração em js/config.js (vazia = sem login). SPEC conta-sync segue pausada aguardando a conta real do Samuel.

### Delta de estado (SPEC-20261118-1956-conta-sync, 2026-11-25 16:57)
Login ligado em produção. Chave anon pública em js/config.js. Recuperação de senha volta ao site e abre 'Criar senha nova' (evento PASSWORD_RECOVERY). Plano grátis manda poucos e-mails por hora.

## Decisões arquiteturais ativas
- DEC-20261118-2110-sync-por-item-com-remocoes [ativa] (SPEC-20261118-2106-revisao-final) — mescla por id em toda sincronização + marcas de remoção sincronizadas; relógio adiantado só afeta edição do MESMO item
- DEC-20261118-2110-sair-limpa-navegador [ativa] (SPEC-20261118-2106-revisao-final) — ao sair, dados sincronizáveis saem do navegador (PC compartilhado da faculdade)

- DEC-20261125-1657-conta-email-e-google [ativa] (SPEC-20261118-1956-conta-sync) — e-mail e senha + Google; senha mínima de 8 no site
- DEC-20261125-1657-conta-grant-authenticated [ativa] (SPEC-20261118-1956-conta-sync) — sem grant automático; grant explícito só para authenticated

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-2106-revisao-final | login de outra pessoa no mesmo navegador (2026-11-18 21:10) — nunca mesclar dados locais de um usuário anterior; sair limpa o navegador
- SPEC-20261118-1956-conta-sync | config real nos testes (2026-11-25 16:57) — testes de tela simulam config.js; quem testa a conta passa manterConfig
- SPEC-20261118-1956-conta-sync | chaves no chat (2026-11-25 16:57) — senha do banco e Client Secret apareceram na conversa: trocar depois da apresentação
