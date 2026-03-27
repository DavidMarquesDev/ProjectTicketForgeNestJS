import { TicketStatus } from '../../entities/ticket-status.enum';

export class UpdateStatusCommand {
    constructor(
        public readonly ticketId: number,
        public readonly status: TicketStatus,
        public readonly actorId: number,
        public readonly actorRole: string,
    ) {}
}
