# Estratégia de Escalabilidade Profissional — TicketForge

## 1. Objetivo

Definir como o TicketForge pode evoluir para um nível profissional de escala, mantendo:

- alta coesão por domínio;
- baixo acoplamento entre camadas;
- segurança operacional;
- previsibilidade de performance e custo.

Escopo: backend NestJS + CQRS + TypeORM + Outbox + processamento assíncrono.

---

## 2. Princípios de escala adotados

1. Escalar por gargalo real, não por hipótese.
2. Priorizar arquitetura modular e contratos estáveis.
3. Favorecer operações idempotentes e observáveis.
4. Separar claramente plano de leitura e plano de escrita.
5. Tratar confiabilidade como requisito funcional.

---

## 3. Modelo de escalabilidade por estágios

## Estágio A — Escala controlada (base atual fortalecida)

Objetivo: sustentar crescimento de tráfego inicial com baixa complexidade operacional.

Pilares:

- banco relacional único com índices bem definidos;
- paginação obrigatória em listagens;
- validação forte de entrada;
- outbox para efeitos assíncronos;
- observabilidade básica por request-id.

Quando permanecer neste estágio:

- throughput moderado;
- baixa contenção em atualização de ticket;
- latência estável sem filas acumulando.

## Estágio B — Escala com especialização de carga

Objetivo: reduzir contenção e isolar workloads.

Pilares:

- separar leitura e escrita por estratégia CQRS evolutiva;
- cache seletivo para consultas quentes;
- réplicas de leitura para endpoints de listagem;
- processamento assíncrono obrigatório para notificações e integrações externas.

Quando avançar:

- crescimento de leituras superior a escritas;
- picos de acesso em listagens;
- aumento de latência P95/P99 em consultas.

## Estágio C — Escala distribuída por domínio

Objetivo: autonomia operacional por domínio e resiliência avançada.

Pilares:

- decomposição por domínio (Auth, Tickets, Comments, Notifications);
- contratos de evento versionados;
- isolamento de banco por bounded context (quando justificável);
- políticas de retry/circuit breaker e DLQ formais.

Quando avançar:

- times múltiplos atuando em paralelo;
- necessidades de deploy independente por domínio;
- SLAs diferenciados por contexto de negócio.

---

## 4. Estratégias técnicas de escalabilidade

## 4.1 API e camada de aplicação

- Implementar idempotência para comandos mutáveis (header `Idempotency-Key`).
- Padronizar limites por endpoint crítico (rate limit por rota e por ator).
- Garantir que `QueryHandlers` continuem sem side effects.
- Introduzir versionamento explícito de contrato (`/v1`, `/v2`) ao quebrar payload.
- Formalizar DTOs de saída para evitar acoplamento acidental em entidade.

## 4.2 Banco de dados

- Garantir índices compostos para filtros reais:
  - tickets: `(status, created_at)`, `(assigned_to, created_at)`;
  - comments: `(ticket_id, created_at)`;
  - outbox: `(status, available_at, created_at)`.
- Evitar `SELECT *` nas consultas de leitura.
- Definir política de arquivamento de dados históricos (tickets/comentários encerrados).
- Preparar estratégia de particionamento para tabelas de alto crescimento.
- Aplicar migrações transacionais com rollback validado.

## 4.3 Cache e leitura

- Cachear consultas de leitura mais acessadas (ex.: detalhe de ticket).
- Cache key por combinação de filtros em listagem.
- Invalidar cache por evento de domínio (`TicketStatusUpdatedEvent`, `CommentCreatedEvent`).
- Adotar TTL curto para dados operacionais mutáveis.
- Evitar cache para endpoints com baixa taxa de repetição.

## 4.4 Mensageria e eventos

- Tornar `ASYNC_QUEUE_ENABLED=true` padrão em ambientes produtivos.
- Definir DLQ para eventos com falha recorrente.
- Versionar nome/payload de eventos (`eventName`, `schemaVersion`).
- Incluir deduplicação por `eventId` para consumidores idempotentes.
- Monitorar backlog da fila e tempo de processamento por tipo de evento.

