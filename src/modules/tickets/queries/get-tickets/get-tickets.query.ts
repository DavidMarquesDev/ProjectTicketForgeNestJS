import { TicketStatus } from '../../entities/ticket-status.enum';

type GetTicketsFilters = {
    page: number;
    limit: number;
    status?: TicketStatus;
    assigneeId?: number;
};

export class GetTicketsQuery {
    constructor(public readonly filters: GetTicketsFilters) {}
}
