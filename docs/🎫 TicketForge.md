🎫 TicketForge

Roteiro CQRS com NestJS

Commands · Queries · Events · CQRS Bus

Command Query Responsibility Segregation com @nestjs/cqrs

1. Visão Geral

Objetivo
Este roteiro detalha a implementação do backend NestJS aplicando CQRS de forma nativa com o pacote @nestjs/cqrs para o sistema TicketForge - API REST de gestão de tickets com autenticação JWT/Sanctum, ciclo completo de chamados e comentários.

CQRS no NestJS com @nestjs/cqrs

O pacote @nestjs/cqrs fornece CommandBus, QueryBus e EventBus nativos. Controllers despacham Commands ou Queries para o Bus. CommandHandlers executam a lógica de escrita e publicam Domain Events. QueryHandlers executam a leitura. Nunca se misturam.

Diferenças em relação ao Laravel (TicketForge original)
Aspecto	NestJS CQRS
Linguagem	TypeScript com decorators nativos (@Command, @Query, @EventsHandler)
Módulos	NestJS Modules com injeção de dependência via DI Container
CQRS Bus	@nestjs/cqrs - CommandBus, QueryBus e EventBus integrados ao DI
Autenticação	Passport.js + JWT Strategy (equivalente ao Sanctum)
ORM	TypeORM ou Prisma (equivalente ao Eloquent)
Validação	class-validator + class-transformer (equivalente ao FormRequest)
Eventos	EventBus do @nestjs/cqrs (equivalente ao Event-Driven do Laravel)
Autorização	Guards customizados (equivalente às Policies do Laravel)
Testes	Jest + @nestjs/testing (equivalente ao PHPUnit + Mockery)
Stack Tecnológica
Camada	Tecnologia	Papel no CQRS
Framework	NestJS 10+	DI Container, Módulos, Pipes, Guards
CQRS	@nestjs/cqrs	CommandBus, QueryBus, EventBus nativos
Auth	Passport.js + JWT	Guards e Strategies de autenticação
ORM	TypeORM + PostgreSQL	Repositories e entidades tipadas
Validação	class-validator + class-transformer	DTOs e Pipes de validação
Docs	Swagger (@nestjs/swagger)	OpenAPI gerado automaticamente
Testes	Jest + @nestjs/testing	Unit, integration e e2e
Migrations	TypeORM Migrations	Equivalente ao php artisan migrate
Config	@nestjs/config	Gerenciamento de variáveis de ambiente
2. Arquitetura CQRS NestJS

Fluxo de uma Requisição
Etapa	Responsável
1. HTTP Request chega	Controller NestJS recebe e valida via ValidationPipe
2. Guard verifica autenticação	JwtAuthGuard extrai e valida token Bearer
3. Guard verifica autorização	TicketGuard ou PolicyGuard verifica permissões
4. Controller cria Command ou Query	Instância do Command/Query DTO com os dados da requisição
5. Bus despacha	commandBus.execute(cmd) ou queryBus.execute(qry)
6. Handler processa	CommandHandler ou QueryHandler recebe e executa
7. CommandHandler publica Event	EventBus.publish(new TicketCreatedEvent(...))
8. EventHandler reage	Notificações, emails, logs assíncronos
9. Resposta serializada	Controller retorna via @nestjs/swagger DTO tipado
Estrutura de Pastas
src/

├── app.module.ts

├── main.ts

├── config/ # @nestjs/config

│ └── configuration.ts

├── common/ # Shared utilities

│ ├── guards/

│ │ ├── jwt-auth.guard.ts

│ │ └── ticket-ownership.guard.ts

│ ├── decorators/

│ │ └── current-user.decorator.ts

│ └── filters/

│ └── http-exception.filter.ts

├── modules/

│ ├── auth/

│ │ ├── auth.module.ts

│ │ ├── auth.controller.ts

│ │ ├── commands/ # Command Side

│ │ │ ├── login/

│ │ │ │ ├── login.command.ts

│ │ │ │ └── login.handler.ts

│ │ │ └── logout/

│ │ │ ├── logout.command.ts

│ │ │ └── logout.handler.ts

