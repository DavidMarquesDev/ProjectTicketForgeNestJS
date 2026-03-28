import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketsQuery } from './get-tickets.query';
import { mapTicketToOutputDto, TicketOutputDto } from '../../dto/ticket-output.dto';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';

type GetTicketsResult = {
    success: true;
    data: TicketOutputDto[];
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

    /**
     * Returns paginated tickets filtered by optional criteria.
     *
     * @param query Query with pagination and filters.
     * @returns Paginated ticket payload.
     */
    async execute(query: GetTicketsQuery): Promise<GetTicketsResult> {
        const result = await this.ticketRepository.paginate({
            page: query.filters.page,
            limit: query.filters.limit,
            status: query.filters.status,
            assigneeId: query.filters.assigneeId,
            sortBy: query.filters.sortBy,
            order: query.filters.order,
        });

        return {
            success: true,
            data: result.data.map(mapTicketToOutputDto),
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        };
    }
}
