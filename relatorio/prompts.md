# Registro de prompts (Vibe Coding) — Checkpoint

> Fonte do APÊNDICE A do relatório. Cada entrada: objetivo, prompt (como foi dito), resposta resumida da IA, como foi aplicada e adaptações feitas pelo grupo.

## P01 — Escolha do tema
- **Objetivo:** descobrir se o tema era livre e achar algo de jogos que fosse útil.
- **Prompt:** "Eu queria fazer algo relacionado a jogo, algo útil, que mesmo que seja uma apresentação, eu quero que seja funcional."
- **Resposta da IA:** propôs 8 ideias (central de speedrun, quiz, "Roda no meu PC?", chaveamento, Pokémon, diário + Wrapped, catálogo de recomps, recomendador) e o extra de navegação por controle.
- **Aplicação:** o grupo juntou 6 ideias num site só, o Checkpoint, com uma aba para cada.
- **Adaptações:** a ideia inicial de achar jogos craqueados foi trocada por um catálogo legal de recomps/ports de código aberto, depois de a IA explicar o problema de direitos autorais.

## P02 — Recomendador sem custo de IA
- **Objetivo:** recomendar jogos de forma atrativa sem pagar por IA.
- **Prompt:** "Teria que entender como a gente melhoraria essa ideia de ele recomendar, sem ter gasto com IA, pra ele realmente recomendar jogos bons... sendo um trailer, um frame famoso, uma especificação de como é o jogo."
- **Resposta da IA:** sistema de pontuação por etiquetas cruzado com as notas do diário, mostrando trailer e o motivo da indicação.
- **Aplicação:** aba Recomendador.
- **Adaptações:** incluído o botão "outra sugestão" e a sugestão do dia na página inicial.

## P03 — Login em vez de backup
- **Objetivo:** guardar os jogos do ano em qualquer computador.
- **Prompt:** "Eu não quero backup, eu poderia usar login, fazer o login e ter as informações."
- **Resposta da IA:** comparou Supabase, Firebase e Cloudflare; recomendou Supabase com login Google e o site funcionando também sem login.
- **Aplicação:** SPEC conta-sync.
- **Adaptações:** LocalStorage mantido para tema, preferências e uso sem conta (exigência da rubrica).

## P04 — Referência visual
- **Objetivo:** escolher um visual bonito e organizado.
- **Prompt:** "Me dá algumas alternativas de design de aplicativos famosos... eu quero um aplicativo bonito, clean, bem estruturadinho."
- **Resposta da IA:** mostrou Letterboxd, Steam, PS5 e Nintendo Switch, com prints reais do Backloggd e da Steam.
- **Aplicação:** base visual Backloggd com toques de PS5 (carta em foco) e Switch (botões arredondados, tema claro).
- **Adaptações:** "Faz suave" — animações curtas e desligadas para quem prefere menos movimento.

## P06 — Fugir do visual "feito por IA"
- **Objetivo:** deixar a interface com identidade própria.
- **Prompt:** "Eu tô gostando, mas ao mesmo tempo achando genérico, parece todo site que faz assim, você olha e fala: usou IA."
- **Resposta da IA:** apontou o que deixava genérico (pílulas em tudo, cartões iguais, azul padrão, fonte neutra) e propôs uma identidade tirada do mundo dos jogos: cada jogo vira uma caixinha com faixa no topo, fonte de menu de console (Unbounded), cor âmbar própria e filtros como abas de console.
- **Aplicação:** novo sistema visual em css/tokens.css e css/style.css.
- **Adaptações:** "Dá pra melhorar essas partes coloridas" — as faixas passaram de blocos coloridos para um topo preto com filete e ponto na cor do status, deixando a capa em destaque.

## P05 — Projeto evolutivo
- **Objetivo:** que o site possa crescer depois do trabalho.
- **Prompt:** "Faz um projeto estruturado para evoluir... lançando novas abas, novas atualizações."
- **Resposta da IA:** arquitetura de módulos plugáveis: cada aba é uma pasta e entra no site com uma linha no registro.
- **Aplicação:** js/modules/registry.js e a receita "como criar uma aba nova" no README.
- **Adaptações:** —
