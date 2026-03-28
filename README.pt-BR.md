# TicketForge NestJS

[🇺🇸 English](./README.en.md) | 🇧🇷 Português

API de gestão de tickets construída com NestJS, CQRS, TypeORM e arquitetura modular orientada a domínio.

Este documento é um guia completo de estudo e operação para desenvolvedores que entram no projeto.

## 1) Visão Geral

O TicketForge foi estruturado para suportar crescimento com baixo acoplamento, previsibilidade de contratos HTTP e evolução assíncrona baseada em eventos.

Capacidades implementadas:

- autenticação JWT (`register`, `login`, `me`, `logout`);
- criação, atribuição, atualização de status, listagem e detalhamento de tickets;
- criação, listagem, edição e exclusão de comentários por ticket;
- autorização por política de negócio (papel do usuário + autoria);
- padronização de respostas de sucesso e erro;
- observabilidade com `x-request-id` e logs estruturados;
- processamento assíncrono com Outbox + BullMQ + worker;
- hardening de configuração com validação fail-fast por ambiente.

## 2) Status do Roteiro Técnico

Com base no roteiro robusto do projeto, as fases foram concluídas:

- Fase 1: Fundação;
- Fase 2: Auth e Segurança;
- Fase 3: Tickets (Command Side);
- Fase 4: Tickets (Query Side);
- Fase 5: Comentários;
- Fase 6: Observabilidade e Assíncrono;
- Fase 7: Qualidade e Go-Live;
- Fase 8: Hardening Final.

Referência do roteiro: `docs/TicketForge_CQRS_NestJS_Roteiro_Robusto.md`.

## 3) Arquitetura

### 3.1 Camadas

- **Apresentação**: controllers, guards, DTOs e contrato HTTP.
- **Aplicação**: commands, queries, handlers e orquestração.
- **Domínio**: entidades, políticas e regras de transição.
- **Infraestrutura**: repositórios TypeORM, persistência e integração assíncrona.

### 3.2 Padrões adotados

- **CQRS** para separar escrita e leitura.
- **Repository Pattern** com interfaces e tokens de injeção.
- **Event-Driven** com eventos de domínio e handlers.
- **Outbox Pattern** para confiabilidade de eventos críticos.
- **DIP (Dependency Inversion)** para reduzir acoplamento com infraestrutura.

### 3.3 Fluxo de alto nível

1. Request HTTP entra no Controller.
2. Controller despacha `CommandBus` ou `QueryBus`.
3. Handler aplica regra de negócio e usa repositório por interface.
4. Em comandos críticos, evento é registrado no Outbox.
5. Dispatcher coleta eventos pendentes e enfileira no BullMQ.
6. Worker processa fila e dispara notificações webhook.

## 4) Tecnologias e Bibliotecas

### 4.1 Core

- Node.js 20+
- TypeScript
- NestJS 10

### 4.2 Framework e módulos principais

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/config`
- `@nestjs/cqrs`
- `@nestjs/typeorm`
- `@nestjs/passport`
- `@nestjs/jwt`
- `@nestjs/swagger`
- `@nestjs/throttler`
- `@nestjs/bullmq`

### 4.3 Persistência, fila e segurança

- `typeorm`
- `pg` (PostgreSQL)
- `sqlite3` (apoio a cenários de teste/local)
- `bullmq`
- `bcryptjs`
- `passport` / `passport-jwt`
- `class-validator` / `class-transformer`

### 4.4 Qualidade e testes

- `jest`
- `supertest`
- `eslint`
- `ts-jest`

## 5) Pré-requisitos de Ambiente

- Node.js 20+
- npm 10+
- Docker Desktop
- WSL2 (ambiente Windows)

## 6) Setup no Windows (WSL2 + Docker)

Execute no PowerShell como Administrador:

```powershell
dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Reinicie o Windows e execute:

```powershell
wsl --install -d Ubuntu
wsl --set-default-version 2
wsl --status
```

No Docker Desktop:

- Settings > General > habilitar **Use the WSL 2 based engine**;
- Settings > Resources > WSL Integration > habilitar a distro (ex.: Ubuntu).

## 7) Subir infraestrutura local (PostgreSQL e Redis)

### 7.1 PostgreSQL

```powershell
docker volume create ticketforge_pgdata
docker run --name ticketforge-postgres -e POSTGRES_DB=ticketforge -e POSTGRES_USER=ticketforge -e POSTGRES_PASSWORD=ticketforge -p 5432:5432 -v ticketforge_pgdata:/var/lib/postgresql/data -d postgres:16
```

### 7.2 Redis (necessário para ASYNC_QUEUE_ENABLED=true)

```powershell
docker run --name ticketforge-redis -p 6379:6379 -d redis:7
```

### 7.3 Operação de containers

```bash
docker ps
docker stop ticketforge-postgres
docker start ticketforge-postgres
docker stop ticketforge-redis
docker start ticketforge-redis
```

## 8) Configuração de ambiente (`.env`)

Crie o arquivo `.env` na raiz:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://ticketforge:ticketforge@localhost:5432/ticketforge

JWT_SECRET=your-long-secure-secret
JWT_EXPIRES_IN=7d

ASYNC_QUEUE_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

OUTBOX_POLL_INTERVAL_MS=5000
OUTBOX_BATCH_SIZE=50

