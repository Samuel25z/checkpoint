# Feature: hardware

**Keywords:** hardware, requisitos, gpu, cpu, webgl, pc, desempenho, fps, resolucao, upgrade
**Arquivos principais:**
  - js/modules/roda-no-pc/logic.js
  - js/modules/roda-no-pc/detect.js
  - js/data/hardware.js
  - js/games.js
**Resumo:** 'Roda no meu PC?': reconhece a GPU pelo navegador, compara com requisitos do catálogo e classifica de 'não roda' a 'ultra' com o gargalo.

## Specs desta feature
### Concluídas
- SPEC-20261120-1907-roda-fps | 2026-11-20 | `32eb688` | FPS estimado e detalhe por jogo
- SPEC-20261120-1629-hardware-completo | 2026-11-20 | `135fedb` | Base grande de peças e caixa de escolha
- SPEC-20261118-1956-roda-no-pc | 2026-11-18 | `ef298ae` | Roda no meu PC?
### Planejadas (future/)

## Estado atual
PCs em storage 'hardware:pcs' [{id,nome,cpu,gpu,ram}] e 'hardware:pcAtual'. Pontuações relativas em js/data/hardware.js; peça nova = 1 linha lá. classificar(pc, requisitos) → {nivel, gargalo, folga}.

### Delta de estado (SPEC-20261120-1629-hardware-completo, 2026-11-20 16:35)
Peça nova = 'Modelo:pontos' na família de js/data/hardware.js. combobox({name, opcoes, valor, placeholder, rotulo}) devolve elemento com .input para FormData; filtra por partes em qualquer ordem; Esc fecha só a lista.

### Delta de estado (SPEC-20261120-1907-roda-fps, 2026-11-20 19:14)
estimarFps: 60 × (gpu/gpuRec) × qualidade(1,6/1,25/1/0,75) × resolução(1/0,65/0,35), limitado por 84 × (cpu/cpuRec), ×0,85 se RAM < rec, teto 240. Resolução salva em hardware:resolucao. placaPara60 prefere RTX 30+/RX 6000+/Arc.

## Decisões arquiteturais ativas
- DEC-20261120-1914-roda-fps-base [ativa] (SPEC-20261120-1907-roda-fps) — recomendado mira ~60 FPS no Alto em 1080p; FPS sempre com ~ e explicação da conta
- DEC-20261118-2034-classificacao-por-razao [ativa] (SPEC-20261118-1956-roda-no-pc) — pior razão PC/recomendado define o nível (<0,75 baixo, <1 médio, <1,6 alto, senão ultra); <0,9 do mínimo = não roda

- DEC-20261120-1635-combobox-proprio [ativa] (SPEC-20261120-1629-hardware-completo) — combobox próprio com role=combobox/listbox no lugar de datalist

## Alternativas consideradas e rejeitadas


## Gotchas
- SPEC-20261118-1956-roda-no-pc | estilos compartilhados presos numa aba (sr-busca, capa-mini) (2026-11-18 20:34) — componente usado por 2+ abas vai para css/style.css
- SPEC-20261120-1629-hardware-completo | setTimeout no blur que fecha lista (2026-11-20 16:35) — cancelar o timer ao reabrir/focar
- SPEC-20261120-1629-hardware-completo | teste comparando duas runs cronometradas (2026-11-20 16:35) — fazer a run 'pior' esperar bem mais
- SPEC-20261120-1907-roda-fps | FPS da lista x selo (2026-11-20 19:14) — mostrar o FPS na qualidade do nível, senão a lista se contradiz
