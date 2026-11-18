# CONSTITUTION.md — princípios do projeto

> Orçamento-alvo: ≤2.400 bytes. Princípios INEGOCIÁVEIS que valem para TODA SPEC.
> Entrada nova = decisão humana explícita. Gotcha citado por ≥3 SPECs pode ser promovido para cá no fechamento (docs/rules/lifecycle.md).
> Formato: `- P-<n> — princípio em 1-2 linhas (origem, YYYY-MM-DD)`

## Princípios

- P-1 — HTML, CSS e JavaScript puro com ES modules, sem build; o repositório publica direto no GitHub Pages (exigência da disciplina, 2026-11-18)
- P-2 — Cada aba é um módulo plugável: aba nova = pasta em js/modules/ + 1 linha no registry; nunca editar outra aba para lançar uma nova (entrevista, 2026-11-18)
- P-3 — Zero botão morto e nenhum alert/confirm nativo; toda tela tem estados carregando, vazio, erro e sucesso, no celular e no PC (do-zero-ao-100, 2026-11-18)
- P-4 — Só APIs gratuitas sem chave secreta; a chave anon do Supabase é a única chave pública no código; nenhum segredo no repositório (entrevista, 2026-11-18)
- P-5 — Nunca linkar ROM, ISO ou jogo pirata; recomps apontam só para o projeto oficial (entrevista, 2026-11-18)
- P-6 — Animação suave e curta, sempre desligada com prefers-reduced-motion; nada que trave (entrevista, 2026-11-18)
- P-7 — Git: um commit por SPEC concluída com trailer Spec:, push para origin/main, nunca push forçado (entrevista, 2026-11-18)
