import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketsQuery } from './get-tickets.query';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
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

@QueryHandler(GetTicketsQuery)
export class GetTicketsHandler implements IQueryHandler<GetTicketsQuery> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
    ) {}

    async execute(query: GetTicketsQuery): Promise<GetTicketsResult> {
        const result = await this.ticketRepository.paginate({
            page: query.page,
            limit: query.limit,
            status: query.status,
            assigneeId: query.assigneeId,
        });

        return {
            success: true,
            data: result.data,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}
