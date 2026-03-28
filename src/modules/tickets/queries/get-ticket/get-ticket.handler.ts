import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTicketQuery } from './get-ticket.query';
import { TICKET_REPOSITORY, type ITicketRepository } from '../../repositories/ticket.repository.interface';
import { Ticket } from '../../entities/ticket.entity';

@QueryHandler(GetTicketQuery)
export class GetTicketHandler implements IQueryHandler<GetTicketQuery> {
    constructor(
        @Inject(TICKET_REPOSITORY)
        private readonly ticketRepository: ITicketRepository,
    ) {}

    /**
     * Returns detailed ticket data by id.
     *
     * @param query Query with ticket identifier.
     * @returns Detailed ticket payload.
     * @throws NotFoundException When ticket does not exist.
     */
    async execute(query: GetTicketQuery): Promise<{ success: true; data: Ticket }> {
        const ticket = await this.ticketRepository.findOneDetailed(query.filter.ticketId);

        if (!ticket) {
            throw new NotFoundException('Ticket não encontrado');
        }

        return {
            success: true,
            data: ticket,
        };
    }
}
