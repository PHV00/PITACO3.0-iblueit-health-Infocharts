# Marco Funcional 04 — baseline preservada antes das correções de segurança

**Data do congelamento documental:** 24/11/2026.  
**Repositório:** `PHV00/PITACO3.0-iblueit-health-Infocharts`.  
**Commit exato da `main` antes de qualquer alteração de hardening:** [`4eea5f6405c54deab47a4278f4ce771bb0c44afb`](https://github.com/PHV00/PITACO3.0-iblueit-health-Infocharts/commit/4eea5f6405c54deab47a4278f4ce771bb0c44afb).  
**Branch de preservação criada apontando diretamente para esse commit:** [`baseline/marco-funcional-04-2026-11-24`](https://github.com/PHV00/PITACO3.0-iblueit-health-Infocharts/tree/baseline/marco-funcional-04-2026-11-24).  
**Escopo:** **PITACO 3.0 frontend**, estado funcional existente em 24/11/2026.

## Funcionalidade preservada

React Health InfoCharts: resultados /plataforma/resultados e comparativos /plataforma/comparativo; fluxo, BPM, SpO₂ DEMO, PPG RED/IR, filtros e gráficos históricos.

O marco histórico original `docs/MARCO_04_ENCERRAMENTO.md` continua preservado **sem modificações** e contém os detalhes de entrega, integração e as evidências originalmente reportadas. Este arquivo é um **adendo de congelamento técnico** que fixa a referência exata de código na data imediatamente anterior ao hardening.

## Evidências anteriores (não reexecutadas neste registro)

Testes Jest/build/deploy e confirmação funcional previamente documentados em docs/MARCO_04_ENCERRAMENTO.md.

A referência imutável de Git é o **commit SHA**, não o nome da branch, que pode mudar. O código desse marco está preservado no commit exato indicado acima; a branch de backup facilita navegação e recuperação.

## Limites e segurança

Exibição de senha, armazenamento de sessão/credenciais no navegador e dependência de autorização do backend exigem hardening; este marco não certifica segurança.

- Não há alegação de aprovação de segurança, privacidade, validação clínica ou conformidade Sonar na baseline.
- Dados funcionais observados em experiências anteriores não substituem testes de regressão na versão endurecida.
- A credencial de banco potencialmente exposta no histórico do backend deve ser rotacionada no provedor se ainda for válida. A criação desta referência não elimina exposições anteriores.
- **Este PR altera apenas documentação**, não firmware, código React/Node, configuração do Azure, rotas HTTP, dados do MongoDB nem segredos.
- Qualquer correção posterior ocorrerá em branch/PR **distinto**, partindo da baseline SHA e mantendo evidência do estado anterior.

## Política de recuperação e migração

1. Consultar o commit baseline para comparação (diff) entre antes/depois.
2. Restaurar somente funcionalidades aprovadas e compatíveis; não restaurar credenciais ou vulnerabilidades para a produção.
3. Validar testes, compatibilidade e Quality Gate antes de integrar correções.
4. Não fazer merge de correções de segurança com este PR apenas documental.

## Fonte principal

- [Marco 04 original](MARCO_04_ENCERRAMENTO.md)
- [Versão preservada do código](https://github.com/PHV00/PITACO3.0-iblueit-health-Infocharts/tree/4eea5f6405c54deab47a4278f4ce771bb0c44afb)
