# Roteiro de Otimização Arquitetural (Quando Estritamente Necessário) — TicketForge

## 1. Objetivo

Este documento consolida:

- análise técnica da arquitetura atual;
- avaliação de risco de classes/funções gordas;
- critérios objetivos para decidir quando otimizar;
- roteiro de implementação incremental de melhorias sem quebrar o desenho atual.

Premissa principal: **não otimizar por antecipação**.  
Ajustes devem ser executados somente quando houver ganho claro de manutenção, legibilidade, confiabilidade ou desempenho.

---

## 2. Resultado executivo da análise

Status geral: **boa base arquitetural, escalável no estágio atual, com pontos de melhoria pontuais e controlados**.

### 2.1 O que já está bem estruturado

- Separação por camadas (Controller, Handlers/Casos de uso, Repositórios, Entidades, Infra).
- Uso consistente de CQRS para comandos e consultas.
- Dependência em abstrações de repositório (interfaces + tokens de injeção).
- Validação de entrada com DTO + `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`).
- Regras de autorização centralizadas em serviço de policy.
- Regras de transição de status centralizadas em serviço de domínio.
- Eventos de domínio com persistência via Outbox.
- Paginação presente em listagens de tickets e comentários.

### 2.2 Pontos de atenção (não críticos, mas relevantes)

- Duplicidade de consulta detalhada de ticket (`findById` e `findOneDetailed` com comportamento parecido).
- Alguns handlers acumulam regra de autorização + orquestração + evento/outbox no mesmo método `execute` (ainda legível, mas com tendência de crescimento).
- Regras de autorização de comentários estão embutidas nos handlers (sem policy dedicada).
- Ausência de idempotência explícita para comandos HTTP sensíveis (proteção contra repetição de requisição).
- Ausência de versionamento formal de contrato para cenários de evolução de API (estratégia ainda implícita).

Conclusão: **não há sinal de arquitetura degradada**, mas há espaço para hardening profissional.

---

## 3. Evidências técnicas por camada

## 3.1 Apresentação (Controllers)

Padrão atual: controllers finos, atuando como contrato HTTP e delegando para `CommandBus`/`QueryBus`.

Avaliação:

- aderente a SRP;
- sem regra de negócio acoplada no controller;
- bom nível de manutenção.

## 3.2 Aplicação (Handlers/Services)

Padrão atual: handlers concentram regras de caso de uso.

Avaliação:

- organização adequada em comandos e queries;
- regras de domínio principais já extraídas para serviços específicos em tickets;
- oportunidade de extração adicional em comentários (policy dedicada).

## 3.3 Domínio (Entidades e serviços de domínio)

Padrão atual: entidades mapeadas via TypeORM e serviços de domínio para regras importantes.

Avaliação:

- transição de status bem encapsulada;
- políticas de ticket bem isoladas;
- espaço para ampliar encapsulamento de regra de comentário.

## 3.4 Infraestrutura (Repositories, Outbox, Async)

Padrão atual: repositórios por interface + implementação TypeORM; outbox com estados claros; processamento assíncrono opcional por fila.

Avaliação:

- boa separação de responsabilidade;
- consultas com paginação e ordenação;
- pronta para evolução em volume com ajustes incrementais de índices e observabilidade.

---

## 4. Diagnóstico de “classes/funções gordas”

Classificação usada:

- **Baixo risco**: método curto, única responsabilidade clara.
- **Médio risco**: método ainda legível, mas com múltiplas preocupações de crescimento.
- **Alto risco**: método longo, múltiplas regras, difícil teste/manutenção.

### 4.1 Estado atual

- Controllers: **baixo risco**.
- Query handlers: **baixo risco**.
- Command handlers de ticket/comments: **baixo a médio risco**.
- Repositórios TypeORM: **baixo risco**.
- `AppModule` (validação de ambiente): **médio risco** pela concentração de regras de configuração.

### 4.2 Decisão técnica

Não há necessidade de refatoração agressiva imediata.  
Há necessidade de **otimização preventiva mínima**, com foco em:

- manter handlers curtos;
- reduzir duplicidades em repositórios;
- externalizar regras que tendem a crescer.

---

## 5. Critérios objetivos: quando otimizar de fato

