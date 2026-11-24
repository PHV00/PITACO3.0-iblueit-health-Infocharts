# Marco Funcional 04 — escopo de análise do portfólio PITACO 3.0

O código de execução deste commit foi restaurado integralmente para o conteúdo do commit `4eea5f6405c54deab47a4278f4ce771bb0c44afb`.

## Escopo SonarQube Cloud

A análise automática utiliza o arquivo `.sonarcloud.properties`, que inclui exclusivamente os componentes React PITACO 3.0, suas páginas integradas, serviços de dados e testes unitários correspondentes.

As exclusões refletem **a fronteira de responsabilidade do portfólio**, e não significam que os módulos legados estejam livres de problemas. Vulnerabilidades críticas conhecidas fora do escopo devem continuar registradas e tratadas pela manutenção do produto, especialmente se afetarem dados pessoais ou as nossas integrações.

A seleção dos arquivos será revisada quando definirmos o inventário de contribuições do portfólio. O build e os testes do GitHub continuam abrangendo o projeto React como um todo.

## Objetivo do rollback

- O merge do PR #11 alterou o tratamento de sessão e exigiu `sessionToken`, ausente na API do backend atual.
- A reversão devolve ao frontend o comportamento previamente validado, sem reintroduzir o refactor transversal.
- Apenas esta documentação e o arquivo de escopo Sonar são novos em relação ao commit funcional de referência.
- A qualidade das nossas features deve ser aferida em PRs pequenos, com rastreabilidade entre arquivos de código, testes e evidências.

## Inventário validado das contribuições — PRs #4 a #7

Em 24/11/2026, foi conferido o histórico dos PRs #4, #5, #6 e #7 do Health InfoCharts. Além do núcleo PITACO 3.0 já incluído, foram identificadas alterações nossas em arquivos legados compartilhados, agora incluídas para análise rastreável:

| Arquivo compartilhado / auxiliar | Origem | Papel da contribuição |
| --- | --- | --- |
| `src/components/device-select/index.js` | PR #4 | Seleção de dispositivo |
| `src/components/platform-graph/comparative/index.js` | PRs #4 e #6 | Integração da visualização comparativa |
| `src/components/select/index.js` | PRs #4 e #6 | Filtros e elementos de seleção |
| `src/services/api/platform.js`, `src/services/api/result.js` | PR #4 | Adaptação de consulta de dados |
| `src/components/date-input/index.js` | PR #6 | Seleção de datas |
| `src/services/chartPresentation.js`, `src/services/chartPresentation.test.js` | PR #7 | Apresentação de séries e seu teste |

**Limitação importante:** o Sonar analisa o arquivo inteiro, e não somente as linhas alteradas pelo PITACO 3.0. Achados nesses caminhos não devem ser atribuídos automaticamente à contribuição nova. Para cada issue, conferir `git diff` dos PRs originais, superfície funcional realmente afetada, severidade e evidência de teste antes de alterar o legado.

Este ajuste modifica apenas o escopo de observação e a documentação; nenhum código React, API ou teste de execução é alterado. O Quality Gate deve ser reavaliado no PR, sem alegar que uma aprovação do Sonar comprova cobertura de testes ou ausência de vulnerabilidades.
