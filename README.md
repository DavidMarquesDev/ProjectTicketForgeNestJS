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
# TicketForge NestJS

TicketForge NestJS is a ticket management API designed for scalable and maintainable enterprise workflows.
The project uses a domain-oriented modular structure and CQRS to separate write and read responsibilities.

## System Scope

Core capabilities currently implemented:

- JWT authentication (`register`, `login`, `me`, `logout`)
- Ticket creation, assignment, status transition, listing, and detail
- Comment creation and listing by ticket
- Policy-based authorization for sensitive ticket operations
- Standardized error payload through a global exception filter

## Architecture

The project follows a layered architecture inspired by DDD + CQRS:

- **Presentation Layer**: Controllers, Guards, DTO validation, HTTP contracts
- **Application Layer**: Commands, Queries, Handlers, orchestration
- **Domain Layer**: Entities, policies, transition rules
- **Infrastructure Layer**: TypeORM repositories and persistence concerns

Patterns in use:

- **CQRS**
- **Repository Pattern**
- **Policy-Oriented Business Rules**
- **Event-Driven Extension Points**
- **Dependency Inversion via tokens/interfaces**

## Tech Stack

- Node.js
- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- JWT + Passport
- class-validator / class-transformer
- Swagger OpenAPI
- Jest + ESLint

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
├── database/
│   └── migrations/
├── app.module.ts
└── main.ts
```

## Prerequisites

- Node.js 20+
- npm 10+
- Docker Desktop
- WSL2 enabled (Windows environments)

## WSL2 Setup (Windows)

Run PowerShell as Administrator and execute:

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

- Open **Settings > General** and enable **Use the WSL 2 based engine**
- Open **Settings > Resources > WSL Integration** and enable your distro (for example, Ubuntu)

## PostgreSQL with Docker

Start PostgreSQL:

```powershell
docker volume create ticketforge_pgdata
docker run --name ticketforge-postgres -e POSTGRES_DB=ticketforge -e POSTGRES_USER=ticketforge -e POSTGRES_PASSWORD=ticketforge -p 5432:5432 -v ticketforge_pgdata:/var/lib/postgresql/data -d postgres:16
```

Check container status:

```bash
docker ps
```

Stop / start:

```bash
docker stop ticketforge-postgres
docker start ticketforge-postgres
```

## Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://ticketforge:ticketforge@localhost:5432/ticketforge
JWT_SECRET=your-long-secure-secret
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## Installation

```bash
npm install
```

## Database Setup

Run migrations:

```bash
npm run migration:run
```

Optional commands:

```bash
npm run migration:show
npm run migration:revert
```

## Run the Application

Development mode:

```bash
npm run start:dev
```

Standard mode:

```bash
npm run start
```

## Swagger (API Docs)

Open:

- `http://localhost:3000/docs/api` (Swagger UI)
- `http://localhost:3000/docs/redoc` (ReDoc)

## How to Authenticate in Swagger

1. Call `POST /api/v1/auth/login` with:
   - `cpf`
   - `password`
2. Copy the returned JWT token
3. Click **Authorize** in Swagger
4. Paste:
   - `Bearer <your_token>`
5. Execute protected endpoints (`/auth/me`, `/tickets`, `/comments`)

## Validation and Quality Commands

```bash
npm run build
npm run lint
npm run test
```

## Useful Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/tickets`
- `POST /api/v1/tickets`
- `GET /api/v1/tickets/:ticketId/comments`

## Troubleshooting

- **Connection refused on localhost:5432**
  - Ensure Docker is running and `ticketforge-postgres` is up (`docker ps`)
- **401 Unauthorized on protected routes**
  - Ensure Swagger **Authorize** is set with `Bearer <token>`
- **Migration issues**
  - Verify `.env` and `DATABASE_URL` values

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
