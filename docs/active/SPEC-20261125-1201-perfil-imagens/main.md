# SPEC-20261125-1201: perfil imagens

**Status:** active
**Porte:** M
**Owner:** @samuel25z
**Criada:** 2026-11-25 12:01
**Ativada:** 2026-11-25 12:01
**Concluída:** —
**Pausada em:** —
**Commit final:** —
**Keywords:** perfil, foto, avatar, banner, gif, link, upload
**Features:** perfil
**Branch:** spec/perfil-imagens
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 12:01
**Resumo:** Foto e banner no Meu perfil, por arquivo (foto reduzida sozinha; GIF com limite de tamanho) ou por link, sem pesar no armazenamento nem na nuvem.

## Objetivo

"Uma coisa que faltou você colocar no perfil é para botar foto e botar banner. E o banner ou a foto pode ser GIF... de preferência GIFs com uma porcentagem muito baixa de megas ou kbytes... E a opção de botar em link, que aí se botar em link não custa para ninguém."

## Escopo

**DENTRO:**
- Foto (avatar) e banner do perfil, cada um por arquivo ou por link https
- Foto JPG/PNG/WebP reduzida no navegador (avatar 256×256, banner 1500×500, WebP)
- GIF aceito sem reduzir, com limite: avatar até 200 KB, banner até 450 KB; acima disso, sugestão de usar link
- Conferência pela assinatura do arquivo (GIF, PNG, JPEG, WebP); SVG e outros recusados
- Remover foto/banner; prévia na edição; banner substitui a arte do jogo coroado; foto substitui as iniciais
- Imagens em chave própria (perfil:imagens) que sincroniza com a conta

**FORA:**
- Hospedar imagens em servidor próprio; recortar imagem na tela

## Invariantes

- SEMPRE o pacote de imagens cabe no limite de 1 MB por linha do banco
- NUNCA aceitar SVG, nem link que não seja https

## Implementação

js/modules/perfil/imagens.js com funções puras (tipoPorAssinatura, validarLink, limites, tamanhoDataUrl) e a redução por canvas na tela. Storage 'perfil:imagens' = { avatar: { origem: 'arquivo'|'link', url }, banner: {...} }. Sync: 'perfil:imagens' em SINCRONIZAVEIS e no check do banco.

### Modelo de dados

| Entidade | Campos / mudança |
|---|---|
| perfil:imagens (LocalStorage e nuvem) | { avatar?: { origem, url }, banner?: { origem, url } } |

## Riscos

- Link que sai do ar — mitigação: se a imagem não carrega, volta para iniciais/arte do jogo
- Armazenamento local cheio — mitigação: limites pequenos e mensagem clara

## Sinais de sucesso

- O Samuel coloca um GIF de banner por link e uma foto do PC, e o perfil fica com a cara dele

## Critério de aceite

- [ ] assinatura de arquivo, limites, links e tamanho testados | verify: `node --test tests/unit/perfil-imagens.test.js`
- [ ] enviar foto, GIF grande recusado, link de banner, remover e persistir funcionam na tela | verify: `npx playwright test tests/e2e/perfil.spec.js`
