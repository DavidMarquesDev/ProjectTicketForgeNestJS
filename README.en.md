# TicketForge NestJS

🇺🇸 English | [🇧🇷 Português](./README.pt-BR.md)

Ticket management API built with NestJS, CQRS, TypeORM, and a domain-oriented modular architecture.

This document is a complete study and operations guide for developers joining the project.

## 1) Overview

TicketForge was designed to support growth with low coupling, predictable HTTP contracts, and asynchronous event-driven evolution.

Implemented capabilities:

- JWT authentication (`register`, `login`, `me`, `logout`);
- ticket creation, assignment, status updates, listing, and detail retrieval;
- comment creation, listing, editing, and deletion per ticket;
- policy-based authorization (user role + ownership);
- standardized success and error responses;
- observability with `x-request-id` and structured logs;
- asynchronous processing with Outbox + BullMQ + worker;
- configuration hardening with environment-based fail-fast validation.

## 2) Technical Roadmap Status

Based on the robust project roadmap, all phases were completed:

- Phase 1: Foundation;
- Phase 2: Auth and Security;
- Phase 3: Tickets (Command Side);
- Phase 4: Tickets (Query Side);
- Phase 5: Comments;
- Phase 6: Observability and Async;
- Phase 7: Quality and Go-Live;
- Phase 8: Final Hardening.

Roadmap reference: `docs/TicketForge_CQRS_NestJS_Roteiro_Robusto.md`.

## 3) Architecture

### 3.1 Layers

- **Presentation**: controllers, guards, DTOs, and HTTP contract.
- **Application**: commands, queries, handlers, and orchestration.
- **Domain**: entities, policies, and transition rules.
- **Infrastructure**: TypeORM repositories, persistence, and asynchronous integration.

### 3.2 Adopted patterns

- **CQRS** to separate writes from reads.
- **Repository Pattern** with interfaces and injection tokens.
- **Event-Driven** with domain events and handlers.
- **Outbox Pattern** for critical event reliability.
- **DIP (Dependency Inversion)** to reduce infrastructure coupling.

### 3.3 High-level flow

1. HTTP request reaches the Controller.
2. Controller dispatches `CommandBus` or `QueryBus`.
3. Handler applies business rules and uses repository interfaces.
4. For critical commands, an event is persisted to Outbox.
5. Dispatcher pulls pending events and enqueues them into BullMQ.
6. Worker processes queue jobs and triggers webhook notifications.

## 4) Technologies and Libraries

### 4.1 Core

- Node.js 20+
- TypeScript
- NestJS 10

### 4.2 Framework and main modules

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

### 4.3 Persistence, queue, and security

- `typeorm`
- `pg` (PostgreSQL)
- `sqlite3` (test/local support)
- `bullmq`
- `bcryptjs`
- `passport` / `passport-jwt`
- `class-validator` / `class-transformer`

### 4.4 Quality and testing

- `jest`
- `supertest`
- `eslint`
- `ts-jest`

## 5) Environment Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop
- WSL2 (Windows environment)

## 6) Windows Setup (WSL2 + Docker)

Run in PowerShell as Administrator:

```powershell
dism /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

Restart Windows, then run:

```powershell
wsl --install -d Ubuntu
wsl --set-default-version 2
wsl --status
```

In Docker Desktop:

- Settings > General > enable **Use the WSL 2 based engine**;
- Settings > Resources > WSL Integration > enable your distro (e.g., Ubuntu).

## 7) Start local infrastructure (PostgreSQL and Redis)

### 7.1 PostgreSQL

```powershell
docker volume create ticketforge_pgdata
docker run --name ticketforge-postgres -e POSTGRES_DB=ticketforge -e POSTGRES_USER=ticketforge -e POSTGRES_PASSWORD=ticketforge -p 5432:5432 -v ticketforge_pgdata:/var/lib/postgresql/data -d postgres:16
```

### 7.2 Redis (required when ASYNC_QUEUE_ENABLED=true)

```powershell
docker run --name ticketforge-redis -p 6379:6379 -d redis:7
```

### 7.3 Container operations

```bash
docker ps
docker stop ticketforge-postgres
docker start ticketforge-postgres
docker stop ticketforge-redis
docker start ticketforge-redis
```

## 8) Environment configuration (`.env`)

Create a `.env` file at the project root:

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
NOTIFICATION_WEBHOOK_URL=https://your-webhook-endpoint.example/notify
NOTIFICATION_WEBHOOK_TIMEOUT_MS=5000
```

