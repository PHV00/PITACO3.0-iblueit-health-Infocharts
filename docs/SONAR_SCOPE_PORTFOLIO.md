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
