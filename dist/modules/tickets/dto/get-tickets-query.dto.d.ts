import { TicketStatus } from '../entities/ticket-status.enum';
export declare class GetTicketsQueryDto {
    status?: TicketStatus;
    assigneeId?: number;
    page?: number;
    limit?: number;
}
