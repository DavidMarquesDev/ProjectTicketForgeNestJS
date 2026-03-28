import { UserRole } from '../../auth/entities/user.entity';
import { TicketStatus } from '../entities/ticket-status.enum';
import { Ticket } from '../entities/ticket.entity';

export type TicketOutputDto = {
    id: number;
    title: string;
    description: string;
    status: TicketStatus;
    createdBy: number;
    assignedTo: number | null;
    createdAt: Date;
    updatedAt: Date;
    creator: {
        id: number;
        name: string | null;
        email: string;
        role: UserRole;
    } | null;
    assignee: {
        id: number;
        name: string | null;
        email: string;
        role: UserRole;
    } | null;
};

export const mapTicketToOutputDto = (ticket: Ticket): TicketOutputDto => {
    return {
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        createdBy: ticket.createdBy,
        assignedTo: ticket.assignedTo,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        creator: ticket.creator
            ? {
                id: ticket.creator.id,
                name: ticket.creator.name ?? null,
                email: ticket.creator.email,
                role: ticket.creator.role,
            }
            : null,
        assignee: ticket.assignee
            ? {
                id: ticket.assignee.id,
                name: ticket.assignee.name ?? null,
                email: ticket.assignee.email,
                role: ticket.assignee.role,
            }
            : null,
    };
};
