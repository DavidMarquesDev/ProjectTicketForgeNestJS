import { ConflictException } from '@nestjs/common';
import { TicketStatus } from '../entities/ticket-status.enum';
import { TicketStatusTransitionService } from './ticket-status-transition.service';

describe('TicketStatusTransitionService', () => {
    const service = new TicketStatusTransitionService();

    it('deve permitir transição OPEN -> IN_PROGRESS', () => {
        expect(() => service.assertValidTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).not.toThrow();
    });

    it('deve bloquear transição OPEN -> CLOSED', () => {
        expect(() => service.assertValidTransition(TicketStatus.OPEN, TicketStatus.CLOSED)).toThrow(
            ConflictException,
        );
    });
});
