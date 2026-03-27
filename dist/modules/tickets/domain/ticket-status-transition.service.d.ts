import { TicketStatus } from '../entities/ticket-status.enum';
export declare class TicketStatusTransitionService {
    private readonly transitions;
    assertValidTransition(currentStatus: TicketStatus, nextStatus: TicketStatus): void;
}
