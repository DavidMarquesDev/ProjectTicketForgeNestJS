# Guia Técnico de Integração Frontend (React) — TicketForge

## 1. Objetivo

Este documento é a referência técnica para o time de frontend construir a aplicação React integrada ao backend do TicketForge.

Escopo:

- contrato HTTP completo da API;
- regras de negócio que impactam UX e validações no frontend;
- estrutura dos módulos e arquivos relevantes do backend;
- autenticação JWT ponta a ponta;
- padrões de tratamento de erros, paginação e autorização;
- fluxos recomendados de tela e integração.

Prefixo global da API: `/api/v1`  
Swagger: `http://localhost:3000/docs/api`  
ReDoc: `http://localhost:3000/docs/redoc`

---

## 2. Contrato global da API

### 2.1 Resposta de sucesso

O backend pode responder em dois formatos válidos:

1. Formato direto já com `success` no payload:

```json
{
  "success": true,
  "id": 7
}
```

2. Formato envelopado pelo interceptor global:

```json
{
  "success": true,
  "data": {
    "id": 7,
    "name": "..."
  }
}
```

Regra prática para o frontend:

- sempre verificar `response.success === true`;
- ler dados em `response.data` quando existir;
- para comandos que retornam `{ id, success }`, consumir diretamente o `id`.

### 2.2 Resposta de erro

Formato padrão:

```json
{
  "success": false,
  "message": "Mensagem legível",
  "code": "ERROR_CODE",
  "errors": {},
  "trace_id": "uuid"
}
```

Campos:

- `message`: texto amigável para exibição;
- `code`: chave estável para regras de UI;
- `errors`: detalhes de validação quando aplicável;
- `trace_id`: usar em suporte/observabilidade.

### 2.3 Status HTTP relevantes

- `400` payload inválido (DTO/validação de entrada);
- `401` não autenticado/token inválido;
- `403` autenticado sem permissão;
- `404` recurso inexistente;
- `409` conflito de regra de negócio (ex.: transição inválida);
- `429` limite de taxa em rotas públicas de auth;
- `500` erro interno.

### 2.4 CORS e headers

- CORS habilitado com `credentials: true`;
- o backend gera/propaga `x-request-id` em toda requisição;
- em incidentes, capturar e logar `trace_id` (corpo) e `x-request-id` (header).

---

## 3. Autenticação JWT (como fazer no React)

## 3.1 Fluxo de login

Endpoint: `POST /api/v1/auth/login`

Request:

```json
{
  "cpf": "12345678901",
  "password": "12345678"
}
```

Response:

```json
{
  "success": true,
  "token": "<JWT>"
}
```

O token contém:

- `sub`: id do usuário;
- `email`: e-mail;
- `role`: `admin`, `support` ou `user`;
- `iat`/`exp`.

## 3.2 Como enviar o token

Todas as rotas protegidas exigem:

```http
Authorization: Bearer <JWT>
```

## 3.3 Estratégia recomendada de armazenamento

Prioridade de segurança:

1. memória (state manager);
2. `sessionStorage` com renovação por login;
3. evitar `localStorage` em ambientes com risco de XSS.

Se optar por persistência:

- sanitize estritamente inputs;
- CSP ativa;
- logout removendo token e cache.

## 3.4 Validação de sessão

Usar `GET /api/v1/auth/me` no bootstrap da aplicação:

- se `200`, sessão válida;
- se `401`, limpar sessão e redirecionar para login;
- se `404`, usuário removido no backend, tratar igual `401`.

## 3.5 Exemplo de cliente HTTP (Axios)

```ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        if (status === 401) {
            sessionStorage.removeItem('access_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);
```

---

## 4. Módulos de negócio e arquivos (mapa para integração)

Esta seção lista os arquivos runtime mais relevantes por módulo e a responsabilidade de cada um.

## 4.1 Auth

