import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssignTicketHandler } from './commands/assign-ticket/assign-ticket.handler';
import { CreateTicketHandler } from './commands/create-ticket/create-ticket.handler';
import { UpdateStatusHandler } from './commands/update-status/update-status.handler';
import { TicketStatusTransitionService } from './domain/ticket-status-transition.service';
import { SendNotificationHandler } from './events/send-notification.handler';
import { Ticket } from './entities/ticket.entity';
import { TicketPolicyService } from './policies/ticket-policy.service';
import { GetTicketHandler } from './queries/get-ticket/get-ticket.handler';
import { GetTicketsHandler } from './queries/get-tickets/get-tickets.handler';
import { TICKET_REPOSITORY } from './repositories/ticket.repository.interface';
import { TicketTypeOrmRepository } from './repositories/ticket.typeorm.repository';
import { TicketsController } from './tickets.controller';

const commandHandlers = [CreateTicketHandler, UpdateStatusHandler, AssignTicketHandler];
const queryHandlers = [GetTicketsHandler, GetTicketHandler];
const eventHandlers = [SendNotificationHandler];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([Ticket])],
    controllers: [TicketsController],
    providers: [
        TicketPolicyService,
        TicketStatusTransitionService,
        TicketTypeOrmRepository,
        {
            provide: TICKET_REPOSITORY,
            useExisting: TicketTypeOrmRepository,
        },
        ...commandHandlers,
        ...queryHandlers,
        ...eventHandlers,
    ],
    exports: [TICKET_REPOSITORY],
})
export class TicketsModule {}
