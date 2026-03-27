# 🎫 TicketForge — Roteiro Robusto de Implementação CQRS com NestJS

## 1. Objetivo

Este roteiro define uma implementação robusta do TicketForge em NestJS com CQRS, incorporando:

- Boas práticas já presentes no roteiro original;
- Melhorias arquiteturais para produção;
- Padrões de segurança, escalabilidade, observabilidade e governança.

A meta é entregar uma API de tickets com escrita e leitura separadas, eventos de domínio, contratos HTTP estáveis, autorização consistente, paginação e capacidade de evolução para processamento assíncrono distribuído.

---

## 2. Princípios Arquiteturais

## 2.1 Separação de responsabilidades (CQRS)

- **Command Side**: altera estado e publica eventos, retornando resposta mínima (`id`, `success`, `version`).
- **Query Side**: lê dados, aplica filtros/paginação, nunca altera estado.
- **Controllers**: recebem requisições, validam via DTO/Pipe, despacham no Bus.
- **Handlers**: concentram regras de caso de uso.

## 2.2 Camadas e fronteiras

- **Apresentação**: controllers, guards, decorators, pipes.
- **Aplicação**: commands, queries, handlers, DTOs de entrada/saída.
- **Domínio**: entidades, value objects, eventos de domínio, regras de transição.
- **Infraestrutura**: repositories (TypeORM), cache, fila, integrações externas.

## 2.3 Regra de ouro

- CommandHandler **não** retorna payload de leitura completo.
- QueryHandler **não** faz escrita, nem publica eventos.
- Controller interage com handlers **apenas** por `CommandBus` e `QueryBus`.

---

## 3. Stack Recomendada

- **Framework**: NestJS 10+
- **CQRS**: `@nestjs/cqrs`
- **ORM**: TypeORM + PostgreSQL
- **Auth**: Passport JWT
- **Validação**: `class-validator` + `class-transformer`
- **Documentação**: `@nestjs/swagger`
- **Testes**: Jest + `@nestjs/testing` + Supertest
- **Fila assíncrona**: BullMQ (`@nestjs/bullmq`) + Redis
- **Configuração**: `@nestjs/config`
- **Observabilidade**: logs estruturados + correlation id

---

## 4. Estrutura de Pastas (DDD + CQRS)

```txt
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pagination/
│   └── response/
├── modules/
│   ├── auth/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   └── strategies/
│   ├── tickets/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── events/
│   │   ├── controllers/
│   │   ├── dto/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── policies/
│   └── comments/
│       ├── commands/
│       ├── queries/
│       ├── events/
│       ├── controllers/
│       ├── dto/
│       ├── entities/
│       └── repositories/
└── database/
    ├── migrations/
    └── seeders/
```

---

## 5. Contratos HTTP Padronizados