- `src/modules/auth/auth.module.ts`: composição do módulo, DI, JWT e strategy.
- `src/modules/auth/auth.controller.ts`: rotas `/auth`.
- `src/modules/auth/dto/login.dto.ts`: validação de login (CPF 11 dígitos, senha >= 8).
- `src/modules/auth/dto/register.dto.ts`: validação de cadastro.
- `src/modules/auth/commands/login/login.handler.ts`: autentica e gera JWT.
- `src/modules/auth/commands/register/register.handler.ts`: cria usuário e valida unicidade.
- `src/modules/auth/commands/logout/logout.handler.ts`: confirmação de logout.
- `src/modules/auth/queries/get-me/get-me.handler.ts`: perfil do usuário autenticado.
- `src/modules/auth/strategies/jwt.strategy.ts`: valida token e confirma existência do usuário no banco.
- `src/modules/auth/repositories/user.repository.interface.ts`: contrato de repositório.
- `src/modules/auth/repositories/user.typeorm.repository.ts`: implementação TypeORM.
- `src/modules/auth/entities/user.entity.ts`: entidade e enum de papéis.

## 4.2 Tickets

- `src/modules/tickets/tickets.module.ts`: composição CQRS + políticas + repositório.
- `src/modules/tickets/tickets.controller.ts`: rotas `/tickets`.
- `src/modules/tickets/dto/create-ticket.dto.ts`: valida criação.
- `src/modules/tickets/dto/update-status.dto.ts`: valida status.
- `src/modules/tickets/dto/assign-ticket.dto.ts`: valida usuário destino.
- `src/modules/tickets/dto/get-tickets-query.dto.ts`: paginação/filtros/sort.
- `src/modules/tickets/commands/create-ticket/create-ticket.handler.ts`: cria ticket + evento.
- `src/modules/tickets/commands/update-status/update-status.handler.ts`: atualiza status com autorização e transição.
- `src/modules/tickets/commands/assign-ticket/assign-ticket.handler.ts`: atribui ticket.
- `src/modules/tickets/queries/get-tickets/get-tickets.handler.ts`: listagem paginada.
- `src/modules/tickets/queries/get-ticket/get-ticket.handler.ts`: detalhamento.
- `src/modules/tickets/policies/ticket-policy.service.ts`: regras de permissão.
- `src/modules/tickets/domain/ticket-status-transition.service.ts`: máquina de estados.
- `src/modules/tickets/repositories/ticket.repository.interface.ts`: contrato do repositório.
- `src/modules/tickets/repositories/ticket.typeorm.repository.ts`: implementação TypeORM.
- `src/modules/tickets/entities/ticket.entity.ts`: entidade.
- `src/modules/tickets/entities/ticket-status.enum.ts`: enum de status.

## 4.3 Comments

- `src/modules/comments/comments.module.ts`: composição CQRS + integração com tickets/outbox.
- `src/modules/comments/comments.controller.ts`: rotas `/tickets/:ticketId/comments`.
- `src/modules/comments/dto/create-comment.dto.ts`: valida criação.
- `src/modules/comments/dto/update-comment.dto.ts`: valida edição.
- `src/modules/comments/dto/get-comments-query.dto.ts`: paginação e ordenação.
- `src/modules/comments/commands/create-comment/create-comment.handler.ts`: cria comentário + evento.
- `src/modules/comments/commands/update-comment/update-comment.handler.ts`: edição com autorização.
- `src/modules/comments/commands/delete-comment/delete-comment.handler.ts`: exclusão com autorização.
- `src/modules/comments/queries/get-comments/get-comments.handler.ts`: listagem paginada.
- `src/modules/comments/repositories/comment.repository.interface.ts`: contrato do repositório.
- `src/modules/comments/repositories/comment.typeorm.repository.ts`: implementação TypeORM.
- `src/modules/comments/entities/comment.entity.ts`: entidade.
- `src/modules/comments/events/comment-created.event.ts`: evento de domínio.
- `src/modules/comments/events/notify-comment-created.handler.ts`: enfileira notificação no outbox.

## 4.4 Outbox e Async Processing

