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

## P07 — Mais ideias de tema
- **Objetivo:** ampliar as opções antes de decidir.
- **Prompt:** "Dê mais ideias."
- **Resposta da IA:** listou central de speedrun, show do milhão gamer, "Roda no meu PC?", gerador de campeonato, montador de time Pokémon, diário com Wrapped e navegação por controle de videogame (Gamepad API) como diferencial.
- **Aplicação:** cinco dessas ideias viraram abas do Checkpoint, e o controle virou funcionalidade extra.
- **Adaptações:** o quiz e o montador de time Pokémon ficaram de fora.

## P08 — Juntar várias ferramentas num site só
- **Objetivo:** definir o escopo final.
- **Prompt:** "Gostei muito da central de speedrun... a questão do Roda no meu PC também... uma nova aba, vai ser tipo um site que vai ter várias informações e utilidades."
- **Resposta da IA:** organizou o projeto como um hub com uma aba por ferramenta e mostrou o que era viável sem servidor em cada uma (APIs gratuitas, limites e alternativas).
- **Aplicação:** arquitetura de abas e a lista de funcionalidades da SPEC.
- **Adaptações:** o grupo decidiu fazer todas as abas ("nós temos a capacidade de fazer todas elas, falta 1 semana").

## P09 — Recomps atualizando sozinhos
- **Objetivo:** não cadastrar projetos à mão.
- **Prompt:** "Ter uma área onde vai ter os recomps sempre atualizando... de alguma forma, não sei se seria possível com bot ou com API, sem precisar fazer isso manualmente."
- **Resposta da IA:** usar a API pública do GitHub, buscando vários projetos numa consulta só (para respeitar o limite de 60 pedidos/hora) e guardando cache de 1 hora.
- **Aplicação:** aba Recomps com dados ao vivo e aviso de versão nova para projetos seguidos.
- **Adaptações:** acrescentado um selo de "verificado" e um alerta de golpe para promessas de jogos recentes rodando no PC.

## P10 — Diário com capa automática
- **Objetivo:** registrar jogos sem precisar anexar imagem.
- **Prompt:** "Aí eu pesquiso o nome, aí como vai ter aquela barra de pesquisa lá, que já puxa da wiki, eu já coloco a capa sem precisar anexar."
- **Resposta da IA:** busca na API da Wikipedia (com o parâmetro que libera capas de jogos) e catálogo próprio com capas da Steam.
- **Aplicação:** busca do Diário com resultados do catálogo e da Wikipedia, e resumo em português quando existe.
- **Adaptações:** filtro para tirar da busca personagens, trilhas sonoras e comunidades.

## P11 — Chaveamento divertido
- **Objetivo:** organizar campeonatos pequenos entre amigos.
- **Prompt:** "Se eu fizer um chaveamento organizado, bem feito, sem muito trabalho, de forma dinâmica, divertida e animada."
- **Resposta da IA:** chave de eliminação simples de 4 a 32 jogadores com folgas automáticas, clique no vencedor, desfazer e campeão com confete.
- **Aplicação:** aba Torneio.
- **Adaptações:** a dupla eliminação ficou para uma versão futura.

## P12 — Apresentação no computador da faculdade
- **Objetivo:** garantir que a apresentação funcione em outro PC.
- **Prompt:** "Eu planejo criar um link provavelmente no Cloudflare para a apresentação, e eu botar o link no computador da apresentação e abrir e fazer tudo bonitinho."
- **Resposta da IA:** alertou que os dados ficam no navegador de quem usa e propôs login com sincronização, mantendo o site funcionando sem conta.
- **Aplicação:** login com Google pelo Supabase, com regras de segurança no banco.
- **Adaptações:** Cloudflare Pages ligado ao mesmo repositório do GitHub Pages.

