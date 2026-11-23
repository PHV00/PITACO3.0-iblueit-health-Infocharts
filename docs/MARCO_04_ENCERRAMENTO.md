# Marco 04 — Encerramento técnico: Health InfoCharts / PITACO 3.0

**Data do registro:** 23/11/2026  
**Estado:** escopo frontend implementado, CI/CD aprovado; funcionamento das duas telas confirmado pelo responsável do projeto.  
**Repositório:** `PHV00/iblueit-health-Infocharts`  
**Branch consolidada antes deste registro:** `main`, commit `efbdeb52b1297b25917cce6a56712e33fd834bbf`  
**Backend correspondente:** https://github.com/PHV00/iblueit-server-side

## Escopo fechado

Foram preservadas as telas originais do I Blue It e ampliadas **apenas**:

1. **Resultados** (`/plataforma/resultados`): escolha do dispositivo PITACO 3.0, execução, quatro modalidades (fluxo, BPM, SpO₂ DEMO e PPG RED/IR), qualidade técnica e sobreposição opcional de referências.
2. **Comparativos** (`/plataforma/comparativo`): pico respiratório e evolução histórica de BPM e SpO₂ DEMO por execução; filtros por fase/nível e referência opcional.

A página de **Informações gerais** foi mantida fora do escopo.

## Padrão arquitetural consolidado

```text
pages/platform/results ou comparative
    |
    |-- componentes React/MUI (seletor, filtros, gráficos)
    |-- services/api/pitaco3.js (Axios + GameToken)
    |-- services/pitaco3Data.js (adaptadores e decimação de exibição)
    |-- services/pitaco3References.js (faixas de referência)
    '-- components/platform-graph/SharedLineChart.jsx (Recharts)
                    |
              Azure Functions
                    |
               MongoDB Atlas
```

A SPA existente em React/Material UI permanece. O motor gráfico é **Recharts** nas telas antigas e novas. O `CalibrationGraph` legado usa `AreaChart/Area`; o `SharedLineChart` compartilhado usa `ComposedChart/Line` para gráficos das novas séries e comparativos.

## Experiência e desempenho

- Os filtros **Fase**, **Nível**, **Qualidade** e seleção de execução reutilizam o `SelectComponent` do site.
- Legendas de curva são exibidas quando há duas ou mais séries; a identificação das métricas individuais permanece no título.
- `SpO₂ (DEMO)` permanece rotulada como experimental, com visualização gráfica.
- Faixas educativas fixas e opcionais: BPM **60–100 bpm em repouso** e SpO₂ **95–100% como referência genérica de oxímetro validado**. Não são critérios de aprovação do paciente.
- Gráficos de até **500** pontos recebem animação de **320 ms**. Séries densas são desenhadas sem animação.
- Sinais densos (fluxo e RED/IR) são decimados **apenas no desenho** para até **1.200** pontos, buscando manter picos e lacunas; os documentos do MongoDB permanecem completos.
- Cache de até **cinco** execuções consultadas por paciente; troca de paciente invalida o cache.
- O comparativo legado deixou de usar valores aleatórios; utiliza dados reais retornados pela API.

## PRs entregues

- https://github.com/PHV00/iblueit-health-Infocharts/pull/4 — duas telas e gráficos PITACO 3.0
- https://github.com/PHV00/iblueit-health-Infocharts/pull/5 — filtro de dia local/UTC
- https://github.com/PHV00/iblueit-health-Infocharts/pull/6 — estilos, legibilidade e Recharts compartilhado
- https://github.com/PHV00/iblueit-health-Infocharts/pull/7 — filtros, legendas e desempenho

## Verificações

| Verificação | Evidência |
|---|---|
| Jest e build da entrega inicial | https://github.com/PHV00/iblueit-health-Infocharts/actions/runs/45204427936 |
| CI da última refatoração | https://github.com/PHV00/iblueit-health-Infocharts/actions/runs/45227602997 |
| Build/testes/deploy da `main` | https://github.com/PHV00/iblueit-health-Infocharts/actions/runs/45227836897 |
| Verificação funcional | Funcionamento adequado informado pelo responsável em 23/11/2026 |

Páginas publicadas:

- https://iblueit-health-infocharts-cqcfckepc9cma7fq.switzerlandnorth-01.azurewebsites.net/plataforma/resultados
- https://iblueit-health-infocharts-cqcfckepc9cma7fq.switzerlandnorth-01.azurewebsites.net/plataforma/comparativo

Referências e regras dos gráficos: [PITACO3_FRONTEND_REFERENCES.md](PITACO3_FRONTEND_REFERENCES.md).

## Limitações e trabalho posterior

1. SpO₂ permanece **DEMO** e os intervalos visuais são didáticos, não prescrições ou limiares clínicos.
2. Mesmo com decimação e cache, a primeira abertura de uma execução precisa baixar as séries completas; não foi registrado benchmark controlado de latência de produção.
3. O frontend depende do controle de acesso efetivo no backend; `GameToken` ainda não implementa autorização por pessoa dentro de uma conta.
4. O projeto conserva a combinação legada React 16/MUI 5 e seu procedimento de build; uma eventual atualização de dependências deve ocorrer em um esforço separado.

**Conclusão:** Marco 04 **concluído no escopo acordado de integração e visualização**. Este registro consolida evidências e decisões sem introduzir mudanças funcionais nos gráficos.
