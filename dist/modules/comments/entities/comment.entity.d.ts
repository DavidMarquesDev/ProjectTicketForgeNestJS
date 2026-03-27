import { User } from '../../auth/entities/user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
export declare class Comment {
    id: number;
    ticketId: number;
    ticket: Ticket;
    authorId: number;
    author: User;
    content: string;
    createdAt: Date;
}
