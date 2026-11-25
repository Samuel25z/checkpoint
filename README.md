# Checkpoint

**Site no ar: [https://samuel25z.github.io/checkpoint/](https://samuel25z.github.io/checkpoint/)**

O Checkpoint é um hub de utilidades para quem joga. Ele junta num lugar só:

| Aba | O que faz |
|---|---|
| **Diário** | Registra o que você joga, zera e quer jogar. A capa e o resumo vêm sozinhos da Wikipedia. |
| **Meu perfil** | Cartão de visitas do jogador: capa com o jogo coroado, foto e banner (arquivo ou link, GIF aceito), nível e XP, números, 5 favoritos, medalhas de bronze a ouro, gráfico das notas, radar de gêneros, mapa de atividade e destaques, tudo calculado do Diário. |
| **Wrapped** | Mostra o seu ano em jogos em telas animadas, no estilo Spotify, e gera um card para postar. |
| **Speedrun** | Mostra os recordes mundiais ao vivo do speedrun.com e tem um cronômetro com splits, recorde pessoal e modo foco. |
| **Recomps** | Catálogo de recomps e ports de código aberto, atualizado direto do GitHub, com alerta de golpe. |
| **Roda no PC?** | Detecta a placa de vídeo pelo navegador e diz em que qualidade e com quantos FPS (estimados) cada jogo roda, em 1080p, 1440p ou 4K, com o detalhe peça por peça. |
| **Torneio** | Monta a chave de um campeonato de 4 a 32 jogadores, com animação de campeão. |
| **Recomenda** | Responde "que jogo eu jogo hoje?" sem IA, explicando o motivo de cada sugestão. |
| **Almanaque** | O livro dos recordes dos games: todos os Jogos do Ano (indicados e vencedores), recordes de speedrun ao vivo, mais vendidos, mais jogados, "neste dia" e curiosidades com fonte. Os dados se atualizam sozinhos toda semana. |

Também tem tema claro e escuro, idioma inglês, navegação por controle de videogame, login com Google opcional e funciona no celular, no tablet e no PC.

Trabalho da disciplina **Desenvolvimento de Interfaces (HTML, CSS e JavaScript)**, UniCEUB Asa Norte, 2026. Feito por **Samuel Mota Ramos e Arthur**.

> O Checkpoint não hospeda nem distribui jogos. Recomps e ports usam a sua cópia original do jogo.

## Entrega da atividade

- Site no ar: [samuel25z.github.io/checkpoint](https://samuel25z.github.io/checkpoint/)
- Vídeo de demonstração: [relatorio/Video-Checkpoint.mp4](relatorio/Video-Checkpoint.mp4)
- Relatório (com o Apêndice A, histórico de prompts): [relatorio/Relatorio-Checkpoint.docx](relatorio/Relatorio-Checkpoint.docx)
- Apresentação: [relatorio/Apresentacao-Checkpoint.pptx](relatorio/Apresentacao-Checkpoint.pptx)
- Registro dos prompts: [relatorio/prompts.md](relatorio/prompts.md)

## Como rodar

O site é HTML, CSS e JavaScript puro, sem etapa de build. Precisa só do [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install
npm run dev
```

Abra [http://localhost:5173](http://localhost:5173).

Testes:

```bash
npm test          # lógica (node --test)
npm run e2e       # ponta a ponta no celular e no PC (Playwright)
npm run lint      # checagens do código
```

## Como publicar

- **GitHub Pages:** cada `git push` na branch `main` atualiza o site sozinho (Settings → Pages → branch `main`, pasta `/`).
- **Cloudflare Pages (opcional):**
  1. No painel da Cloudflare, crie um projeto Pages ligado a este repositório.
  2. Deixe o comando de build vazio e use `/` como pasta de saída.

## Dados do Almanaque (atualizam sozinhos)

O arquivo `js/data/almanaque.json` é montado por `scripts/atualizar-almanaque.mjs` a partir do Wikidata (prêmios e lançamentos), da Wikipedia (mais vendidos) e da Steam (mais jogados). O GitHub Actions (`.github/workflows/almanaque.yml`) roda o script toda segunda-feira e publica se algo mudou. Para rodar na mão: `node scripts/atualizar-almanaque.mjs`. As curiosidades escritas à mão ficam em `js/data/curiosidades.js` (uma por item, sempre com fonte).

## Como criar uma aba nova

1. Crie a pasta `js/modules/minha-aba/` com dois arquivos: `index.js` e `estilo.css`.
2. O `index.js` exporta a aba:

   ```js
   import { h, usarEstilo, cabecalho } from '../../core/ui.js';

   export default {
     montar(el, ctx) {
       usarEstilo('js/modules/minha-aba/estilo.css');
       el.append(cabecalho('Minha aba', 'O que ela faz em uma frase.'));
     },
     painelInicio(ctx) { return null; } // opcional: um resumo na página Início
   };
   ```

3. Acrescente **uma linha** em `js/modules/registry.js`:

   ```js
   { id: 'minha-aba', titulo: 'Minha aba', icone: 'bandeira', rota: 'minha-aba', carregar: () => import('./minha-aba/index.js') },
   ```

4. Para a aba ter inglês, acrescente as frases dela no dicionário `EN` de `js/core/i18n.js`. O teste `npm test` avisa se faltar alguma.

Nenhuma outra aba precisa ser alterada. O `ctx` entrega `storage` (salvar dados), `irPara` (navegar), `toast` (avisos) e `registro`.

## Estrutura

```
index.html
css/          tokens.css (cores e fontes) e style.css (casca e componentes)
js/
  app.js      liga tudo: tema, menu, roteador, conta, controle e idioma
  storage.js  único ponto de leitura e escrita (LocalStorage)
  games.js    catálogo de 65 jogos (requisitos, etiquetas, capas)
  config.js   chaves públicas do Supabase (opcional)
  core/       roteador, componentes, ícones, conta, sincronização, idioma, controle
  services/   Wikipedia, speedrun.com, GitHub
  modules/    uma pasta por aba (index.js = tela, logic.js = regras testadas)
tests/        unit/ (node --test) e e2e/ (Playwright)
docs/         especificações (SPECs), decisões e histórico do projeto
relatorio/    relatório, registro de prompts e capturas de tela
supabase/     script do banco para o login
```

## Login com Google (opcional)

Sem configuração, o site salva tudo no navegador. Para ligar o login e a sincronização entre aparelhos:

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o arquivo `supabase/migracao.sql`. Ele cria a tabela e as regras que deixam cada usuário ver só os próprios dados.
3. Em **Authentication → Providers → Google**, ative o Google com o Client ID e o Client Secret criados no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
4. Em **Authentication → URL Configuration**, coloque o endereço do site em **Site URL** e em **Redirect URLs**.
5. Copie a **Project URL** e a chave **anon public** (em Settings → API) para `js/config.js`.

A chave anon é pública por natureza. Quem protege os dados são as regras de segurança do banco.

## Importar da Steam (opcional)

O botão **Importar da Steam** do Diário traz a biblioteca com horas e conquistas. Ele só sugere status por fatos:
- **Quero jogar:** 0 h.
- **Jogando:** jogou nas últimas 2 semanas.
- **Platinado:** 100% das conquistas.

O resto a pessoa escolhe. A chave da Steam fica num ajudante (Cloudflare Worker), nunca no site.

1. Crie a chave grátis em [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey). No campo de domínio pode pôr `samuel25z.github.io`.
2. Publique o ajudante (precisa de uma conta grátis da Cloudflare):

   ```bash
   cd servidor/steam-worker
   npx wrangler login
   npx wrangler secret put STEAM_KEY
   npx wrangler deploy
   ```

   O `secret put` pede a chave do passo 1.
3. Copie o endereço que o `deploy` mostrar (algo como `https://checkpoint-steam.<seu-usuario>.workers.dev`) para `STEAM_AJUDANTE` em `js/config.js`.

Quem for importar precisa deixar o perfil e os **Detalhes do jogo** como públicos na Steam. A Steam não informa horas por ano, então o Checkpoint mostra as horas totais de cada jogo.

## Créditos

- Capas e resumos: [Wikipedia](https://www.wikipedia.org) e Steam.
- Recordes: [speedrun.com](https://www.speedrun.com).
- Projetos: [GitHub](https://github.com).
- Fontes: Unbounded e Figtree, do Google Fonts.