- `src/modules/outbox/outbox.module.ts`: módulo de persistência de eventos.
- `src/modules/outbox/outbox.service.ts`: ciclo de vida de eventos (`pending`, `queued`, `processed`, `failed`).
- `src/modules/outbox/entities/outbox-event.entity.ts`: tabela `outbox_events`.
- `src/modules/outbox/entities/outbox-event-status.enum.ts`: enum de status.
- `src/modules/async-processing/async-processing.module.ts`: BullMQ + processor + dispatcher.
- `src/modules/async-processing/outbox-dispatcher.service.ts`: polling do outbox e envio para fila.
- `src/modules/async-processing/domain-events-queue.producer.ts`: produção de jobs.
- `src/modules/async-processing/domain-events.processor.ts`: consumo da fila e marcação de processamento/falha.
- `src/modules/async-processing/notifications/webhook-notification.dispatcher.ts`: envio HTTP webhook.
- `src/modules/async-processing/notifications/notification-dispatcher.interface.ts`: contrato de dispatcher.

## 4.5 Camada Common

- `src/common/guards/jwt-auth.guard.ts`: proteção de rotas por JWT.
- `src/common/decorators/current-user.decorator.ts`: extrai usuário autenticado.
- `src/common/filters/http-exception.filter.ts`: padroniza erro.
- `src/common/interceptors/success-response.interceptor.ts`: padroniza sucesso.
- `src/common/response/api-response.ts`: tipos de contrato.

## 4.6 Inventário completo de arquivos (por módulo)

### Auth

