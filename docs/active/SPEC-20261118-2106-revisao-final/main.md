# SPEC-20261118-2106: revisao final

**Status:** active
**Porte:** M
**Owner:** @samuel
**Criada:** 2026-11-18 21:06
**Ativada:** 2026-11-18 21:06
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** revisao, seguranca, sync, tombstone, links
**Features:** conta
**Branch:** spec/revisao-final
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-18 21:06
**Resumo:** Corrige os achados do revisor cético: vazamento entre contas no PC compartilhado, perda de edição e ressurreição na sincronização, link de downloads para projeto não verificado e links sem http.

## Objetivo

Fechar as lacunas de correção e segurança encontradas pela revisão cética da etapa 7 antes da entrega, com um teste para cada uma.

## Escopo

**DENTRO:**
- Sair da conta limpa deste navegador os dados sincronizáveis (eles continuam na conta); a próxima pessoa não herda nada
- Sincronização mescla por item em toda sincronização (não só na primeira) e registra exclusões (marcas de remoção sincronizadas) para nada voltar
- Dados vindos da nuvem só são aplicados se tiverem o formato esperado
- Recomps: projeto não verificado aponta só para a página do repositório, nunca para downloads
- Links vindos de APIs externas só são aceitos com http/https

**FORA:**
- Foto de jogador por link externo (risco baixo, digitada pelo próprio usuário) — registrado como limite conhecido
- Integridade (SRI) do SDK do Supabase via CDN — registrado como limite conhecido

## Invariantes

- NUNCA dados de uma conta aparecem na conta de outra pessoa que entra no mesmo navegador
- NUNCA um item excluído volta numa sincronização
- NUNCA link de download para projeto não verificado

## Implementação

js/core/sync.js passa a mesclar listas por id com marcas de remoção (chave `sync:removidos`, sincronizada); js/core/conta.js registra remoções comparando os ids antes/depois, limpa os dados ao sair e valida o formato do que vem da nuvem. Funções `httpSeguro` nos conversores de API. Recomps mostra "Ver no GitHub" para não verificados.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| sync:removidos | { chave: { id: removidoEm } } — sincronizada |
| rotas, pcs, torneios | ganham `atualizadoEm` ao salvar |

## Riscos

- Relógio adiantado num aparelho — mitigação: a mescla é por item e une as duas listas; só a edição do MESMO item usa a data

## Sinais de sucesso

- Revisão cética sem achados graves restantes

## Critério de aceite

- [ ] Mescla por item mantém adições feitas em dois aparelhos, respeita marcas de remoção e troca de usuário | verify: `node --test tests/unit/sync.test.js`
- [ ] Links de API sem http/https são descartados e recomps não verificado não aponta para downloads | verify: `node --test tests/unit/recomps.test.js tests/unit/speedrun-api.test.js`
- [ ] Sair da conta limpa o navegador e outra conta que entra não recebe os dados da anterior | verify: `npx playwright test tests/e2e/conta.spec.js`
- [ ] Catálogo de recomps com rede simulada mostra "Ver no GitHub" para não verificado e esconde link de golpe | verify: `npx playwright test tests/e2e/recomps.spec.js`