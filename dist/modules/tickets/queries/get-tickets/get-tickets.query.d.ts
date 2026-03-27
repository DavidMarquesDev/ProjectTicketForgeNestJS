import { TicketStatus } from '../../entities/ticket-status.enum';
export declare class GetTicketsQuery {
    readonly page: number;
    readonly limit: number;
    readonly status?: TicketStatus | undefined;
    readonly assigneeId?: number | undefined;
    constructor(page: number, limit: number, status?: TicketStatus | undefined, assigneeId?: number | undefined);
}
