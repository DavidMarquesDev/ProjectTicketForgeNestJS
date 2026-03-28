import { TicketPaginationParams } from '../../repositories/ticket.repository.interface';

export type GetTicketsFilters = TicketPaginationParams;

export class GetTicketsQuery {
    constructor(public readonly filters: GetTicketsFilters) {}
}