Executar otimização somente quando ocorrer ao menos um gatilho:

- método de handler ultrapassar 30–40 linhas de regra relevante;
- mesma regra de autorização repetida em 2+ handlers;
- duplicação de query/regras em 2+ repositórios ou handlers;
- aumento de bugs em um mesmo módulo por acoplamento;
- aumento de latência de listagens por volume real;
- necessidade de evoluir contrato sem quebrar frontend existente.

Sem gatilho, manter arquitetura atual e apenas monitorar.

---

## 6. Roteiro de implementação de melhorias (incremental)

## Fase 1 — Hardening de manutenção (sem alterar contrato HTTP)

Objetivo: reduzir risco de crescimento de classes/funções gordas.

Ações:

1. Extrair `CommentPolicyService` para centralizar permissões de editar/excluir comentário.
2. Padronizar retorno de comandos com DTO de resposta mínimo (`{ id, success }`) em todos os comandos.
3. Consolidar consulta detalhada de ticket em um único método no repositório para evitar duplicidade.
4. Adicionar testes unitários focados em policy de comentário e cenários de permissão.

Critério de pronto:

- nenhum handler de comentário com regra de autorização inline;
- cobertura de testes de autorização com cenários de sucesso/negação.

## Fase 2 — Evolução segura de regras de negócio

Objetivo: manter clareza de caso de uso conforme novas regras.

Ações:

1. Adotar objetos de política/validador por caso de uso quando uma regra começar a crescer.
2. Criar padrão de composição de validações em handlers (ordem fixa: existência → autorização → regra de domínio → persistência → evento).
3. Definir checklist de revisão para evitar “if”s de regra no controller.

Critério de pronto:

- todos os handlers seguem pipeline de execução padronizado;
- regra nova entra por policy/domain service e não por controller.

## Fase 3 — Robustez operacional

Objetivo: elevar confiabilidade em cenários reais de concorrência e integração.

Ações:

1. Introduzir idempotência para comandos mutáveis críticos (`create-ticket`, `create-comment`, `update-status`).
2. Implementar controle de concorrência otimista em mudanças de status (quando necessário por volume).
3. Expandir observabilidade por caso de uso com correlação por `x-request-id` e `trace_id`.

Critério de pronto:

- repetição de requisição não gera inconsistência;
- logs permitem rastrear operação ponta a ponta.

## Fase 4 — Governança de qualidade contínua

Objetivo: prevenir regressão arquitetural.

Ações:

1. Definir limite de tamanho por método e classe no quality gate.
2. Criar regra de lint/arquitetura para impedir dependência indevida entre camadas.
3. Automatizar checklist de PR para SRP, DIP, CQRS e contratos.

Critério de pronto:

- PRs bloqueadas automaticamente quando quebrarem regras de arquitetura.

---

## 7. Backlog priorizado de otimizações recomendadas

Prioridade alta:

- extrair `CommentPolicyService`;
- reduzir duplicidade de métodos no repositório de ticket;
- reforçar testes de autorização e transição de status.

Prioridade média:

- idempotência em comandos mutáveis;
- padronização avançada de observabilidade por caso de uso;
- regras automáticas de arquitetura no CI.

Prioridade condicional (somente com demanda real):

- lock otimista/pessimista em operações de status;
- particionamento de tabelas operacionais de maior crescimento;
- versionamento formal de API por header/path.

---

## 8. Se optar por não otimizar agora

Caso a decisão seja manter como está (cenário válido neste momento), executar apenas:

1. monitoramento de latência por endpoint;
2. monitoramento de taxa de erro por módulo;
3. revisão mensal de acoplamento e crescimento de handlers;
4. reforço de testes em novos casos de uso.

Essa estratégia mantém a base limpa e evita overengineering.

---

## 9. Conclusão técnica

O sistema **já está em bom nível de organização e escalabilidade para o estágio atual**.  
A recomendação é aplicar melhorias **cirúrgicas e orientadas por gatilho**, preservando:

- controllers finos;
- regras no nível de aplicação/domínio;
- repositórios focados em I/O;
- evolução orientada a evento via outbox.

Em resumo: **otimizar com disciplina, não por ansiedade**.

