import { ConflictException, Injectable } from '@nestjs/common';
import { TicketStatus } from '../entities/ticket-status.enum';

@Injectable()
export class TicketStatusTransitionService {
    private readonly transitions: Record<TicketStatus, TicketStatus[]> = {
        [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
        [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
        [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
        [TicketStatus.CLOSED]: [],
    };

    assertValidTransition(currentStatus: TicketStatus, nextStatus: TicketStatus): void {
        const allowed = this.transitions[currentStatus] ?? [];
        if (!allowed.includes(nextStatus)) {
            throw new ConflictException('Transição de status inválida');
        }
    }
}