│ │ ├── queries/ # Query Side

│ │ │ └── get-me/

│ │ │ ├── get-me.query.ts

│ │ │ └── get-me.handler.ts

│ │ ├── strategies/

│ │ │ └── jwt.strategy.ts

│ │ └── dto/

│ │ ├── login.dto.ts

│ │ └── register.dto.ts

│ ├── tickets/

│ │ ├── tickets.module.ts

│ │ ├── tickets.controller.ts

│ │ ├── commands/

│ │ │ ├── create-ticket/

│ │ │ │ ├── create-ticket.command.ts

│ │ │ │ └── create-ticket.handler.ts

│ │ │ ├── update-status/

│ │ │ │ ├── update-status.command.ts

│ │ │ │ └── update-status.handler.ts

│ │ │ └── assign-ticket/

│ │ │ ├── assign-ticket.command.ts

│ │ │ └── assign-ticket.handler.ts

│ │ ├── queries/

│ │ │ ├── get-tickets/

│ │ │ │ ├── get-tickets.query.ts

│ │ │ │ └── get-tickets.handler.ts

│ │ │ └── get-ticket/

│ │ │ ├── get-ticket.query.ts

│ │ │ └── get-ticket.handler.ts

│ │ ├── events/

│ │ │ ├── ticket-created.event.ts

│ │ │ ├── ticket-status-updated.event.ts

│ │ │ └── handlers/

│ │ │ └── send-notification.handler.ts

│ │ ├── entities/

│ │ │ └── ticket.entity.ts

│ │ └── dto/

│ │ ├── create-ticket.dto.ts

│ │ └── update-status.dto.ts

│ └── comments/

│ ├── comments.module.ts

│ ├── comments.controller.ts

│ ├── commands/

│ ├── queries/

│ ├── events/

│ ├── entities/

│ └── dto/

└── database/

├── migrations/

└── seeders/

3. Configuração Base

Instalação de Dependências
npm install @nestjs/cqrs @nestjs/passport @nestjs/jwt

npm install @nestjs/typeorm typeorm pg

npm install @nestjs/config @nestjs/swagger

npm install passport passport-jwt bcryptjs

npm install class-validator class-transformer

npm install --save-dev @types/passport-jwt @types/bcryptjs

main.ts - Bootstrap
// src/main.ts

import { NestFactory } from '@nestjs/core';

import { ValidationPipe } from '@nestjs/common';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {

const app = await NestFactory.create(AppModule);

app.setGlobalPrefix('api/v1');

app.useGlobalPipes(new ValidationPipe({

whitelist: true,

forbidNonWhitelisted: true,

transform: true,

}));

const config = new DocumentBuilder()

.setTitle('TicketForge API')

.setVersion('1.0')

.addBearerAuth()

.build();

SwaggerModule.setup('docs/api', app,

SwaggerModule.createDocument(app, config));

await app.listen(3000);

}

bootstrap();

app.module.ts
// src/app.module.ts

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

4. Módulo Auth

auth.module.ts
// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthController } from './auth.controller';

import { JwtStrategy } from './strategies/jwt.strategy';

import { LoginHandler } from './commands/login/login.handler';

import { LogoutHandler } from './commands/logout/logout.handler';

import { GetMeHandler } from './queries/get-me/get-me.handler';

import { User } from './entities/user.entity';

@Module({

imports: [

CqrsModule,

PassportModule,

JwtModule.register({

secret: process.env.JWT_SECRET,

signOptions: { expiresIn: '7d' },

}),

TypeOrmModule.forFeature([User]),

],

controllers: [AuthController],

providers: [JwtStrategy, LoginHandler, LogoutHandler, GetMeHandler],

exports: [JwtModule],

})

export class AuthModule {}

DTOs de Auth
// src/modules/auth/dto/login.dto.ts

