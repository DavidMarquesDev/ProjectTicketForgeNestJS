import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../auth/entities/user.entity';
import { TicketStatus } from '../entities/ticket-status.enum';
import { TicketPolicyService } from './ticket-policy.service';

describe('TicketPolicyService', () => {
    const service = new TicketPolicyService();

    it('deve permitir atribuição para suporte', () => {
        expect(() => service.assertCanAssign(UserRole.SUPPORT)).not.toThrow();
    });

    it('deve bloquear atribuição para usuário comum', () => {
        expect(() => service.assertCanAssign(UserRole.USER)).toThrow(ForbiddenException);
    });

    it('deve permitir atualização para dono do ticket', () => {
        expect(() =>
            service.assertCanUpdateStatus(
                {
                    id: 1,
                    title: 'Ticket',
                    description: 'Descrição',
                    status: TicketStatus.OPEN,
                    createdBy: 10,
                    assignedTo: null,
                    creator: null as never,
                    assignee: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                10,
                UserRole.USER,
            ),
        ).not.toThrow();
    });
});
