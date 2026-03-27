import { TicketStatus } from '../entities/ticket-status.enum';
export declare class TicketStatusUpdatedEvent {
    readonly ticketId: number;
    readonly status: TicketStatus;
    readonly updatedBy: number;
    constructor(ticketId: number, status: TicketStatus, updatedBy: number);
}