- `src/modules/auth/api/auth.http-documentation.ts`
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.module.ts`
- `src/modules/auth/commands/login/login.command.ts`
- `src/modules/auth/commands/login/login.handler.ts`
- `src/modules/auth/commands/login/login.handler.spec.ts`
- `src/modules/auth/commands/logout/logout.command.ts`
- `src/modules/auth/commands/logout/logout.handler.ts`
- `src/modules/auth/commands/logout/logout.handler.spec.ts`
- `src/modules/auth/commands/register/register.command.ts`
- `src/modules/auth/commands/register/register.handler.ts`
- `src/modules/auth/commands/register/register.handler.spec.ts`
- `src/modules/auth/dto/login.dto.ts`
- `src/modules/auth/dto/register.dto.ts`
- `src/modules/auth/entities/user.entity.ts`
- `src/modules/auth/queries/get-me/get-me.handler.ts`
- `src/modules/auth/queries/get-me/get-me.handler.spec.ts`
- `src/modules/auth/queries/get-me/get-me.query.ts`
- `src/modules/auth/repositories/user.repository.interface.ts`
- `src/modules/auth/repositories/user.typeorm.repository.ts`
- `src/modules/auth/strategies/jwt.strategy.ts`
- `src/modules/auth/strategies/jwt.strategy.spec.ts`

### Tickets

- `src/modules/tickets/api/tickets.http-documentation.ts`
- `src/modules/tickets/commands/assign-ticket/assign-ticket.command.ts`
- `src/modules/tickets/commands/assign-ticket/assign-ticket.handler.ts`
- `src/modules/tickets/commands/assign-ticket/assign-ticket.handler.spec.ts`
- `src/modules/tickets/commands/create-ticket/create-ticket.command.ts`
- `src/modules/tickets/commands/create-ticket/create-ticket.handler.ts`
- `src/modules/tickets/commands/create-ticket/create-ticket.handler.spec.ts`
- `src/modules/tickets/commands/update-status/update-status.command.ts`
- `src/modules/tickets/commands/update-status/update-status.handler.ts`
- `src/modules/tickets/commands/update-status/update-status.handler.spec.ts`
- `src/modules/tickets/domain/ticket-status-transition.service.ts`
- `src/modules/tickets/domain/ticket-status-transition.service.spec.ts`
- `src/modules/tickets/dto/assign-ticket.dto.ts`
- `src/modules/tickets/dto/create-ticket.dto.ts`
- `src/modules/tickets/dto/get-tickets-query.dto.ts`
- `src/modules/tickets/dto/update-status.dto.ts`
- `src/modules/tickets/entities/ticket.entity.ts`
- `src/modules/tickets/entities/ticket-status.enum.ts`
- `src/modules/tickets/events/send-notification.handler.ts`
- `src/modules/tickets/events/send-notification.handler.spec.ts`
- `src/modules/tickets/events/ticket-created.event.ts`
- `src/modules/tickets/events/ticket-status-updated.event.ts`
- `src/modules/tickets/policies/ticket-policy.service.ts`
- `src/modules/tickets/policies/ticket-policy.service.spec.ts`
- `src/modules/tickets/queries/get-ticket/get-ticket.handler.ts`
- `src/modules/tickets/queries/get-ticket/get-ticket.handler.spec.ts`
- `src/modules/tickets/queries/get-ticket/get-ticket.query.ts`
- `src/modules/tickets/queries/get-tickets/get-tickets.handler.ts`
- `src/modules/tickets/queries/get-tickets/get-tickets.handler.spec.ts`
- `src/modules/tickets/queries/get-tickets/get-tickets.query.ts`
- `src/modules/tickets/repositories/ticket.repository.interface.ts`
- `src/modules/tickets/repositories/ticket.typeorm.repository.ts`
- `src/modules/tickets/tickets.controller.ts`
- `src/modules/tickets/tickets.module.ts`

### Comments

- `src/modules/comments/api/comments.http-documentation.ts`
- `src/modules/comments/commands/create-comment/create-comment.command.ts`
- `src/modules/comments/commands/create-comment/create-comment.handler.ts`
- `src/modules/comments/commands/create-comment/create-comment.handler.spec.ts`
- `src/modules/comments/commands/delete-comment/delete-comment.command.ts`
- `src/modules/comments/commands/delete-comment/delete-comment.handler.ts`
- `src/modules/comments/commands/delete-comment/delete-comment.handler.spec.ts`
- `src/modules/comments/commands/update-comment/update-comment.command.ts`
- `src/modules/comments/commands/update-comment/update-comment.handler.ts`
- `src/modules/comments/commands/update-comment/update-comment.handler.spec.ts`
- `src/modules/comments/comments.controller.ts`
- `src/modules/comments/comments.module.ts`
- `src/modules/comments/dto/create-comment.dto.ts`
- `src/modules/comments/dto/get-comments-query.dto.ts`
- `src/modules/comments/dto/update-comment.dto.ts`
- `src/modules/comments/entities/comment.entity.ts`
- `src/modules/comments/events/comment-created.event.ts`
- `src/modules/comments/events/notify-comment-created.handler.ts`
- `src/modules/comments/events/notify-comment-created.handler.spec.ts`
- `src/modules/comments/queries/get-comments/get-comments.handler.ts`
- `src/modules/comments/queries/get-comments/get-comments.handler.spec.ts`
- `src/modules/comments/queries/get-comments/get-comments.query.ts`
- `src/modules/comments/repositories/comment.repository.interface.ts`
- `src/modules/comments/repositories/comment.typeorm.repository.ts`

---

## 5. Regras de negócio que impactam o frontend

## 5.1 Usuários e papéis

Papéis:

- `user`
- `support`
- `admin`

Impacto em interface:

- mostrar/ocultar ações por role;
- ainda assim tratar `403` (backend sempre é fonte da verdade).

## 5.2 Tickets

### Criação

- qualquer usuário autenticado pode criar.

### Atribuição

- apenas `support` e `admin`.
- `user` deve ver ação desabilitada/oculta.

### Atualização de status

Permitidos:

- criador do ticket;
- usuário atribuído;
- `support` e `admin`.

### Transição de status

Fluxo obrigatório:

- `open` → `in_progress`
- `in_progress` → `resolved`
- `resolved` → `closed`
- `closed` não transita

Se inválido: `409`.

## 5.3 Comentários

### Criar comentário

- requer ticket existente;
- se ticket não existe: `404`.

### Editar comentário

Permitidos:

- autor do comentário;
- `admin`.

Não permitido: `403`.

### Excluir comentário

Permitidos:

- autor do comentário;
- `admin`.

Não permitido: `403`.

---

## 6. Rotas e contratos para integração React

## 6.1 Auth

### POST `/auth/register`

Request:

```json
{
  "name": "João da Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "password": "12345678"
}
```

Sucesso:

```json
{
  "success": true,
  "data": {
    "id": 10
  }
}
```

Erros comuns:

- `400` validação;
- `409` e-mail/CPF já cadastrado;
- `429` rate limit.

### POST `/auth/login`

Request:

```json
{
  "cpf": "12345678901",
  "password": "12345678"
}
```

Sucesso:

```json
{
  "success": true,
  "token": "eyJhbGciOi..."
}
```

Erros:

- `400` validação;
- `401` credenciais inválidas;
- `429` rate limit.

### POST `/auth/logout` (JWT)

Response:

```json
{
  "success": true
}
```

### GET `/auth/me` (JWT)

Sucesso:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "João da Silva",
    "cpf": "12345678901",
    "email": "joao@email.com",
    "role": "user",
    "createdAt": "2026-03-27T12:00:00.000Z",
    "updatedAt": "2026-03-27T12:00:00.000Z"
  }
}
```

