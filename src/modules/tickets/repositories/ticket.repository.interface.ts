import { Ticket } from '../entities/ticket.entity';
import { TicketStatus } from '../entities/ticket-status.enum';

export enum TicketSortBy {
    CREATED_AT = 'createdAt',
    UPDATED_AT = 'updatedAt',
    STATUS = 'status',
}

export enum TicketSortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export type TicketPaginationParams = {
    page: number;
    limit: number;
    status?: TicketStatus;
    assigneeId?: number;
    sortBy?: TicketSortBy;
    order?: TicketSortOrder;
};

export type PaginatedTickets = {
    data: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface ITicketRepository {
    createAndSave(input: { title: string; description: string; createdBy: number }): Promise<Ticket>;
    findById(ticketId: number): Promise<Ticket | null>;
    save(ticket: Ticket): Promise<Ticket>;
    assign(ticketId: number, assigneeId: number): Promise<void>;
    paginate(params: TicketPaginationParams): Promise<PaginatedTickets>;
    findOneDetailed(ticketId: number): Promise<Ticket | null>;
}
