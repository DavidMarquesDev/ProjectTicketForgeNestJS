import { Ticket } from '../entities/ticket.entity';
export declare class TicketPolicyService {
    assertCanAssign(actorRole: string): void;
    assertCanUpdateStatus(ticket: Ticket, actorId: number, actorRole: string): void;
}