## 4.5 Segurança e conformidade

- Fortalecer política de autenticação:
  - rotação de segredo JWT;
  - expiração curta + refresh strategy (se necessário por UX).
- Aplicar hardening de CORS por ambientes conhecidos em produção.
- Registrar trilha de auditoria em ações críticas:
  - atribuição de ticket;
  - mudança de status;
  - edição/exclusão de comentário.
- Garantir mascaramento de dados sensíveis em logs.

## 4.6 Observabilidade e operação

- Métricas mínimas por endpoint:
  - latência P50/P95/P99;
  - erro por status code;
  - volume por rota.
- Métricas mínimas de fila/outbox:
  - eventos pendentes;
  - taxa de falha;
  - tempo médio pendente.
- Tracing distribuído por request e evento.
- Dashboard operacional por domínio.
- Alertas proativos por SLO.

---

## 5. Blueprint de evolução arquitetural por domínio

## 5.1 Auth

Evoluções:

- cache de perfil autenticado com invalidação por update de usuário;
- limitação adaptativa de tentativas de login;
- estratégia formal de refresh token se sessões longas forem necessárias.

## 5.2 Tickets

Evoluções:

- leitura especializada para dashboard (projeções de consulta);
- lock otimista para transições concorrentes;
- trilha de histórico de status para auditoria e analytics.

## 5.3 Comments

Evoluções:

- policy dedicada para autorização de comentário;
- paginação cursor-based para tickets com alto volume de comentários;
- moderação/flag assíncrona por evento (se requerido pelo negócio).

## 5.4 Notifications (Outbox + Async)

Evoluções:

- múltiplos dispatchers (webhook, e-mail, fila externa);
- retry exponencial com jitter;
- isolamento de fila por tipo de evento para evitar efeito dominó.

---

## 6. Roteiro de implementação profissional

## Fase 1 — Fundamentos operacionais

- consolidar índices e revisar planos de execução SQL;
- definir SLO inicial de API e fila;
- padronizar métricas e painéis por domínio;
- implementar idempotência para comandos prioritários.

## Fase 2 — Desempenho de leitura

- ativar cache seletivo em endpoints críticos;
- introduzir réplicas de leitura quando houver pressão de consulta;
- ajustar queries para payload mínimo e joins necessários.

## Fase 3 — Confiabilidade assíncrona

- formalizar DLQ e política de reprocessamento;
- versionar contratos de evento;
- habilitar deduplicação de consumo.

## Fase 4 — Escala por domínio

- separar componentes com maior acoplamento operacional;
- evoluir contratos entre domínios para integração orientada a evento;
- adotar deploy e observabilidade por bounded context.

---

## 7. Matriz de decisão (quando aplicar cada alavanca)

- **Aumentar cache**: quando latência de leitura subir e hit ratio esperado for alto.
- **Adicionar réplica**: quando leitura dominar carga e banco primário saturar.
- **Particionar dados**: quando volume histórico degradar índices/consultas.
- **Separar domínio em serviço**: quando equipe/carga exigir autonomia de deploy e SLA.
- **Elevar complexidade de fila**: quando eventos críticos exigirem garantias fortes de entrega.

---

## 8. Anti-padrões a evitar na escalabilidade

- escalar infraestrutura sem observabilidade mínima;
- criar microserviços antes de modularizar bem o monólito;
- mover regra de negócio para controller para “ganhar velocidade”;
- ignorar idempotência em operações de escrita;
- multiplicar filas/eventos sem governança de contrato.

---

## 9. Conclusão

O TicketForge tem base arquitetural sólida para escalar com segurança.  
O caminho profissional recomendado é:

1. fortalecer operação e métricas;
2. otimizar leitura e assíncrono por evidência;
3. evoluir para separação por domínio somente quando o negócio exigir.

Essa abordagem preserva qualidade de código, evita classes gordas e sustenta crescimento com previsibilidade.

