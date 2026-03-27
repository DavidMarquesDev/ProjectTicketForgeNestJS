import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateTicketCommand } from './create-ticket.command';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { TicketCreatedEvent } from '../../events/ticket-created.event';

@CommandHandler(CreateTicketCommand)
export class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
        private readonly eventBus: EventBus,
    ) {}

    async execute(command: CreateTicketCommand): Promise<{ id: number; success: true }> {
        const ticket = await this.ticketRepository.createAndSave({
            title: command.title,
            description: command.description,
            createdBy: command.createdBy,
        });

        this.eventBus.publish(new TicketCreatedEvent(ticket.id, command.createdBy));

        return { id: ticket.id, success: true };
    }
}