import { IsEmail, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {

@ApiProperty() @IsEmail()

email: string;

@ApiProperty() @IsString() @MinLength(8)

password: string;

}

Command: Login
// src/modules/auth/commands/login/login.command.ts

export class LoginCommand {

constructor(

public readonly email: string,

public readonly password: string,

) {}

}

// src/modules/auth/commands/login/login.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';

import { JwtService } from '@nestjs/jwt';

import { UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

import { LoginCommand } from './login.command';

import { User } from '../../entities/user.entity';

@CommandHandler(LoginCommand)

export class LoginHandler implements ICommandHandler<LoginCommand> {

constructor(

@InjectRepository(User)

private readonly userRepo: Repository<User>,

private readonly jwtService: JwtService,

) {}

async execute(command: LoginCommand) {

const { email, password } = command;

const user = await this.userRepo.findOneBy({ email });

if (!user || !(await bcrypt.compare(password, user.password)))

throw new UnauthorizedException('Credenciais inválidas');

const token = this.jwtService.sign({ sub: user.id, email: user.email });

return { token, user };

}

}

Query: GetMe
// src/modules/auth/queries/get-me/get-me.query.ts

export class GetMeQuery {

constructor(public readonly userId: number) {}

}

// src/modules/auth/queries/get-me/get-me.handler.ts

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';

import { NotFoundException } from '@nestjs/common';

import { GetMeQuery } from './get-me.query';

import { User } from '../../entities/user.entity';

@QueryHandler(GetMeQuery)

export class GetMeHandler implements IQueryHandler<GetMeQuery> {

constructor(

@InjectRepository(User)

private readonly userRepo: Repository<User>,

) {}

async execute({ userId }: GetMeQuery) {

const user = await this.userRepo.findOneBy({ id: userId });

if (!user) throw new NotFoundException('Usuário não encontrado');

return user;

}

}

Auth Controller
// src/modules/auth/auth.controller.ts

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { LoginCommand } from './commands/login/login.command';

import { GetMeQuery } from './queries/get-me/get-me.query';

import { LoginDto } from './dto/login.dto';

@ApiTags('auth')

@Controller('auth')

export class AuthController {

constructor(

private readonly commandBus: CommandBus,

private readonly queryBus: QueryBus,

) {}

@Post('login')

login(@Body() dto: LoginDto) {

return this.commandBus.execute(

new LoginCommand(dto.email, dto.password),

);

}

@Get('me')

@UseGuards(JwtAuthGuard)

@ApiBearerAuth()

getMe(@CurrentUser() user: { id: number }) {

return this.queryBus.execute(new GetMeQuery(user.id));

}

}

5. Módulo Tickets - Command Side

Regra fundamental do Command Side

CommandHandlers executam lógica de escrita, persistem dados via Repository e publicam Domain Events. Eles NUNCA retornam dados completos para leitura - apenas o ID ou uma confirmação mínima. Toda leitura é responsabilidade do Query Side.

Entity: Ticket
// src/modules/tickets/entities/ticket.entity.ts

import { Entity, PrimaryGeneratedColumn, Column,

ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type TicketStatus = 'open'|'in_progress'|'resolved'|'closed';

@Entity('tickets')

export class Ticket {

@PrimaryGeneratedColumn() id: number;

@Column() title: string;

@Column('text') description: string;

@Column({ default: 'open' })

status: TicketStatus;

@ManyToOne(() => User, { eager: true }) created_by: User;

@ManyToOne(() => User, { nullable: true, eager: true })

assigned_to: User | null;

@CreateDateColumn() created_at: Date;

@UpdateDateColumn() updated_at: Date;

}

DTOs de Tickets
// src/modules/tickets/dto/create-ticket.dto.ts

import { IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateTicketDto {

@ApiProperty() @IsString() @MinLength(3)

title: string;

@ApiProperty() @IsString() @MinLength(10)

description: string;

}

// src/modules/tickets/dto/update-status.dto.ts

import { IsEnum } from 'class-validator';

export class UpdateStatusDto {

@IsEnum(['open','in_progress','resolved','closed'])

status: TicketStatus;

}

Command: CreateTicket
// commands/create-ticket/create-ticket.command.ts

export class CreateTicketCommand {

constructor(

public readonly title: string,

public readonly description: string,

public readonly createdById: number,

) {}

}

// commands/create-ticket/create-ticket.handler.ts

import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';

import { CreateTicketCommand } from './create-ticket.command';

import { TicketCreatedEvent } from '../../events/ticket-created.event';

import { Ticket } from '../../entities/ticket.entity';

@CommandHandler(CreateTicketCommand)

export class CreateTicketHandler

implements ICommandHandler<CreateTicketCommand> {

constructor(

@InjectRepository(Ticket)

private readonly ticketRepo: Repository<Ticket>,

private readonly eventBus: EventBus,

) {}

async execute(command: CreateTicketCommand) {

const ticket = this.ticketRepo.create({

title: command.title,

description: command.description,

created_by: { id: command.createdById },

});

await this.ticketRepo.save(ticket);

this.eventBus.publish(

new TicketCreatedEvent(ticket.id, command.createdById),

);

return { id: ticket.id };

}

}

Command: UpdateStatus
// commands/update-status/update-status.command.ts

export class UpdateStatusCommand {

constructor(

public readonly ticketId: number,

public readonly status: TicketStatus,

public readonly userId: number,

) {}

}

// commands/update-status/update-status.handler.ts

@CommandHandler(UpdateStatusCommand)

export class UpdateStatusHandler

implements ICommandHandler<UpdateStatusCommand> {

constructor(

@InjectRepository(Ticket)

private readonly ticketRepo: Repository<Ticket>,

private readonly eventBus: EventBus,

) {}

async execute({ ticketId, status, userId }: UpdateStatusCommand) {

const ticket = await this.ticketRepo.findOneByOrFail({ id: ticketId });

ticket.status = status;

await this.ticketRepo.save(ticket);

this.eventBus.publish(

new TicketStatusUpdatedEvent(ticketId, status, userId),

);

return { id: ticketId };

}

}

Command: AssignTicket
// commands/assign-ticket/assign-ticket.command.ts

export class AssignTicketCommand {

constructor(

public readonly ticketId: number,

public readonly assigneeId: number,

public readonly requesterId: number,

) {}

}

// commands/assign-ticket/assign-ticket.handler.ts

@CommandHandler(AssignTicketCommand)

export class AssignTicketHandler

implements ICommandHandler<AssignTicketCommand> {

async execute({ ticketId, assigneeId }: AssignTicketCommand) {

await this.ticketRepo.update(ticketId, {

assigned_to: { id: assigneeId },

});

return { id: ticketId };

}

}

6. Módulo Tickets - Query Side

Regra fundamental do Query Side

QueryHandlers são somente leitura. Eles podem usar o Repository diretamente, uma view otimizada, ou até uma conexão de banco separada (read replica). Nunca publicam eventos, nunca alteram estado.

Query: GetTickets
// queries/get-tickets/get-tickets.query.ts

export class GetTicketsQuery {

constructor(

public readonly userId?: number,

public readonly status?: TicketStatus,

public readonly assignee?: number,

) {}

}

// queries/get-tickets/get-tickets.handler.ts

import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

import { InjectRepository } from '@nestjs/typeorm';

import { GetTicketsQuery } from './get-tickets.query';

import { Ticket } from '../../entities/ticket.entity';

@QueryHandler(GetTicketsQuery)

export class GetTicketsHandler

implements IQueryHandler<GetTicketsQuery> {

constructor(

@InjectRepository(Ticket)

private readonly ticketRepo: Repository<Ticket>,

) {}

async execute({ status, assignee }: GetTicketsQuery) {

const qb = this.ticketRepo

.createQueryBuilder('ticket')

.leftJoinAndSelect('ticket.created_by', 'creator')

.leftJoinAndSelect('ticket.assigned_to', 'assignee')

.orderBy('ticket.created_at', 'DESC');

if (status) qb.andWhere('ticket.status = :status', { status });

if (assignee) qb.andWhere('assignee.id = :assignee', { assignee });

return qb.getMany();

}

}

Query: GetTicketById
// queries/get-ticket/get-ticket.query.ts

export class GetTicketQuery {

constructor(public readonly ticketId: number) {}

}

// queries/get-ticket/get-ticket.handler.ts

@QueryHandler(GetTicketQuery)

export class GetTicketHandler implements IQueryHandler<GetTicketQuery> {

async execute({ ticketId }: GetTicketQuery) {

const ticket = await this.ticketRepo

.createQueryBuilder('ticket')

.leftJoinAndSelect('ticket.created_by', 'creator')

.leftJoinAndSelect('ticket.assigned_to', 'assignee')

.where('ticket.id = :id', { id: ticketId })

.getOne();

if (!ticket) throw new NotFoundException('Ticket não encontrado');

return ticket;

}

}

7. Domain Events

Definição dos Eventos
// src/modules/tickets/events/ticket-created.event.ts

export class TicketCreatedEvent {

constructor(

public readonly ticketId: number,

public readonly creatorId: number,

) {}

}

// src/modules/tickets/events/ticket-status-updated.event.ts

export class TicketStatusUpdatedEvent {

constructor(

public readonly ticketId: number,

public readonly status: TicketStatus,

public readonly userId: number,

) {}

}

EventHandler: Notificação
// events/handlers/send-notification.handler.ts

import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { TicketCreatedEvent } from '../ticket-created.event';

@EventsHandler(TicketCreatedEvent)

export class SendNotificationHandler

implements IEventHandler<TicketCreatedEvent> {

handle(event: TicketCreatedEvent) {

// Disparo assíncrono: email, push, websocket...

console.log(`Ticket ${event.ticketId} criado por ${event.creatorId}`);

}

}

EventBus vs Filas externas

O EventBus do @nestjs/cqrs opera in-process (síncrono no mesmo runtime). Para processamento assíncrono distribuído, integre com @nestjs/bull (Redis) ou @nestjs/microservices. O Domain Event permanece o mesmo - apenas o transporte muda.

8. Tickets Controller

O Controller é thin: recebe HTTP, valida DTO via ValidationPipe e despacha para o Bus. Sem lógica de negócio.

// src/modules/tickets/tickets.controller.ts

import { Controller, Get, Post, Patch,

Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

import { CreateTicketCommand } from './commands/create-ticket/create-ticket.command';

import { UpdateStatusCommand } from './commands/update-status/update-status.command';

import { AssignTicketCommand } from './commands/assign-ticket/assign-ticket.command';

import { GetTicketsQuery } from './queries/get-tickets/get-tickets.query';

import { GetTicketQuery } from './queries/get-ticket/get-ticket.query';

import { CreateTicketDto } from './dto/create-ticket.dto';

import { UpdateStatusDto } from './dto/update-status.dto';

@ApiTags('tickets')

@ApiBearerAuth()

@UseGuards(JwtAuthGuard)

@Controller('tickets')

export class TicketsController {

constructor(

private readonly commandBus: CommandBus,

private readonly queryBus: QueryBus,

) {}

// ─── QUERIES ───────────────────────────────────────────

@Get()

getAll() {

return this.queryBus.execute(new GetTicketsQuery());

}

@Get(':id')

getOne(@Param('id', ParseIntPipe) id: number) {

return this.queryBus.execute(new GetTicketQuery(id));

}

// ─── COMMANDS ──────────────────────────────────────────

@Post()

create(

@Body() dto: CreateTicketDto,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new CreateTicketCommand(dto.title, dto.description, user.id),

);

}

@Patch(':id/status')

updateStatus(

@Param('id', ParseIntPipe) id: number,

@Body() dto: UpdateStatusDto,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new UpdateStatusCommand(id, dto.status, user.id),

);

}

@Patch(':id/assign')

assign(

@Param('id', ParseIntPipe) id: number,

@Body('user_id', ParseIntPipe) userId: number,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new AssignTicketCommand(id, userId, user.id),

);

}

}

9. Módulo Comentários

Commands de Comentários
// commands/create-comment/create-comment.command.ts

export class CreateCommentCommand {

constructor(

public readonly ticketId: number,

public readonly body: string,

public readonly authorId: number,

) {}

}

// commands/create-comment/create-comment.handler.ts

@CommandHandler(CreateCommentCommand)

export class CreateCommentHandler

implements ICommandHandler<CreateCommentCommand> {

async execute({ ticketId, body, authorId }: CreateCommentCommand) {

const comment = this.commentRepo.create({

ticket: { id: ticketId },

body,

author: { id: authorId },

});

await this.commentRepo.save(comment);

return { id: comment.id };

}

}

// commands/update-comment/update-comment.command.ts

export class UpdateCommentCommand {

constructor(

public readonly commentId: number,

public readonly body: string,

public readonly requesterId: number,

) {}

}

// commands/delete-comment/delete-comment.command.ts

export class DeleteCommentCommand {

constructor(

public readonly commentId: number,

public readonly requesterId: number,

) {}

}

Query de Comentários
// queries/get-comments/get-comments.query.ts

export class GetCommentsQuery {

constructor(public readonly ticketId: number) {}

}

// queries/get-comments/get-comments.handler.ts

@QueryHandler(GetCommentsQuery)

export class GetCommentsHandler

implements IQueryHandler<GetCommentsQuery> {

async execute({ ticketId }: GetCommentsQuery) {

return this.commentRepo.find({

where: { ticket: { id: ticketId } },

relations: ['author'],

order: { created_at: 'ASC' },

});

}

}

Comments Controller
// src/modules/comments/comments.controller.ts

@ApiTags('comments')

@ApiBearerAuth()

@UseGuards(JwtAuthGuard)

@Controller('tickets/:ticketId/comments')

export class CommentsController {

constructor(

private readonly commandBus: CommandBus,

private readonly queryBus: QueryBus,

) {}

@Get()

list(@Param('ticketId', ParseIntPipe) ticketId: number) {

return this.queryBus.execute(new GetCommentsQuery(ticketId));

}

@Post()

create(

@Param('ticketId', ParseIntPipe) ticketId: number,

@Body('body') body: string,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new CreateCommentCommand(ticketId, body, user.id),

);

}

@Patch(':commentId')

update(

@Param('commentId', ParseIntPipe) commentId: number,

@Body('body') body: string,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new UpdateCommentCommand(commentId, body, user.id),

);

}

@Delete(':commentId')

delete(

@Param('commentId', ParseIntPipe) commentId: number,

@CurrentUser() user: { id: number },

) {

return this.commandBus.execute(

new DeleteCommentCommand(commentId, user.id),

);

}

}