## 9) Operational configuration policy (anti-overengineering)

Applied policy:

- In critical environments (`production`, `staging`, `homolog`, `hml`, `qa`, `uat`):
  - if `ASYNC_QUEUE_ENABLED=true` and notifications are enabled, `NOTIFICATION_WEBHOOK_URL` is required (fail-fast).
- In local environments (`development`, `test`, `local`):
  - webhook can be optional to simplify development and tests.
- `ASYNC_QUEUE_ENABLED` only accepts `true` or `false`.
- `REDIS_PORT` must be an integer from `1` to `65535`.
- `NOTIFICATION_WEBHOOK_TIMEOUT_MS` must be an integer between `500` and `60000`.

## 10) Installation and execution

### 10.1 Dependencies

```bash
npm install
```

### 10.2 Migrations

```bash
npm run migration:run
```

Useful commands:

```bash
npm run migration:show
npm run migration:revert
```

### 10.3 Start API

```bash
npm run start:dev
```

Standard mode:

```bash
npm run start
```

## 11) API Documentation

- Swagger UI: `http://localhost:3000/docs/api`
- ReDoc: `http://localhost:3000/docs/redoc`

Global API prefix: `/api/v1`.

## 12) Main routes

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

### 12.3 Comments

- `POST /api/v1/tickets/:ticketId/comments` (JWT)
- `GET /api/v1/tickets/:ticketId/comments` (JWT)
- `PATCH /api/v1/tickets/:ticketId/comments/:id` (JWT)
- `DELETE /api/v1/tickets/:ticketId/comments/:id` (JWT)

## 13) API response structure

### 13.1 Success

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

### 13.2 Error

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "errors": {},
  "trace_id": "uuid"
}
```

## 14) Data model (summary)

Main tables:

- `users`
  - `id`, `name`, `cpf`, `email`, `password_hash`, `role`, `created_at`, `updated_at`
- `tickets`
  - `id`, `title`, `description`, `status`, `created_by`, `assigned_to`, `created_at`, `updated_at`
- `comments`
  - `id`, `ticket_id`, `author_id`, `content`, `created_at`
- `outbox_events`
  - `id`, `event_name`, `aggregate_type`, `aggregate_id`, `payload`, `status`, `attempts`, `available_at`, `queued_at`, `processed_at`, `last_error`, `created_at`, `updated_at`

Relevant indexes:

- `tickets(status, created_at)`, `tickets(created_at)`, `tickets(created_by)`, `tickets(assigned_to)`
- `comments(ticket_id, created_at)`, `comments(ticket_id)`, `comments(author_id)`
- `outbox_events(status, available_at)`, `outbox_events(event_name, created_at)`

## 15) Folder structure

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

## 16) Observability, async, and consistency

- `x-request-id` is injected in every request.
- Structured logs include action context and traceability.
- `HttpExceptionFilter` centralizes errors with `trace_id`.
- `SuccessResponseInterceptor` standardizes success payloads.
- Outbox ensures event persistence before publishing.
- BullMQ processes domain events in a decoupled way.

## 17) Quality and testing

Commands:

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

Coverage gate:

- minimum 80% for `commands` and `queries` handlers.

## 18) Study guide for new developers

Recommended reading order:

1. `src/main.ts` (global bootstrap, pipes, filters, and docs).
2. `src/app.module.ts` (environment config and module wiring).
3. `src/modules/auth` (base authentication and security pattern).
4. `src/modules/tickets` (main use case with full CQRS).
5. `src/modules/comments` (ownership and role-based authorization).
6. `src/modules/outbox` + `src/modules/async-processing` (async events).
7. `src/common/filters` and `src/common/interceptors` (final HTTP contract).
8. `src/database/migrations` (physical model and indexes).

## 19) Troubleshooting

- PostgreSQL unavailable:
  - check container with `docker ps`;
  - review `DATABASE_URL`.
- Redis unavailable while queue is enabled:
  - ensure `ticketforge-redis` is running;
  - review `REDIS_HOST` and `REDIS_PORT`.
- 401 on protected route:
  - send `Authorization: Bearer <token>`.
- Migration failures:
  - validate DB connection and permissions.
- Notification webhook not firing:
  - validate `NOTIFICATION_EVENTS_ENABLED`;
  - validate `NOTIFICATION_WEBHOOK_URL` and timeout.

## 20) Quick reference commands

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
