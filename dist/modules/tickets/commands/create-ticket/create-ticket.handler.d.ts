import { EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateTicketCommand } from './create-ticket.command';
import { type ITicketRepository } from '../../repositories/ticket.repository.interface';
export declare class CreateTicketHandler implements ICommandHandler<CreateTicketCommand> {
    private readonly ticketRepository;
    private readonly eventBus;
    constructor(ticketRepository: ITicketRepository, eventBus: EventBus);
    execute(command: CreateTicketCommand): Promise<{
        id: number;
        success: true;
    }>;
}
