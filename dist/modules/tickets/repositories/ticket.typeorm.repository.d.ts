import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { ITicketRepository, PaginatedTickets, TicketPaginationParams } from './ticket.repository.interface';
export declare class TicketTypeOrmRepository implements ITicketRepository {
    private readonly ormRepository;
    constructor(ormRepository: Repository<Ticket>);
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
