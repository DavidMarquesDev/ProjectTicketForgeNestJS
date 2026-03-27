import { IQueryHandler } from '@nestjs/cqrs';
import { GetTicketsQuery } from './get-tickets.query';
import { type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { Ticket } from '../../entities/ticket.entity';
type GetTicketsResult = {
    success: true;
    data: Ticket[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
};
export declare class GetTicketsHandler implements IQueryHandler<GetTicketsQuery> {
    private readonly ticketRepository;
    constructor(ticketRepository: ITicketRepository);
    execute(query: GetTicketsQuery): Promise<GetTicketsResult>;
}
export {};