10. Guards e Decorators

JwtAuthGuard
// src/common/guards/jwt-auth.guard.ts

import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}

JwtStrategy
// src/modules/auth/strategies/jwt.strategy.ts

import { PassportStrategy } from '@nestjs/passport';

import { Strategy, ExtractJwt } from 'passport-jwt';

import { Injectable } from '@nestjs/common';

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

CurrentUser Decorator
// src/common/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(

(_data, ctx: ExecutionContext) => {

const req = ctx.switchToHttp().getRequest();

return req.user;

},

);

TicketOwnership Guard
// src/common/guards/ticket-ownership.guard.ts

import { CanActivate, ExecutionContext, Injectable,

ForbiddenException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Ticket } from '@/modules/tickets/entities/ticket.entity';

@Injectable()

export class TicketOwnershipGuard implements CanActivate {

constructor(

@InjectRepository(Ticket)

private readonly ticketRepo: Repository<Ticket>,

) {}

async canActivate(context: ExecutionContext): Promise<boolean> {

const req = context.switchToHttp().getRequest();

const ticketId = Number(req.params.id);

const userId = req.user.id;

const ticket = await this.ticketRepo.findOneByOrFail({ id: ticketId });

if (ticket.created_by.id !== userId)

throw new ForbiddenException('Acesso negado');

return true;

}

}

