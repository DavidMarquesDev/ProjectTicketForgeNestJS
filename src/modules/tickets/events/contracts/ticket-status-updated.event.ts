import { TicketStatus } from '../../entities/ticket-status.enum';

export class TicketStatusUpdatedEvent {
    constructor(
        public readonly ticketId: number,
        public readonly status: TicketStatus,
        public readonly updatedBy: number,
    ) {}
}