Erros:

- `401` token ausente/inválido/usuário inexistente;
- `404` usuário não encontrado.

## 6.2 Tickets

### POST `/tickets` (JWT)

Request:

```json
{
  "title": "Payment gateway timeout",
  "description": "Users report timeout when confirming card payment in checkout."
}
```

Sucesso:

```json
{
  "id": 7,
  "success": true
}
```

### PATCH `/tickets/:id/status` (JWT)

Request:

```json
{
  "status": "in_progress"
}
```

Sucesso:

```json
{
  "id": 7,
  "success": true
}
```

Erros:

- `403` sem permissão;
- `404` ticket inexistente;
- `409` transição inválida.

### PATCH `/tickets/:id/assign` (JWT)

Request:

```json
{
  "userId": 2
}
```

Sucesso:

```json
{
  "id": 7,
  "success": true
}
```

Erros:

- `403` apenas suporte/admin;
- `404` ticket não encontrado.

### GET `/tickets` (JWT)

Query params:

- `status?: open|in_progress|resolved|closed`
- `assigneeId?: number`
- `page?: number` (default `1`)
- `limit?: number` (default `20`, max `100`)
- `sortBy?: createdAt|updatedAt|status`
- `order?: ASC|DESC`

Sucesso:

```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "title": "Payment gateway timeout",
      "description": "Users report timeout...",
      "status": "open",
      "createdBy": 5,
      "assignedTo": null,
      "createdAt": "2026-03-28T13:00:00.000Z",
      "updatedAt": "2026-03-28T13:00:00.000Z",
      "creator": {
        "id": 5,
        "name": "..."
      },
      "assignee": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### GET `/tickets/:id` (JWT)

Sucesso:

```json
{
  "success": true,
  "data": {
    "id": 7,
    "title": "Payment gateway timeout",
    "description": "Users report timeout...",
    "status": "open",
    "createdBy": 5,
    "assignedTo": null,
    "createdAt": "2026-03-28T13:00:00.000Z",
    "updatedAt": "2026-03-28T13:00:00.000Z",
    "creator": {
      "id": 5,
      "name": "..."
    },
    "assignee": null
  }
}
```

## 6.3 Comments

### POST `/tickets/:ticketId/comments` (JWT)

Request:

```json
{
  "content": "Issue acknowledged. Working on a fix."
}
```

Sucesso:

```json
{
  "id": 6,
  "success": true
}
```

Erros:

- `404` ticket inexistente;
- `400` payload inválido.

### GET `/tickets/:ticketId/comments` (JWT)

Query params:

- `page?: number` (default `1`)
- `limit?: number` (default `20`, max `100`)
- `order?: ASC|DESC` (por `createdAt`)

Sucesso:

```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "ticketId": 7,
      "authorId": 5,
      "content": "Issue acknowledged. Working on a fix.",
      "createdAt": "2026-03-28T13:05:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### PATCH `/tickets/:ticketId/comments/:id` (JWT)

