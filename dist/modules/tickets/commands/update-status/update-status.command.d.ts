import { TicketStatus } from '../../entities/ticket-status.enum';
export declare class UpdateStatusCommand {
    readonly ticketId: number;
    readonly status: TicketStatus;
    readonly actorId: number;
    readonly actorRole: string;
    constructor(ticketId: number, status: TicketStatus, actorId: number, actorRole: string);
}