11. tickets.module.ts - Registro Completo

// src/modules/tickets/tickets.module.ts

import { Module } from '@nestjs/common';

import { CqrsModule } from '@nestjs/cqrs';

import { TypeOrmModule } from '@nestjs/typeorm';

import { TicketsController } from './tickets.controller';

import { Ticket } from './entities/ticket.entity';

// Commands

import { CreateTicketHandler } from './commands/create-ticket/create-ticket.handler';

import { UpdateStatusHandler } from './commands/update-status/update-status.handler';

import { AssignTicketHandler } from './commands/assign-ticket/assign-ticket.handler';

// Queries

import { GetTicketsHandler } from './queries/get-tickets/get-tickets.handler';

import { GetTicketHandler } from './queries/get-ticket/get-ticket.handler';

// Events

import { SendNotificationHandler } from './events/handlers/send-notification.handler';

const CommandHandlers = [CreateTicketHandler, UpdateStatusHandler, AssignTicketHandler];

const QueryHandlers = [GetTicketsHandler, GetTicketHandler];

const EventHandlers = [SendNotificationHandler];

@Module({

imports: [CqrsModule, TypeOrmModule.forFeature([Ticket])],

controllers: [TicketsController],

providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],

})

export class TicketsModule {}

12. Roteiro de Testes