## 5.1 Envelope de sucesso

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": "Operação realizada com sucesso"
}
```

## 5.2 Envelope de erro (global)

```json
{
  "success": false,
  "message": "Mensagem amigável",
  "code": "TICKET_NOT_FOUND",
  "errors": {},
  "trace_id": "a1b2c3d4"
}
```

## 5.3 Mapeamento mínimo de status

- `400`: payload inválido/sintaxe
- `401`: não autenticado
- `403`: sem permissão
- `404`: recurso não encontrado
- `409`: conflito de estado/regra de negócio
- `422`: validação de domínio/entrada
- `500`: falha interna

---

## 6. Segurança e Autorização

## 6.1 Autenticação

- JWT com expiração curta e refresh token opcional.
- Guard global para endpoints privados.
- Rate limit em endpoints públicos (`/auth/login`, `/auth/register`).

## 6.2 Autorização por caso de uso

Definir matriz de autorização explícita:

- Criar ticket: usuário autenticado.
- Atualizar status: criador, responsável ou perfil de suporte.
- Atribuir ticket: apenas suporte/admin.
- Deletar comentário: autor do comentário ou admin.

Implementar em guard/policy dedicada por módulo.

---

## 7. Modelagem de Domínio e Banco

## 7.1 Entidades principais

- `User`
- `Ticket`
- `Comment`

## 7.2 Regras de domínio essenciais

- Fluxo de status com transições válidas (`open -> in_progress -> resolved -> closed`).
- Bloquear transições inválidas com exceção de domínio (`409`).
- Cada alteração de status gera evento de domínio.

## 7.3 Índices e constraints obrigatórios

- Índices: `tickets(status)`, `tickets(created_by)`, `tickets(assigned_to)`, `tickets(created_at)`.
- Índices compostos para filtros mais usados, ex.: `(status, created_at)`.
- Foreign keys com `ON UPDATE/DELETE` conforme regra de negócio.
- Unicidade quando aplicável.

---

## 8. Padrão de Repositório e Consultas

- Criar interfaces de repositório por domínio (`ITicketRepository`, `ICommentRepository`).
- Implementações TypeORM ficam na camada de infraestrutura.
- Evitar `select *`; selecionar colunas necessárias.
- Sempre usar joins explícitos para evitar N+1.
- Para consultas de alta carga, considerar read model materializada.

---

## 9. Padrão de Eventos e Assincronia

## 9.1 Eventos de domínio

- `TicketCreatedEvent`
- `TicketStatusUpdatedEvent`
- `CommentCreatedEvent`

## 9.2 Estratégia de produção

- Publicar evento em memória via `EventBus`.
- Para efeitos externos, enfileirar job no BullMQ.
- Adotar padrão Outbox para garantir consistência entre banco e mensageria.
- Consumers idempotentes para evitar duplicidade.

---

## 10. Padrão de Paginação e Filtros (Query Side)

Toda listagem deve aceitar:

- `page` (default: 1)
- `limit` (default: 20, máximo: 100)
- `sort` (campo permitido)
- `order` (`asc`/`desc`)
- filtros específicos (`status`, `assignee_id`, `created_by`, período)

Resposta de paginação:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

---

## 11. Fluxo End-to-End (Ticket)

1. `POST /tickets` recebe `CreateTicketDto`.
2. `JwtAuthGuard` autentica.
3. Controller despacha `CreateTicketCommand`.
4. Handler valida regra de negócio e persiste.
5. Handler publica `TicketCreatedEvent`.
6. EventHandler enfileira notificação.
7. API retorna `201` com `{ id, success }`.
8. `GET /tickets` usa `GetTicketsQuery` com paginação/filtros.
9. QueryHandler retorna coleção + metadados.

---

## 12. Roadmap de Implementação (Fases)

## Fase 1 — Fundação

- Criar projeto NestJS e configurar módulos base.
- Configurar `ValidationPipe`, `Swagger`, `ConfigModule`.
- Configurar TypeORM + migrations.
- Padronizar aliases (`paths`) no `tsconfig`.

## Fase 2 — Auth e Segurança

- Implementar login, me, guards e strategy JWT.
- Adicionar rate limiting para endpoints públicos.
- Definir matriz de autorização inicial.

## Fase 3 — Tickets (Command Side)

- Implementar `CreateTicket`, `UpdateStatus`, `AssignTicket`.
- Aplicar regra de transição de status no domínio.
- Publicar eventos de domínio em todos os comandos relevantes.

## Fase 4 — Tickets (Query Side)

- Implementar listagem e detalhe com paginação/filtros.
- Retornar contrato padronizado com `meta`.
- Otimizar consultas com índices e seleção de colunas.

## Fase 5 — Comentários

- Implementar comandos e queries de comentário.
- Aplicar autorização por autor/perfil.
- Publicar evento de criação de comentário.

## Fase 6 — Observabilidade e Assíncrono

- Incluir correlation id por request.
- Configurar logs estruturados.
- Integrar BullMQ + workers.
- Implementar Outbox para eventos críticos.

## Fase 7 — Qualidade e Go-Live

- Cobertura mínima de testes: 80% em handlers.
- Testes e2e dos fluxos críticos.
- Revisão de segurança (authn/authz/rate limit).
- Revisão de performance (queries, índices, paginação).

---

## 13. Estratégia de Testes

## 13.1 Unitários

- CommandHandlers: validar `save`, transições e publicação de evento.
- QueryHandlers: validar filtros/paginação sem escrita.
- Policies/Guards: cenários allow/deny.

## 13.2 Integração

- Repositórios com banco de teste.
- Migrations e constraints validadas.

## 13.3 E2E

Fluxos mínimos:

- Login -> criar ticket -> listar -> detalhar.
- Alterar status válido e inválido.
- Atribuir ticket sem permissão (esperar `403`).
- Criar e editar comentário com regras de autoria.

---

## 14. Checklist de Pronto para Produção

- Contratos HTTP consistentes e documentados.
- Tratamento global de exceções com código de erro funcional.
- Paginação em todas as listagens.
- Autorização por caso de uso implementada.
- Índices críticos aplicados nas migrations.
- Eventos críticos integrados com fila e idempotência.
- Logs estruturados com `trace_id`.
- Testes unitários, integração e e2e verdes.

---

## 15. Critérios de Aceite

- Separação CQRS respeitada em todos os módulos.
- Nenhum controller com regra de negócio.
- CommandHandlers retornando payload mínimo.
- QueryHandlers sem escrita/evento.
- Respostas de erro padronizadas.
- Performance de listagem estável com paginação e índices.

---

## 16. Referências

- NestJS CQRS: `https://docs.nestjs.com/recipes/cqrs`
- NestJS Guards: `https://docs.nestjs.com/guards`
- NestJS Testing: `https://docs.nestjs.com/fundamentals/testing`
- TypeORM: `https://typeorm.io`
- Swagger NestJS: `https://docs.nestjs.com/openapi/introduction`

