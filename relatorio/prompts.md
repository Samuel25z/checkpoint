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

## P05 — Projeto evolutivo
- **Objetivo:** que o site possa crescer depois do trabalho.
- **Prompt:** "Faz um projeto estruturado para evoluir... lançando novas abas, novas atualizações."
- **Resposta da IA:** arquitetura de módulos plugáveis: cada aba é uma pasta e entra no site com uma linha no registro.
- **Aplicação:** js/modules/registry.js e a receita "como criar uma aba nova" no README.
- **Adaptações:** —