Estratégia
Camada	Abordagem
CommandHandlers	Mockar Repository e EventBus. Verificar save() e eventBus.publish().
QueryHandlers	Mockar Repository. Verificar que nenhum save/publish é chamado.
Controllers	@nestjs/testing + supertest. Mockar CommandBus e QueryBus.
EventHandlers	Testar efeito colateral (log, email mock) de forma isolada.
Guards	Mockar ExecutionContext. Testar allow e ForbiddenException.
E2E	Banco SQLite em memória. Fluxo completo: login → criar → atualizar.
Teste de CommandHandler
// create-ticket.handler.spec.ts

import { Test } from '@nestjs/testing';

import { getRepositoryToken } from '@nestjs/typeorm';

import { CreateTicketHandler } from './create-ticket.handler';

import { EventBus } from '@nestjs/cqrs';

describe('CreateTicketHandler', () => {

let handler: CreateTicketHandler;

let ticketRepo: jest.Mocked<Repository<Ticket>>;

let eventBus: jest.Mocked<EventBus>;

beforeEach(async () => {

const module = await Test.createTestingModule({

providers: [

CreateTicketHandler,

{ provide: getRepositoryToken(Ticket),

useValue: { create: jest.fn(), save: jest.fn() } },

{ provide: EventBus, useValue: { publish: jest.fn() } },

],

}).compile();

handler = module.get(CreateTicketHandler);

ticketRepo = module.get(getRepositoryToken(Ticket));

eventBus = module.get(EventBus);

});

it('cria ticket e publica TicketCreatedEvent', async () => {

const saved = { id: 1, title: 'T', description: 'D' };

ticketRepo.create.mockReturnValue(saved as any);

ticketRepo.save.mockResolvedValue(saved as any);

const result = await handler.execute(

new CreateTicketCommand('T', 'D', 42),

);

expect(ticketRepo.save).toHaveBeenCalledTimes(1);

expect(eventBus.publish).toHaveBeenCalledWith(

expect.objectContaining({ ticketId: 1, creatorId: 42 }),

);

expect(result).toEqual({ id: 1 });

});

});