---

## 17. Resultado Esperado

Ao final deste roteiro, o TicketForge NestJS estará preparado para:

- Crescimento com baixo acoplamento;
- Governança técnica com contratos previsíveis;
- Operação em produção com segurança, rastreabilidade e desempenho;
- Evolução incremental para arquitetura orientada a eventos distribuídos.

---

## 18. Anexo Técnico A — Diferenças Laravel vs NestJS CQRS

| Aspecto | Laravel (referência) | NestJS CQRS (alvo) |
| --- | --- | --- |
| Linguagem | PHP | TypeScript |
| Organização | Controllers/Services/Repositories | Modules + Command/Query/Event Handlers |
| Autenticação | Sanctum | Passport JWT + Guards |
| Validação | FormRequest | DTO + ValidationPipe |
| Eventos | Events/Listeners | EventBus + EventHandlers |
| ORM | Eloquent | TypeORM |
| Testes | PHPUnit/Mockery | Jest/@nestjs/testing/Supertest |
| Docs API | Swagger/Scribe no Laravel | `@nestjs/swagger` em `/docs/api` |

Diretriz de compatibilidade: preservar contratos funcionais do legado, usando o endpoint de referência `localhost:8000/docs/api` durante a migração.

---

## 19. Anexo Técnico B — Bootstrap Base (concreto)

## 19.1 Dependências iniciais

```bash
npm install @nestjs/cqrs @nestjs/passport @nestjs/jwt
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/config @nestjs/swagger
npm install passport passport-jwt bcryptjs
npm install class-validator class-transformer
npm install --save-dev @types/passport-jwt @types/bcryptjs
```

## 19.2 `main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('TicketForge API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    SwaggerModule.setup('docs/api', app, SwaggerModule.createDocument(app, config));

    await app.listen(3000);
}

bootstrap();
```

## 19.3 `app.module.ts`

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            autoLoadEntities: true,
            synchronize: false,
        }),
        AuthModule,
        TicketsModule,
        CommentsModule,
    ],
})
export class AppModule {}
```

---

## 20. Anexo Técnico C — Implementações de Referência (CQRS)

## 20.1 Command de criação de ticket

```ts
export class CreateTicketCommand {
    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly createdById: number,
    ) {}
}
```

