import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTicketCommand } from './create-ticket.command';
import { OutboxService } from '../../../outbox/outbox.service';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketCreatedEvent } from '../../events/ticket-created.event';

@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly eventBus: EventBus,
        private readonly outboxService: OutboxService,
    ) {}

    /**
     * Creates a ticket and publishes a domain event.
     *
     * @param command Command with ticket creation payload.
     * @returns Created ticket identifier.
     */
    async execute(command: CreateTicketCommand): Promise<{ id: number; success: true }> {
        const ticket = await this.ticketRepository.createAndSave({
            title: command.title,
            description: command.description,
            createdBy: command.createdBy,
        });

        this.eventBus.publish(new TicketCreatedEvent(ticket.id, command.createdBy));
        await this.outboxService.createPendingEvent({
            eventName: 'TicketCreatedEvent',
            aggregateType: 'ticket',
            aggregateId: ticket.id.toString(),
            payload: {
                ticketId: ticket.id,
                createdBy: command.createdBy,
            },
        });

        return { id: ticket.id, success: true };
    }
}
