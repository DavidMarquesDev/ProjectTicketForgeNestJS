import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { OutboxModule } from '../outbox/outbox.module';
import { AssignTicketHandler } from './commands/assign-ticket/assign-ticket.handler';
import { CreateTicketHandler } from './commands/create-ticket/create-ticket.handler';
import { UpdateStatusHandler } from './commands/update-status/update-status.handler';
import { TicketStatusTransitionService } from './domain/ticket-status-transition.service';
import { AuditTicketAssignedHandler } from './events/audit/audit-ticket-assigned.handler';
import { AuditTicketStatusUpdatedHandler } from './events/audit/audit-ticket-status-updated.handler';
import { InvalidateTicketCacheOnStatusUpdatedHandler } from './events/cache/invalidate-ticket-cache-on-status-updated.handler';
import { SendNotificationHandler } from './events/notification/send-notification.handler';
import { EnqueueTicketCreatedOutboxHandler } from './events/outbox/enqueue-ticket-created-outbox.handler';
import { EnqueueTicketStatusUpdatedOutboxHandler } from './events/outbox/enqueue-ticket-status-updated-outbox.handler';
import { Ticket } from './entities/ticket.entity';
import { TicketPolicyService } from './policies/ticket-policy.service';
import { GetTicketHandler } from './queries/get-ticket/get-ticket.handler';
import { GetTicketsHandler } from './queries/get-tickets/get-tickets.handler';
import { TICKET_REPOSITORY } from './repositories/ticket.repository.interface';
import { TicketTypeOrmRepository } from './repositories/ticket.typeorm.repository';
import { TicketReadCacheService } from './services/ticket-read-cache.service';
import { TicketsController } from './tickets.controller';

const commandHandlers = [CreateTicketHandler, UpdateStatusHandler, AssignTicketHandler];
const queryHandlers = [GetTicketsHandler, GetTicketHandler];
const eventHandlers = [
    SendNotificationHandler,
    InvalidateTicketCacheOnStatusUpdatedHandler,
    AuditTicketAssignedHandler,
    AuditTicketStatusUpdatedHandler,
    EnqueueTicketCreatedOutboxHandler,
    EnqueueTicketStatusUpdatedOutboxHandler,
];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Ticket]), OutboxModule, IdempotencyModule],
    controllers: [TicketsController],
    providers: [
        TicketPolicyService,
        TicketStatusTransitionService,
        TicketReadCacheService,
        TicketTypeOrmRepository,
        {
            provide: TICKET_REPOSITORY,
            useExisting: TicketTypeOrmRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
    ],
    exports: [TICKET_REPOSITORY, TicketReadCacheService],
})
export class TicketsModule {}