## P13 — Importar a biblioteca da Steam
- **Objetivo:** não precisar cadastrar à mão os jogos do ano.
- **Prompt:** "Teria como fazer alguma sincronização com a Steam? ... quem não quiser ficar adicionando manualmente... pode ter a opção de fazer automático ou manualmente."
- **Resposta da IA:** explicou o que a API da Steam informa (biblioteca, horas totais, última vez, conquistas), o que não informa (horas por ano) e por que precisa de um servidor ajudante para guardar a chave. Também explicou que PlayStation e Xbox só têm APIs não oficiais ou de terceiros, e que ler os jogos instalados no PC exige um programa instalado.
- **Aplicação:** botão "Importar da Steam" no Diário, com tela de revisão, e um Cloudflare Worker que guarda a chave.
- **Adaptações:** "Coisas que não deu pra fazer, você não faz" — o grupo vetou status por suposição. Só fatos viram sugestão (0 h, últimas 2 semanas, 100% das conquistas), e o resto a pessoa escolhe, um por um ou em massa.

## P14 — Identidade de verdade, em três visuais
- **Objetivo:** tirar a cara de "site feito por IA" e criar uma marca.
- **Prompt:** "Quando eu olho para esse site, eu vejo ele ainda com design meio retrógrado... meio cara de IA... a logo não ficou legal, tá parecendo um PNG."
- **Resposta da IA:** em vez de descrever, desenhou três direções completas com telas reais e capas de jogos, cada uma com logo própria: Palco (inspirada no PS5), Joy (no Switch) e Deck (no Steam Deck).
- **Aplicação:** Deck virou o visual padrão (menu lateral, magenta, letras de console e logo hexagonal rosa e branca). Palco e Joy ficaram como opção em Configurações. O tema claro/escuro vale nos três.
- **Adaptações:** "Gostei das três, ficou insano" — o grupo decidiu manter as três como escolha da pessoa, em vez de descartar duas.

## P15 — Sugestões que fazem sentido
- **Objetivo:** parar de sugerir "qualquer coisa".
- **Prompt:** "Agora você está me sugerindo um God of War, Undertale e Celeste. A gente tem que dar uma melhorada nessa sugestão."
- **Resposta da IA:** explicou que, sem notas suficientes, os jogos empatavam e a escolha virava sorteio. Passou a usar a nota real do Metacritic e as recomendações da Steam, o humor como filtro, a semelhança com os jogos bem avaliados e a variedade de gênero.
- **Aplicação:** recomendador v2, com motivos baseados em fatos ("Nota 95 no Metacritic", "Parecido com Hollow Knight, que você deu 5").
- **Adaptações:** o grupo pediu que isso ficasse por último, por ser o mais complexo.

## P05 — Projeto evolutivo
- **Objetivo:** que o site possa crescer depois do trabalho.
- **Prompt:** "Faz um projeto estruturado para evoluir... lançando novas abas, novas atualizações."
- **Resposta da IA:** arquitetura de módulos plugáveis: cada aba é uma pasta e entra no site com uma linha no registro.
- **Aplicação:** js/modules/registry.js e a receita "como criar uma aba nova" no README.
- **Adaptações:** —

## P16 — FPS estimado no "Roda no meu PC?"
- **Objetivo:** dar mais profundidade ao resultado de cada jogo.
- **Prompt:** "Você poderia dar também estimativa de quantos FPS roda. Ele tá dando poucas informações. Coloque mais informações para a pessoa conseguir entender mais a profundidade daquilo."
- **Resposta da IA:** criou uma estimativa de FPS a partir dos requisitos (o recomendado mira cerca de 60 FPS no Alto em 1080p; a placa escala o número, o processador limita o teto e pouca memória tira 15%) e uma página de detalhes por jogo: FPS por qualidade e resolução, comparação peça por peça, o que limita o FPS e qual placa atual resolveria.
- **Aplicação:** seletor de resolução (1080p, 1440p, 4K), FPS na lista e detalhe ao clicar no jogo.
- **Adaptações:** o FPS da lista passou a seguir o nível do selo (antes a lista mostrava "Ultra" num jogo marcado "Alto"), e a sugestão de troca prioriza placas que ainda se vendem.
