import { TicketStatus } from '../../entities/ticket-status.enum';

export class GetTicketsQuery {
    constructor(
        public readonly page: number,
        public readonly limit: number,
        public readonly status?: TicketStatus,
        public readonly assigneeId?: number,
    ) {}
}
