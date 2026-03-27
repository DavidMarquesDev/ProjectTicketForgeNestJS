import { User } from '../../auth/entities/user.entity';
import { TicketStatus } from './ticket-status.enum';
export declare class Ticket {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    createdBy: number;
    creator: User;
    assignedTo: number | null;
    assignee: User | null;
    createdAt: Date;
    updatedAt: Date;
}
