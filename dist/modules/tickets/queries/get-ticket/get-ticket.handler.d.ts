import { IQueryHandler } from '@nestjs/cqrs';
import { GetTicketQuery } from './get-ticket.query';
import { type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { Ticket } from '../../entities/ticket.entity';
export declare class GetTicketHandler implements IQueryHandler<GetTicketQuery> {
    private readonly ticketRepository;
    constructor(ticketRepository: ITicketRepository);
    execute(query: GetTicketQuery): Promise<{
        success: true;
        data: Ticket;
    }>;
}