Request:

```json
{
  "content": "Atualização: correção em andamento."
}
```

Erros:

- `403` se não for autor nem admin;
- `404` comentário não encontrado no ticket.

### DELETE `/tickets/:ticketId/comments/:id` (JWT)

Sucesso:

```json
{
  "id": 6,
  "success": true
}
```

Erros:

- `403` se não for autor nem admin;
- `404` comentário não encontrado no ticket.

---

## 7. Estratégia de implementação React por domínio

## 7.1 Módulo Auth (frontend)

Páginas:

- Login
- Cadastro

Estado recomendado:

- `auth.user`
- `auth.token`
- `auth.isAuthenticated`
- `auth.role`

Fluxo:

1. `POST /auth/login`
2. persistir token
3. `GET /auth/me`
4. preencher contexto de usuário
5. navegar para dashboard

Logout:

1. `POST /auth/logout`
2. limpar token e cache de queries
3. redirecionar para login

## 7.2 Módulo Tickets (frontend)

Páginas:

- Lista de tickets (filtro + paginação + ordenação)
- Detalhe do ticket
- Criação de ticket

Ações condicionais:

- botão Atribuir: visível para `support|admin`;
- botão Atualizar Status: visível para criador, assignee, `support|admin`.

## 7.3 Módulo Comments (frontend)

Componente no detalhe do ticket:

- formulário de novo comentário;
- lista paginada;
- editar/excluir por item.

Permissões na UI:

- mostrar editar/excluir quando `comment.authorId === user.id || user.role === 'admin'`.

## 7.4 Mapeamento de erros para UX

- `400`: destacar campos inválidos;
- `401`: redirecionar login;
- `403`: toast “sem permissão”;
- `404`: estado vazio “recurso não encontrado”;
- `409`: toast de conflito de regra de negócio;
- `429`: mensagem de tentativas excessivas no login/cadastro.

---

## 8. Tipos TypeScript sugeridos para o frontend

```ts
export type ApiError = {
    success: false;
    message: string;
    code: string;
    errors?: Record<string, unknown>;
    trace_id?: string;
};

export type UserRole = 'admin' | 'support' | 'user';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type AuthUser = {
    id: number;
    name: string;
    cpf: string;
    email: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
};

export type Ticket = {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    createdBy: number;
    assignedTo: number | null;
    createdAt: string;
    updatedAt: string;
    creator?: { id: number; name?: string; email?: string };
    assignee?: { id: number; name?: string; email?: string } | null;
};

export type Comment = {
    id: number;
    ticketId: number;
    authorId: number;
    content: string;
    createdAt: string;
};

export type PaginatedResponse<T> = {
    success: true;
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
```

---

## 9. Checklist de integração frontend

- implementar cliente HTTP com injeção automática de Bearer token;
- tratar resposta de sucesso em ambos formatos (`data` e retorno direto com `success`);
- mapear códigos de erro para UX consistente;
- criar guards de rota por autenticação e papel;
- implementar refresh de sessão via `/auth/me` ao iniciar app;
- usar paginação server-side em tickets e comentários;
- enviar somente valores permitidos de enum em filtros/status;
- logar `trace_id` em erros críticos no frontend.

---

## 10. Observações operacionais importantes

- Para funcionamento completo de comentários/tickets com eventos, as migrations devem estar aplicadas (`npm run migration:run`).
- Se `ASYNC_QUEUE_ENABLED=true`, Redis precisa estar ativo.
- A ausência de webhook configurado não impede uso principal da API, mas suprime entrega de notificação externa.