Teste de QueryHandler
// get-tickets.handler.spec.ts

it('retorna tickets sem publicar eventos', async () => {

const mockTickets = [{ id: 1 }, { id: 2 }];

const qb = {

leftJoinAndSelect: jest.fn().mockReturnThis(),

orderBy: jest.fn().mockReturnThis(),

andWhere: jest.fn().mockReturnThis(),

getMany: jest.fn().mockResolvedValue(mockTickets),

};

ticketRepo.createQueryBuilder.mockReturnValue(qb as any);

const result = await handler.execute(new GetTicketsQuery());

expect(result).toHaveLength(2);

expect(eventBus.publish).not.toHaveBeenCalled();

});

Teste de Controller
// tickets.controller.spec.ts

it('POST /tickets despacha CreateTicketCommand', async () => {

const executeSpy = jest.spyOn(commandBus, 'execute')

.mockResolvedValue({ id: 1 });

await request(app.getHttpServer())

.post('/api/v1/tickets')

.set('Authorization', `Bearer ${token}`)

.send({ title: 'Título', description: 'Descrição completa' })

.expect(201);

expect(executeSpy).toHaveBeenCalledWith(

expect.any(CreateTicketCommand),

);

});

Comandos de Execução
Rodar todos os testes
npm run test

Rodar testes por módulo
npm run test -- --testPathPattern=tickets

Cobertura
npm run test:cov

