import { Ticket } from '../entities/ticket.entity';
import { TicketStatus } from '../entities/ticket-status.enum';
export type TicketPaginationParams = {
    page: number;
    limit: number;
    status?: TicketStatus;
    assigneeId?: number;
};
export type PaginatedTickets = {
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};
export declare const TICKET_REPOSITORY: unique symbol;
export interface ITicketRepository {
    createAndSave(input: {
        title: string;
        description: string;
        createdBy: number;
    }): Promise<Ticket>;
    findByIdOrFail(ticketId: number): Promise<Ticket>;
    save(ticket: Ticket): Promise<Ticket>;
    assign(ticketId: number, assigneeId: number): Promise<void>;
    paginate(params: TicketPaginationParams): Promise<PaginatedTickets>;
    findOneDetailed(ticketId: number): Promise<Ticket | null>;
}
