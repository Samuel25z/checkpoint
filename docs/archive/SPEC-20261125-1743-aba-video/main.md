# SPEC-20261125-1743: aba video

**Status:** done
**Porte:** P
**Owner:** @samuel25z
**Criada:** 2026-11-25 17:43
**Ativada:** 2026-11-25 17:43
**Concluída:** 2026-11-25 17:48
**Pausada em:** —
**Commit final:** `1b4276d`
**Keywords:** video, apresentacao, aba
**Features:** base
**Branch:** spec/aba-video
**Programa:** —
**Workspace:** —
**Origem:** usuário em 2026-11-25 17:43
**Resumo:** Aba Apresentação com o vídeo de demonstração, logo abaixo da Início, para abrir antes de mostrar o site.

## Objetivo

"Quero que você crie uma nova aba no site e anexe o nosso vídeo primário... vai ser mais fácil de abrir o site lá e apresentar o vídeo primeiro, antes de apresentar o site."

## Escopo

**DENTRO:**
- Aba Apresentação com o vídeo (relatorio/Video-Checkpoint.mp4), capa do logo, tela cheia e botão "Ir para o site"
- Lista VIDEOS para trocar pelo vídeo novo se o Samuel aprovar

**FORA:**
- Vídeo novo (feito à parte, se der tempo)

## Invariantes

—

## Implementação

js/modules/video/index.js + estilo.css + 1 linha no registry; capa assets/video-capa.jpg tirada do próprio vídeo.

### Modelo de dados

—

## Riscos

—

## Sinais de sucesso

- O Samuel abre a aba e toca o vídeo em tela cheia na apresentação

## Critério de aceite

- [x] aba mostra o vídeo com capa e leva ao site (2026-11-25 17:48, commit `1b4276d`, verify: exit 0) | verify: `npx playwright test tests/e2e/video.spec.js`