Testes E2E
npm run test:e2e

Watch mode
npm run test:watch

13. Variáveis de Ambiente

# .env

# Banco de dados

DATABASE_URL=postgresql://user:pass@localhost:5432/ticketforge

# JWT

JWT_SECRET=sua-chave-secreta-muito-longa

JWT_EXPIRES_IN=7d

# Aplicação

PORT=3000

NODE_ENV=development

14. Fluxo CQRS Completo - Ciclo de Ticket

Etapa	Responsável NestJS
1. POST /tickets chega	TicketsController - ValidationPipe valida CreateTicketDto
2. JwtAuthGuard verifica token	JwtStrategy extrai userId do payload JWT
3. Controller cria Command	new CreateTicketCommand(title, desc, userId)
4. commandBus.execute(cmd)	CommandBus localiza CreateTicketHandler via DI
5. Handler persiste no banco	ticketRepo.save(ticket) via TypeORM
6. Handler publica evento	eventBus.publish(new TicketCreatedEvent(...))
7. EventHandler reage	SendNotificationHandler.handle() - assíncrono
8. Controller retorna { id }	HTTP 201 Created com ID do ticket
9. GET /tickets chega	TicketsController - sem body, sem validação
10. queryBus.execute(query)	QueryBus localiza GetTicketsHandler via DI
11. Handler consulta banco	QueryBuilder com joins e filtros opcionais
12. Retorna array serializado	HTTP 200 OK com lista de tickets
Regra de Ouro CQRS NestJS

CommandHandlers escrevem e publicam eventos - nunca lêem para retornar dados completos. QueryHandlers lêem e retornam - nunca escrevem nem publicam eventos. O CommandBus e o QueryBus são os únicos pontos de contato entre Controllers e Handlers.

15. Checklist de Entrega

Configuração Inicial
Projeto NestJS criado com nest new ticketforge-api
@nestjs/cqrs instalado e CqrsModule importado em cada módulo
TypeORM configurado com PostgreSQL e migrations habilitadas
Passport.js + JWT configurados no AuthModule
ValidationPipe global com whitelist e transform
Swagger configurado em /docs/api com BearerAuth
@nestjs/config com .env e ConfigModule.forRoot({ isGlobal: true })
Módulo Auth
User entity e migration criados
LoginCommand + LoginHandler implementados
LogoutCommand + LogoutHandler implementados
GetMeQuery + GetMeHandler implementados
JwtStrategy configurada
JwtAuthGuard criado e aplicado
CurrentUser decorator criado
Módulo Tickets - Commands
Ticket entity e migration criados
CreateTicketCommand + Handler (publica TicketCreatedEvent)
UpdateStatusCommand + Handler (publica TicketStatusUpdatedEvent)
AssignTicketCommand + Handler
TicketOwnershipGuard implementado
Módulo Tickets - Queries
GetTicketsQuery + Handler (com filtros opcionais)
GetTicketQuery + Handler (com joins e NotFoundException)
Módulo Tickets - Events
TicketCreatedEvent definido
TicketStatusUpdatedEvent definido
SendNotificationHandler registrado
Módulo Comments
Comment entity e migration criados
CreateCommentCommand + Handler
UpdateCommentCommand + Handler
DeleteCommentCommand + Handler
GetCommentsQuery + Handler
CommentsController com rotas aninhadas /tickets/:ticketId/comments
Testes
Testes de todos os CommandHandlers (mock repo + eventBus)
Testes de todos os QueryHandlers (sem publicação de eventos)
Testes de Controllers com supertest
Testes de Guards
Cobertura >= 80% em handlers/
16. Referências

Recurso	URL
NestJS CQRS Docs	docs.nestjs.com/recipes/cqrs
NestJS Guards	docs.nestjs.com/guards
NestJS Testing	docs.nestjs.com/fundamentals/testing
TypeORM Docs	typeorm.io
Passport JWT	docs.nestjs.com/security/authentication
class-validator	github.com/typestack/class-validator
NestJS Swagger	docs.nestjs.com/openapi/introduction
TicketForge Laravel API	localhost:8000/docs/api (referência de contratos)