NOTIFICATION_EVENTS_ENABLED=true
NOTIFICATION_WEBHOOK_URL=https://seu-endpoint-webhook.exemplo/notify
NOTIFICATION_WEBHOOK_TIMEOUT_MS=5000
```

## 9) Política operacional de configuração (anti-overengineering)

Política aplicada no projeto:

- Em ambientes críticos (`production`, `staging`, `homolog`, `hml`, `qa`, `uat`):
  - se `ASYNC_QUEUE_ENABLED=true` e notificações habilitadas, `NOTIFICATION_WEBHOOK_URL` é obrigatório (fail-fast).
- Em ambientes locais (`development`, `test`, `local`):
  - webhook pode ser opcional para facilitar desenvolvimento e testes.
- `ASYNC_QUEUE_ENABLED` aceita apenas `true` ou `false`.
- `REDIS_PORT` deve ser inteiro de `1` a `65535`.
- `NOTIFICATION_WEBHOOK_TIMEOUT_MS` deve ser inteiro entre `500` e `60000`.

## 10) Instalação e execução

### 10.1 Dependências

```bash
npm install
```

### 10.2 Migrations

```bash
npm run migration:run
```

Comandos úteis:

```bash
npm run migration:show
npm run migration:revert
```

### 10.3 Subir API

```bash
npm run start:dev
```

Modo padrão:

```bash
npm run start
```

## 11) Documentação da API

- Swagger UI: `http://localhost:3000/docs/api`
- ReDoc: `http://localhost:3000/docs/redoc`

Prefixo global da API: `/api/v1`.

## 12) Rotas principais

### 12.1 Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout` (JWT)
- `GET /api/v1/auth/me` (JWT)

### 12.2 Tickets

- `POST /api/v1/tickets` (JWT)
- `PATCH /api/v1/tickets/:id/status` (JWT)
- `PATCH /api/v1/tickets/:id/assign` (JWT)
- `GET /api/v1/tickets` (JWT)
- `GET /api/v1/tickets/:id` (JWT)

### 12.3 Comentários

- `POST /api/v1/tickets/:ticketId/comments` (JWT)
- `GET /api/v1/tickets/:ticketId/comments` (JWT)
- `PATCH /api/v1/tickets/:ticketId/comments/:id` (JWT)
- `DELETE /api/v1/tickets/:ticketId/comments/:id` (JWT)

## 13) Estrutura de respostas da API

### 13.1 Sucesso

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### 13.2 Erro

```json
{
  "success": false,
  "message": "Mensagem de erro",
  "code": "ERROR_CODE",
  "errors": {},
  "trace_id": "uuid"
}
```

## 14) Modelo de dados (resumo)

Tabelas principais:

- `users`
  - `id`, `name`, `cpf`, `email`, `password_hash`, `role`, `created_at`, `updated_at`
- `tickets`
  - `id`, `title`, `description`, `status`, `created_by`, `assigned_to`, `created_at`, `updated_at`
- `comments`
  - `id`, `ticket_id`, `author_id`, `content`, `created_at`
- `outbox_events`
  - `id`, `event_name`, `aggregate_type`, `aggregate_id`, `payload`, `status`, `attempts`, `available_at`, `queued_at`, `processed_at`, `last_error`, `created_at`, `updated_at`

Índices relevantes:

- `tickets(status, created_at)`, `tickets(created_at)`, `tickets(created_by)`, `tickets(assigned_to)`
- `comments(ticket_id, created_at)`, `comments(ticket_id)`, `comments(author_id)`
- `outbox_events(status, available_at)`, `outbox_events(event_name, created_at)`

## 15) Estrutura de pastas

```txt
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── logging/
│   └── response/
├── database/
│   ├── migrations/
│   └── typeorm.data-source.ts
└── modules/
    ├── auth/
    ├── tickets/
    ├── comments/
    ├── outbox/
    └── async-processing/
```

## 16) Observabilidade, assíncrono e consistência

- `x-request-id` é injetado em todas as requisições.
- Logs estruturados com contexto de ação e rastreabilidade.
- `HttpExceptionFilter` centraliza erros com `trace_id`.
- `SuccessResponseInterceptor` padroniza respostas de sucesso.
- Outbox garante persistência de eventos antes da publicação.
- BullMQ processa eventos de domínio de forma desacoplada.

## 17) Qualidade e testes

Comandos:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

Gate de cobertura:

- mínimo de 80% para handlers de `commands` e `queries`.

## 18) Guia de estudo para novos devs

Ordem sugerida de leitura:

1. `src/main.ts` (bootstrap global, pipes, filtros e docs).
2. `src/app.module.ts` (configuração por ambiente e módulos).
3. `src/modules/auth` (padrão base de autenticação e segurança).
4. `src/modules/tickets` (caso de uso principal com CQRS completo).
5. `src/modules/comments` (autorização por autoria e perfil).
6. `src/modules/outbox` + `src/modules/async-processing` (eventos assíncronos).
7. `src/common/filters` e `src/common/interceptors` (contrato HTTP final).
8. `src/database/migrations` (modelo físico e índices).

## 19) Troubleshooting

- PostgreSQL indisponível:
  - validar container com `docker ps`;
  - revisar `DATABASE_URL`.
- Redis indisponível com fila ativa:
  - validar `ticketforge-redis` ativo;
  - revisar `REDIS_HOST` e `REDIS_PORT`.
- Erro 401 em rota protegida:
  - enviar `Authorization: Bearer <token>`.
- Migrations falhando:
  - validar conexão e permissões do banco.
- Webhook de notificação não dispara:
  - validar `NOTIFICATION_EVENTS_ENABLED`;
  - validar `NOTIFICATION_WEBHOOK_URL` e timeout.

## 20) Comandos de referência rápida

```bash
npm install
npm run migration:run
npm run start:dev
npm run lint
npm run build
npm run test
npm run test:e2e
npm run test:cov
```
