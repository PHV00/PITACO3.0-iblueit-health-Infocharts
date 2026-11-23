# PITACO 3.0 — consistência visual e referências didáticas

## Motivação

As telas Resultados e Comparativos exibem formulários sobre superfícies claras,
enquanto o tema global (que também atende à navegação escura) configura texto
branco. Os novos campos do PITACO 3.0 recebiam essa cor por herança.

## Implementação

- `src/components/select/index.js`: mantém a API do seletor legado, mas define
  explicitamente texto escuro, superfície branca e opções contrastantes.
- `src/components/date-input/index.js`: define contraste do valor digitado sem
  modificar a aparência dos menus escuros.
- `src/components/pitaco3/controlStyles.js`: estilo reutilizável para campos
  `TextField`, aplicado a fases/níveis e campos etários da tela comparativa.
- `src/components/platform-graph/SharedLineChart.jsx`: único componente-base
  com Recharts / `ComposedChart` para gráficos de série temporal PITACO 3.0,
  comparativos fisiológicos e o comparativo legado. O gráfico legado de resultados
  (`CalibrationGraph`) continua `AreaChart`, pois representa outra métrica.
- O componente-base mantém tooltip, legenda, responsividade, eixos, valores nulos
  como lacunas e dados reais retornados pela API. As faixas são
  `ReferenceArea`, não valores artificiais adicionados à série de paciente.

## Referências fixas e limitações

| Série | Faixa ilustrativa | Fonte | Advertência |
|---|---|---|---|
| BPM | 60–100 bpm | American Heart Association | Somente repouso em muitos adultos; não representa limite universal durante exercício |
| SpO₂ | 95–100% | MedlinePlus | Referência de oxímetro validado; **PITACO 3.0 SpO₂ DEMO não foi calibrada** |

- BPM: https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates
- SpO₂: https://medlineplus.gov/lab-tests/pulse-oximetry/

A opção de exibição das faixas é ativada inicialmente e pode ser desligada.
Os números não são editáveis; são exemplos fixos respaldados nas fontes acima.
Não existe lógica de aprovação/reprovação, alertas, diagnóstico ou tratamento.
Uma observação de texto aparece diretamente abaixo de cada gráfico com faixa.

## Validação

- `npm run test -- --watchAll=false` inclui teste de integridade e
  desativação das referências em `src/services/pitaco3References.test.js`.
- `npm run build` deve passar com `CI=true` e o fluxo de CI frontend.
- Verificar em navegador, com conta de teste:
  - seleção de dispositivos, execuções, fase, nível e datas com valores legíveis;
  - curvas comparativas e sinais PITACO 3.0 reais, inclusive ausência de valores;
  - bandas fixas apenas em BPM e SpO₂; nunca em fluxo respiratório ou PPG;
  - ao desmarcar opção, bandas removidas sem afetar dados;
  - SpO₂ DEMO explicitamente identificada.
- A publicação é distinta da validação autenticada E2E: o CI não verifica
  comportamento com dados de pacientes reais no Azure.

Nenhuma alteração foi feita nos endpoints ou modelos do backend.

## Revisão de UX e desempenho (filtros e legendas)

- **Inputs:** Fase, Nível e Qualidade das amostras usam o mesmo `SelectComponent` controlado dos demais filtros do site. Datas continuam no `DateInterval`.
- **Legendas:** títulos informam a métrica; legenda Recharts aparece só com duas ou mais séries (ex.: RED/IR, paciente/coorte). A referência fixa aparece numa linha compacta sob o gráfico, sem avisos repetidos ou links externos no painel.
- **DEMO:** a identificação `SpO₂ (DEMO)` continua visível; as fontes e justificativas da faixa ficam neste documento e em `pitaco3References.js`, não repetidas em cada sessão.
- **Animação:** `CalibrationGraph` legado usa `AreaChart/Area` com animação padrão. O `SharedLineChart` novo usa `ComposedChart/Line`; antes todas as animações estavam desligadas. Agora até 500 pontos ganham transição curta (320 ms); acima disso as curvas são desenhadas sem animação para não comprometer a interação.
- **Dados brutos:** fluxo e PPG usam decimação min/max por blocos de até 1200 pontos *apenas na visualização*, preservando extremos, endpoints e exemplos de lacunas. O MongoDB e o retorno HTTP não são alterados.
- **Troca de execução:** cache de até cinco documentos fisiológicos por paciente evita requisições repetidas de uma execução anteriormente selecionada. Ao mudar de paciente, o cache é descartado.
- **Limitação importante:** transferir uma execução extensa pela rede continua levando tempo. Este ajuste reduz principalmente processamento/desenho no navegador; não substitui um endpoint paginado ou de visualização downsampled caso o volume de sessões cresça.

### Checagens de regressão

`npm run test -- --watchAll=false` cobre duração da animação, faixas fixas, preservação de extremos e lacunas na decimação e compatibilidade dos adaptadores. Revalidar visualmente com conta de teste o histórico, a seleção de dispositivo e as curvas ao trocar entre execuções.