```ts
@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: CreateTicketCommand): Promise<{ id: number; success: true }> {
        const ticket = this.ticketRepo.create({
            title: command.title,
            description: command.description,
            created_by: { id: command.createdById } as User,
        });

        await this.ticketRepo.save(ticket);
        this.eventBus.publish(new TicketCreatedEvent(ticket.id, command.createdById));

        return { id: ticket.id, success: true };
    }
}
```

## 20.2 Query de listagem com filtros

```ts
export class GetTicketsQuery {
    constructor(
        public readonly status?: TicketStatus,
        public readonly assignee?: number,
    ) {}
}
```

```ts
@QueryHandler(GetTicketsQuery)
export class GetTicketsHandler implements IQueryHandler<GetTicketsQuery> {
    constructor(
        @InjectRepository(Ticket)
        private readonly ticketRepo: Repository<Ticket>,
    ) {}

    async execute({ status, assignee }: GetTicketsQuery): Promise<Ticket[]> {
        const qb = this.ticketRepo
            .createQueryBuilder('ticket')
            .leftJoinAndSelect('ticket.created_by', 'creator')
            .leftJoinAndSelect('ticket.assigned_to', 'assignee')
            .orderBy('ticket.created_at', 'DESC');

        if (status) {
            qb.andWhere('ticket.status = :status', { status });
        }

        if (assignee) {
            qb.andWhere('assignee.id = :assignee', { assignee });
        }

        return qb.getMany();
    }
}
```

## 20.3 Controller thin por Bus

```ts
@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get()
    getAll() {
        return this.queryBus.execute(new GetTicketsQuery());
    }

    @Post()
    create(@Body() dto: CreateTicketDto, @CurrentUser() user: { id: number }) {
        return this.commandBus.execute(new CreateTicketCommand(dto.title, dto.description, user.id));
    }
}
```

---

## 21. Anexo Técnico D — Segurança, Guardas e Módulo

## 21.1 `JwtAuthGuard` e `JwtStrategy`

```ts
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    validate(payload: { sub: number; email: string }) {
        return { id: payload.sub, email: payload.email };
    }
}
```

## 21.2 `tickets.module.ts` (registro completo)

```ts
const CommandHandlers = [CreateTicketHandler, UpdateStatusHandler, AssignTicketHandler];
const QueryHandlers = [GetTicketsHandler, GetTicketHandler];
const EventHandlers = [SendNotificationHandler];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Ticket])],
    controllers: [TicketsController],
    providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class TicketsModule {}
```

---

## 22. Anexo Técnico E — Testes, Execução e Ambiente

## 22.1 Estratégia mínima de testes

- CommandHandlers: mock de `Repository` e `EventBus`, validando `save()` e `publish()`.
- QueryHandlers: validar que não há `save()` nem publicação de evento.
- Controllers: testes com `@nestjs/testing` + `supertest`, mockando `CommandBus`/`QueryBus`.
- Guards: cenários `allow` e `ForbiddenException`.
- E2E: fluxo completo `login -> create ticket -> update status`.

## 22.2 Comandos de execução

```bash
npm run test
npm run test -- --testPathPattern=tickets
npm run test:cov
npm run test:e2e
npm run test:watch
```

## 22.3 `.env` de referência

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ticketforge
JWT_SECRET=sua-chave-secreta-muito-longa
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

---

## 23. Matriz de Cobertura 100% (Original + Melhorias)

- Arquitetura CQRS, fluxo e módulos: coberto.
- Exemplos concretos de bootstrap, handlers, controllers, guards e module: coberto.
- Estratégia e comandos de testes, mais variáveis de ambiente: coberto.
- Referência de contrato legado Laravel (`localhost:8000/docs/api`): coberto.
- Melhorias de robustez (paginação padrão, autorização por caso de uso, outbox, idempotência, contrato global de erro): coberto.

Resultado: este documento passa a atuar como versão híbrida, mantendo a base didática do roteiro original e adicionando endurecimento técnico para produção.
