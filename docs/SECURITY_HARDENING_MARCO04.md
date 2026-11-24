# Hardening de segurança — Health InfoCharts (após Marco Funcional 04)

**Status: PR em desenvolvimento, não publicado nem compatível isoladamente com a API anterior.**

Baseline funcional do frontend: commit `4eea5f6405c54deab47a4278f4ce771bb0c44afb`, branch `baseline/marco-funcional-04-2026-11-24`, [PR do marco #10](https://github.com/PHV00/PITACO3.0-iblueit-health-Infocharts/pull/10).

## Alterações

- Login novo exige `sessionToken` emitido pela API. O estado de autenticação local verifica `authExpirationTime`; JSON ausente/malformado não causa crash.
- As chamadas administrativas `POST /token`, `POST /register`, `GET /pacients/:id/account` e `POST /pacients/:id/account/reset-password` enviam `Authorization: Bearer <sessionToken>`.
- A interface de conta de paciente **não mostra nem copia senhas**. O administrador pode redefinir uma senha nova, com no mínimo 12 caracteres.
- A rota de cadastro deixa de ser aberta a visitantes não autenticados.
- O logout remove apenas `userCredentials`, preservando outros dados de sessão do site.
- Testes automatizados cobrem expiração, sessão ausente, formato inválido e cabeçalho de autorização.

## ATENÇÃO: implantação coordenada

Este frontend depende de backend com autenticação de sessão, rota de reset e resposta `sessionToken`. O backend correspondente está em [PR #7](https://github.com/PHV00/PITACO3.0-iblueit-server-side/pull/7). **Não integrar nem publicar um dos PRs de hardening sem o outro e sem homologação**, porque o frontend da `main` e as rotas legadas têm contratos diferentes.

Ainda não concluído: autorização de usuário final por paciente em **todas** as rotas legadas de GET, rate limiting do login, credenciais GameToken persistidas na sessão do navegador e rotação de tokens sem interromper o histórico. A proteção de dados deve ser implementada no backend, não apenas pela UI.

## Validação e rollout

1. CI de build/testes e SonarQube Cloud no PR.
2. Homologar login de administrador, cadastro User, emissão de token, consulta de conta e redefinição de senha.
3. Homologar uma conta User de paciente e impedir acesso a registros de outros pacientes.
4. Verificar gráficos PITACO 3.0 (fluxo, BPM, SpO₂ DEMO, RED/IR), filtros e histórico.
5. Coordenar versões de backend/frontend durante deploy Azure. Não desativar rulesets ou checks Sonar.
