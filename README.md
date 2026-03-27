# ProjectTicketForgeNestJS
# TicketForge NestJS

TicketForge NestJS is a ticket management API designed for scalable and maintainable enterprise workflows.  
The project adopts a clear domain-oriented modular structure and separates write and read responsibilities with CQRS.

## System Proposal

The goal of this system is to provide a robust backend for handling support and operational tickets, with:

- clear separation between command (write) and query (read) operations;
- secure authentication and authorization flows;
- predictable API contracts;
- domain events for asynchronous evolution;
- production-ready patterns for observability, consistency, and scalability.

Core business capabilities currently implemented:

- user authentication (JWT);
- ticket creation, assignment, status transition, and listing;
- comment creation and retrieval per ticket;
- authorization policies for sensitive ticket actions;
- standardized error handling.

## Architecture

The project follows a layered modular architecture inspired by DDD and CQRS:

- **Presentation Layer**: Controllers, Guards, DTO validation, HTTP contracts.
- **Application Layer**: Commands, Queries, Handlers, use-case orchestration.
- **Domain Layer**: Entities, domain rules, status transition policy.
- **Infrastructure Layer**: TypeORM repositories, persistence concerns.

### Architectural Patterns

- **CQRS**: Command side for state changes, query side for optimized reads.
- **Repository Pattern**: Business logic depends on repository interfaces, not concrete ORM classes.
- **Service/Policy-Oriented Rules**: Business constraints centralized in dedicated domain/application services.
- **Event-Driven Approach**: Domain events and event handlers enable asynchronous extension points.
- **Dependency Inversion (DIP)**: Tokens/interfaces decouple modules from infrastructure details.

## Technologies and Libraries

### Core

- Node.js
- TypeScript
- NestJS

### Main Framework Modules

- `@nestjs/common`
- `@nestjs/core`
- `@nestjs/config`
- `@nestjs/cqrs`
- `@nestjs/typeorm`
- `@nestjs/passport`
- `@nestjs/jwt`
- `@nestjs/swagger`

### Data and Persistence

- `typeorm`
- `pg` (PostgreSQL driver)

### Validation and Security

- `class-validator`
- `class-transformer`
- `passport`
- `passport-jwt`
- `bcryptjs`

### Quality and Testing

- `jest`
- `@nestjs/testing`
- `supertest`
- `eslint`
- `typescript`

## Development Practices

This project is built with the following engineering practices:

- **Thin Controllers**: controllers only receive requests and dispatch commands/queries.
- **Business Logic in Handlers/Policies**: no business rules in presentation layer.
- **Input Validation**: DTO + global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
- **Consistent Error Contract**: centralized exception filter returns normalized error payloads.
- **Explicit Authorization**: policy-based checks for ticket assignment and status updates.
- **Test-Driven Reliability**: unit tests for command/query handlers and automated lint/build checks.
- **Scalable Modularity**: domain modules (`auth`, `tickets`, `comments`) with explicit boundaries.
- **API Documentation**: Swagger/OpenAPI exposure for contract visibility.

## Project Structure

```txt
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── response/
├── modules/
│   ├── auth/
│   ├── tickets/
│   └── comments/
├── app.module.ts
└── main.ts
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ticketforge
JWT_SECRET=your-long-secure-secret
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### 3) Run in development

```bash
npm run start:dev
```

### 4) Open API documentation

- `http://localhost:3000/docs/api`

## Validation Commands

```bash
npm run build
npm run lint
npm run test
```
